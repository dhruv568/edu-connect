import { getSession } from "@/lib/auth/session";
import { UserRole, UserSession } from "@/types/auth";

export async function requireAuth(): Promise<UserSession> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED: Session expired or invalid.");
  }
  return session;
}

export async function requireRole(allowedRoles: UserRole[]): Promise<UserSession> {
  const session = await requireAuth();
  if (!allowedRoles.includes(session.role)) {
    throw new Error(`FORBIDDEN: Access restricted to roles [${allowedRoles.join(", ")}].`);
  }
  return session;
}

export async function requireVerifiedEmail(): Promise<UserSession> {
  const session = await requireAuth();
  if (!session.emailVerified) {
    throw new Error("UNVERIFIED: Email verification required to access this feature.");
  }
  return session;
}
