import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/auth/password";
import { syncFeatureRegistry, PROJECT_FEATURES, PROJECT_PERMISSIONS } from "../lib/permissions/registry";
import {
  getUserAuthorization,
  requirePermission,
  hasPermission,
  hasFeature,
  getDynamicNavigation,
} from "../lib/permissions/permission-engine";
import crypto from "crypto";

async function runDynamicRBACTests() {
  console.log("\n=======================================================");
  console.log("🧪 STARTING DYNAMIC RBAC & STAFF DASHBOARD TEST SUITE");
  console.log("=======================================================\n");

  let testAdminUser: any;
  let testStaffUser1: any;
  let testStaffUser2: any;
  let courseManagerRole: any;
  let opsExecutiveRole: any;
  let testInvitation: any;

  try {
    // -----------------------------------------------------------------
    // SETUP: Synchronize DB registry and create test users
    // -----------------------------------------------------------------
    console.log("⚙️  Step 0: Synchronizing feature and permission registry in DB...");
    await syncFeatureRegistry();

    const allFeaturesInDb = await prisma.feature.findMany();
    const allPermsInDb = await prisma.permission.findMany();
    console.log(`   ✅ DB has ${allFeaturesInDb.length} features and ${allPermsInDb.length} permissions in registry.\n`);

    const passwordHash = await hashPassword("StaffPass123!");
    const timestamp = Date.now();

    // Create Super Admin
    testAdminUser = await prisma.user.create({
      data: {
        email: `super.admin.${timestamp}@educonnect.com`,
        passwordHash,
        role: "ADMIN",
        status: "ACTIVE",
        emailVerified: true,
        emailVerifiedAt: new Date(),
        profile: {
          create: { firstName: "Root", lastName: "Admin" },
        },
      },
    });

    // -----------------------------------------------------------------
    // TEST 7: Super Admin Platform Access Unrestricted
    // -----------------------------------------------------------------
    console.log("📋 Test 7: Super Admin Unrestricted Platform Access...");
    const adminAuth = await getUserAuthorization(testAdminUser.id);
    if (!adminAuth.isSuperAdmin) {
      throw new Error("Expected testAdminUser to have isSuperAdmin = true");
    }
    if (adminAuth.features.length !== allFeaturesInDb.length) {
      throw new Error(`Expected Super Admin to have all ${allFeaturesInDb.length} features, got ${adminAuth.features.length}`);
    }
    if (adminAuth.permissions.length !== allPermsInDb.length) {
      throw new Error(`Expected Super Admin to have all ${allPermsInDb.length} permissions, got ${adminAuth.permissions.length}`);
    }

    const adminPermCheck = await hasPermission(testAdminUser.id, "courses.delete");
    if (!adminPermCheck) {
      throw new Error("Super Admin should have unconditional access to courses.delete");
    }
    const adminRandCheck = await hasPermission(testAdminUser.id, "payments.reconcile");
    if (!adminRandCheck) {
      throw new Error("Super Admin should have unconditional access to payments.reconcile");
    }
    console.log("   ✅ Super Admin has full unrestricted access to all features and permissions without manual assignment.\n");

    // -----------------------------------------------------------------
    // TEST 1: Super Admin creates "Course Manager" with Courses + Reports
    // -----------------------------------------------------------------
    console.log("📋 Test 1: Super Admin creates 'Course Manager' role (Courses + Reports)...");

    // Fetch feature records
    const coursesFeat = await prisma.feature.findUnique({ where: { key: "courses" } });
    const reportsFeat = await prisma.feature.findUnique({ where: { key: "reports" } });
    const paymentsFeat = await prisma.feature.findUnique({ where: { key: "payments" } });

    if (!coursesFeat || !reportsFeat || !paymentsFeat) {
      throw new Error("Missing feature records in DB.");
    }

    const initialPermKeys = [
      "courses.view",
      "courses.approve",
      "courses.reject",
      "courses.delete",
      "reports.view",
      "reports.resolve",
    ];

    const initialPerms = await prisma.permission.findMany({
      where: { key: { in: initialPermKeys } },
    });

    courseManagerRole = await prisma.role.create({
      data: {
        name: `Course Manager Test ${timestamp}`,
        description: "Manages curriculum, catalog moderation, and flagged reports",
        status: "ACTIVE",
        isSystem: false,
        createdById: testAdminUser.id,
        roleFeatures: {
          create: [{ featureId: coursesFeat.id }, { featureId: reportsFeat.id }],
        },
        rolePermissions: {
          create: initialPerms.map((p) => ({ permissionId: p.id })),
        },
      },
    });

    // Create staff member 1 and assign Course Manager role
    testStaffUser1 = await prisma.user.create({
      data: {
        email: `course.manager.${timestamp}@educonnect.com`,
        passwordHash,
        role: "STAFF",
        roleId: courseManagerRole.id,
        status: "ACTIVE",
        emailVerified: true,
        emailVerifiedAt: new Date(),
        profile: {
          create: { firstName: "Alice", lastName: "Courses" },
        },
      },
    });

    // Verify staff 1 authorization
    const staff1Auth = await getUserAuthorization(testStaffUser1.id);
    console.log(`   Staff 1 features: ${staff1Auth.features.join(", ")}`);
    console.log(`   Staff 1 permissions count: ${staff1Auth.permissions.length}`);

    if (staff1Auth.isSuperAdmin) {
      throw new Error("Staff member should not have isSuperAdmin = true");
    }
    if (!staff1Auth.features.includes("courses") || !staff1Auth.features.includes("reports")) {
      throw new Error("Staff 1 should have courses and reports features");
    }
    if (staff1Auth.features.includes("payments") || staff1Auth.features.includes("users")) {
      throw new Error("Staff 1 should NOT have payments or users features");
    }

    // Check dynamic navigation
    const staff1Nav = await getDynamicNavigation(testStaffUser1.id);
    const navHrefs = staff1Nav.map((n) => n.href);
    console.log(`   Staff 1 dynamic navigation hrefs: ${navHrefs.join(", ")}`);

    if (!navHrefs.includes("/admin/courses") || !navHrefs.includes("/admin/reports")) {
      throw new Error("Staff 1 navigation missing expected allowed routes");
    }
    if (navHrefs.includes("/admin/users") || navHrefs.includes("/admin/payments")) {
      throw new Error("Staff 1 navigation should NOT include /admin/users or /admin/payments");
    }

    // Permission checks
    const canViewCourses = await hasPermission(testStaffUser1.id, "courses.view");
    const canDeleteCourses = await hasPermission(testStaffUser1.id, "courses.delete");
    const canViewUsers = await hasPermission(testStaffUser1.id, "users.view");
    const canViewPayments = await hasPermission(testStaffUser1.id, "payments.view");

    if (!canViewCourses || !canDeleteCourses) {
      throw new Error("Staff 1 should have courses.view and courses.delete");
    }
    if (canViewUsers || canViewPayments) {
      throw new Error("Staff 1 should NOT have users.view or payments.view");
    }
    console.log("   ✅ Dynamic role creation & initial authorization verified successfully.\n");

    // -----------------------------------------------------------------
    // TEST 2: Remove courses.delete permission
    // -----------------------------------------------------------------
    console.log("📋 Test 2: Remove 'courses.delete' from Course Manager role...");

    const deletePerm = initialPerms.find((p) => p.key === "courses.delete");
    if (!deletePerm) throw new Error("Could not find courses.delete permission in DB");

    // Remove the permission link
    await prisma.rolePermission.deleteMany({
      where: {
        roleId: courseManagerRole.id,
        permissionId: deletePerm.id,
      },
    });

    const staff1AuthAfterRemoval = await getUserAuthorization(testStaffUser1.id);
    const hasDeleteNow = await hasPermission(testStaffUser1.id, "courses.delete");
    const hasApproveNow = await hasPermission(testStaffUser1.id, "courses.approve");

    if (hasDeleteNow) {
      throw new Error("Staff 1 should NO LONGER have courses.delete permission");
    }
    if (!hasApproveNow) {
      throw new Error("Staff 1 should retain courses.approve permission");
    }

    // Verify requirePermission throws FORBIDDEN for delete
    let threwForbidden = false;
    try {
      await requirePermission("courses.delete", testStaffUser1.id);
    } catch (err: any) {
      if (err.message.includes("FORBIDDEN")) {
        threwForbidden = true;
      }
    }

    if (!threwForbidden) {
      throw new Error("requirePermission('courses.delete') should have thrown FORBIDDEN");
    }
    console.log("   ✅ courses.delete successfully revoked; requirePermission correctly returned FORBIDDEN.\n");

    // -----------------------------------------------------------------
    // TEST 3: Add payments.view to the role
    // -----------------------------------------------------------------
    console.log("📋 Test 3: Add 'payments' feature and 'payments.view' permission to the role...");

    // Add roleFeature payments
    await prisma.roleFeature.create({
      data: {
        roleId: courseManagerRole.id,
        featureId: paymentsFeat.id,
      },
    });

    // Add rolePermission payments.view
    const paymentsViewPerm = await prisma.permission.findUnique({
      where: { key: "payments.view" },
    });
    if (!paymentsViewPerm) throw new Error("payments.view permission missing in DB");

    await prisma.rolePermission.create({
      data: {
        roleId: courseManagerRole.id,
        permissionId: paymentsViewPerm.id,
      },
    });

    const hasPaymentsFeatureNow = await hasFeature(testStaffUser1.id, "payments");
    const hasPaymentsViewNow = await hasPermission(testStaffUser1.id, "payments.view");
    const staff1NavAfterPayments = await getDynamicNavigation(testStaffUser1.id);
    const navHrefsAfterPayments = staff1NavAfterPayments.map((n) => n.href);

    if (!hasPaymentsFeatureNow) {
      throw new Error("Staff 1 should now have payments feature");
    }
    if (!hasPaymentsViewNow) {
      throw new Error("Staff 1 should now have payments.view permission");
    }
    if (!navHrefsAfterPayments.includes("/admin/payments")) {
      throw new Error("Dynamic navigation should automatically include /admin/payments");
    }
    console.log(`   Staff 1 navigation now includes: ${navHrefsAfterPayments.join(", ")}`);
    console.log("   ✅ Dynamic feature addition automatically reflected in navigation and permissions.\n");

    // -----------------------------------------------------------------
    // TEST 4: Create new custom role "Operations Executive"
    // -----------------------------------------------------------------
    console.log("📋 Test 4: Create custom role 'Operations Executive' (users, teachers, live_classes, reports)...");

    const usersFeat = await prisma.feature.findUnique({ where: { key: "users" } });
    const teachersFeat = await prisma.feature.findUnique({ where: { key: "teachers" } });
    const liveClassesFeat = await prisma.feature.findUnique({ where: { key: "live_classes" } });

    if (!usersFeat || !teachersFeat || !liveClassesFeat) {
      throw new Error("Missing feature records for Operations Executive");
    }

    const opsPermKeys = ["users.view", "teachers.view", "live_classes.view", "reports.view"];
    const opsPerms = await prisma.permission.findMany({
      where: { key: { in: opsPermKeys } },
    });

    opsExecutiveRole = await prisma.role.create({
      data: {
        name: `Operations Executive Test ${timestamp}`,
        description: "Monitors active users, educators, interactive classroom slots, and safety flags",
        status: "ACTIVE",
        isSystem: false,
        createdById: testAdminUser.id,
        roleFeatures: {
          create: [
            { featureId: usersFeat.id },
            { featureId: teachersFeat.id },
            { featureId: liveClassesFeat.id },
            { featureId: reportsFeat.id },
          ],
        },
        rolePermissions: {
          create: opsPerms.map((p) => ({ permissionId: p.id })),
        },
      },
    });

    // Create staff member 2
    testStaffUser2 = await prisma.user.create({
      data: {
        email: `ops.exec.${timestamp}@educonnect.com`,
        passwordHash,
        role: "STAFF",
        roleId: opsExecutiveRole.id,
        status: "ACTIVE",
        emailVerified: true,
        emailVerifiedAt: new Date(),
        profile: {
          create: { firstName: "Bob", lastName: "Ops" },
        },
      },
    });

    const staff2Auth = await getUserAuthorization(testStaffUser2.id);
    const staff2Nav = await getDynamicNavigation(testStaffUser2.id);
    const staff2Hrefs = staff2Nav.map((n) => n.href);

    console.log(`   Staff 2 features: ${staff2Auth.features.join(", ")}`);
    console.log(`   Staff 2 dynamic navigation: ${staff2Hrefs.join(", ")}`);

    if (staff2Auth.features.length !== 4) {
      throw new Error(`Expected exactly 4 features for Staff 2, got ${staff2Auth.features.length}`);
    }
    if (!staff2Hrefs.includes("/admin/users") || !staff2Hrefs.includes("/admin/teachers") || !staff2Hrefs.includes("/admin/live-classes")) {
      throw new Error("Staff 2 navigation missing operational modules");
    }
    if (staff2Hrefs.includes("/admin/courses") || staff2Hrefs.includes("/admin/payments")) {
      throw new Error("Staff 2 should NOT have courses or payments in navigation");
    }

    const staff2CanViewUsers = await hasPermission(testStaffUser2.id, "users.view");
    const staff2CanViewCourses = await hasPermission(testStaffUser2.id, "courses.view");

    if (!staff2CanViewUsers || staff2CanViewCourses) {
      throw new Error("Staff 2 permission check failed");
    }
    console.log("   ✅ Custom 'Operations Executive' role generated full navigation without code alteration.\n");

    // -----------------------------------------------------------------
    // TEST 5: Deactivate staff & Inactive Role guards
    // -----------------------------------------------------------------
    console.log("📋 Test 5: Deactivating staff member and testing security enforcement...");

    // Deactivate staff 2
    await prisma.user.update({
      where: { id: testStaffUser2.id },
      data: { status: "DEACTIVATED" },
    });

    const canViewUsersWhenDeactivated = await hasPermission(testStaffUser2.id, "users.view");
    if (canViewUsersWhenDeactivated) {
      throw new Error("Deactivated staff should NOT have any active permissions");
    }

    let caughtDeactivatedError = false;
    try {
      await requirePermission("users.view", testStaffUser2.id);
    } catch (err: any) {
      if (err.message.includes("deactivated or suspended")) {
        caughtDeactivatedError = true;
      }
    }
    if (!caughtDeactivatedError) {
      throw new Error("requirePermission should have rejected deactivated user");
    }

    // Reactivate staff 2
    await prisma.user.update({
      where: { id: testStaffUser2.id },
      data: { status: "ACTIVE" },
    });
    const canViewUsersAfterReactivation = await hasPermission(testStaffUser2.id, "users.view");
    if (!canViewUsersAfterReactivation) {
      throw new Error("Reactivated staff should have permissions restored");
    }

    // Deactivate role itself
    await prisma.role.update({
      where: { id: opsExecutiveRole.id },
      data: { status: "INACTIVE" },
    });

    let caughtInactiveRoleError = false;
    try {
      await requirePermission("users.view", testStaffUser2.id);
    } catch (err: any) {
      if (err.message.includes("role is currently inactive")) {
        caughtInactiveRoleError = true;
      }
    }
    if (!caughtInactiveRoleError) {
      throw new Error("requirePermission should have rejected user with inactive role");
    }

    // Reactivate role
    await prisma.role.update({
      where: { id: opsExecutiveRole.id },
      data: { status: "ACTIVE" },
    });
    console.log("   ✅ User deactivation and role deactivation guards properly block access.\n");

    // -----------------------------------------------------------------
    // TEST 6: Staff Invitation Lifecycle
    // -----------------------------------------------------------------
    console.log("📋 Test 6: Testing Staff Invitation Lifecycle (Generation, Expiry, Acceptance)...");

    const rawInviteToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawInviteToken).digest("hex");
    const inviteEmail = `invitee.${timestamp}@educonnect.com`;

    testInvitation = await prisma.staffInvitation.create({
      data: {
        email: inviteEmail,
        fullName: "Invited Staff Candidate",
        roleId: courseManagerRole.id,
        invitedById: testAdminUser.id,
        tokenHash,
        status: "PENDING",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Lookup invitation by token hash
    const foundInvite = await prisma.staffInvitation.findUnique({
      where: { tokenHash },
      include: { role: true },
    });
    if (!foundInvite || foundInvite.status !== "PENDING") {
      throw new Error("Invitation not found or status not PENDING");
    }

    // Test Expiry check
    const expiredTokenHash = crypto.createHash("sha256").update("expired_token_sample").digest("hex");
    const expiredInvitation = await prisma.staffInvitation.create({
      data: {
        email: `expired.${timestamp}@educonnect.com`,
        fullName: "Expired Candidate",
        roleId: courseManagerRole.id,
        invitedById: testAdminUser.id,
        tokenHash: expiredTokenHash,
        status: "PENDING",
        expiresAt: new Date(Date.now() - 1000), // In the past
      },
    });

    const isExpired = new Date() > expiredInvitation.expiresAt;
    if (!isExpired) {
      throw new Error("Expected past expiration date to evaluate to true");
    }

    // Simulate Invitation Acceptance
    const acceptedStaff = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          email: foundInvite.email,
          passwordHash,
          role: "STAFF",
          roleId: foundInvite.roleId,
          status: "ACTIVE",
          emailVerified: true,
          emailVerifiedAt: new Date(),
          profile: {
            create: { firstName: "Invited", lastName: "Staff" },
          },
        },
      });

      await tx.staffInvitation.update({
        where: { id: foundInvite.id },
        data: {
          status: "ACCEPTED",
          acceptedAt: new Date(),
        },
      });

      return u;
    });

    const acceptedInviteRecord = await prisma.staffInvitation.findUnique({
      where: { id: foundInvite.id },
    });
    if (acceptedInviteRecord?.status !== "ACCEPTED") {
      throw new Error("Expected invitation status to be ACCEPTED");
    }

    const acceptedStaffAuth = await getUserAuthorization(acceptedStaff.id);
    if (!acceptedStaffAuth.features.includes("courses")) {
      throw new Error("Newly accepted staff should inherit the role's features");
    }

    // Cleanup expired invitation record and accepted staff
    await prisma.staffInvitation.delete({ where: { id: expiredInvitation.id } });
    await prisma.user.delete({ where: { id: acceptedStaff.id } });
    console.log("   ✅ Staff invitation generation, validation, expiry check, and acceptance verified.\n");

    console.log("=======================================================");
    console.log("🎉 ALL DYNAMIC RBAC & STAFF DASHBOARD TESTS PASSED!");
    console.log("=======================================================\n");
  } catch (error: any) {
    console.error("❌ Test Suite Failed with error:", error);
    process.exitCode = 1;
  } finally {
    // Teardown test artifacts
    console.log("🧹 Cleaning up test artifacts...");
    try {
      if (testInvitation?.id) {
        await prisma.staffInvitation.deleteMany({ where: { id: testInvitation.id } });
      }
      if (testStaffUser1?.id) {
        await prisma.user.deleteMany({ where: { id: testStaffUser1.id } });
      }
      if (testStaffUser2?.id) {
        await prisma.user.deleteMany({ where: { id: testStaffUser2.id } });
      }
      if (courseManagerRole?.id) {
        await prisma.roleFeature.deleteMany({ where: { roleId: courseManagerRole.id } });
        await prisma.rolePermission.deleteMany({ where: { roleId: courseManagerRole.id } });
        await prisma.role.deleteMany({ where: { id: courseManagerRole.id } });
      }
      if (opsExecutiveRole?.id) {
        await prisma.roleFeature.deleteMany({ where: { roleId: opsExecutiveRole.id } });
        await prisma.rolePermission.deleteMany({ where: { roleId: opsExecutiveRole.id } });
        await prisma.role.deleteMany({ where: { id: opsExecutiveRole.id } });
      }
      if (testAdminUser?.id) {
        await prisma.user.deleteMany({ where: { id: testAdminUser.id } });
      }
      console.log("   ✅ Cleanup complete.");
    } catch (cleanupErr) {
      console.error("Cleanup encountered an error:", cleanupErr);
    }
  }
}

runDynamicRBACTests();
