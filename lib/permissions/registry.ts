import { prisma } from "@/lib/prisma";

export interface FeatureDefinition {
  key: string;
  name: string;
  description: string;
  moduleGroup: "Core" | "Academic" | "Finance" | "Governance" | "Operations" | "Administration";
  route: string;
  icon: string;
  sortOrder: number;
  dashboardWidgetKey?: string;
}

export interface PermissionDefinition {
  key: string;
  name: string;
  description: string;
  moduleGroup: string;
  action: string;
  featureKey: string;
  sortOrder: number;
}

export const PROJECT_FEATURES: FeatureDefinition[] = [
  {
    key: "dashboard",
    name: "Overview Dashboard",
    description: "Access executive summary metrics, system statistics, and priority operational queues.",
    moduleGroup: "Core",
    route: "/admin",
    icon: "LayoutDashboard",
    sortOrder: 1,
    dashboardWidgetKey: "widget.overview_stats",
  },
  {
    key: "users",
    name: "User Governance",
    description: "Manage learner, educator, and staff accounts, suspensions, and account states.",
    moduleGroup: "Governance",
    route: "/admin/users",
    icon: "Users",
    sortOrder: 2,
    dashboardWidgetKey: "widget.user_metrics",
  },
  {
    key: "teachers",
    name: "Teacher Roster",
    description: "Browse educator roster, credentials, profiles, hourly rates, and status.",
    moduleGroup: "Academic",
    route: "/admin/teachers",
    icon: "GraduationCap",
    sortOrder: 3,
  },
  {
    key: "verification",
    name: "Teacher Verifications",
    description: "Review pending educator verification applications, identity documents, and credentials.",
    moduleGroup: "Academic",
    route: "/admin/verification",
    icon: "ShieldCheck",
    sortOrder: 4,
    dashboardWidgetKey: "widget.verification_queue",
  },
  {
    key: "courses",
    name: "Course Moderation",
    description: "Moderate, approve, review, and manage course catalog content and video curriculum.",
    moduleGroup: "Academic",
    route: "/admin/courses",
    icon: "BookOpen",
    sortOrder: 5,
    dashboardWidgetKey: "widget.course_metrics",
  },
  {
    key: "live_classes",
    name: "Live Classes",
    description: "Oversee scheduled live class slots, classroom attendance, and live session health.",
    moduleGroup: "Academic",
    route: "/admin/live-classes",
    icon: "Video",
    sortOrder: 6,
    dashboardWidgetKey: "widget.live_class_metrics",
  },
  {
    key: "payments",
    name: "Financial Ledger & Payouts",
    description: "View platform revenue transactions, teacher payout splits, commission, and reconciliation.",
    moduleGroup: "Finance",
    route: "/admin/payments",
    icon: "FileCheck",
    sortOrder: 7,
    dashboardWidgetKey: "widget.financial_metrics",
  },
  {
    key: "refunds",
    name: "Refund Management",
    description: "Review, approve, or reject learner refund requests and reverse ledger disbursements.",
    moduleGroup: "Finance",
    route: "/admin/refunds",
    icon: "IndianRupee",
    sortOrder: 8,
    dashboardWidgetKey: "widget.refund_metrics",
  },
  {
    key: "reports",
    name: "Content & User Reports",
    description: "Moderate user reports, review violations, and take compliance actions.",
    moduleGroup: "Governance",
    route: "/admin/reports",
    icon: "AlertOctagon",
    sortOrder: 9,
    dashboardWidgetKey: "widget.reports_metrics",
  },
  {
    key: "analytics",
    name: "Platform Analytics",
    description: "Analyze growth trajectories, enrollment trends, revenue reports, and user metrics.",
    moduleGroup: "Core",
    route: "/admin/analytics",
    icon: "BarChart2",
    sortOrder: 10,
  },
  {
    key: "activity",
    name: "Audit & Security Logs",
    description: "Inspect immutable audit log trails of all administrative, financial, and authentication events.",
    moduleGroup: "Governance",
    route: "/admin/activity",
    icon: "Activity",
    sortOrder: 11,
  },
  {
    key: "system_health",
    name: "System Health",
    description: "Monitor database, LiveKit Cloud, Mux Video, and Razorpay gateway health statuses.",
    moduleGroup: "Operations",
    route: "/admin/system-health",
    icon: "Server",
    sortOrder: 12,
  },
  {
    key: "roles",
    name: "Role Management",
    description: "Configure dynamic roles, assign granular permissions, and control sub-dashboard capabilities.",
    moduleGroup: "Administration",
    route: "/admin/roles",
    icon: "ShieldAlert",
    sortOrder: 13,
  },
  {
    key: "staff",
    name: "Staff Management",
    description: "Invite staff, assign custom roles, manage access lifecycles, and revoke permissions.",
    moduleGroup: "Administration",
    route: "/admin/staff",
    icon: "UserCheck",
    sortOrder: 14,
  },
  {
    key: "settings",
    name: "Platform Settings",
    description: "Adjust global commission fees, subject taxonomies, and platform configs.",
    moduleGroup: "Operations",
    route: "/admin/settings",
    icon: "Settings",
    sortOrder: 15,
  },
];

