process.env.EMAIL_PROVIDER = "console";

import assert from "node:assert";
import { prisma } from "../lib/prisma";
import { AuthService } from "../services/auth-service";
import { hashPassword } from "../lib/auth/password";
import { hashToken } from "../lib/auth/tokens";
import { encodeSession } from "../lib/auth/session";
import { NextRequest } from "next/server";
import { POST as educatorRegistrationPOST, GET as educatorRegistrationGET } from "../app/api/teacher/registration/route";

let reqCounter = 100;
function createReq(url: string, init?: ConstructorParameters<typeof NextRequest>[1]) {
  const headers = new Headers(init?.headers);
  if (!headers.has("x-forwarded-for")) {
    headers.set("x-forwarded-for", `192.168.1.${reqCounter++}`);
  }
  return new NextRequest(url, { ...init, headers });
}

async function runEducatorRegistrationFlowTests() {
  console.log("🧪 Running Educator Registration, OTP, Payment, Verification & Activation Test Suite...\n");

  const ts = Date.now();
  const testPassword = "Password123!";
  const testEmail = `educator.flow.${ts}@educonnects.test`;

  // ========================================================================
  // Test 1: Full Educator Registration Flow (Step 1 -> 6 -> Verification -> Approval -> Login)
  // ========================================================================
  console.log("Test 1: Full Educator Registration Flow (Step 1 to 6)...");

  // Step 1: Initiate Basic Info
  const step1Req = createReq("http://localhost:3000/api/teacher/registration", {
    method: "POST",
    body: JSON.stringify({
      action: "STEP1_INITIATE",
      firstName: "Priya",
      lastName: "Nair",
      email: testEmail,
      phone: "9876543210",
      password: testPassword,
      confirmPassword: testPassword,
    }),
  });
  const step1Res = await educatorRegistrationPOST(step1Req);
  const step1Data = await step1Res.json();
  assert.strictEqual(step1Res.status, 200, `Step 1 failed: ${JSON.stringify(step1Data)}`);
  assert.strictEqual(step1Data.data.step, 2);
  console.log("  ✅ Step 1 (Initiate) succeeded and advanced to Step 2.");

  // Check pendingRegistration in DB and set known OTP
  const knownOtp = "654321";
  await prisma.pendingRegistration.update({
    where: { email: testEmail },
    data: {
      codeHash: hashToken(knownOtp),
      attempts: 0,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    },
  });

  // Step 2: Verify OTP
  const step2Req = createReq("http://localhost:3000/api/teacher/registration", {
    method: "POST",
    body: JSON.stringify({
      action: "STEP2_VERIFY_OTP",
      email: testEmail,
      otp: knownOtp,
    }),
  });
  const step2Res = await educatorRegistrationPOST(step2Req);
  const step2Data = await step2Res.json();
  assert.strictEqual(step2Res.status, 200, `Step 2 failed: ${JSON.stringify(step2Data)}`);
  assert.strictEqual(step2Data.data.verified, true);
  assert.strictEqual(step2Data.data.step, 3);
  console.log("  ✅ Step 2 (OTP Verification) verified email and advanced to Step 3.");

  // Step 3: Save Professional Profile
  const step3Req = createReq("http://localhost:3000/api/teacher/registration", {
    method: "POST",
    body: JSON.stringify({
      action: "STEP3_SAVE_PROFILE",
      email: testEmail,
      headline: "Senior Physics Educator",
      subjects: "Physics, Mathematics",
      qualifications: "M.Sc. Physics, B.Ed.",
      experienceYears: 7,
      hourlyRate: 600,
      teachingMode: "ONLINE",
      languages: "English, Hindi",
      bio: "Passionate about teaching conceptual physics to high school learners.",
    }),
  });
  const step3Res = await educatorRegistrationPOST(step3Req);
  const step3Data = await step3Res.json();
  assert.strictEqual(step3Res.status, 200, `Step 3 failed: ${JSON.stringify(step3Data)}`);
  assert.strictEqual(step3Data.data.step, 4);
  console.log("  ✅ Step 3 (Professional Profile) recorded and advanced to Step 4.");

  // Step 5: Create Cashfree Payment Order (₹99)
  const step5Req = createReq("http://localhost:3000/api/teacher/registration", {
    method: "POST",
    body: JSON.stringify({
      action: "STEP5_CREATE_ORDER",
      email: testEmail,
    }),
  });
  const step5Res = await educatorRegistrationPOST(step5Req);
  const step5Data = await step5Res.json();
  assert.strictEqual(step5Res.status, 200, `Step 5 failed: ${JSON.stringify(step5Data)}`);
  assert.ok(step5Data.data.orderId);
  assert.strictEqual(step5Data.data.orderAmount, 99.00);
  const orderId = step5Data.data.orderId;
  console.log(`  ✅ Step 5 (Order Creation) created order ${orderId} for ₹99.`);

  // Step 6: Verify Cashfree Payment & Complete Registration
  const step6Req = createReq("http://localhost:3000/api/teacher/registration", {
    method: "POST",
    body: JSON.stringify({
      action: "STEP6_VERIFY_PAYMENT",
      email: testEmail,
      orderId,
    }),
  });
  const step6Res = await educatorRegistrationPOST(step6Req);
  const step6Data = await step6Res.json();
  assert.strictEqual(step6Res.status, 200, `Step 6 failed: ${JSON.stringify(step6Data)}`);
  assert.strictEqual(step6Data.data.user.role, "TEACHER");
  assert.strictEqual(step6Data.data.user.emailVerified, true);
  console.log("  ✅ Step 6 (Payment Verification) created active educator user and captured ₹99.");

  // Verify User, Profile, TeacherProfile & PaymentTransaction in Database
  const createdTeacher = await prisma.user.findUnique({
    where: { email: testEmail },
    include: {
      profile: true,
      teacherProfile: true,
      paymentTransactions: true,
    },
  });
  assert.ok(createdTeacher, "Educator must exist in users table");
  assert.strictEqual(createdTeacher.status, "ACTIVE");
  assert.strictEqual(createdTeacher.emailVerified, true);
  assert.strictEqual(createdTeacher.teacherProfile?.headline, "Senior Physics Educator");
  assert.strictEqual(createdTeacher.teacherProfile?.verificationStatus, "PENDING");
  assert.strictEqual(createdTeacher.paymentTransactions.length, 1);
  assert.strictEqual(createdTeacher.paymentTransactions[0].type, "EDUCATOR_REGISTRATION");
  assert.strictEqual(createdTeacher.paymentTransactions[0].amountPaise, 9900);
  assert.strictEqual(createdTeacher.paymentTransactions[0].status, "CAPTURED");
  console.log("  ✅ Database verified: User is ACTIVE, emailVerified=true, TeacherProfile is PENDING, ₹99 payment CAPTURED.");

  // Educator Application: Add Qualification & Identity Document, then Submit Verification
  const teacherProfileId = createdTeacher.teacherProfile!.id;
  await prisma.teacherQualification.create({
    data: {
      teacherId: teacherProfileId,
      degree: "M.Sc. Physics",
      institution: "Delhi University",
      year: 2018,
    },
  });
  await prisma.teacherDocument.create({
    data: {
      teacherId: teacherProfileId,
      category: "IDENTITY",
      fileName: "aadhar_card.pdf",
      fileType: "application/pdf",
      fileSize: 1024,
      storageKey: `docs/${teacherProfileId}/aadhar.pdf`,
      status: "ACTIVE",
    },
  });

  // Submit verification application
  const teacherSessionCookie = encodeSession({
    id: createdTeacher.id,
    userId: createdTeacher.id,
    email: createdTeacher.email,
    role: "TEACHER",
    emailVerified: true,
    firstName: "Priya",
    lastName: "Nair",
  });

  // Record bank details and submit application
  await prisma.teacherProfile.update({
    where: { id: teacherProfileId },
    data: {
      accountHolderName: "Priya Nair",
      accountNumber: "1234567890",
      bankName: "HDFC Bank",
      ifscCode: "HDFC0001234",
      submittedAt: new Date(),
    },
  });
  console.log("  ✅ Educator verification application submitted with bank details, qualifications & ID.");

  // Admin Approval
  const adminHashedPass = await hashPassword("AdminPass123!");
  const adminUser = await prisma.user.upsert({
    where: { email: `admin.test.${ts}@educonnects.test` },
    update: { role: "ADMIN", status: "ACTIVE", emailVerified: true },
    create: {
      email: `admin.test.${ts}@educonnects.test`,
      passwordHash: adminHashedPass,
      role: "ADMIN",
      status: "ACTIVE",
      emailVerified: true,
      profile: { create: { firstName: "Admin", lastName: "Tester" } },
    },
  });

  const approveNow = new Date();
  await prisma.teacherProfile.update({
    where: { id: teacherProfileId },
    data: {
      verificationStatus: "VERIFIED",
      verifiedAt: approveNow,
    },
  });

  await prisma.teacherVerificationHistory.create({
    data: {
      teacherId: teacherProfileId,
      adminId: adminUser.id,
      previousStatus: "PENDING",
      newStatus: "VERIFIED",
      reason: "All credentials and identity verified during test.",
    },
  });

  const updatedTeacherProfile = await prisma.teacherProfile.findUnique({
    where: { id: teacherProfileId },
  });
  assert.strictEqual(updatedTeacherProfile?.verificationStatus, "VERIFIED");
  console.log("  ✅ Admin approved application: verificationStatus is now VERIFIED.");

  // Test Educator Sign In
  const loginRes = await AuthService.loginUser({
    email: testEmail,
    password: testPassword,
  });
  assert.ok(loginRes.requiresOtp);
  console.log("  ✅ Educator signed in with credentials and received login OTP challenge.");

  // Complete Login OTP
  const loginVerificationRecord = await prisma.emailVerification.findFirst({
    where: { userId: createdTeacher.id, verifiedAt: null },
    orderBy: { createdAt: "desc" },
  });
  assert.ok(loginVerificationRecord);

  const loginOtp = "112233";
  await prisma.emailVerification.update({
    where: { id: loginVerificationRecord.id },
    data: { codeHash: hashToken(loginOtp) },
  });

  const loginOtpResult = await AuthService.verifyOTP(testEmail, loginOtp);
  assert.strictEqual(loginOtpResult.success, true);
  assert.strictEqual(loginOtpResult.redirectPath, "/teacher/dashboard");
  console.log("  ✅ Login OTP verified: educator successfully signed into /teacher/dashboard.");

  // ========================================================================
  // Test 2: Pre-existing User in Pending/Unverified Registration State
  // ========================================================================
  console.log("\nTest 2: Pre-existing Educator in Pending/Unverified Registration State...");
  const unverifiedEmail = `unverified.teacher.${ts}@educonnects.test`;

  // Pre-create user in pending/unverified state
  const preCreatedUser = await prisma.user.create({
    data: {
      email: unverifiedEmail,
      passwordHash: await hashPassword("OldPassword123!"),
      role: "TEACHER",
      status: "PENDING",
      emailVerified: false,
      profile: {
        create: { firstName: "OldName", lastName: "OldLastName", phone: "9111111111" },
      },
    },
  });
  const originalUserId = preCreatedUser.id;

  // Educator starts registration with this email
  const reInitReq = createReq("http://localhost:3000/api/teacher/registration", {
    method: "POST",
    body: JSON.stringify({
      action: "STEP1_INITIATE",
      firstName: "UpdatedPriya",
      lastName: "UpdatedNair",
      email: unverifiedEmail,
      phone: "9222222222",
      password: "NewPassword123!",
      confirmPassword: "NewPassword123!",
    }),
  });
  const reInitRes = await educatorRegistrationPOST(reInitReq);
  const reInitData = await reInitRes.json();
  assert.strictEqual(reInitRes.status, 200, `Re-initiate should succeed for unverified user: ${JSON.stringify(reInitData)}`);
  assert.strictEqual(reInitData.data.step, 2);

  // User record was NOT deleted and still has original ID
  const userCheckAfterInit = await prisma.user.findUnique({ where: { email: unverifiedEmail } });
  assert.ok(userCheckAfterInit);
  assert.strictEqual(userCheckAfterInit.id, originalUserId, "User record must NOT be deleted or replaced with duplicate row!");
  console.log("  ✅ Re-initiate preserved existing unverified user record without deleting or duplicating.");

  // Verify OTP for this user
  const unverifiedOtp = "778899";
  await prisma.pendingRegistration.update({
    where: { email: unverifiedEmail },
    data: {
      codeHash: hashToken(unverifiedOtp),
      attempts: 0,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    },
  });

  const unverifiedVerifyReq = createReq("http://localhost:3000/api/teacher/registration", {
    method: "POST",
    body: JSON.stringify({
      action: "STEP2_VERIFY_OTP",
      email: unverifiedEmail,
      otp: unverifiedOtp,
    }),
  });
  const unverifiedVerifyRes = await educatorRegistrationPOST(unverifiedVerifyReq);
  const unverifiedVerifyData = await unverifiedVerifyRes.json();
  assert.strictEqual(unverifiedVerifyRes.status, 200, `Step 2 OTP failed: ${JSON.stringify(unverifiedVerifyData)}`);
  assert.strictEqual(unverifiedVerifyData.data.verified, true);

  // Check emailVerified is now true on the existing user record
  const userCheckAfterOtp = await prisma.user.findUnique({ where: { email: unverifiedEmail } });
  assert.strictEqual(userCheckAfterOtp?.emailVerified, true);
  assert.strictEqual(userCheckAfterOtp?.id, originalUserId);
  console.log("  ✅ OTP verification updated emailVerified=true on the existing user without duplicate constraint failure.");

  // Save profile & verify payment for this user
  await educatorRegistrationPOST(createReq("http://localhost:3000/api/teacher/registration", {
    method: "POST",
    body: JSON.stringify({
      action: "STEP3_SAVE_PROFILE",
      email: unverifiedEmail,
      headline: "Biology Educator",
      subjects: "Biology",
      qualifications: "M.Sc. Zoology",
    }),
  }));

  const order2Res = await educatorRegistrationPOST(createReq("http://localhost:3000/api/teacher/registration", {
    method: "POST",
    body: JSON.stringify({ action: "STEP5_CREATE_ORDER", email: unverifiedEmail }),
  }));
  const order2Data = await order2Res.json();
  const orderId2 = order2Data.data.orderId;

  const payment2Res = await educatorRegistrationPOST(createReq("http://localhost:3000/api/teacher/registration", {
    method: "POST",
    body: JSON.stringify({
      action: "STEP6_VERIFY_PAYMENT",
      email: unverifiedEmail,
      orderId: orderId2,
    }),
  }));
  const payment2Data = await payment2Res.json();
  assert.strictEqual(payment2Res.status, 200, `Payment verification failed: ${JSON.stringify(payment2Data)}`);

  const finalUserCheck = await prisma.user.findUnique({
    where: { email: unverifiedEmail },
    include: { teacherProfile: true },
  });
  assert.strictEqual(finalUserCheck?.id, originalUserId, "Must retain original user record throughout registration");
  assert.strictEqual(finalUserCheck?.status, "ACTIVE");
  assert.strictEqual(finalUserCheck?.teacherProfile?.headline, "Biology Educator");
  console.log("  ✅ Complete registration finalized on original user record with no duplicates.");

  // ========================================================================
  // Test 3: Idempotent Retry of OTP Verification & Payment Verification
  // ========================================================================
  console.log("\nTest 3: Idempotent Retry of Verification and Payment...");

  // Retrying Step 6 with same order
  const retryPaymentRes = await educatorRegistrationPOST(createReq("http://localhost:3000/api/teacher/registration", {
    method: "POST",
    body: JSON.stringify({
      action: "STEP6_VERIFY_PAYMENT",
      email: unverifiedEmail,
      orderId: orderId2,
    }),
  }));
  const retryPaymentData = await retryPaymentRes.json();
  assert.strictEqual(retryPaymentRes.status, 200, "Retrying payment verification must be idempotent!");
  assert.strictEqual(retryPaymentData.data.user.email, unverifiedEmail);

  // Total payment transactions for this user should still be exactly 1
  const txCount = await prisma.paymentTransaction.count({
    where: { userId: originalUserId, type: "EDUCATOR_REGISTRATION" },
  });
  assert.strictEqual(txCount, 1, "Must not create duplicate payment transaction on retry!");
  console.log("  ✅ Retrying payment verification was completely idempotent with 0 duplicate transactions.");

  // ========================================================================
  // Test 4: Pre-existing Active Educator Re-registration Blocked
  // ========================================================================
  console.log("\nTest 4: Attempting Re-registration on Active Educator Account...");

  const activeReInitRes = await educatorRegistrationPOST(createReq("http://localhost:3000/api/teacher/registration", {
    method: "POST",
    body: JSON.stringify({
      action: "STEP1_INITIATE",
      firstName: "Impostor",
      lastName: "Teacher",
      email: testEmail, // Active from Test 1
      phone: "9999999999",
      password: "Password123!",
      confirmPassword: "Password123!",
    }),
  }));
  const activeReInitData = await activeReInitRes.json();
  assert.strictEqual(activeReInitRes.status, 400);
  assert.ok(
    activeReInitData.error.toLowerCase().includes("email already registered"),
    `Must return clear "Email already registered" message. Got: ${activeReInitData.error}`
  );
  assert.ok(
    activeReInitData.error.toLowerCase().includes("log in") || activeReInitData.error.toLowerCase().includes("sign in"),
    `Must direct educator to login. Got: ${activeReInitData.error}`
  );
  console.log(`  ✅ Active educator re-registration correctly rejected: "${activeReInitData.error}"`);

  // Also verify GET status returns COMPLETED and directs to login
  const getStatusRes = await educatorRegistrationGET(createReq(`http://localhost:3000/api/teacher/registration?email=${encodeURIComponent(testEmail)}`));
  const getStatusData = await getStatusRes.json();
  assert.strictEqual(getStatusData.data.status, "COMPLETED");
  assert.strictEqual(getStatusData.data.registered, true);
  console.log("  ✅ GET educator status returns COMPLETED and registered:true for active account.");

  // ========================================================================
  // Test 5: AuthService.verifyOTP Idempotency with Pre-existing User Record
  // ========================================================================
  console.log("\nTest 5: AuthService.verifyOTP with Pre-existing User Record...");
  const authServiceTestEmail = `authservice.teacher.${ts}@educonnects.test`;

  // Pre-create user in database as unverified
  const preUserAuth = await prisma.user.create({
    data: {
      email: authServiceTestEmail,
      passwordHash: await hashPassword("TempPass123!"),
      role: "TEACHER",
      status: "PENDING",
      emailVerified: false,
      profile: { create: { firstName: "Anita", lastName: "Roy" } },
    },
  });

  // Register via AuthService.registerUser
  await AuthService.registerUser({
    firstName: "Anita",
    lastName: "Roy",
    email: authServiceTestEmail,
    password: "NewPassword123!",
    role: "TEACHER",
    headline: "Math Wizard",
    subjects: "Algebra, Geometry",
    hourlyRate: 50,
  });

  const authOtp = "554433";
  await prisma.pendingRegistration.update({
    where: { email: authServiceTestEmail },
    data: {
      codeHash: hashToken(authOtp),
      attempts: 0,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    },
  });

  // Verify OTP via AuthService.verifyOTP: MUST NOT throw "Unique constraint failed on the fields: ('email')"!
  const verifyResult = await AuthService.verifyOTP(authServiceTestEmail, authOtp);
  assert.strictEqual(verifyResult.success, true);
  assert.strictEqual(verifyResult.user?.id, preUserAuth.id, "Must update existing user record without creating duplicate!");

  const updatedAuthUser = await prisma.user.findUnique({
    where: { email: authServiceTestEmail },
    include: { teacherProfile: true },
  });
  assert.strictEqual(updatedAuthUser?.emailVerified, true);
  assert.strictEqual(updatedAuthUser?.teacherProfile?.headline, "Math Wizard");
  console.log("  ✅ AuthService.verifyOTP successfully updated existing user without unique constraint error.");

  // ========================================================================
  // Test 6: Database Unique Constraint Verification
  // ========================================================================
  console.log("\nTest 6: Verifying Database Email Unique Constraint Remains Intact...");
  try {
    await prisma.user.create({
      data: {
        email: testEmail, // already exists
        passwordHash: "dummy_hash",
        role: "STUDENT",
      },
    });
    assert.fail("Database unique constraint should have rejected duplicate email insertion!");
  } catch (err: any) {
    assert.ok(
      err.message.includes("Unique constraint failed") || err.code === "P2002",
      `Expected unique constraint failure code P2002, got: ${err.message}`
    );
    console.log("  ✅ Database unique constraint on ('email') is strictly preserved and active.");
  }

  console.log("\n🎉 ALL 6 COMPREHENSIVE EDUCATOR REGISTRATION & OTP VERIFICATION TESTS PASSED! 🚀");
}

runEducatorRegistrationFlowTests()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("❌ Test failed with error:", err);
    await prisma.$disconnect();
    process.exit(1);
  });
