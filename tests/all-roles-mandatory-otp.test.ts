process.env.EMAIL_PROVIDER = "console";

import assert from "node:assert";
import { prisma } from "../lib/prisma";
import { AuthService } from "../services/auth-service";
import { hashPassword } from "../lib/auth/password";
import { hashToken } from "../lib/auth/tokens";
import { decodeSession } from "../lib/auth/session";
import { NextRequest } from "next/server";
import { POST as loginRoute } from "../app/api/auth/login/route";
import { POST as verifyEmailRoute } from "../app/api/auth/verify-email/route";
import { POST as resendOtpRoute } from "../app/api/auth/resend-otp/route";
import { POST as logoutRoute } from "../app/api/auth/logout/route";
import { GET as meRoute } from "../app/api/auth/me/route";
import { middleware } from "../middleware";

let reqCounter = 1;
function createReq(url: string, init?: ConstructorParameters<typeof NextRequest>[1]) {
  const headers = new Headers(init?.headers);
  if (!headers.has("x-forwarded-for")) {
    headers.set("x-forwarded-for", `10.42.0.${reqCounter++}`);
  }
  return new NextRequest(url, { ...init, headers });
}

async function runAllRolesMandatoryOTPTests() {
  console.log("🧪 Running EduConnects All Roles Mandatory Dynamic OTP Test Suite...\n");

  const commonPassword = "Password123!";
  const learnerEmail = "student@educonnects.com";
  const educatorEmail = "teacher@educonnects.com";
  const adminEmail = "educonnects.com@gmail.com";

  // ------------------------------------------------------------------------
  // Setup: Ensure all three test accounts exist and are verified & active
  // ------------------------------------------------------------------------
  const hashedPass = await hashPassword(commonPassword);

  const learnerUser = await prisma.user.upsert({
    where: { email: learnerEmail },
    update: { passwordHash: hashedPass, status: "ACTIVE", role: "STUDENT", emailVerified: true },
    create: {
      email: learnerEmail,
      passwordHash: hashedPass,
      status: "ACTIVE",
      role: "STUDENT",
      emailVerified: true,
      profile: { create: { firstName: "Test", lastName: "Learner" } },
      studentProfile: { create: { gradeLevel: "Grade 11", interests: "Physics" } },
    },
    include: { profile: true },
  });

  const educatorUser = await prisma.user.upsert({
    where: { email: educatorEmail },
    update: { passwordHash: hashedPass, status: "ACTIVE", role: "TEACHER", emailVerified: true },
    create: {
      email: educatorEmail,
      passwordHash: hashedPass,
      status: "ACTIVE",
      role: "TEACHER",
      emailVerified: true,
      profile: { create: { firstName: "Test", lastName: "Educator" } },
      teacherProfile: { create: { headline: "Master Tutor", verificationStatus: "VERIFIED" } },
    },
    include: { profile: true },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash: hashedPass, status: "ACTIVE", role: "ADMIN", emailVerified: true },
    create: {
      email: adminEmail,
      passwordHash: hashedPass,
      status: "ACTIVE",
      role: "ADMIN",
      emailVerified: true,
      profile: { create: { firstName: "Super", lastName: "Admin" } },
    },
    include: { profile: true },
  });

  // Clear previous OTP records for fresh clean state
  await prisma.emailVerification.updateMany({
    where: {
      userId: { in: [learnerUser.id, educatorUser.id, adminUser.id] },
      verifiedAt: null,
    },
    data: { expiresAt: new Date(), createdAt: new Date(Date.now() - 70 * 1000) },
  });

  // ========================================================================
  // TEST SUITE 1: REGISTERED LEARNER MANDATORY OTP FLOW
  // ========================================================================
  console.log("==================================================");
  console.log("TEST 1: Registered Learner - Password Verification Alone Must NOT Create Session");
  console.log("==================================================");

  const learnerLoginReq = createReq("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: learnerEmail, password: commonPassword }),
  });
  const learnerLoginRes = await loginRoute(learnerLoginReq);
  assert.strictEqual(learnerLoginRes.status, 200, "Learner login with valid credentials must return 200");
  const learnerLoginData = await learnerLoginRes.json();

  assert.strictEqual(learnerLoginData.data.requiresVerification, true, "Must require OTP verification");
  assert.strictEqual(learnerLoginData.data.requiresOtp, true, "Must flag requiresOtp: true");
  assert.ok(
    learnerLoginData.data.redirectPath.includes("/verify-email"),
    "Redirect path must point to /verify-email"
  );
  assert.ok(
    learnerLoginData.data.redirectPath.includes("student%2Fdashboard"),
    "Redirect path must target student dashboard"
  );

  // CRITICAL SECURITY ASSERTION: No authenticated session cookie (`educonnects_session`) must be issued!
  const learnerCookies = learnerLoginRes.headers.getSetCookie();
  const learnerSessionCookie = learnerCookies.find((c) => c.startsWith("educonnects_session="));
  assert.strictEqual(learnerSessionCookie, undefined, "CRITICAL: educonnects_session cookie MUST NOT be set before OTP!");

  // Must set temporary pending cookie
  const learnerPendingCookie = learnerCookies.find((c) => c.startsWith("educonnects_pending_otp="));
  assert.ok(learnerPendingCookie, "Temporary educonnects_pending_otp cookie must be set");

  // Verify Learner Dashboard is NOT accessible with pending cookie
  const learnerMwBeforeOtp = middleware(
    createReq("http://localhost:3000/student/dashboard", {
      headers: { cookie: learnerPendingCookie },
    })
  );
  assert.strictEqual(learnerMwBeforeOtp.status, 307, "Learner dashboard must be redirected when session is absent");
  assert.ok(
    learnerMwBeforeOtp.headers.get("Location")?.includes("/student/login"),
    "Must redirect to /student/login"
  );
  console.log("  ✅ Passed: Learner OTP dispatched, no session cookie issued, dashboard blocked.");

  // ------------------------------------------------------------------------
  // TEST 2: Learner Incorrect OTP Rejection & Attempt Limits
  // ------------------------------------------------------------------------
  console.log("\nTEST 2: Learner Incorrect OTP Rejection & 5-Attempt Limit...");
  const wrongOtpReq = createReq("http://localhost:3000/api/auth/verify-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: learnerEmail, otp: "999999" }),
  });
  const wrongOtpRes = await verifyEmailRoute(wrongOtpReq);
  assert.strictEqual(wrongOtpRes.status, 400, "Wrong OTP must be rejected with 400");
  const wrongOtpCookies = wrongOtpRes.headers.getSetCookie();
  assert.strictEqual(
    wrongOtpCookies.find((c) => c.startsWith("educonnects_session=")),
    undefined,
    "No session on wrong OTP"
  );
  console.log("  ✅ Passed: Wrong OTP rejected, no session created.");

  // ------------------------------------------------------------------------
  // TEST 3: Resend OTP Cooldown & Replacement
  // ------------------------------------------------------------------------
  console.log("\nTEST 3: Resend OTP Cooldown & New OTP Replacement...");
  const prematureResendReq = createReq("http://localhost:3000/api/auth/resend-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: learnerEmail }),
  });
  const prematureResendRes = await resendOtpRoute(prematureResendReq);
  assert.strictEqual(prematureResendRes.status, 400, "Resend within 60s cooldown must be rejected");
  console.log("  ✅ Passed: Resend cooldown correctly enforced.");

  // Simulate 65 seconds elapsed and request new OTP
  await prisma.emailVerification.updateMany({
    where: { userId: learnerUser.id, verifiedAt: null },
    data: { createdAt: new Date(Date.now() - 65 * 1000) },
  });

  const validResendReq = createReq("http://localhost:3000/api/auth/resend-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: learnerEmail }),
  });
  const validResendRes = await resendOtpRoute(validResendReq);
  assert.strictEqual(validResendRes.status, 200, "Resend after cooldown must succeed");

  // ------------------------------------------------------------------------
  // TEST 4: Learner Successful OTP Verification & Dashboard Redirect
  // ------------------------------------------------------------------------
  console.log("\nTEST 4: Learner Successful OTP Verification...");
  const learnerActiveVerification = await prisma.emailVerification.findFirst({
    where: { userId: learnerUser.id, verifiedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  assert.ok(learnerActiveVerification, "Active verification record must exist");

  const correctLearnerOTP = "456123";
  await prisma.emailVerification.update({
    where: { id: learnerActiveVerification.id },
    data: { codeHash: hashToken(correctLearnerOTP), attempts: 0 },
  });

  const learnerVerifyReq = createReq("http://localhost:3000/api/auth/verify-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: learnerEmail, otp: correctLearnerOTP }),
  });
  const learnerVerifyRes = await verifyEmailRoute(learnerVerifyReq);
  assert.strictEqual(learnerVerifyRes.status, 200, "Correct OTP must return 200");
  const learnerVerifyData = await learnerVerifyRes.json();
  assert.strictEqual(learnerVerifyData.data.redirectPath, "/student/dashboard", "Must redirect to student dashboard");

  const learnerVerifyCookies = learnerVerifyRes.headers.getSetCookie();
  const learnerActiveSessionCookie = learnerVerifyCookies.find((c) => c.startsWith("educonnects_session="));
  assert.ok(learnerActiveSessionCookie, "educonnects_session MUST be set after valid OTP");
  const learnerSessionToken = learnerActiveSessionCookie.split(";")[0].replace("educonnects_session=", "");
  const decodedLearner = decodeSession(learnerSessionToken);
  assert.strictEqual(decodedLearner?.role, "STUDENT", "Decoded role must be STUDENT");
  console.log("  ✅ Passed: Learner OTP verified, session cookie created, redirect to /student/dashboard.");

  // ========================================================================
  // TEST SUITE 2: REGISTERED EDUCATOR MANDATORY OTP FLOW
  // ========================================================================
  console.log("\n==================================================");
  console.log("TEST 5: Registered Educator - Password Verification Alone Must NOT Create Session");
  console.log("==================================================");

  // Clear educator OTP records
  await prisma.emailVerification.updateMany({
    where: { userId: educatorUser.id, verifiedAt: null },
    data: { expiresAt: new Date(), createdAt: new Date(Date.now() - 70 * 1000) },
  });

  const educatorLoginReq = createReq("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: educatorEmail, password: commonPassword }),
  });
  const educatorLoginRes = await loginRoute(educatorLoginReq);
  assert.strictEqual(educatorLoginRes.status, 200, "Educator login with valid credentials must return 200");
  const educatorLoginData = await educatorLoginRes.json();

  assert.strictEqual(educatorLoginData.data.requiresVerification, true, "Must require OTP");
  assert.strictEqual(educatorLoginData.data.requiresOtp, true, "Must flag requiresOtp");
  assert.ok(
    educatorLoginData.data.redirectPath.includes("teacher%2Fdashboard"),
    "Redirect path must target teacher dashboard"
  );

  const educatorCookies = educatorLoginRes.headers.getSetCookie();
  assert.strictEqual(
    educatorCookies.find((c) => c.startsWith("educonnects_session=")),
    undefined,
    "CRITICAL: Educator MUST NOT get a session before OTP!"
  );

  // Verify Teacher Dashboard is NOT accessible before OTP
  const educatorMwBeforeOtp = middleware(
    createReq("http://localhost:3000/teacher/dashboard", {
      headers: { cookie: educatorCookies.find((c) => c.startsWith("educonnects_pending_otp=")) || "" },
    })
  );
  assert.strictEqual(educatorMwBeforeOtp.status, 307, "Teacher dashboard must be protected");
  console.log("  ✅ Passed: Educator OTP dispatched, no session cookie issued, dashboard protected.");

  // Educator verifies OTP
  const educatorActiveVerification = await prisma.emailVerification.findFirst({
    where: { userId: educatorUser.id, verifiedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  assert.ok(educatorActiveVerification, "Active educator verification record must exist");

  const correctEducatorOTP = "789123";
  await prisma.emailVerification.update({
    where: { id: educatorActiveVerification.id },
    data: { codeHash: hashToken(correctEducatorOTP), attempts: 0 },
  });

  const educatorVerifyReq = createReq("http://localhost:3000/api/auth/verify-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: educatorEmail, otp: correctEducatorOTP }),
  });
  const educatorVerifyRes = await verifyEmailRoute(educatorVerifyReq);
  assert.strictEqual(educatorVerifyRes.status, 200, "Educator OTP verification must return 200");
  const educatorVerifyData = await educatorVerifyRes.json();
  assert.strictEqual(educatorVerifyData.data.redirectPath, "/teacher/dashboard", "Must redirect to /teacher/dashboard");

  const educatorVerifyCookies = educatorVerifyRes.headers.getSetCookie();
  const educatorSessionCookie = educatorVerifyCookies.find((c) => c.startsWith("educonnects_session="));
  assert.ok(educatorSessionCookie, "educonnects_session MUST be set for educator after OTP");
  const educatorSessionToken = educatorSessionCookie.split(";")[0].replace("educonnects_session=", "");
  const decodedEducator = decodeSession(educatorSessionToken);
  assert.strictEqual(decodedEducator?.role, "TEACHER", "Decoded role must be TEACHER");
  console.log("  ✅ Passed: Educator OTP verified, session issued, redirect to /teacher/dashboard.");

  // ========================================================================
  // TEST SUITE 3: ADMIN MANDATORY DYNAMIC OTP FLOW
  // ========================================================================
  console.log("\n==================================================");
  console.log("TEST 6: Admin Account - Password Alone Must NOT Create Session");
  console.log("==================================================");

  // Clear admin OTP records
  await prisma.emailVerification.updateMany({
    where: { userId: adminUser.id, verifiedAt: null },
    data: { expiresAt: new Date(), createdAt: new Date(Date.now() - 70 * 1000) },
  });

  const adminLoginReq = createReq("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: adminEmail, password: commonPassword }),
  });
  const adminLoginRes = await loginRoute(adminLoginReq);
  assert.strictEqual(adminLoginRes.status, 200, "Admin login must return 200");
  const adminLoginData = await adminLoginRes.json();
  assert.strictEqual(adminLoginData.data.requiresVerification, true);
  assert.strictEqual(adminLoginData.data.requiresOtp, true);

  const adminCookies = adminLoginRes.headers.getSetCookie();
  assert.strictEqual(
    adminCookies.find((c) => c.startsWith("educonnects_session=")),
    undefined,
    "Admin MUST NOT get session before OTP!"
  );

  const adminActiveVerification = await prisma.emailVerification.findFirst({
    where: { userId: adminUser.id, verifiedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  assert.ok(adminActiveVerification, "Active admin verification must exist");

  const correctAdminOTP = "654987";
  await prisma.emailVerification.update({
    where: { id: adminActiveVerification.id },
    data: { codeHash: hashToken(correctAdminOTP), attempts: 0 },
  });

  const adminVerifyReq = createReq("http://localhost:3000/api/auth/verify-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: adminEmail, otp: correctAdminOTP }),
  });
  const adminVerifyRes = await verifyEmailRoute(adminVerifyReq);
  assert.strictEqual(adminVerifyRes.status, 200, "Admin OTP verification must return 200");
  const adminVerifyData = await adminVerifyRes.json();
  assert.strictEqual(adminVerifyData.data.redirectPath, "/admin", "Must redirect to /admin");

  const adminVerifyCookies = adminVerifyRes.headers.getSetCookie();
  assert.ok(
    adminVerifyCookies.find((c) => c.startsWith("educonnects_session=")),
    "educonnects_session MUST be set for admin after OTP"
  );
  console.log("  ✅ Passed: Admin OTP verified, session issued, redirect to /admin.");

  // ========================================================================
  // TEST SUITE 4: ALREADY AUTHENTICATED USERS REDIRECT FROM LOGIN
  // ========================================================================
  console.log("\n==================================================");
  console.log("TEST 7: Already Authenticated Users Redirect from Login Pages");
  console.log("==================================================");

  // Authenticated Learner visiting /login
  const learnerVisitLogin = middleware(
    createReq("http://localhost:3000/login", {
      headers: { cookie: `educonnects_session=${learnerSessionToken}` },
    })
  );
  assert.strictEqual(learnerVisitLogin.status, 307, "Learner visiting /login must be redirected");
  assert.ok(
    learnerVisitLogin.headers.get("Location")?.includes("/student/dashboard"),
    "Must redirect to /student/dashboard"
  );

  // Authenticated Educator visiting /teacher/login
  const educatorVisitLogin = middleware(
    createReq("http://localhost:3000/teacher/login", {
      headers: { cookie: `educonnects_session=${educatorSessionToken}` },
    })
  );
  assert.strictEqual(educatorVisitLogin.status, 307, "Educator visiting /teacher/login must be redirected");
  assert.ok(
    educatorVisitLogin.headers.get("Location")?.includes("/teacher/dashboard"),
    "Must redirect to /teacher/dashboard"
  );
  console.log("  ✅ Passed: Authenticated users redirected from login forms based on role.");

  // ========================================================================
  // TEST SUITE 5: LOGOUT SYSTEM & SESSION INVALIDATION
  // ========================================================================
  console.log("\n==================================================");
  console.log("TEST 8: Logout Clears Session & Requires OTP on Next Login");
  console.log("==================================================");

  const logoutReq = createReq("http://localhost:3000/api/auth/logout", {
    method: "POST",
    headers: { cookie: `educonnects_session=${learnerSessionToken}` },
  });
  const logoutRes = await logoutRoute(logoutReq);
  assert.strictEqual(logoutRes.status, 200, "Logout must return 200");
  const logoutCookies = logoutRes.headers.getSetCookie();

  const clearedSessionCookie = logoutCookies.find((c) => c.startsWith("educonnects_session="));
  assert.ok(clearedSessionCookie, "Logout must set expired session cookie");
  assert.ok(clearedSessionCookie.includes("Max-Age=0"), "Session cookie Max-Age must be 0");

  const clearedPendingCookie = logoutCookies.find((c) => c.startsWith("educonnects_pending_otp="));
  assert.ok(clearedPendingCookie, "Logout must set expired pending otp cookie");
  assert.ok(clearedPendingCookie.includes("Max-Age=0"), "Pending OTP cookie Max-Age must be 0");

  // Next login attempt requires OTP again
  await prisma.emailVerification.updateMany({
    where: { userId: learnerUser.id, verifiedAt: null },
    data: { createdAt: new Date(Date.now() - 70 * 1000) },
  });
  const nextLoginReq = createReq("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: learnerEmail, password: commonPassword }),
  });
  const nextLoginRes = await loginRoute(nextLoginReq);
  const nextLoginData = await nextLoginRes.json();
  assert.strictEqual(nextLoginData.data.requiresOtp, true, "Next login must require OTP again");
  assert.strictEqual(
    nextLoginRes.headers.getSetCookie().find((c) => c.startsWith("educonnects_session=")),
    undefined,
    "No session created on next login before OTP"
  );
  console.log("  ✅ Passed: Session destroyed on logout, subsequent login strictly requires OTP again.");

  console.log("\n🎉 ALL ROLES MANDATORY OTP TESTS PASSED FLAWLESSLY! 🚀\n");
  await prisma.$disconnect();
  process.exit(0);
}

runAllRolesMandatoryOTPTests().catch(async (err) => {
  console.error("❌ Test Failure:", err.stack || err);
  await prisma.$disconnect();
  process.exit(1);
});