export const PROJECT_PERMISSIONS: PermissionDefinition[] = [
  // Dashboard
  {
    key: "dashboard.view",
    name: "View Dashboard",
    description: "Access dashboard metrics, charts, and operational summary widgets",
    moduleGroup: "Dashboard",
    action: "view",
    featureKey: "dashboard",
    sortOrder: 1,
  },

  // Courses
  {
    key: "courses.view",
    name: "View Courses",
    description: "Browse course catalog, view syllabus, and view lesson contents",
    moduleGroup: "Courses",
    action: "view",
    featureKey: "courses",
    sortOrder: 10,
  },
  {
    key: "courses.create",
    name: "Create Course",
    description: "Draft and create new courses and sections",
    moduleGroup: "Courses",
    action: "create",
    featureKey: "courses",
    sortOrder: 11,
  },
  {
    key: "courses.update",
    name: "Edit Course",
    description: "Modify course details, descriptions, pricing, and curriculum",
    moduleGroup: "Courses",
    action: "update",
    featureKey: "courses",
    sortOrder: 12,
  },
  {
    key: "courses.delete",
    name: "Delete Course",
    description: "Permanently delete courses and associated resources",
    moduleGroup: "Courses",
    action: "delete",
    featureKey: "courses",
    sortOrder: 13,
  },
  {
    key: "courses.approve",
    name: "Approve Course",
    description: "Approve pending draft courses and publish them to the live catalog",
    moduleGroup: "Courses",
    action: "approve",
    featureKey: "courses",
    sortOrder: 14,
  },
  {
    key: "courses.reject",
    name: "Reject Course",
    description: "Reject submitted course applications and request changes from teachers",
    moduleGroup: "Courses",
    action: "reject",
    featureKey: "courses",
    sortOrder: 15,
  },
  {
    key: "courses.archive",
    name: "Archive Course",
    description: "Archive published courses and take them off public listing",
    moduleGroup: "Courses",
    action: "archive",
    featureKey: "courses",
    sortOrder: 16,
  },
  {
    key: "courses.manage_videos",
    name: "Manage Course Videos",
    description: "Upload, re-order, replace, and configure video lessons",
    moduleGroup: "Courses",
    action: "manage_videos",
    featureKey: "courses",
    sortOrder: 17,
  },

  // Teachers
  {
    key: "teachers.view",
    name: "View Teachers",
    description: "Browse educator roster, view teacher bios, qualifications, and ratings",
    moduleGroup: "Teachers",
    action: "view",
    featureKey: "teachers",
    sortOrder: 20,
  },
  {
    key: "teachers.update",
    name: "Edit Teacher Profile",
    description: "Update teacher profile metadata and subject qualifications",
    moduleGroup: "Teachers",
    action: "update",
    featureKey: "teachers",
    sortOrder: 21,
  },
  {
    key: "teachers.suspend",
    name: "Suspend Teacher",
    description: "Suspend educator accounts and disable active slot scheduling",
    moduleGroup: "Teachers",
    action: "suspend",
    featureKey: "teachers",
    sortOrder: 22,
  },
  {
    key: "teachers.reactivate",
    name: "Reactivate Teacher",
    description: "Restore suspended educator accounts back to verified standing",
    moduleGroup: "Teachers",
    action: "reactivate",
    featureKey: "teachers",
    sortOrder: 23,
  },

  // Verification
  {
    key: "verification.view",
    name: "View Verifications",
    description: "View teacher verification queue and inspect identity documents",
    moduleGroup: "Verifications",
    action: "view",
    featureKey: "verification",
    sortOrder: 30,
  },
  {
    key: "verification.approve",
    name: "Approve Verification",
    description: "Approve teacher verification applications and grant teaching privileges",
    moduleGroup: "Verifications",
    action: "approve",
    featureKey: "verification",
    sortOrder: 31,
  },
  {
    key: "verification.reject",
    name: "Reject Verification",
    description: "Reject teacher applications with feedback reasons",
    moduleGroup: "Verifications",
    action: "reject",
    featureKey: "verification",
    sortOrder: 32,
  },
  {
    key: "verification.suspend",
    name: "Suspend Verified Teacher",
    description: "Revoke teacher verification standing for compliance reasons",
    moduleGroup: "Verifications",
    action: "suspend",
    featureKey: "verification",
    sortOrder: 33,
  },
  {
    key: "verification.notes",
    name: "Manage Verification Notes",
    description: "Add administrative internal review notes on educator applications",
    moduleGroup: "Verifications",
    action: "notes",
    featureKey: "verification",
    sortOrder: 34,
  },

  // Users
  {
    key: "users.view",
    name: "View Users",
    description: "Search, filter, and view user profiles and account metadata",
    moduleGroup: "Users",
    action: "view",
    featureKey: "users",
    sortOrder: 40,
  },
  {
    key: "users.create",
    name: "Create User",
    description: "Manually provision new user accounts",
    moduleGroup: "Users",
    action: "create",
    featureKey: "users",
    sortOrder: 41,
  },
  {
    key: "users.update",
    name: "Update User",
    description: "Edit user profile information, contact info, and status",
    moduleGroup: "Users",
    action: "update",
    featureKey: "users",
    sortOrder: 42,
  },
  {
    key: "users.suspend",
    name: "Suspend User",
    description: "Temporarily suspend user access with recorded reason",
    moduleGroup: "Users",
    action: "suspend",
    featureKey: "users",
    sortOrder: 43,
  },
  {
    key: "users.activate",
    name: "Activate User",
    description: "Re-enable suspended or deactivated user accounts",
    moduleGroup: "Users",
    action: "activate",
    featureKey: "users",
    sortOrder: 44,
  },
  {
    key: "users.deactivate",
    name: "Deactivate User",
    description: "Permanently deactivate user accounts and invalidate sessions",
    moduleGroup: "Users",
    action: "deactivate",
    featureKey: "users",
    sortOrder: 45,
  },
  {
    key: "users.delete",
    name: "Delete User",
    description: "Purge user records from system if permitted",
    moduleGroup: "Users",
    action: "delete",
    featureKey: "users",
    sortOrder: 46,
  },

  // Live Classes
  {
    key: "live_classes.view",
    name: "View Live Classes",
    description: "View scheduled, active, and completed live class slots",
    moduleGroup: "Live Classes",
    action: "view",
    featureKey: "live_classes",
    sortOrder: 50,
  },
  {
    key: "live_classes.create",
    name: "Schedule Live Class",
    description: "Schedule administrative live classes or special workshops",
    moduleGroup: "Live Classes",
    action: "create",
    featureKey: "live_classes",
    sortOrder: 51,
  },
  {
    key: "live_classes.update",
    name: "Edit Live Class",
    description: "Update live class timings, capacity, and subject details",
    moduleGroup: "Live Classes",
    action: "update",
    featureKey: "live_classes",
    sortOrder: 52,
  },
  {
    key: "live_classes.cancel",
    name: "Cancel Live Class",
    description: "Administratively cancel live classes and trigger learner notifications",
    moduleGroup: "Live Classes",
    action: "cancel",
    featureKey: "live_classes",
    sortOrder: 53,
  },
  {
    key: "live_classes.moderate",
    name: "Moderate Live Classroom",
    description: "Join live classrooms as administrative moderator with mute/eject controls",
    moduleGroup: "Live Classes",
    action: "moderate",
    featureKey: "live_classes",
    sortOrder: 54,
  },

  // Payments & Commission
  {
    key: "payments.view",
    name: "View Payments",
    description: "Inspect financial ledger, revenue transactions, and payment statuses",
    moduleGroup: "Payments",
    action: "view",
    featureKey: "payments",
    sortOrder: 60,
  },
  {
    key: "payments.reconcile",
    name: "Reconcile Payments",
    description: "Execute automated payment reconciliation with payment gateway",
    moduleGroup: "Payments",
    action: "reconcile",
    featureKey: "payments",
    sortOrder: 61,
  },
  {
    key: "payments.manage",
    name: "Manage Payments",
    description: "Manage financial ledger entries and adjustments",
    moduleGroup: "Payments",
    action: "manage",
    featureKey: "payments",
    sortOrder: 62,
  },
  {
    key: "commission.view",
    name: "View Commission",
    description: "View platform commission rates and fee structures",
    moduleGroup: "Payments",
    action: "view",
    featureKey: "payments",
    sortOrder: 63,
  },
  {
    key: "commission.manage",
    name: "Manage Commission",
    description: "Update platform commission percentage across courses and live classes",
    moduleGroup: "Payments",
    action: "manage",
    featureKey: "payments",
    sortOrder: 64,
  },
  {
    key: "payouts.view",
    name: "View Payouts",
    description: "View educator payouts and ledger balances",
    moduleGroup: "Payments",
    action: "view",
    featureKey: "payments",
    sortOrder: 65,
  },
  {
    key: "payouts.manage",
    name: "Manage Payouts",
    description: "Process, hold, or release educator payout disbursements",
    moduleGroup: "Payments",
    action: "manage",
    featureKey: "payments",
    sortOrder: 66,
  },

  // Refunds
  {
    key: "refunds.view",
    name: "View Refunds",
    description: "View refund requests, amounts, reasons, and status timeline",
    moduleGroup: "Refunds",
    action: "view",
    featureKey: "refunds",
    sortOrder: 70,
  },
  {
    key: "refunds.approve",
    name: "Approve Refund",
    description: "Approve refund request and trigger gateway disbursement",
    moduleGroup: "Refunds",
    action: "approve",
    featureKey: "refunds",
    sortOrder: 71,
  },
  {
    key: "refunds.reject",
    name: "Reject Refund",
    description: "Reject refund request with official explanatory reason",
    moduleGroup: "Refunds",
    action: "reject",
    featureKey: "refunds",
    sortOrder: 72,
  },

  // Reports
  {
    key: "reports.view",
    name: "View Reports",
    description: "Inspect student and educator reported content, courses, and chats",
    moduleGroup: "Reports",
    action: "view",
    featureKey: "reports",
    sortOrder: 80,
  },
  {
    key: "reports.resolve",
    name: "Resolve Report",
    description: "Mark reports as resolved with recorded administrative action",
    moduleGroup: "Reports",
    action: "resolve",
    featureKey: "reports",
    sortOrder: 81,
  },
  {
    key: "reports.reject",
    name: "Dismiss Report",
    description: "Dismiss invalid or spam user reports",
    moduleGroup: "Reports",
    action: "reject",
    featureKey: "reports",
    sortOrder: 82,
  },
  {
    key: "moderation.action",
    name: "Take Moderation Action",
    description: "Take punitive moderation action against reported users or content",
    moduleGroup: "Reports",
    action: "action",
    featureKey: "reports",
    sortOrder: 83,
  },

  // Analytics
  {
    key: "analytics.view",
    name: "View Analytics",
    description: "Analyze platform performance, revenue charts, and enrollment curves",
    moduleGroup: "Analytics",
    action: "view",
    featureKey: "analytics",
    sortOrder: 90,
  },
  {
    key: "analytics.export",
    name: "Export Analytics",
    description: "Download CSV and Excel reporting data",
    moduleGroup: "Analytics",
    action: "export",
    featureKey: "analytics",
    sortOrder: 91,
  },

  // Activity
  {
    key: "activity.view",
    name: "View Activity Logs",
    description: "Inspect immutable audit log trails across all platform operations",
    moduleGroup: "Activity",
    action: "view",
    featureKey: "activity",
    sortOrder: 100,
  },
  {
    key: "activity.export",
    name: "Export Activity Logs",
    description: "Export audit trails for security compliance review",
    moduleGroup: "Activity",
    action: "export",
    featureKey: "activity",
    sortOrder: 101,
  },

  // System Health
  {
    key: "system_health.view",
    name: "View System Health",
    description: "Inspect operational status of database, Mux, Razorpay, and LiveKit",
    moduleGroup: "System Health",
    action: "view",
    featureKey: "system_health",
    sortOrder: 110,
  },
  {
    key: "system_health.manage",
    name: "Manage System Health",
    description: "Trigger health probes and diagnostics",
    moduleGroup: "System Health",
    action: "manage",
    featureKey: "system_health",
    sortOrder: 111,
  },

  // Roles
  {
    key: "roles.view",
    name: "View Roles",
    description: "Browse custom roles, permissions, and assigned staff",
    moduleGroup: "Roles",
    action: "view",
    featureKey: "roles",
    sortOrder: 120,
  },
  {
    key: "roles.create",
    name: "Create Role",
    description: "Create new custom roles and configure sub-dashboards",
    moduleGroup: "Roles",
    action: "create",
    featureKey: "roles",
    sortOrder: 121,
  },
  {
    key: "roles.update",
    name: "Edit Role",
    description: "Modify role name, description, assigned features, and permissions",
    moduleGroup: "Roles",
    action: "update",
    featureKey: "roles",
    sortOrder: 122,
  },
  {
    key: "roles.delete",
    name: "Delete Role",
    description: "Delete custom roles when safe and unassigned",
    moduleGroup: "Roles",
    action: "delete",
    featureKey: "roles",
    sortOrder: 123,
  },
  {
    key: "roles.duplicate",
    name: "Duplicate Role",
    description: "Clone an existing role with all feature and permission mappings",
    moduleGroup: "Roles",
    action: "duplicate",
    featureKey: "roles",
    sortOrder: 124,
  },
  {
    key: "roles.assign_features",
    name: "Assign Features",
    description: "Add or remove dashboard features from a role",
    moduleGroup: "Roles",
    action: "assign_features",
    featureKey: "roles",
    sortOrder: 125,
  },
  {
    key: "roles.assign_permissions",
    name: "Assign Permissions",
    description: "Add or remove granular permissions from a role",
    moduleGroup: "Roles",
    action: "assign_permissions",
    featureKey: "roles",
    sortOrder: 126,
  },

  // Staff
  {
    key: "staff.view",
    name: "View Staff",
    description: "Browse staff members, active roles, and invitation states",
    moduleGroup: "Staff",
    action: "view",
    featureKey: "staff",
    sortOrder: 130,
  },
  {
    key: "staff.create",
    name: "Invite Staff",
    description: "Create staff members and generate secure one-time invitations",
    moduleGroup: "Staff",
    action: "create",
    featureKey: "staff",
    sortOrder: 131,
  },
  {
    key: "staff.update",
    name: "Update Staff",
    description: "Reassign staff roles and modify account permissions",
    moduleGroup: "Staff",
    action: "update",
    featureKey: "staff",
    sortOrder: 132,
  },
  {
    key: "staff.activate",
    name: "Activate Staff",
    description: "Activate staff access to the dynamic administration portal",
    moduleGroup: "Staff",
    action: "activate",
    featureKey: "staff",
    sortOrder: 133,
  },
  {
    key: "staff.deactivate",
    name: "Deactivate Staff",
    description: "Deactivate staff member, immediately revoking all dashboard access",
    moduleGroup: "Staff",
    action: "deactivate",
    featureKey: "staff",
    sortOrder: 134,
  },
  {
    key: "staff.invite_resend",
    name: "Resend Invitation",
    description: "Regenerate and resend staff invitation links",
    moduleGroup: "Staff",
    action: "invite_resend",
    featureKey: "staff",
    sortOrder: 135,
  },
  {
    key: "staff.invite_revoke",
    name: "Revoke Invitation",
    description: "Revoke pending staff invitations",
    moduleGroup: "Staff",
    action: "invite_revoke",
    featureKey: "staff",
    sortOrder: 136,
  },

  // Settings
  {
    key: "settings.view",
    name: "View Settings",
    description: "View platform configurations, categories, and system toggles",
    moduleGroup: "Settings",
    action: "view",
    featureKey: "settings",
    sortOrder: 140,
  },
  {
    key: "settings.manage",
    name: "Manage Settings",
    description: "Update platform fee settings, categories, and global configurations",
    moduleGroup: "Settings",
    action: "manage",
    featureKey: "settings",
    sortOrder: 141,
  },
];

