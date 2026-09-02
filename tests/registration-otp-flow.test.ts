import assert from "node:assert";
import { AuthService } from "../services/auth-service";
import { prisma } from "../lib/prisma";
import { hashToken } from "../lib/auth/tokens";

async function runRegistrationOTPFlowTests() {
  console.log("🧪 Running EduConnect Fix Registration & OTP Verification Flow Tests...\n");

  const timestamp = Date.now();
  const testStudentEmail = `flow.student.${timestamp}@educonnect.com`;
  const testPassword = "Password123!";

  // ------------------------------------------------------------------------
  // Test 1: Register User - Verify NO entry in users table, stored in pending_registrations
  // ------------------------------------------------------------------------
  console.log("Test 1: Submitting Registration Form (Checking Pending Storage vs Main DB)...");
  const regResult = await AuthService.registerUser({
    firstName: "Chloe",
    lastName: "Kim",
    email: testStudentEmail,
    password: testPassword,
    role: "STUDENT",
    gradeLevel: "Grade 11",
    interests: "Physics, Math",
  });

  assert.strictEqual(regResult.email, testStudentEmail);
  assert.strictEqual(regResult.role, "STUDENT");
  assert.strictEqual(regResult.emailVerified, false);

  // CRITICAL REQUIREMENT 1: User must NOT be in the main users database!
  const mainUserBefore = await prisma.user.findUnique({
    where: { email: testStudentEmail },
  });
  assert.strictEqual(mainUserBefore, null, "User MUST NOT exist in main users table before OTP verification!");

  // CRITICAL REQUIREMENT 2: Stored in pending_registrations temporary storage
  const pendingReg = await prisma.pendingRegistration.findUnique({
    where: { email: testStudentEmail },
  });
  assert.ok(pendingReg, "Registration must exist in pending_registrations table");
  assert.strictEqual(pendingReg.email, testStudentEmail);
  assert.strictEqual(pendingReg.role, "STUDENT");
  assert.strictEqual(pendingReg.attempts, 0);
  assert.ok(pendingReg.expiresAt > new Date(), "Pending registration must have future expiration");
  assert.ok(pendingReg.codeHash, "Pending registration must have hashed OTP");
  console.log("✅ Passed: Registration stored in pending storage; main users table untouched (0 rows).");

  // ------------------------------------------------------------------------
  // Test 2: Pending registration is not treated as registered account for login
  // ------------------------------------------------------------------------
  console.log("\nTest 2: Verifying Pending Registration is Not Treated as Registered Account (Login Check)...");
  try {
    await AuthService.loginUser({
      email: testStudentEmail,
      password: testPassword,
    });
    assert.fail("Unverified pending user should not be able to log in");
  } catch (err: any) {
    assert.ok(
      err.message.includes("Invalid email or password"),
      "Login must reject unverified pending registration as unauthenticated"
    );
    console.log("✅ Passed: Pending registration cannot log in.");
  }

  // ------------------------------------------------------------------------
  // Test 3: Re-register with same email before OTP verification -> gets new OTP without error
  // ------------------------------------------------------------------------
  console.log("\nTest 3: Re-submitting Registration with Same Email Before Verification (Must Issue New OTP)...");
  const originalCodeHash = pendingReg.codeHash;

  // Simulate re-registration
  const reRegResult = await AuthService.registerUser({
    firstName: "Chloe",
    lastName: "Kim",
    email: testStudentEmail,
    password: testPassword,
    role: "STUDENT",
    gradeLevel: "Grade 12",
  });

  assert.strictEqual(reRegResult.email, testStudentEmail);

  // Still not in main users database
  const mainUserAfterReReg = await prisma.user.findUnique({
    where: { email: testStudentEmail },
  });
  assert.strictEqual(mainUserAfterReReg, null, "User still must not exist in main users table!");

  // Pending registration updated with new OTP
  const updatedPending = await prisma.pendingRegistration.findUnique({
    where: { email: testStudentEmail },
  });
  assert.ok(updatedPending);
  assert.notStrictEqual(updatedPending.codeHash, originalCodeHash, "New registration must generate fresh OTP");
  console.log("✅ Passed: Re-registration allowed without 'Email already registered' error and issued new OTP.");

  // ------------------------------------------------------------------------
  // Test 4: Incorrect OTP Handling & Attempt Increment
  // ------------------------------------------------------------------------
  console.log("\nTest 4: Testing Incorrect OTP Attempt...");
  try {
    await AuthService.verifyOTP(testStudentEmail, "000000");
    assert.fail("Should reject incorrect OTP");
  } catch (err: any) {
    assert.ok(err.message.includes("Incorrect verification code"), "Must reject incorrect OTP");
    console.log("✅ Passed: Incorrect OTP rejected.");
  }

  const pendingAfterWrongOtp = await prisma.pendingRegistration.findUnique({
    where: { email: testStudentEmail },
  });
  assert.strictEqual(pendingAfterWrongOtp?.attempts, 1, "Attempts must be incremented to 1");
  console.log("✅ Passed: Attempt counter properly incremented.");

  // ------------------------------------------------------------------------
  // Test 5: Resend OTP Cooldown and Success
  // ------------------------------------------------------------------------
  console.log("\nTest 5: Testing Resend OTP Cooldown on Pending Registration...");
  try {
    await AuthService.resendVerification(testStudentEmail);
    assert.fail("Rapid resend should be blocked by cooldown");
  } catch (err: any) {
    assert.ok(err.message.includes("Please wait"), "Should enforce cooldown wait message");
    console.log(`✅ Passed: Cooldown properly enforced (${err.message}).`);
  }

  // Fast-forward cooldown by updating updatedAt
  await prisma.pendingRegistration.update({
    where: { email: testStudentEmail },
    data: { updatedAt: new Date(Date.now() - 65 * 1000) },
  });

  const resendSuccess = await AuthService.resendVerification(testStudentEmail);
  assert.strictEqual(resendSuccess.success, true);
  console.log("✅ Passed: Resend OTP succeeded after cooldown.");

  // ------------------------------------------------------------------------
  // Test 6: OTP Expiration Handling
  // ------------------------------------------------------------------------
  console.log("\nTest 6: Testing Expired OTP Rejection...");
  // Temporarily set expiresAt to the past
  await prisma.pendingRegistration.update({
    where: { email: testStudentEmail },
    data: { expiresAt: new Date(Date.now() - 60 * 1000) },
  });

  try {
    await AuthService.verifyOTP(testStudentEmail, "123456");
    assert.fail("Expired OTP must be rejected");
  } catch (err: any) {
    assert.ok(err.message.includes("expired"), "Error message must indicate code expired");
    console.log("✅ Passed: Expired OTP rejected with proper expiration message.");
  }

  // ------------------------------------------------------------------------
  // Test 7: Successful OTP Verification -> Creates User in Main Database & Deletes Pending
  // ------------------------------------------------------------------------
  console.log("\nTest 7: Testing Successful OTP Verification (Creating User in Main Database)...");
  const knownOTP = "654321";
  await prisma.pendingRegistration.update({
    where: { email: testStudentEmail },
    data: {
      codeHash: hashToken(knownOTP),
      attempts: 0,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  const verifyResult = await AuthService.verifyOTP(testStudentEmail, knownOTP);
  assert.strictEqual(verifyResult.success, true);
  assert.ok(verifyResult.user, "Must return authenticated user session");
  assert.strictEqual(verifyResult.user.email, testStudentEmail);
  assert.strictEqual(verifyResult.user.emailVerified, true);
  assert.strictEqual(verifyResult.redirectPath, "/student/dashboard");

  // CRITICAL REQUIREMENT 4: User must NOW be in main users database!
  const mainUserAfterVerify = await prisma.user.findUnique({
    where: { email: testStudentEmail },
    include: { profile: true, studentProfile: true },
  });
  assert.ok(mainUserAfterVerify, "User MUST exist in main users table after verification!");
  assert.strictEqual(mainUserAfterVerify.emailVerified, true);
  assert.strictEqual(mainUserAfterVerify.profile?.firstName, "Chloe");
  assert.strictEqual(mainUserAfterVerify.studentProfile?.gradeLevel, "Grade 12");

  // CRITICAL: Pending registration must be cleaned up!
  const pendingAfterVerify = await prisma.pendingRegistration.findUnique({
    where: { email: testStudentEmail },
  });
  assert.strictEqual(pendingAfterVerify, null, "Pending registration must be deleted after successful verification!");
  console.log("✅ Passed: User account created in main users table, profiles created, pending record deleted.");

  // ------------------------------------------------------------------------
  // Test 8: Re-registering with Already Registered & Verified Email MUST be blocked
  // ------------------------------------------------------------------------
  console.log("\nTest 8: Testing Re-registration with Already Verified Email (Must Show Email Already Registered)...");
  try {
    await AuthService.registerUser({
      firstName: "Impostor",
      lastName: "Kim",
      email: testStudentEmail,
      password: testPassword,
      role: "STUDENT",
    });
    assert.fail("Should reject registration for already verified user");
  } catch (err: any) {
    assert.ok(
      err.message.includes("already exists"),
      "Must show account already exists error for verified email"
    );
    console.log(`✅ Passed: Fully registered and verified user is properly blocked (${err.message}).`);
  }

  // ------------------------------------------------------------------------
  // Test 9: Multi-Step Teacher Registration & Profile Creation on Verification
  // ------------------------------------------------------------------------
  console.log("\nTest 9: Testing Multi-Step Teacher Pending Registration & Verification...");
  const testTeacherEmail = `flow.teacher.${timestamp}@educonnect.com`;
  await AuthService.registerUser({
    firstName: "David",
    lastName: "Miller",
    email: testTeacherEmail,
    password: testPassword,
    role: "TEACHER",
    headline: "Senior Calculus Tutor",
    subjects: "Calculus, Linear Algebra",
    experienceYears: 6,
    hourlyRate: 55,
    teachingMode: "ONLINE",
  });

  // Verify not in main DB yet
  const mainTeacherBefore = await prisma.user.findUnique({
    where: { email: testTeacherEmail },
  });
  assert.strictEqual(mainTeacherBefore, null, "Teacher must not be in users table before OTP verification");

  // Set known OTP and verify
  const teacherOTP = "876543";
  await prisma.pendingRegistration.update({
    where: { email: testTeacherEmail },
    data: {
      codeHash: hashToken(teacherOTP),
      attempts: 0,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  const teacherVerifyResult = await AuthService.verifyOTP(testTeacherEmail, teacherOTP);
  assert.strictEqual(teacherVerifyResult.success, true);
  assert.strictEqual(teacherVerifyResult.redirectPath, "/teacher/dashboard");

  const createdTeacher = await prisma.user.findUnique({
    where: { email: testTeacherEmail },
    include: { profile: true, teacherProfile: true },
  });
  assert.ok(createdTeacher, "Teacher must exist in main users table");
  assert.strictEqual(createdTeacher.teacherProfile?.headline, "Senior Calculus Tutor");
  assert.strictEqual(createdTeacher.teacherProfile?.hourlyRate, 55);
  console.log("✅ Passed: Teacher registration created user & teacher profile only after OTP verification.");

  // ------------------------------------------------------------------------
  // Test 10: Existing Login OTP Verification Compatibility
  // ------------------------------------------------------------------------
  console.log("\nTest 10: Testing Existing User Login Flow with Login OTP...");
  const loginResult = await AuthService.loginUser({
    email: testStudentEmail,
    password: testPassword,
  });
  assert.strictEqual(loginResult.requiresOtp, true, "Login must require OTP");

  // Fetch the login OTP record from email_verifications
  const loginVerification = await prisma.emailVerification.findFirst({
    where: { userId: mainUserAfterVerify.id, verifiedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  assert.ok(loginVerification, "Login OTP record must exist in email_verifications");

  // Set known OTP for login verification
  const loginOTP = "998877";
  await prisma.emailVerification.update({
    where: { id: loginVerification.id },
    data: { codeHash: hashToken(loginOTP), attempts: 0 },
  });

  const loginVerifyResult = await AuthService.verifyOTP(testStudentEmail, loginOTP);
  assert.strictEqual(loginVerifyResult.success, true);
  assert.strictEqual(loginVerifyResult.user?.email, testStudentEmail);
  console.log("✅ Passed: Login flow and login OTP verification remain 100% functional.");

  console.log("\n🎉 ALL 10 REGISTRATION & OTP VERIFICATION FLOW TESTS PASSED! 🚀\n");
}

runRegistrationOTPFlowTests().catch((err) => {
  console.error("❌ Test Failure:", err);
  process.exit(1);
});
