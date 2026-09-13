import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { getHomeUrl, getMainDomain } from "../lib/app-url";

describe("Back to Home Navigation System", () => {
  it("1. getHomeUrl() resolves the canonical homepage URL with trailing slash", () => {
    const homeUrl = getHomeUrl();
    assert.ok(homeUrl.endsWith("/"), `Expected homeUrl to end with trailing slash: ${homeUrl}`);
    assert.ok(
      homeUrl.includes("educonnects.co.in") || homeUrl.includes("localhost"),
      `Expected homeUrl to be educonnects or localhost: ${homeUrl}`
    );
  });

  it("2. BackToHomeButton component exists and supports responsive styling and variants", () => {
    const btnFile = path.resolve(process.cwd(), "components/ui/back-to-home-button.tsx");
    assert.ok(fs.existsSync(btnFile), "components/ui/back-to-home-button.tsx must exist");

    const content = fs.readFileSync(btnFile, "utf-8");
    assert.ok(content.includes("Back to Home"), "Must include 'Back to Home' label");
    assert.ok(content.includes("ArrowLeft"), "Must render ArrowLeft icon");
    assert.ok(content.includes("getHomeUrl"), "Must utilize getHomeUrl()");
    assert.ok(content.includes("back-to-home-header-btn"), "Must have header button testid");
    assert.ok(content.includes("back-to-home-sidebar-btn"), "Must have sidebar button testid");
    assert.ok(content.includes("hidden sm:inline"), "Must have responsive desktop text class");
    assert.ok(content.includes("sm:hidden"), "Must have responsive mobile text class");
    assert.ok(!content.includes("handleLogout"), "Back to Home button must NEVER invoke handleLogout");
  });

  it("3. DashboardLayout integrates BackToHomeButton in both top header and sidebar for all roles", () => {
    const layoutFile = path.resolve(process.cwd(), "components/layout/dashboard-layout.tsx");
    const content = fs.readFileSync(layoutFile, "utf-8");

    // Must import BackToHomeButton
    assert.ok(
      content.includes("BackToHomeButton"),
      "dashboard-layout.tsx must import and use BackToHomeButton"
    );

    // Header placement
    assert.ok(
      content.includes('<BackToHomeButton variant="default" />'),
      "Dashboard topbar header must include BackToHomeButton with default variant"
    );

    // Sidebar placement
    assert.ok(
      content.includes('<BackToHomeButton variant="sidebar" />'),
      "Dashboard sidebar must include BackToHomeButton with sidebar variant"
    );

    // Header layout: verify BackToHomeButton is placed near NotificationPopover and profile
    const headerSlice = content.slice(content.indexOf("<header"), content.indexOf("</header>"));
    assert.ok(
      headerSlice.includes("BackToHomeButton"),
      "BackToHomeButton must reside inside the top header"
    );
    assert.ok(
      headerSlice.includes("NotificationPopover"),
      "NotificationPopover must reside alongside BackToHomeButton in the top header"
    );
  });

  it("4. Standalone LMS Classroom Player (/learn/[slug]) includes BackToHomeButton", () => {
    const lmsFile = path.resolve(process.cwd(), "app/learn/[slug]/page.tsx");
    const content = fs.readFileSync(lmsFile, "utf-8");

    assert.ok(
      content.includes("BackToHomeButton"),
      "app/learn/[slug]/page.tsx must import BackToHomeButton"
    );
    assert.ok(
      content.includes('<BackToHomeButton variant="dark" />'),
      "app/learn/[slug]/page.tsx must render BackToHomeButton variant='dark' in header"
    );
  });

  it("5. Student Payment History and Receipts include BackToHomeButton", () => {
    const payHistoryFile = path.resolve(process.cwd(), "app/student/payments/page.tsx");
    const payHistoryContent = fs.readFileSync(payHistoryFile, "utf-8");
    assert.ok(
      payHistoryContent.includes('<BackToHomeButton variant="dark" />'),
      "app/student/payments/page.tsx must render BackToHomeButton"
    );

    const receiptFile = path.resolve(process.cwd(), "app/student/payments/[id]/page.tsx");
    const receiptContent = fs.readFileSync(receiptFile, "utf-8");
    assert.ok(
      receiptContent.includes('<BackToHomeButton variant="dark" />'),
      "app/student/payments/[id]/page.tsx must render BackToHomeButton"
    );
  });

  it("6. Teacher Earnings Dashboard and Payout pages include BackToHomeButton", () => {
    const earningsFile = path.resolve(process.cwd(), "app/teacher/earnings/page.tsx");
    const earningsContent = fs.readFileSync(earningsFile, "utf-8");
    assert.ok(
      earningsContent.includes('<BackToHomeButton variant="dark" />'),
      "app/teacher/earnings/page.tsx must render BackToHomeButton"
    );

    const setupFile = path.resolve(process.cwd(), "app/teacher/earnings/setup/page.tsx");
    const setupContent = fs.readFileSync(setupFile, "utf-8");
    assert.ok(
      setupContent.includes('<BackToHomeButton variant="dark" />'),
      "app/teacher/earnings/setup/page.tsx must render BackToHomeButton"
    );

    const txFile = path.resolve(process.cwd(), "app/teacher/earnings/transactions/page.tsx");
    const txContent = fs.readFileSync(txFile, "utf-8");
    assert.ok(
      txContent.includes('<BackToHomeButton variant="dark" />'),
      "app/teacher/earnings/transactions/page.tsx must render BackToHomeButton"
    );
  });

  it("7. Live Classroom header includes BackToHomeButton", () => {
    const classroomHeader = path.resolve(process.cwd(), "components/classroom/classroom-header.tsx");
    const content = fs.readFileSync(classroomHeader, "utf-8");
    assert.ok(
      content.includes('<BackToHomeButton variant="dark" />'),
      "components/classroom/classroom-header.tsx must render BackToHomeButton"
    );
  });

  it("8. Verify homepage FloatingNavbar handles returning authenticated sessions without logout", () => {
    const navbarFile = path.resolve(process.cwd(), "components/homepage/floating-navbar.tsx");
    const content = fs.readFileSync(navbarFile, "utf-8");

    // Check that FloatingNavbar queries session
    assert.ok(content.includes('fetch("/api/auth/me"'), "Must check session against server");

    // Check Learner Portal button
    assert.ok(content.includes("Learner Portal"), "Must render Learner Portal button for students");

    // Check Educator Portal button
    assert.ok(content.includes("Educator Portal"), "Must render Educator Portal button for teachers");

    // Check Admin Governance button
    assert.ok(content.includes("Admin Governance"), "Must render Admin Governance button for admins");

    // Strictly NO "Parent" navigation
    assert.ok(!content.includes("Parent Portal"), "Strictly NO 'Parent Portal'");
    assert.ok(!content.includes("Parent Dashboard"), "Strictly NO 'Parent Dashboard'");
  });
});
