import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { PROJECT_FEATURES, PROJECT_PERMISSIONS } from "./registry";
import { DynamicNavItem } from "@/types/auth";

export interface UserAuthorization {
  authorized: boolean;
  isSuperAdmin: boolean;
  userId: string;
  email: string;
  role: string;
  roleId?: string | null;
  roleName: string;
  status: string;
  features: string[];
  permissions: string[];
  reason?: string;
}

export function isSuperAdmin(role?: string): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

/**
 * Resolves current user's authorization, role, active status,
 * allowed features, and granular permissions from the database.
 */
export async function getUserAuthorization(userId: string): Promise<UserAuthorization> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      customRole: {
        include: {
          roleFeatures: { include: { feature: true } },
          rolePermissions: { include: { permission: true } },
        },
      },
    },
  });

  if (!user) {
    return {
      authorized: false,
      isSuperAdmin: false,
      userId,
      email: "",
      role: "",
      roleName: "",
      status: "DEACTIVATED",
      features: [],
      permissions: [],
      reason: "USER_NOT_FOUND",
    };
  }

  // Account status check
  if (user.status !== "ACTIVE") {
    return {
      authorized: false,
      isSuperAdmin: isSuperAdmin(user.role),
      userId: user.id,
      email: user.email,
      role: user.role,
      roleId: user.roleId,
      roleName: user.customRole?.name || user.role,
      status: user.status,
      features: [],
      permissions: [],
      reason: "ACCOUNT_INACTIVE",
    };
  }

  // Super Admin has full platform access
  if (isSuperAdmin(user.role)) {
    return {
      authorized: true,
      isSuperAdmin: true,
      userId: user.id,
      email: user.email,
      role: "ADMIN",
      roleId: user.roleId,
      roleName: "Super Administrator",
      status: user.status,
      features: PROJECT_FEATURES.map((f) => f.key),
      permissions: PROJECT_PERMISSIONS.map((p) => p.key),
    };
  }

  // Staff Account
  if (user.role === "STAFF") {
    if (!user.customRole || user.customRole.status !== "ACTIVE") {
      return {
        authorized: false,
        isSuperAdmin: false,
        userId: user.id,
        email: user.email,
        role: "STAFF",
        roleId: user.roleId,
        roleName: user.customRole?.name || "Unassigned Staff",
        status: user.status,
        features: [],
        permissions: [],
        reason: "ROLE_INACTIVE",
      };
    }

    const featureKeys = user.customRole.roleFeatures
      .filter((rf) => rf.feature.status === "ACTIVE")
      .map((rf) => rf.feature.key);

    const permissionKeys = user.customRole.rolePermissions.map((rp) => rp.permission.key);

    return {
      authorized: true,
      isSuperAdmin: false,
      userId: user.id,
      email: user.email,
      role: "STAFF",
      roleId: user.customRole.id,
      roleName: user.customRole.name,
      status: user.status,
      features: featureKeys,
      permissions: permissionKeys,
    };
  }

  // Other roles (STUDENT, TEACHER)
  return {
    authorized: true,
    isSuperAdmin: false,
    userId: user.id,
    email: user.email,
    role: user.role,
    roleId: null,
    roleName: user.role,
    status: user.status,
    features: [],
    permissions: [],
  };
}

export function hasPermission(auth: UserAuthorization, permissionKey: string): boolean;
export function hasPermission(userId: string, permissionKey: string): Promise<boolean>;
export function hasPermission(
  authOrUserId: UserAuthorization | string,
  permissionKey: string
): boolean | Promise<boolean> {
  if (typeof authOrUserId === "string") {
    return getUserAuthorization(authOrUserId).then((auth) => hasPermission(auth, permissionKey));
  }
  const auth = authOrUserId;
  if (!auth.authorized) return false;
  if (auth.isSuperAdmin) return true;
  return auth.permissions.includes(permissionKey);
}

