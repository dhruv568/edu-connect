import { getSession } from "@/lib/auth/session";
import { UserRole, UserSession } from "@/types/auth";

export async function requireAuth(): Promise<UserSession & { userId: string }> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED: Session expired or invalid.");
  }
  const userId = session.userId || session.id;
  return { ...session, userId };
}

export async function requireVerifiedEmail(): Promise<UserSession & { userId: string }> {
  const session = await requireAuth();
  if (!session.emailVerified) {
    throw new Error("UNVERIFIED: Email verification required to access this feature.");
  }
  return session;
}

export async function requireRole(allowedRoles: UserRole[]): Promise<UserSession & { userId: string }> {
  const session = await requireVerifiedEmail();
  if (!allowedRoles.includes(session.role)) {
    throw new Error(`FORBIDDEN: Access restricted to roles [${allowedRoles.join(", ")}].`);
  }
  return session;
}

