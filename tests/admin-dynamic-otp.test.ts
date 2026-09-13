process.env.EMAIL_PROVIDER = "console";

import assert from "node:assert";
import { prisma } from "../lib/prisma";
import { AuthService } from "../services/auth-service";
import { hashToken } from "../lib/auth/tokens";
import { decodeSession } from "../lib/auth/session";
import { NextRequest } from "next/server";
import { POST as loginRoute } from "../app/api/auth/login/route";
import { POST as verifyEmailRoute } from "../app/api/auth/verify-email/route";
import { POST as resendOtpRoute } from "../app/api/auth/resend-otp/route";
import { POST as logoutRoute } from "../app/api/auth/logout/route";
import { middleware } from "../middleware";

async function runAdminDynamicOTPTests() {
  console.log("🧪 Running EduConnects Admin Login Mandatory Dynamic OTP Test Suite...\n");

  const adminEmail = "educonnects.com@gmail.com";
  const adminPassword = "Password123!";

  // ------------------------------------------------------------------------
  // Setup: Confirm Admin User Exists
  // ------------------------------------------------------------------------
  const adminUser = await prisma.user.findUnique({
    where: { email: adminEmail },
    include: { profile: true },
  });
  assert.ok(adminUser, "Admin account educonnects.com@gmail.com must exist in the database");
  assert.strictEqual(adminUser.role, "ADMIN", "Account role must be ADMIN");
  assert.strictEqual(adminUser.status, "ACTIVE", "Account status must be ACTIVE");

  const oldTypoUser = await prisma.user.findUnique({
    where: { email: "educonnets.com@gmail.com" },
  });
  assert.strictEqual(oldTypoUser, null, "Legacy typo email educonnets.com@gmail.com must NOT exist in the database");

  // Clean old unverified OTP records to start fresh
  await prisma.emailVerification.updateMany({
    where: { userId: adminUser.id, verifiedAt: null },
    data: { expiresAt: new Date(), createdAt: new Date(Date.now() - 70 * 1000) },
  });

  // ========================================================================
  // TEST 1: Enter educonnects.com@gmail.com + correct password
  // Expected:
  // → OTP email sent
  // → OTP verification page shown
  // → Admin Dashboard NOT accessible yet (no session cookie)
  // ========================================================================
  console.log("TEST 1: Admin Login with Email & Password (OTP Dispatched, No Session)...");

  // First test wrong password rejection
  const wrongPassReq = new NextRequest("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: adminEmail, password: "WrongPassword999!" }),
  });
  const wrongPassRes = await loginRoute(wrongPassReq);
  assert.strictEqual(wrongPassRes.status, 401, "Wrong password must be rejected with 401");
  const wrongPassData = await wrongPassRes.json();
  assert.strictEqual(wrongPassData.success, false);
  console.log("  ✅ Wrong password rejected immediately.");

  // Now login with correct credentials
  const loginReq = new NextRequest("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: adminEmail, password: adminPassword }),
  });
  const loginRes = await loginRoute(loginReq);
  assert.strictEqual(loginRes.status, 200, "Valid credentials must return 200");
  const loginData = await loginRes.json();

  assert.strictEqual(loginData.data.requiresVerification, true, "Must require OTP verification");
  assert.strictEqual(loginData.data.requiresOtp, true, "Must flag requiresOtp");
  assert.strictEqual(
    loginData.data.redirectPath,
    `/verify-email?email=${encodeURIComponent(adminEmail)}&redirectTo=%2Fadmin`,
    "Redirect path must point to /verify-email targeting /admin"
  );

  // CRITICAL SECURITY ASSERTION: No authenticated session cookie (`educonnects_session`) must be issued!
  const loginCookies = loginRes.headers.getSetCookie();
  const sessionCookie = loginCookies.find((c) => c.startsWith("educonnects_session="));
  assert.strictEqual(sessionCookie, undefined, "CRITICAL: educonnects_session cookie MUST NOT be set before OTP!");

  // Must set temporary pending admin cookie
  const pendingCookie = loginCookies.find((c) => c.startsWith("admin_pending_otp="));
  assert.ok(pendingCookie, "Temporary admin_pending_otp cookie must be set");

  // Verify Admin Dashboard is NOT accessible with the response cookies
  const mwCheckBeforeOtp = middleware(
    new NextRequest("http://localhost:3000/admin", {
      headers: { cookie: pendingCookie },
    })
  );
  assert.strictEqual(mwCheckBeforeOtp.status, 307, "Admin dashboard access must be redirected");
  assert.ok(mwCheckBeforeOtp.headers.get("Location")?.includes("/admin/login"), "Must redirect to /admin/login");
  console.log("  ✅ Passed: OTP dispatched, /verify-email target returned, Admin Dashboard NOT accessible.");

  // Retrieve the generated OTP record from DB
  const latestOtpRecord = await prisma.emailVerification.findFirst({
    where: { userId: adminUser.id, verifiedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  assert.ok(latestOtpRecord, "Active email verification record must exist in DB");
  assert.strictEqual(latestOtpRecord.attempts, 0);
  assert.strictEqual(latestOtpRecord.codeHash.length, 64, "OTP must be SHA-256 hashed");

  // ========================================================================
  // TEST 2: Enter incorrect OTP
  // Expected:
  // → Invalid OTP
  // → no Admin session
  // ========================================================================
  console.log("\nTEST 2: Entering Incorrect OTP...");
  const wrongOtpReq = new NextRequest("http://localhost:3000/api/auth/verify-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: adminEmail, otp: "000000" }),
  });
  const wrongOtpRes = await verifyEmailRoute(wrongOtpReq);
  assert.strictEqual(wrongOtpRes.status, 400, "Wrong OTP must return 400");
  const wrongOtpData = await wrongOtpRes.json();
  assert.strictEqual(wrongOtpData.success, false);
  assert.ok(wrongOtpData.error.includes("Incorrect verification code") || wrongOtpData.error.includes("Invalid"));

  // Verify no session cookie is created
  const wrongOtpCookies = wrongOtpRes.headers.getSetCookie();
  const wrongOtpSession = wrongOtpCookies.find((c) => c.startsWith("educonnects_session="));
  assert.strictEqual(wrongOtpSession, undefined, "No session must be issued on wrong OTP");
  console.log("  ✅ Passed: Wrong OTP rejected, zero session cookies issued.");

  // Also test static codes (123456, 111111) are blocked
  for (const staticCode of ["123456", "111111"]) {
    try {
      await AuthService.verifyOTP(adminEmail, staticCode);
      assert.fail(`Static code ${staticCode} should have failed`);
    } catch (err: any) {
      assert.ok(
        err.message.includes("Incorrect") ||
        err.message.includes("Too many") ||
        err.message.includes("No active") ||
        err.message.includes("expired")
      );
    }
  }
  console.log("  ✅ Passed: Static codes (123456, 111111) strictly rejected.");

  // ========================================================================
  // TEST 3: Enter expired OTP
  // Expected:
  // → OTP expired
  // → no Admin session
  // ========================================================================
  console.log("\nTEST 3: Entering Expired OTP...");
  const expiredCode = "334455";
  const expiredRec = await prisma.emailVerification.create({
    data: {
      userId: adminUser.id,
      codeHash: hashToken(expiredCode),
      tokenHash: hashToken("expired-test-token"),
      expiresAt: new Date(Date.now() - 60 * 1000), // Expired 1 min ago
    },
  });

  const expiredOtpReq = new NextRequest("http://localhost:3000/api/auth/verify-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: adminEmail, otp: expiredCode }),
  });
  const expiredOtpRes = await verifyEmailRoute(expiredOtpReq);
  assert.strictEqual(expiredOtpRes.status, 400, "Expired OTP must return 400");
  const expiredData = await expiredOtpRes.json();
  assert.ok(expiredData.error.includes("expired"), `Expected expired error, got: ${expiredData.error}`);

  const expiredCookies = expiredOtpRes.headers.getSetCookie();
  assert.strictEqual(expiredCookies.find((c) => c.startsWith("educonnects_session=")), undefined);
  await prisma.emailVerification.delete({ where: { id: expiredRec.id } }).catch(() => {});
  console.log("  ✅ Passed: Expired OTP rejected, no session created.");

  // ========================================================================
  // TEST 4: Resend OTP
  // Expected:
  // → new OTP sent
  // → old OTP invalid
  // → 60s cooldown enforced
  // ========================================================================
  console.log("\nTEST 4: Resend OTP (Invalidates Old OTP, Cooldown Enforced)...");
  // 1. Rapid resend blocked by cooldown
  const rapidResendReq = new NextRequest("http://localhost:3000/api/auth/resend-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: adminEmail }),
  });
  const rapidResendRes = await resendOtpRoute(rapidResendReq);
  assert.strictEqual(rapidResendRes.status, 400, "Rapid resend must be blocked by cooldown");
  const rapidResendData = await rapidResendRes.json();
  assert.ok(rapidResendData.error.includes("Please wait"), "Cooldown message expected");
  console.log(`  ✅ Passed: Rapid resend blocked by 60s cooldown (${rapidResendData.error}).`);

  // 2. Fast forward cooldown by setting previous OTP createdAt back 65s
  const currentOtpRec = await prisma.emailVerification.findFirst({
    where: { userId: adminUser.id, verifiedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  assert.ok(currentOtpRec);
  await prisma.emailVerification.update({
    where: { id: currentOtpRec.id },
    data: { createdAt: new Date(Date.now() - 65 * 1000) },
  });

  // 3. Resend OTP succeeds
  const resendSuccessReq = new NextRequest("http://localhost:3000/api/auth/resend-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: adminEmail }),
  });
  const resendSuccessRes = await resendOtpRoute(resendSuccessReq);
  assert.strictEqual(resendSuccessRes.status, 200, "Resend must succeed after cooldown");

  // 4. Verify old OTP is now expired
  const oldRecCheck = await prisma.emailVerification.findUnique({
    where: { id: currentOtpRec.id },
  });
  assert.ok(oldRecCheck && oldRecCheck.expiresAt <= new Date(), "Older OTP must be expired");

  // 5. Verify new OTP record exists
  const newOtpRec = await prisma.emailVerification.findFirst({
    where: { userId: adminUser.id, verifiedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  assert.ok(newOtpRec && newOtpRec.id !== currentOtpRec.id, "New OTP record must be generated");
  console.log("  ✅ Passed: New OTP sent, older OTP immediately invalidated.");

  // ========================================================================
  // TEST 5: Enter correct OTP
  // Expected:
  // → OTP verified
  // → Admin session created
  // → Admin Dashboard opens
  // ========================================================================
  console.log("\nTEST 5: Entering Correct OTP (Authenticated Admin Session Created)...");
  // Inject known dynamic code into the active record
  const correctDynamicOTP = "739281";
  await prisma.emailVerification.update({
    where: { id: newOtpRec.id },
    data: { codeHash: hashToken(correctDynamicOTP), attempts: 0 },
  });

  const correctVerifyReq = new NextRequest("http://localhost:3000/api/auth/verify-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: adminEmail, otp: correctDynamicOTP }),
  });
  const correctVerifyRes = await verifyEmailRoute(correctVerifyReq);
  assert.strictEqual(correctVerifyRes.status, 200, "Correct OTP must return 200");
  const correctVerifyData = await correctVerifyRes.json();
  assert.strictEqual(correctVerifyData.success, true);
  assert.strictEqual(correctVerifyData.data.redirectPath, "/admin", "Redirect must be /admin");
  assert.strictEqual(correctVerifyData.data.user.role, "ADMIN");

  // Verify authenticated session cookie IS set
  const successCookies = correctVerifyRes.headers.getSetCookie();
  const adminSessionCookieHeader = successCookies.find((c) => c.startsWith("educonnects_session="));
  assert.ok(adminSessionCookieHeader, "educonnects_session cookie MUST be set upon successful OTP");
  const sessionToken = adminSessionCookieHeader.split(";")[0].replace("educonnects_session=", "");
  const decodedSession = decodeSession(sessionToken);
  assert.ok(decodedSession);
  assert.strictEqual(decodedSession.role, "ADMIN");
  assert.strictEqual(decodedSession.email, adminEmail);
  console.log("  ✅ Passed: Correct OTP verified, authenticated admin session created, redirectPath=/admin.");

  // ========================================================================
  // TEST 6: Refresh Admin Dashboard
  // Expected:
  // → remains authenticated
  // ========================================================================
  console.log("\nTEST 6: Refreshing Admin Dashboard (Session Persistence)...");
  const dashboardMwReq = new NextRequest("http://localhost:3000/admin", {
    headers: { cookie: `educonnects_session=${sessionToken}` },
  });
  const dashboardMwRes = middleware(dashboardMwReq);
  // Status is 200 (NextResponse.next()) when allowed through middleware
  assert.strictEqual(dashboardMwRes.status, 200, "Dashboard access must be granted with active session");
  console.log("  ✅ Passed: Session persists and allows access on reload/refresh.");

  // ========================================================================
  // TEST 7: Open Admin Login while authenticated
  // Expected:
  // → automatically redirect to Admin Dashboard
  // ========================================================================
  console.log("\nTEST 7: Opening Admin Login While Authenticated...");
  const loginMwReq = new NextRequest("http://localhost:3000/admin/login", {
    headers: { cookie: `educonnects_session=${sessionToken}` },
  });
  const loginMwRes = middleware(loginMwReq);
  assert.strictEqual(loginMwRes.status, 307, "Must redirect authenticated admin away from login page");
  assert.strictEqual(loginMwRes.headers.get("Location"), "http://localhost:3000/admin");
  console.log("  ✅ Passed: Automatically redirected from /admin/login to /admin.");

  // ========================================================================
  // TEST 8: Logout
  // Expected:
  // → session invalidated
  // → Admin Dashboard inaccessible
  // → Login page available
  // ========================================================================
  console.log("\nTEST 8: Logout (Session Invalidation & Route Re-locking)...");
  const logoutReq = new NextRequest("http://localhost:3000/api/auth/logout", {
    method: "POST",
  });
  const logoutRes = await logoutRoute(logoutReq);
  assert.strictEqual(logoutRes.status, 200);

  const logoutCookies = logoutRes.headers.getSetCookie();
  const clearedSessionCookie = logoutCookies.find((c) => c.startsWith("educonnects_session="));
  assert.ok(clearedSessionCookie?.includes("Max-Age=0"), "Session cookie must be cleared on logout");

  // After logout: Admin Dashboard inaccessible
  const afterLogoutDashboardReq = new NextRequest("http://localhost:3000/admin", {
    headers: { cookie: clearedSessionCookie || "" },
  });
  const afterLogoutDashboardRes = middleware(afterLogoutDashboardReq);
  assert.strictEqual(afterLogoutDashboardRes.status, 307);
  assert.ok(afterLogoutDashboardRes.headers.get("Location")?.includes("/admin/login"));

  // After logout: Admin Login is accessible again
  const afterLogoutLoginReq = new NextRequest("http://localhost:3000/admin/login", {
    headers: { cookie: clearedSessionCookie || "" },
  });
  const afterLogoutLoginRes = middleware(afterLogoutLoginReq);
  assert.strictEqual(afterLogoutLoginRes.status, 200, "Login page must be accessible after logout");
  console.log("  ✅ Passed: Logout clears session, locks /admin, and re-enables /admin/login.");

  // ========================================================================
  // TEST 9: Access Admin Dashboard before OTP verification
  // Expected:
  // → access denied / redirected
  // → no Admin session
  // ========================================================================
  console.log("\nTEST 9: Accessing Admin Dashboard Before OTP Verification...");
  const unverifiedReq = new NextRequest("http://localhost:3000/admin");
  const unverifiedRes = middleware(unverifiedReq);
  assert.strictEqual(unverifiedRes.status, 307);
  assert.ok(unverifiedRes.headers.get("Location")?.includes("/admin/login"));
  console.log("  ✅ Passed: Direct access to /admin strictly blocked without completed OTP verification.");

  // ========================================================================
  // TEST 10: Server Log Security (Zero OTP in logs)
  // Expected:
  // → OTP must NOT appear in logs
  // ========================================================================
  console.log("\nTEST 10: Verifying Zero OTP Leakage in Console/Server Logs...");
  // Capture console.log outputs during dynamic OTP generation
  const logs: string[] = [];
  const originalLog = console.log;
  console.log = (...args: any[]) => {
    logs.push(args.map((a) => String(a)).join(" "));
    originalLog(...args);
  };

  try {
    // Fast forward cooldown
    await prisma.emailVerification.updateMany({
      where: { userId: adminUser.id },
      data: { createdAt: new Date(Date.now() - 70 * 1000) },
    });
    await AuthService.loginUser({ email: adminEmail, password: adminPassword });
  } finally {
    console.log = originalLog;
  }

  // Verify that any 6-digit number does not match raw OTP in logs
  const rawOtpRegex = /🔑 6-Digit OTP: \d{6}/;
  const hasLeakedOtp = logs.some((l) => rawOtpRegex.test(l));
  assert.strictEqual(hasLeakedOtp, false, "Plaintext OTP must NEVER appear in console logs");

  const hasMaskedOtp = logs.some((l) => l.includes("[REDACTED FOR SECURITY]"));
  assert.ok(hasMaskedOtp, "Console logs must explicitly mask OTP as [REDACTED FOR SECURITY]");
  console.log("  ✅ Passed: Plaintext OTP never logged; masked with [REDACTED FOR SECURITY].");

  console.log("\n🎉 ALL 10 MANDATORY ADMIN DYNAMIC OTP TESTS PASSED SUCCESSFULLY! 🚀\n");
}

runAdminDynamicOTPTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Test Failure:", err);
    process.exit(1);
  });

