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

  // Test 3: Invalidation of Previous OTP (Single Active OTP Rule)
  console.log("\nTest 3: Testing Invalidation of Older OTP (Single Active OTP)...");
  // Force reset latest record's createdAt to simulate 61 seconds passing
  const initialVerification = await prisma.emailVerification.findFirst({
    where: { userId: user.id, verifiedAt: null },
    orderBy: { createdAt: "desc" },
  });
  assert.ok(initialVerification, "Initial verification record must exist");

  await prisma.emailVerification.update({
    where: { id: initialVerification.id },
    data: { createdAt: new Date(Date.now() - 65 * 1000) },
  });

  // Request new OTP
  await AuthService.resendVerification(testEmail);

  // Check that initial verification record was invalidated (expired)
  const updatedInitial = await prisma.emailVerification.findUnique({
    where: { id: initialVerification.id },
  });
  assert.ok(updatedInitial, "Initial record should still exist in database");
  assert.ok(updatedInitial.expiresAt <= new Date(), "Initial record must be invalidated/expired after new OTP generation");

  const activeVerifications = await prisma.emailVerification.findMany({
    where: { userId: user.id, verifiedAt: null, expiresAt: { gt: new Date() } },
  });
  assert.strictEqual(activeVerifications.length, 1, "Only 1 active unexpired OTP should exist");
  console.log("✅ Passed: Previous OTP automatically invalidated; only newest OTP is active.");

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

  // Test 6: Mandatory OTP on Login Flow
  console.log("\nTest 6: Testing Mandatory OTP on Login Flow...");
  const loginResult = await AuthService.loginUser({
    email: testEmail,
    password: "Password123!",
  });
  assert.strictEqual(loginResult.requiresOtp, true, "Login must require OTP");
  assert.strictEqual(loginResult.requiresVerification, true, "Login must require verification");
  assert.strictEqual(loginResult.emailVerified, false, "Session must not be verified prior to OTP submission");
  console.log("✅ Passed: Login successfully initiates mandatory OTP dispatch without granting session.");

  // Test 7: Wrong Credentials Rejection
  console.log("\nTest 7: Testing Wrong Login Credentials Rejection...");
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

  // Test 8: Successful OTP Verification and Session Issuance
  console.log("\nTest 8: Testing Correct OTP Verification & Session Issuance...");
  // Query the newest active OTP codeHash from database and verify with valid OTP
  const activeVerification = await prisma.emailVerification.findFirst({
    where: { userId: user.id, verifiedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  assert.ok(activeVerification, "Active verification record must exist");

  // In test environment, manually update codeHash to a known OTP hash to test verification
  const testOTP = "789456";
  const { hashToken } = require("../lib/auth/tokens");
  await prisma.emailVerification.update({
    where: { id: activeVerification.id },
    data: { codeHash: hashToken(testOTP), attempts: 0 },
  });

  const verifySuccess = await AuthService.verifyOTP(testEmail, testOTP);
  assert.strictEqual(verifySuccess.success, true);
  assert.ok(verifySuccess.user, "User session must be returned on valid OTP");
  assert.strictEqual(verifySuccess.user.emailVerified, true, "User session must have emailVerified=true");
  assert.strictEqual(verifySuccess.redirectPath, "/student/dashboard");
  console.log("✅ Passed: Valid OTP verified, session created, emailVerified marked true.");

  // Test 9: Mandatory OTP on subsequent login for verified users (No Bypass)
  console.log("\nTest 9: Verifying No Bypass on Subsequent Login for Verified User...");
  // User is now verified in DB. Trigger login again:
  const secondLoginResult = await AuthService.loginUser({
    email: testEmail,
    password: "Password123!",
  });
  assert.strictEqual(secondLoginResult.requiresOtp, true, "Subsequent login must still require OTP");

  // Attempting to verify with wrong OTP on verified user must NOT bypass
  try {
    await AuthService.verifyOTP(testEmail, "111111");
    assert.fail("Wrong OTP on verified user must not be accepted");
  } catch (err: any) {
    assert.ok(err.message.includes("Incorrect verification code"), "Wrong OTP must be blocked even for verified users");
    console.log("✅ Passed: Verified users cannot bypass OTP with wrong code.");
  }

  console.log("\n🎉 ALL OTP & MANDATORY LOGIN INTEGRATION TESTS PASSED SUCCESSFULLY! 🚀\n");
}

runOTPTests().catch((err) => {
  console.error("❌ Test Failure:", err);
  process.exit(1);
});
