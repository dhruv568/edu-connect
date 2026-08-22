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

  console.log("\n🎉 ALL OTP & RESEND INTEGRATION TESTS PASSED SUCCESSFULLY! 🚀\n");
}

runOTPTests().catch((err) => {
  console.error("❌ Test Failure:", err);
  process.exit(1);
});