export function hasFeature(auth: UserAuthorization, featureKey: string): boolean;
export function hasFeature(userId: string, featureKey: string): Promise<boolean>;
export function hasFeature(
  authOrUserId: UserAuthorization | string,
  featureKey: string
): boolean | Promise<boolean> {
  if (typeof authOrUserId === "string") {
    return getUserAuthorization(authOrUserId).then((auth) => hasFeature(auth, featureKey));
  }
  const auth = authOrUserId;
  if (!auth.authorized) return false;
  if (auth.isSuperAdmin) return true;
  return auth.features.includes(featureKey);
}

/**
 * Server guard: Validates that the active session user is authorized and has the specified permission.
 * Throws standard error messages for unauthorized / forbidden states.
 */
export async function requirePermission(permissionKey: string, overrideUserId?: string) {
  let userId: string;
  let session: any = null;

  if (overrideUserId) {
    userId = overrideUserId;
  } else {
    session = await getSession();
    if (!session) {
      throw new Error("UNAUTHORIZED: Session expired or invalid.");
    }
    userId = session.userId || session.id;
  }

  const auth = await getUserAuthorization(userId);

  if (!auth.authorized) {
    if (auth.reason === "ACCOUNT_INACTIVE") {
      throw new Error("FORBIDDEN: User account is deactivated or suspended. Access denied.");
    }
    if (auth.reason === "ROLE_INACTIVE") {
      throw new Error("FORBIDDEN: Staff role is currently inactive or unassigned. Contact Super Admin.");
    }
    throw new Error("UNAUTHORIZED: User account not found.");
  }

  if (!hasPermission(auth, permissionKey)) {
    throw new Error(`FORBIDDEN: Access restricted. Missing required permission [${permissionKey}].`);
  }

  return { session, auth, userId };
}

/**
 * Server guard: Validates that the active session user has at least one of the specified permissions.
 */
export async function requireAnyPermission(permissionKeys: string[], overrideUserId?: string) {
  let userId: string;
  let session: any = null;

  if (overrideUserId) {
    userId = overrideUserId;
  } else {
    session = await getSession();
    if (!session) {
      throw new Error("UNAUTHORIZED: Session expired or invalid.");
    }
    userId = session.userId || session.id;
  }

  const auth = await getUserAuthorization(userId);

  if (!auth.authorized) {
    throw new Error("FORBIDDEN: User account is inactive or role is unassigned.");
  }

  const granted = permissionKeys.some((p) => hasPermission(auth, p));
  if (!granted) {
    throw new Error(`FORBIDDEN: Access restricted. Requires one of [${permissionKeys.join(", ")}].`);
  }

  return { session, auth, userId };
}

/**
 * Server guard: Validates that the user has access to a feature module.
 */
export async function requireFeature(featureKey: string, overrideUserId?: string) {
  let userId: string;
  let session: any = null;

  if (overrideUserId) {
    userId = overrideUserId;
  } else {
    session = await getSession();
    if (!session) {
      throw new Error("UNAUTHORIZED: Session expired or invalid.");
    }
    userId = session.userId || session.id;
  }

  const auth = await getUserAuthorization(userId);

  if (!auth.authorized || !hasFeature(auth, featureKey)) {
    throw new Error(`FORBIDDEN: Access restricted to feature [${featureKey}].`);
  }

  return { session, auth, userId };
}

/**
 * Compiles dynamic navigation items strictly filtered by the user's allowed features.
 */
export function getDynamicNavigation(auth: UserAuthorization): DynamicNavItem[];
export function getDynamicNavigation(userId: string): Promise<DynamicNavItem[]>;
export function getDynamicNavigation(
  authOrUserId: UserAuthorization | string
): DynamicNavItem[] | Promise<DynamicNavItem[]> {
  if (typeof authOrUserId === "string") {
    return getUserAuthorization(authOrUserId).then((auth) => getDynamicNavigation(auth));
  }
  const auth = authOrUserId;
  if (!auth.authorized) return [];

  const activeFeatures = PROJECT_FEATURES.filter((feat) => {
    if (auth.isSuperAdmin) return true;
    return auth.features.includes(feat.key);
  });

  return activeFeatures
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((feat) => ({
      key: feat.key,
      label: feat.name,
      href: feat.route,
      icon: feat.icon,
      moduleGroup: feat.moduleGroup,
      sortOrder: feat.sortOrder,
    }));
}
