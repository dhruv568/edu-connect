const fs = require("fs");
const path = require("path");

const BASE_URL = "http://localhost:3005";

async function runE2ESuite() {
  console.log("\n============================================================");
  console.log("EduConnects End-to-End Auth, Routing & Protection Test Suite");
  console.log("============================================================\n");

  let passed = 0;
  let failed = 0;

  function record(name, ok, details) {
    if (ok) {
      console.log(`  [PASS] ${name}`);
      console.log(`      -> ${details}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${name}`);
      console.error(`      -> Assertion failed: ${details}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------------------
    // 1. Educator Login Authentication & Direct Session Issuance
    // -------------------------------------------------------------------------
    console.log("1. Testing Educator Login & Direct Session Issuance via HTTP...");
    const teacherLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "teacher@educonnects.com",
        password: "Password123!",
      }),
    });

    const teacherLoginBody = await teacherLoginRes.json();
    const teacherCookies = teacherLoginRes.headers.getSetCookie();

    const educatorLoginOk =
      teacherLoginRes.status === 200 &&
      teacherLoginBody.success === true &&
      teacherLoginBody.data.redirectPath === "/teacher/dashboard" &&
      (teacherLoginBody.data.user.role === "TEACHER" || teacherLoginBody.data.user.role === "EDUCATOR") &&
      teacherCookies.some((c) => c.includes("educonnects_session="));

    record(
      "test_educator_login_issues_session_and_teacher_redirect",
      educatorLoginOk,
      `Status: ${teacherLoginRes.status}, redirectPath: '${teacherLoginBody.data?.redirectPath}', Cookie Set-Headers: ${teacherCookies.length}`
    );

    const educatorCookieHeader = teacherCookies.find((c) => c.includes("educonnects_session=")) || "";
    const educatorCookie = educatorCookieHeader.split(";")[0];

    // -------------------------------------------------------------------------
    // 2. Educator Session Verification via /api/auth/me
    // -------------------------------------------------------------------------
    console.log("\n2. Testing Educator /api/auth/me Verification...");
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { cookie: educatorCookie },
    });
    const meBody = await meRes.json();

    const educatorMeOk =
      meRes.status === 200 &&
      meBody.success === true &&
      (meBody.data.user.role === "TEACHER" || meBody.data.user.role === "EDUCATOR") &&
      meBody.data.user.status === "ACTIVE" &&
      meBody.data.user.emailVerified === true;

    record(
      "test_educator_me_returns_active_verified_session",
      educatorMeOk,
      `Status: ${meRes.status}, Role: ${meBody.data?.user?.role}, Status: ${meBody.data?.user?.status}`
    );

    // -------------------------------------------------------------------------
    // 3. Educator Access to /api/teacher/dashboard
    // -------------------------------------------------------------------------
    console.log("\n3. Testing Educator Access to Educator Dashboard API...");
    const teacherDashRes = await fetch(`${BASE_URL}/api/teacher/dashboard`, {
      headers: { cookie: educatorCookie },
    });
    const teacherDashBody = await teacherDashRes.json();

    const educatorDashOk =
      teacherDashRes.status === 200 &&
      teacherDashBody.success === true &&
      teacherDashBody.data &&
      (typeof teacherDashBody.data.metrics === "object" || typeof teacherDashBody.data.stats === "object");

    record(
      "test_educator_accesses_teacher_dashboard_api",
      educatorDashOk,
      `Status: ${teacherDashRes.status}, Success: ${teacherDashBody.success}, Metrics Present: ${!!teacherDashBody.data?.metrics}`
    );

    // -------------------------------------------------------------------------
    // 4. Learner Login Authentication & Direct Session Issuance
    // -------------------------------------------------------------------------
    console.log("\n4. Testing Learner Login & Direct Session Issuance via HTTP...");
    const studentLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "student@educonnects.com",
        password: "Password123!",
      }),
    });

    const studentLoginBody = await studentLoginRes.json();
    const studentCookies = studentLoginRes.headers.getSetCookie();

    const learnerLoginOk =
      studentLoginRes.status === 200 &&
      studentLoginBody.success === true &&
      studentLoginBody.data.redirectPath === "/student/dashboard" &&
      (studentLoginBody.data.user.role === "STUDENT" || studentLoginBody.data.user.role === "LEARNER") &&
      studentCookies.some((c) => c.includes("educonnects_session="));

    record(
      "test_learner_login_issues_session_and_student_redirect",
      learnerLoginOk,
      `Status: ${studentLoginRes.status}, redirectPath: '${studentLoginBody.data?.redirectPath}', Cookie Set-Headers: ${studentCookies.length}`
    );

    const learnerCookieHeader = studentCookies.find((c) => c.includes("educonnects_session=")) || "";
    const learnerCookie = learnerCookieHeader.split(";")[0];

    // -------------------------------------------------------------------------
    // 5. Learner Access to /api/student/dashboard
    // -------------------------------------------------------------------------
    console.log("\n5. Testing Learner Access to Student Dashboard API...");
    const studentDashRes = await fetch(`${BASE_URL}/api/student/dashboard`, {
      headers: { cookie: learnerCookie },
    });
    const studentDashBody = await studentDashRes.json();

    const learnerDashOk =
      studentDashRes.status === 200 &&
      studentDashBody.success === true &&
      studentDashBody.data &&
      typeof studentDashBody.data.stats === "object";

    record(
      "test_learner_accesses_student_dashboard_api",
      learnerDashOk,
      `Status: ${studentDashRes.status}, Success: ${studentDashBody.success}, Stats Present: ${!!studentDashBody.data?.stats}`
    );

    // -------------------------------------------------------------------------
    // 6. Cross-Role Protection: Learner Blocked from Educator Dashboard API
    // -------------------------------------------------------------------------
    console.log("\n6. Testing Cross-Role Protection: Learner Blocked from /api/teacher/dashboard...");
    const learnerBlockedRes = await fetch(`${BASE_URL}/api/teacher/dashboard`, {
      headers: { cookie: learnerCookie },
    });

    const learnerBlockedOk = learnerBlockedRes.status === 403;
    record(
      "test_learner_blocked_from_teacher_dashboard_api_with_403",
      learnerBlockedOk,
      `Status: ${learnerBlockedRes.status} (Expected: 403 Forbidden)`
    );

    // -------------------------------------------------------------------------
    // 7. Cross-Role Protection: Educator Blocked from Student Dashboard API
    // -------------------------------------------------------------------------
    console.log("\n7. Testing Cross-Role Protection: Educator Blocked from /api/student/dashboard...");
    const educatorBlockedRes = await fetch(`${BASE_URL}/api/student/dashboard`, {
      headers: { cookie: educatorCookie },
    });

    const educatorBlockedOk = educatorBlockedRes.status === 403;
    record(
      "test_educator_blocked_from_student_dashboard_api_with_403",
      educatorBlockedOk,
      `Status: ${educatorBlockedRes.status} (Expected: 403 Forbidden)`
    );

    // -------------------------------------------------------------------------
    // 8. Middleware: Login Page Interception for Authenticated Educator
    // -------------------------------------------------------------------------
    console.log("\n8. Testing Middleware Login Interception for Authenticated Educator...");
    const educatorOnLogin = await fetch(`${BASE_URL}/teacher/login`, {
      headers: { cookie: educatorCookie },
      redirect: "manual",
    });
    const educatorLoginLocation = educatorOnLogin.headers.get("location") || "";

    const educatorLoginInterceptOk =
      (educatorOnLogin.status === 307 || educatorOnLogin.status === 302) &&
      educatorLoginLocation.includes("/teacher/dashboard");

    record(
      "test_authenticated_educator_intercepted_from_login_to_dashboard",
      educatorLoginInterceptOk,
      `Status: ${educatorOnLogin.status}, Location: '${educatorLoginLocation}'`
    );

    // -------------------------------------------------------------------------
    // 9. Middleware: Login Page Interception for Authenticated Learner
    // -------------------------------------------------------------------------
    console.log("\n9. Testing Middleware Login Interception for Authenticated Learner...");
    const learnerOnLogin = await fetch(`${BASE_URL}/student/login`, {
      headers: { cookie: learnerCookie },
      redirect: "manual",
    });
    const learnerLoginLocation = learnerOnLogin.headers.get("location") || "";

    const learnerLoginInterceptOk =
      (learnerOnLogin.status === 307 || learnerOnLogin.status === 302) &&
      learnerLoginLocation.includes("/student/dashboard");

    record(
      "test_authenticated_learner_intercepted_from_login_to_dashboard",
      learnerLoginInterceptOk,
      `Status: ${learnerOnLogin.status}, Location: '${learnerLoginLocation}'`
    );

    // -------------------------------------------------------------------------
    // 10. Middleware: Cross-Role Route Redirection (Learner -> Educator Dashboard)
    // -------------------------------------------------------------------------
    console.log("\n10. Testing Middleware Cross-Role Protection (Learner -> Teacher Dashboard)...");
    const learnerOnTeacherDash = await fetch(`${BASE_URL}/teacher/dashboard`, {
      headers: { cookie: learnerCookie },
      redirect: "manual",
    });
    const learnerOnTeacherLocation = learnerOnTeacherDash.headers.get("location") || "";

    const learnerCrossRedirectOk =
      (learnerOnTeacherDash.status === 307 || learnerOnTeacherDash.status === 302) &&
      learnerOnTeacherLocation.includes("/student/dashboard");

    record(
      "test_learner_accessing_teacher_dashboard_redirected_to_student_dashboard",
      learnerCrossRedirectOk,
      `Status: ${learnerOnTeacherDash.status}, Location: '${learnerOnTeacherLocation}'`
    );

    // -------------------------------------------------------------------------
    // 11. Middleware: Cross-Role Route Redirection (Educator -> Student Dashboard)
    // -------------------------------------------------------------------------
    console.log("\n11. Testing Middleware Cross-Role Protection (Educator -> Student Dashboard)...");
    const educatorOnStudentDash = await fetch(`${BASE_URL}/student/dashboard`, {
      headers: { cookie: educatorCookie },
      redirect: "manual",
    });
    const educatorOnStudentLocation = educatorOnStudentDash.headers.get("location") || "";

    const educatorCrossRedirectOk =
      (educatorOnStudentDash.status === 307 || educatorOnStudentDash.status === 302) &&
      educatorOnStudentLocation.includes("/teacher/dashboard");

    record(
      "test_educator_accessing_student_dashboard_redirected_to_teacher_dashboard",
      educatorCrossRedirectOk,
      `Status: ${educatorOnStudentDash.status}, Location: '${educatorOnStudentLocation}'`
    );

    // -------------------------------------------------------------------------
    // 12. Middleware: Unauthenticated Access Guarding
    // -------------------------------------------------------------------------
    console.log("\n12. Testing Middleware Unauthenticated Dashboard Protection...");
    const unauthTeacherDash = await fetch(`${BASE_URL}/teacher/dashboard`, {
      redirect: "manual",
    });
    const unauthTeacherLocation = unauthTeacherDash.headers.get("location") || "";

    const unauthTeacherOk =
      (unauthTeacherDash.status === 307 || unauthTeacherDash.status === 302) &&
      unauthTeacherLocation.includes("/login");

    record(
      "test_unauthenticated_visitor_blocked_from_teacher_dashboard",
      unauthTeacherOk,
      `Status: ${unauthTeacherDash.status}, Location: '${unauthTeacherLocation}'`
    );

    // -------------------------------------------------------------------------
    // 13. Production Domain Cookie Configuration
    // -------------------------------------------------------------------------
    console.log("\n13. Testing Production Domain Cookie Attributes...");
    const prodLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-host": "educonnects.co.in",
        host: "educonnects.co.in",
      },
      body: JSON.stringify({
        email: "teacher@educonnects.com",
        password: "Password123!",
      }),
    });

    const prodCookies = prodLoginRes.headers.getSetCookie();
    const prodSessionCookie = prodCookies.find((c) => c.includes("educonnects_session=")) || "";

    const lowerCookie = prodSessionCookie.toLowerCase();
    const prodCookieOk =
      (lowerCookie.includes("domain=.educonnects.co.in") || lowerCookie.includes("domain=educonnects.co.in")) &&
      lowerCookie.includes("httponly") &&
      lowerCookie.includes("samesite=lax") &&
      lowerCookie.includes("secure");

    record(
      "test_production_cookie_has_root_domain_and_security_flags",
      prodCookieOk,
      `Cookie Set-Header: ${prodSessionCookie.substring(0, 80)}...`
    );

    // -------------------------------------------------------------------------
    // 14. Logout Session Invalidation & Cookie Expiration
    // -------------------------------------------------------------------------
    console.log("\n14. Testing Logout Cookie Clearance...");
    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        cookie: educatorCookie,
        "x-forwarded-host": "educonnects.co.in",
      },
    });

    const logoutCookies = logoutRes.headers.getSetCookie();
    const logoutCacheControl = logoutRes.headers.get("Cache-Control") || "";

    const logoutCookiesOk =
      logoutCookies.some((c) => c.includes("Max-Age=0") && c.includes("Domain=.educonnects.co.in")) &&
      logoutCacheControl.includes("no-store");

    record(
      "test_logout_expires_cookies_with_no_store",
      logoutCookiesOk,
      `Set-Cookie Headers: ${logoutCookies.length}, Cache-Control: '${logoutCacheControl}'`
    );

    // -------------------------------------------------------------------------
    // 15. Zero Parent Terminology Verification
    // -------------------------------------------------------------------------
    console.log("\n15. Testing Terminology Compliance across Key Navigation & Auth Files...");
    const navbarContent = fs.readFileSync(
      path.join(process.cwd(), "components", "homepage", "floating-navbar.tsx"),
      "utf-8"
    );
    const dashboardLayoutContent = fs.readFileSync(
      path.join(process.cwd(), "components", "layout", "dashboard-layout.tsx"),
      "utf-8"
    );
    const teacherLoginContent = fs.readFileSync(
      path.join(process.cwd(), "app", "teacher", "login", "page.tsx"),
      "utf-8"
    );

    const parentRegex = /\bparents?\b/i;
    const hasNoParentInNavbar = !parentRegex.test(navbarContent);
    const hasNoParentInLayout = !parentRegex.test(dashboardLayoutContent);
    const hasNoParentInTeacherLogin = !parentRegex.test(teacherLoginContent);

    record(
      "test_zero_parent_terminology_in_auth_and_navigation",
      hasNoParentInNavbar && hasNoParentInLayout && hasNoParentInTeacherLogin,
      `Navbar clean: ${hasNoParentInNavbar}, Dashboard clean: ${hasNoParentInLayout}, Login clean: ${hasNoParentInTeacherLogin}`
    );

    // -------------------------------------------------------------------------
    // Summary
    // -------------------------------------------------------------------------
    console.log("\n============================================================");
    console.log(`Test Execution Finished: ${passed} Passed | ${failed} Failed`);
    console.log("============================================================\n");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test execution encountered an error:", err);
    process.exit(1);
  }
}

runE2ESuite();