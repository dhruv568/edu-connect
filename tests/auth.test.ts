import assert from "node:assert";
import { RegisterSchema, LoginSchema, VerifyOTPSchema } from "../schemas/auth-schemas";
import { generateOTP, generateVerificationToken, hashToken, verifyTokenHash, maskEmail } from "../lib/auth/tokens";
import { hashPassword, verifyPassword } from "../lib/auth/password";
import { ConsoleEmailProvider } from "../lib/email/email-service";

async function runTests() {
  console.log("🧪 Running EduConnect Module 01 Architectural Verification Tests...\n");

  // Test 1: Zod Registration Schema
  console.log("Test 1: Validating Zod Registration Schema...");
  const validRegister = RegisterSchema.parse({
    email: "test.student@educonnect.com",
    password: "Password123!",
    firstName: "Test",
    lastName: "Student",
    role: "STUDENT",
  });
  assert.strictEqual(validRegister.role, "STUDENT");
  assert.strictEqual(validRegister.email, "test.student@educonnect.com");
  console.log("✅ Passed: Zod Registration Schema validation.");

  // Test 2: Invalid Password Rejection
  console.log("\nTest 2: Verifying Zod Password Strength Enforcement...");
  try {
    RegisterSchema.parse({
      email: "weak@educonnect.com",
      password: "weak",
      firstName: "Weak",
      lastName: "Pass",
    });
    assert.fail("Should have failed on weak password");
  } catch (e: any) {
    assert.ok(e.name === "ZodError");
    console.log("✅ Passed: Weak password properly rejected.");
  }

  // Test 3: Password Hashing & Verification
  console.log("\nTest 3: Testing Bcrypt Password Hashing...");
  const plainPass = "SuperSecret2026!";
  const hash = await hashPassword(plainPass);
  const isMatch = await verifyPassword(plainPass, hash);
  const isWrongMatch = await verifyPassword("WrongPassword123", hash);
  assert.strictEqual(isMatch, true);
  assert.strictEqual(isWrongMatch, false);
  console.log("✅ Passed: Password hashing & timing verification.");

  // Test 4: OTP Generation & SHA-256 Token Hashing
  console.log("\nTest 4: Testing 6-Digit OTP & Token SHA-256 Hashing...");
  const otp = generateOTP();
  assert.strictEqual(otp.length, 6);
  assert.ok(/^\d{6}$/.test(otp), "OTP must be 6 numeric digits");

  const hashedOTP = hashToken(otp);
  const isValidOTP = verifyTokenHash(otp, hashedOTP);
  const isInvalidOTP = verifyTokenHash("999999", hashedOTP);
  assert.strictEqual(isValidOTP, true);
  assert.strictEqual(isInvalidOTP, false);
  console.log("✅ Passed: 6-digit OTP generation and timing-safe token verification.");

  // Test 5: Email Masking Utility
  console.log("\nTest 5: Testing Email Privacy Masking...");
  const masked = maskEmail("dhruv.tester@gmail.com");
  assert.strictEqual(masked, "dh***@gmail.com");
  console.log("✅ Passed: Email privacy masking (dh***@gmail.com).");

  // Test 6: Console Email Provider Abstraction
  console.log("\nTest 6: Testing Email Provider Abstraction (Console Provider)...");
  const provider = new ConsoleEmailProvider();
  const sent = await provider.sendVerificationEmail({
    to: "dhruv@gmail.com",
    subject: "Verify your EduConnect email",
    templateParams: {
      recipientEmail: "dhruv@gmail.com",
      firstName: "Dhruv",
      otp: "123456",
      verificationUrl: "http://localhost:3000/verify-email?token=abc",
      expiresInMinutes: 15,
    },
  });
  assert.strictEqual(sent, true);
  // Test 7: LoginSchema & VerifyOTPSchema validation
  console.log("\nTest 7: Testing LoginSchema & VerifyOTPSchema Zod Constraints...");
  const validLogin = LoginSchema.parse({
    email: "user@educonnect.com",
    password: "Password123!",
  });
  assert.strictEqual(validLogin.email, "user@educonnect.com");

  const validLoginWithOtp = LoginSchema.parse({
    email: "user@educonnect.com",
    password: "Password123!",
    otp: "123456",
  });
  assert.strictEqual(validLoginWithOtp.otp, "123456");

  const validOtp = VerifyOTPSchema.parse({
    email: "user@educonnect.com",
    otp: "654321",
  });
  assert.strictEqual(validOtp.otp, "654321");

  try {
    VerifyOTPSchema.parse({
      email: "user@educonnect.com",
      otp: "12345", // too short
    });
    assert.fail("Should reject short OTP");
  } catch (e: any) {
    assert.ok(e.name === "ZodError");
  }

  try {
    VerifyOTPSchema.parse({
      email: "user@educonnect.com",
      otp: "12345a", // non numeric
    });
    assert.fail("Should reject non-numeric OTP");
  } catch (e: any) {
    assert.ok(e.name === "ZodError");
  }
  console.log("✅ Passed: LoginSchema and VerifyOTPSchema validation.");

  console.log("\n🎉 ALL ARCHITECTURAL TESTS PASSED SUCCESSFULLY! 🚀\n");
}

runTests().catch((err) => {
  console.error("❌ Test Failure:", err);
  process.exit(1);
});
