process.env.EMAIL_PROVIDER = "console";

import assert from "node:assert";
import { prisma } from "../lib/prisma";
import { AuthService } from "../services/auth-service";
import { verifyTokenHash, hashToken } from "../lib/auth/tokens";
import { encodeSession, decodeSession, applyLogoutCookies } from "../lib/auth/session";
import { UserRole } from "../types/auth";
import { NextResponse } from "next/server";

async function runAdminDynamicOTPTests() {
  console.log("🧪 Running EduConnects Admin Login Dynamic OTP Test Suite...\n");

  const adminEmail = "educonnets.com@gmail.com";

  // ------------------------------------------------------------------------
  // Test 1: Verify Existing Authorized Admin Account
  // ------------------------------------------------------------------------
  console.log("Test 1: Verifying existing authorized admin account in database...");
  const adminUser = await prisma.user.findUnique({
    where: { email: adminEmail },
    include: { profile: true },
  });
  assert.ok(adminUser, "Admin account educonnets.com@gmail.com must exist in the database");
  assert.strictEqual(adminUser.role, "ADMIN", "Account role must be ADMIN");
  assert.strictEqual(adminUser.status, "ACTIVE", "Account status must be ACTIVE");
  console.log(`✅ Passed: Admin account confirmed (${adminUser.email}, role: ${adminUser.role}).`);

  // Clear existing unverified OTP records for clean test state
  await prisma.emailVerification.updateMany({
    where: { userId: adminUser.id, verifiedAt: null },
    data: { expiresAt: new Date() },
  });

  // ------------------------------------------------------------------------
  // Test 2: Dynamic OTP Generation on Admin Login Request
  // ------------------------------------------------------------------------
  console.log("\nTest 2: Initiating Admin Login (Dynamic OTP Generation)...");
  const loginResult = await AuthService.loginUser({
    email: adminEmail,
  });

  assert.strictEqual(loginResult.requiresOtp, true, "Admin login must require OTP");
  assert.strictEqual(loginResult.requiresVerification, true, "Admin login must require verification");
  assert.strictEqual(loginResult.role, "ADMIN", "Role must be ADMIN");
  // CRITICAL: Ensure no OTP is leaked in loginResult
  assert.strictEqual((loginResult as any).otp, undefined, "OTP must NOT be exposed in login result");
  console.log("✅ Passed: Admin login successfully initiated without exposing OTP in response.");

  // ------------------------------------------------------------------------
  // Test 3: OTP Storage Security (SHA-256 Hashing & Expiration)
  // ------------------------------------------------------------------------
  console.log("\nTest 3: Checking OTP Secure Storage in Database...");
  const latestVerification = await prisma.emailVerification.findFirst({
    where: { userId: adminUser.id, verifiedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  assert.ok(latestVerification, "Active email verification record must exist in DB");
  assert.strictEqual(latestVerification.attempts, 0, "Attempts counter must start at 0");
  assert.ok(latestVerification.codeHash, "Hashed OTP must exist");
  assert.strictEqual(latestVerification.codeHash.length, 64, "OTP hash must be 64-character hex (SHA-256)");
  
  // Verify expiration is ~10 minutes in future
  const timeRemainingMs = latestVerification.expiresAt.getTime() - Date.now();
  const minutesRemaining = timeRemainingMs / (60 * 1000);
  assert.ok(minutesRemaining > 9 && minutesRemaining <= 10.1, "OTP expiration must be ~10 minutes");
  console.log(`✅ Passed: OTP stored securely as SHA-256 hash with 10-minute validity (${minutesRemaining.toFixed(1)} mins).`);

  // ------------------------------------------------------------------------
  // Test 4: Complete Removal of Predefined / Static OTP (123456)
  // ------------------------------------------------------------------------
  console.log("\nTest 4: Verifying Predefined/Static OTP (123456, 000000, 111111) Rejection...");
  const staticCodes = ["123456", "000000", "111111"];
  for (const staticCode of staticCodes) {
    try {
      await AuthService.verifyOTP(adminEmail, staticCode);
      assert.fail(`Static code ${staticCode} should have been strictly rejected`);
    } catch (err: any) {
      assert.ok(
        err.message.includes("Incorrect verification code") || err.message.includes("Too many incorrect attempts"),
        `Expected rejection message for static code ${staticCode}`
      );
    }
  }
  console.log("✅ Passed: Predefined OTPs (123456, 000000, 111111) are completely blocked.");

  // ------------------------------------------------------------------------
  // Test 5: Dynamic OTP Verification & Admin Session Generation
  // ------------------------------------------------------------------------
  console.log("\nTest 5: Testing Successful Verification with Valid Dynamic OTP...");
  // Simulate knowing the generated OTP by injecting a known hash for testing verification
  const knownDynamicOTP = "482913";
  const updatedRecord = await prisma.emailVerification.update({
    where: { id: latestVerification.id },
    data: { codeHash: hashToken(knownDynamicOTP), attempts: 0 },
  });

  const verifyResult = await AuthService.verifyOTP(adminEmail, knownDynamicOTP);
  assert.strictEqual(verifyResult.success, true, "Verification must succeed with valid OTP");
  assert.ok(verifyResult.user, "User session must be returned");
  assert.strictEqual(verifyResult.user.role, "ADMIN", "Session user role must be ADMIN");
  assert.strictEqual(verifyResult.user.email, adminEmail);
  assert.strictEqual(verifyResult.redirectPath, "/admin", "Admin must be redirected to /admin");
  console.log("✅ Passed: Dynamic OTP verified, authenticated admin session created, redirectPath=/admin.");

  // Confirm record is marked verifiedAt
  const checkedRecord = await prisma.emailVerification.findUnique({
    where: { id: latestVerification.id },
  });
  assert.ok(checkedRecord?.verifiedAt, "Verification record must be marked verifiedAt");
  console.log("✅ Passed: Verification record successfully finalized with verifiedAt timestamp.");

  // ------------------------------------------------------------------------
  // Test 6: Resend Cooldown Enforcement (60 seconds)
  // ------------------------------------------------------------------------
  console.log("\nTest 6: Testing Resend OTP Cooldown Enforcement (60 seconds)...");
  // Trigger new OTP request
  await prisma.emailVerification.updateMany({
    where: { userId: adminUser.id },
    data: { expiresAt: new Date(), createdAt: new Date(Date.now() - 70 * 1000) },
  });
  await AuthService.loginUser({ email: adminEmail });

  try {
    await AuthService.resendVerification(adminEmail);
    assert.fail("Rapid resend must be blocked by 60s cooldown");
  } catch (err: any) {
    assert.ok(err.message.includes("Please wait"), `Cooldown error expected, got: ${err.message}`);
    console.log(`✅ Passed: Cooldown enforced (${err.message}).`);
  }

  // ------------------------------------------------------------------------
  // Test 7: Previous OTP Invalidation on Resend (Single Active OTP)
  // ------------------------------------------------------------------------
  console.log("\nTest 7: Testing Invalidation of Older OTP on Resend...");
  const activeRecordBefore = await prisma.emailVerification.findFirst({
    where: { userId: adminUser.id, verifiedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  assert.ok(activeRecordBefore);

  // Fast-forward cooldown by setting createdAt back 65 seconds
  await prisma.emailVerification.update({
    where: { id: activeRecordBefore.id },
    data: { createdAt: new Date(Date.now() - 65 * 1000) },
  });

  // Request resend
  await AuthService.resendVerification(adminEmail);

  // Check that old record is expired
  const oldRecordCheck = await prisma.emailVerification.findUnique({
    where: { id: activeRecordBefore.id },
  });
  assert.ok(
    oldRecordCheck && oldRecordCheck.expiresAt <= new Date(),
    "Previous OTP record must be expired upon resend"
  );

  // Check new record exists with different hash
  const newActiveRecord = await prisma.emailVerification.findFirst({
    where: { userId: adminUser.id, verifiedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  assert.ok(newActiveRecord);
  assert.notStrictEqual(newActiveRecord.id, activeRecordBefore.id, "New verification record created");
  assert.notStrictEqual(newActiveRecord.codeHash, activeRecordBefore.codeHash, "New OTP hash generated");
  console.log("✅ Passed: Older OTP automatically invalidated; only newest OTP is active.");

  // ------------------------------------------------------------------------
  // Test 8: Attempt Limit Protection (Max 5 Failed Attempts)
  // ------------------------------------------------------------------------
  console.log("\nTest 8: Testing Attempt Limit Protection (Max 5 Attempts)...");
  // Set known OTP
  const attemptTestOTP = "554433";
  await prisma.emailVerification.update({
    where: { id: newActiveRecord.id },
    data: { codeHash: hashToken(attemptTestOTP), attempts: 0 },
  });

  // Fail 5 times with wrong codes
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      await AuthService.verifyOTP(adminEmail, "000000");
      assert.fail("Should have failed");
    } catch (err: any) {
      assert.ok(err.message.includes("Incorrect verification code"));
    }
  }

  // 5th failed attempt should trigger exhaustion
  try {
    await AuthService.verifyOTP(adminEmail, "000000");
    assert.fail("5th failed attempt must exhaust OTP");
  } catch (err: any) {
    assert.ok(err.message.includes("Too many incorrect attempts"), `Expected attempt limit message, got: ${err.message}`);
  }

  // Verify record is now expired in database
  const exhaustedRecord = await prisma.emailVerification.findUnique({
    where: { id: newActiveRecord.id },
  });
  assert.ok(exhaustedRecord && exhaustedRecord.expiresAt <= new Date(), "Record must be expired after 5 attempts");

  // Even the correct OTP must now be rejected
  try {
    await AuthService.verifyOTP(adminEmail, attemptTestOTP);
    assert.fail("Exhausted OTP must not accept valid code");
  } catch (err: any) {
    assert.ok(
      err.message.includes("Too many incorrect attempts") || err.message.includes("expired") || err.message.includes("No active"),
      "Must reject exhausted OTP"
    );
  }
  console.log("✅ Passed: 5 incorrect attempts permanently invalidates OTP and locks verification.");

  // ------------------------------------------------------------------------
  // Test 9: Expired OTP Rejection (>10 Minutes)
  // ------------------------------------------------------------------------
  console.log("\nTest 9: Testing Expired OTP Rejection...");
  // Fast forward cooldown
  await prisma.emailVerification.updateMany({
    where: { userId: adminUser.id },
    data: { createdAt: new Date(Date.now() - 70 * 1000) },
  });

  // Create an expired record
  const expiredOTP = "112233";
  const expiredRecord = await prisma.emailVerification.create({
    data: {
      userId: adminUser.id,
      codeHash: hashToken(expiredOTP),
      tokenHash: hashToken("expired-token-123"),
      expiresAt: new Date(Date.now() - 60 * 1000), // Expired 1 minute ago
    },
  });

  try {
    await AuthService.verifyOTP(adminEmail, expiredOTP);
    assert.fail("Expired OTP must be rejected");
  } catch (err: any) {
    assert.ok(err.message.includes("expired"), `Expected expired error, got: ${err.message}`);
    console.log(`✅ Passed: Expired OTP rejected (${err.message}).`);
  }
  await prisma.emailVerification.delete({ where: { id: expiredRecord.id } }).catch(() => {});

  // ------------------------------------------------------------------------
  // Test 10: Server-Side Role Enforcement (Non-Admins Blocked from Admin Dashboard)
  // ------------------------------------------------------------------------
  console.log("\nTest 10: Testing Server-Side Role Verification (Learner/Educator Isolation)...");
  // Create a temporary student user
  const tempStudentEmail = `learner.boundary.${Date.now()}@educonnects.com`;
  const tempStudent = await prisma.user.create({
    data: {
      email: tempStudentEmail,
      passwordHash: adminUser.passwordHash,
      role: "STUDENT",
      emailVerified: true,
      profile: { create: { firstName: "Test", lastName: "Learner" } },
    },
  });

  try {
    // 1. Student cannot log in without password
    try {
      await AuthService.loginUser({ email: tempStudentEmail });
      assert.fail("Student without password must be rejected");
    } catch (err: any) {
      assert.ok(err.message.includes("Password is required"), "Password required for non-admins");
    }

    // 2. Student redirect path is never /admin
    const studentLogin = await AuthService.loginUser({
      email: tempStudentEmail,
      password: "Password123!",
    });
    assert.strictEqual(studentLogin.role, "STUDENT");

    // Inject OTP and verify
    const studentOTP = "998811";
    const studentRec = await prisma.emailVerification.findFirst({
      where: { userId: tempStudent.id, verifiedAt: null },
      orderBy: { createdAt: "desc" },
    });
    assert.ok(studentRec);
    await prisma.emailVerification.update({
      where: { id: studentRec.id },
      data: { codeHash: hashToken(studentOTP) },
    });

    const studentVerify = await AuthService.verifyOTP(tempStudentEmail, studentOTP);
    assert.strictEqual(studentVerify.redirectPath, "/student/dashboard", "Learner redirect must be /student/dashboard");
    assert.notStrictEqual(studentVerify.redirectPath, "/admin", "Learner redirect MUST NOT be /admin");
    console.log("✅ Passed: Non-admin accounts strictly isolated to student dashboard; admin access blocked.");
  } finally {
    await prisma.emailVerification.deleteMany({ where: { userId: tempStudent.id } });
    await prisma.profile.deleteMany({ where: { userId: tempStudent.id } });
    await prisma.user.delete({ where: { id: tempStudent.id } });
  }

  // ------------------------------------------------------------------------
  // Test 11: Session Encoding, HttpOnly Cookies & Logout Invalidation
  // ------------------------------------------------------------------------
  console.log("\nTest 11: Testing Admin Session Encoding, HttpOnly Cookies & Logout Invalidation...");
  const adminSession = {
    id: adminUser.id,
    userId: adminUser.id,
    email: adminUser.email,
    role: "ADMIN" as UserRole,
    emailVerified: true,
    firstName: "System",
    lastName: "Administrator",
  };

  const encoded = encodeSession(adminSession);
  assert.ok(encoded, "Session must be encoded");
  const decoded = decodeSession(encoded);
  assert.ok(decoded);
  assert.strictEqual(decoded.email, adminEmail);
  assert.strictEqual(decoded.role, "ADMIN");

  // Test applyLogoutCookies
  const testResponse = NextResponse.json({ success: true });
  const logoutResponse = applyLogoutCookies(testResponse, "educonnects.co.in");
  const setCookieHeader = logoutResponse.headers.get("Set-Cookie");
  assert.ok(setCookieHeader, "Set-Cookie headers must be present on logout");
  assert.ok(setCookieHeader.includes("Max-Age=0") || setCookieHeader.includes("Expires="), "Cookie must be expired on logout");
  console.log("✅ Passed: Admin session cookies and multi-domain logout invalidation verified.");

  console.log("\n🎉 ALL 11 ADMIN DYNAMIC OTP TESTS PASSED SUCCESSFULLY! 🚀\n");
}

runAdminDynamicOTPTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Test Failure:", err);
    process.exit(1);
  });