export interface RoleTemplate {
  name: string;
  description: string;
  featureKeys: string[];
  permissionKeys: string[];
}

export const ROLE_TEMPLATES: RoleTemplate[] = [
  {
    name: "Course Manager",
    description: "Responsible for course catalog review, lesson videos, and content moderation.",
    featureKeys: ["dashboard", "courses", "reports"],
    permissionKeys: [
      "dashboard.view",
      "courses.view",
      "courses.create",
      "courses.update",
      "courses.delete",
      "courses.approve",
      "courses.reject",
      "courses.archive",
      "courses.manage_videos",
      "reports.view",
    ],
  },
  {
    name: "Finance Executive",
    description: "Manages financial transactions, refunds, teacher payout reconciliations, and commission rates.",
    featureKeys: ["dashboard", "payments", "refunds", "reports"],
    permissionKeys: [
      "dashboard.view",
      "payments.view",
      "payments.reconcile",
      "payments.manage",
      "commission.view",
      "commission.manage",
      "payouts.view",
      "payouts.manage",
      "refunds.view",
      "refunds.approve",
      "refunds.reject",
      "reports.view",
    ],
  },
  {
    name: "Teacher Manager",
    description: "Oversees educator verification, credential inspections, teacher roster, and performance.",
    featureKeys: ["dashboard", "teachers", "verification", "reports"],
    permissionKeys: [
      "dashboard.view",
      "teachers.view",
      "teachers.update",
      "teachers.suspend",
      "teachers.reactivate",
      "verification.view",
      "verification.approve",
      "verification.reject",
      "verification.suspend",
      "verification.notes",
      "reports.view",
    ],
  },
  {
    name: "Support Executive",
    description: "Handles user support, content flags, resolution of abuse reports, and user accounts view.",
    featureKeys: ["dashboard", "reports", "users"],
    permissionKeys: [
      "dashboard.view",
      "reports.view",
      "reports.resolve",
      "reports.reject",
      "moderation.action",
      "users.view",
    ],
  },
  {
    name: "Operations Executive",
    description: "Cross-functional operations managing user accounts, teacher roster, live classrooms, and reports.",
    featureKeys: ["dashboard", "users", "teachers", "live_classes", "reports"],
    permissionKeys: [
      "dashboard.view",
      "users.view",
      "users.update",
      "teachers.view",
      "live_classes.view",
      "live_classes.create",
      "live_classes.update",
      "live_classes.cancel",
      "live_classes.moderate",
      "reports.view",
      "reports.resolve",
    ],
  },
  {
    name: "Content Moderator",
    description: "Moderates course submissions and user reports across all platform subjects.",
    featureKeys: ["dashboard", "courses", "reports"],
    permissionKeys: [
      "dashboard.view",
      "courses.view",
      "courses.approve",
      "courses.reject",
      "reports.view",
      "reports.resolve",
      "reports.reject",
      "moderation.action",
    ],
  },
];

