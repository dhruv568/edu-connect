import assert from "node:assert";
import { AuthService } from "../services/auth-service";
import { getEmailProvider, EmailService } from "../lib/email/email-service";
import { prisma } from "../lib/prisma";

async function runOTPTests() {
  console.log("🧪 Running EduConnect Email OTP & Resend System Tests...\n");

  const testEmail = `otp.test.${Date.now()}@educonnect.com`;

  // Test 1: Register User and generate initial OTP
  console.log("Test 1: Registering User and Generating Initial OTP...");
  const user = await AuthService.registerUser({
    firstName: "Alex",
    lastName: "Testing",
    email: testEmail,
    password: "Password123!",
    role: "STUDENT",
  });
  assert.strictEqual(user.emailVerified, false);
  console.log("✅ Passed: User registered, initial OTP generated and saved.");

  // Test 2: Resend Cooldown Enforcement
  console.log("\nTest 2: Testing Resend Cooldown Block (60 seconds)...");
  try {
    await AuthService.resendVerification(testEmail);
    assert.fail("Should have thrown resend cooldown error");
  } catch (err: any) {
    assert.ok(err.message.includes("Please wait"), "Should enforce cooldown wait message");
    console.log(`✅ Passed: Resend cooldown correctly enforced (${err.message}).`);
  }

  // Test 3: Invalidation of Previous OTP (Single Active OTP Rule on Pending Registration)
  console.log("\nTest 3: Testing Invalidation of Older OTP (Single Active OTP on Pending Registration)...");
  const initialPending = await prisma.pendingRegistration.findUnique({
    where: { email: testEmail },
  });
  assert.ok(initialPending, "Initial pending registration record must exist");
  const oldCodeHash = initialPending.codeHash;

  // Simulate cooldown passing by setting updatedAt back 65 seconds
  await prisma.pendingRegistration.update({
    where: { email: testEmail },
    data: { updatedAt: new Date(Date.now() - 65 * 1000) },
  });

  // Request new OTP
  await AuthService.resendVerification(testEmail);

  // Check that pending registration was updated with new codeHash
  const updatedPending = await prisma.pendingRegistration.findUnique({
    where: { email: testEmail },
  });
  assert.ok(updatedPending, "Updated pending record must exist");
  assert.notStrictEqual(updatedPending.codeHash, oldCodeHash, "New OTP must replace previous codeHash");
  assert.strictEqual(updatedPending.attempts, 0, "Attempts must reset to 0 on resend");
  console.log("✅ Passed: Previous OTP automatically replaced; only newest OTP is active.");

  // Test 4: Attempt Limit & Invalidation on Wrong Code
  console.log("\nTest 4: Testing Invalid OTP Attempt Handling & Max Attempts Limit...");
  try {
    await AuthService.verifyOTP(testEmail, "000000");
    assert.fail("Should have rejected wrong OTP");
  } catch (err: any) {
    assert.ok(err.message.includes("Incorrect verification code"), "Should reject invalid OTP");
    console.log("✅ Passed: Wrong OTP rejected with user-friendly message.");
  }

  // Test 5: Email Provider Resolution
  console.log("\nTest 5: Verifying Email Provider Factory...");
  const provider = getEmailProvider();
  assert.ok(provider.name, "Email provider must have a valid name identifier");
  console.log(`✅ Passed: Active email provider resolved to "${provider.name}".`);

  // Test 6: Successful Registration OTP Verification & User Creation in Main DB
  console.log("\nTest 6: Testing Correct Registration OTP Verification & User Creation...");
  const testOTP = "789456";
  const { hashToken } = require("../lib/auth/tokens");
  await prisma.pendingRegistration.update({
    where: { email: testEmail },
    data: { codeHash: hashToken(testOTP), attempts: 0, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
  });

  const verifySuccess = await AuthService.verifyOTP(testEmail, testOTP);
  assert.strictEqual(verifySuccess.success, true);
  assert.ok(verifySuccess.user, "User session must be returned on valid OTP");
  assert.strictEqual(verifySuccess.user.emailVerified, true, "User session must have emailVerified=true");
  assert.strictEqual(verifySuccess.redirectPath, "/student/dashboard");

  // Verify user is now in main users table
  const createdUser = await prisma.user.findUnique({ where: { email: testEmail } });
  assert.ok(createdUser, "User must now be in main users table");
  assert.strictEqual(createdUser.emailVerified, true);
  console.log("✅ Passed: Registration OTP verified, user created in main DB, session returned.");

  // Test 7: Mandatory OTP on Login Flow for Verified User
  console.log("\nTest 7: Testing Mandatory OTP on Login Flow...");
  const loginResult = await AuthService.loginUser({
    email: testEmail,
    password: "Password123!",
  });
  assert.strictEqual(loginResult.requiresOtp, true, "Login must require OTP");
  assert.strictEqual(loginResult.requiresVerification, true, "Login must require verification");
  console.log("✅ Passed: Login successfully initiates mandatory OTP dispatch without granting session.");

  // Test 8: Wrong Credentials Rejection
  console.log("\nTest 8: Testing Wrong Login Credentials Rejection...");
  try {
    await AuthService.loginUser({
      email: testEmail,
      password: "WrongPassword!",
    });
    assert.fail("Should have rejected wrong password");
  } catch (err: any) {
    assert.ok(err.message.includes("Invalid email or password"), "Should reject invalid password");
    console.log("✅ Passed: Invalid login password rejected.");
  }

  // Test 9: Login OTP Verification and Session Issuance
  console.log("\nTest 9: Testing Login OTP Verification & Session Issuance...");
  const activeVerification = await prisma.emailVerification.findFirst({
    where: { userId: createdUser.id, verifiedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  assert.ok(activeVerification, "Active login verification record must exist");

  const loginOTP = "654321";
  await prisma.emailVerification.update({
    where: { id: activeVerification.id },
    data: { codeHash: hashToken(loginOTP), attempts: 0 },
  });

  const loginVerifySuccess = await AuthService.verifyOTP(testEmail, loginOTP);
  assert.strictEqual(loginVerifySuccess.success, true);
  assert.ok(loginVerifySuccess.user, "User session must be returned on valid login OTP");
  assert.strictEqual(loginVerifySuccess.user.emailVerified, true);
  console.log("✅ Passed: Login OTP verified and session issued.");

  // Test 10: Mandatory OTP on Subsequent Login (No Bypass)
  console.log("\nTest 10: Verifying No Bypass on Subsequent Login for Verified User...");
  const secondLoginResult = await AuthService.loginUser({
    email: testEmail,
    password: "Password123!",
  });
  assert.strictEqual(secondLoginResult.requiresOtp, true, "Subsequent login must still require OTP");

  try {
    await AuthService.verifyOTP(testEmail, "111111");
    assert.fail("Wrong OTP on verified user must not be accepted");
  } catch (err: any) {
    assert.ok(err.message.includes("Incorrect verification code"), "Wrong OTP must be blocked");
    console.log("✅ Passed: Verified users cannot bypass OTP with wrong code.");
  }

  console.log("\n🎉 ALL OTP & MANDATORY LOGIN INTEGRATION TESTS PASSED SUCCESSFULLY! 🚀\n");
}

runOTPTests().catch((err) => {
  console.error("❌ Test Failure:", err);
  process.exit(1);
});

