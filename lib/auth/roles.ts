export function isEducatorRole(role?: string | null): boolean {
  if (!role) return false;
  const upper = role.toUpperCase();
  return upper === "TEACHER" || upper === "EDUCATOR";
}

export function isLearnerRole(role?: string | null): boolean {
  if (!role) return false;
  const upper = role.toUpperCase();
  return upper === "STUDENT" || upper === "LEARNER";
}

export function isAdminRole(role?: string | null): boolean {
  if (!role) return false;
  const upper = role.toUpperCase();
  return upper === "ADMIN" || upper === "STAFF";
}

export function getDashboardPathForRole(role?: string | null): string {
  if (isEducatorRole(role)) return "/teacher/dashboard";
  if (isLearnerRole(role)) return "/student/dashboard";
  if (isAdminRole(role)) return "/admin";
  return "/student/dashboard";
}

export function matchesRole(userRole: string | undefined, allowedRole: string): boolean {
  if (!userRole) return false;
  const target = allowedRole.toUpperCase();
  if (target === "EDUCATOR" || target === "TEACHER") {
    return isEducatorRole(userRole);
  }
  if (target === "LEARNER" || target === "STUDENT") {
    return isLearnerRole(userRole);
  }
  if (target === "ADMIN") {
    return userRole.toUpperCase() === "ADMIN";
  }
  if (target === "STAFF") {
    return userRole.toUpperCase() === "STAFF" || userRole.toUpperCase() === "ADMIN";
  }
  return userRole.toUpperCase() === target;
}