/**
 * Ensures all features and permissions from the registry exist in the database.
 * Also seeds default starter templates if they don't exist yet.
 */
export async function syncFeatureRegistry() {
  // 1. Sync Features
  for (const feat of PROJECT_FEATURES) {
    await prisma.feature.upsert({
      where: { key: feat.key },
      create: {
        key: feat.key,
        name: feat.name,
        description: feat.description,
        moduleGroup: feat.moduleGroup,
        route: feat.route,
        icon: feat.icon,
        sortOrder: feat.sortOrder,
        status: "ACTIVE",
        dashboardWidgetKey: feat.dashboardWidgetKey,
      },
      update: {
        name: feat.name,
        description: feat.description,
        moduleGroup: feat.moduleGroup,
        route: feat.route,
        icon: feat.icon,
        sortOrder: feat.sortOrder,
        dashboardWidgetKey: feat.dashboardWidgetKey,
      },
    });
  }

  // 2. Fetch created features map
  const dbFeatures = await prisma.feature.findMany();
  const featureMap = new Map<string, string>();
  for (const f of dbFeatures) {
    featureMap.set(f.key, f.id);
  }

  // 3. Sync Permissions
  for (const perm of PROJECT_PERMISSIONS) {
    const featureId = featureMap.get(perm.featureKey);
    await prisma.permission.upsert({
      where: { key: perm.key },
      create: {
        key: perm.key,
        name: perm.name,
        description: perm.description,
        moduleGroup: perm.moduleGroup,
        action: perm.action,
        featureId,
        sortOrder: perm.sortOrder,
      },
      update: {
        name: perm.name,
        description: perm.description,
        moduleGroup: perm.moduleGroup,
        action: perm.action,
        featureId,
        sortOrder: perm.sortOrder,
      },
    });
  }

  // 4. Fetch created permissions map
  const dbPermissions = await prisma.permission.findMany();
  const permissionMap = new Map<string, string>();
  for (const p of dbPermissions) {
    permissionMap.set(p.key, p.id);
  }

  // 5. Seed default starter templates if not already present
  for (const template of ROLE_TEMPLATES) {
    let role = await prisma.role.findUnique({
      where: { name: template.name },
      include: { roleFeatures: true, rolePermissions: true },
    });

    if (!role) {
      role = await prisma.role.create({
        data: {
          name: template.name,
          description: template.description,
          status: "ACTIVE",
          isSystem: true,
        },
        include: { roleFeatures: true, rolePermissions: true },
      });

      // Link Features
      for (const featKey of template.featureKeys) {
        const featId = featureMap.get(featKey);
        if (featId) {
          await prisma.roleFeature.create({
            data: { roleId: role.id, featureId: featId },
          });
        }
      }

      // Link Permissions
      for (const permKey of template.permissionKeys) {
        const permId = permissionMap.get(permKey);
        if (permId) {
          await prisma.rolePermission.create({
            data: { roleId: role.id, permissionId: permId },
          });
        }
      }
    }
  }

  return { success: true };
}
