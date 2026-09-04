import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiUnauthorized } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return apiUnauthorized("No active session.");
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId || session.id },
      include: { profile: true },
    });

    if (!user || user.status !== "ACTIVE") {
      return apiUnauthorized("User account inactive or not found.");
    }

    const firstName = user?.profile?.firstName || session.firstName || "";
    const lastName = user?.profile?.lastName || session.lastName || "";
    const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
    let resolvedName = fullName || (user.email ? user.email.split("@")[0] : "");

    let roleName = user.role === "ADMIN" ? "System Administrator" : user.role === "TEACHER" ? "Educator" : "Student";
    let features: string[] = [];
    let permissions: string[] = [];
    let navigation: any[] = [];

    if (user.role === "ADMIN" || user.role === "STAFF") {
      const { getUserAuthorization, getDynamicNavigation } = await import("@/lib/permissions/permission-engine");
      const auth = await getUserAuthorization(user.id);
      roleName = auth.roleName;
      features = auth.features;
      permissions = auth.permissions;
      navigation = getDynamicNavigation(auth);
    }

    if (!resolvedName) {
      resolvedName = roleName;
    }

    return apiSuccess({
      user: {
        ...session,
        id: user.id,
        userId: user.id,
        email: user.email,
        role: user.role,
        roleId: user.roleId,
        roleName,
        status: user.status,
        firstName,
        lastName,
        name: resolvedName,
        avatarUrl: user?.profile?.avatarUrl || null,
        features,
        permissions,
        navigation,
      },
    });
  } catch {
    const fullName = [session.firstName, session.lastName].filter(Boolean).join(" ").trim();
    return apiSuccess({
      user: {
        ...session,
        name: fullName || session.email?.split("@")[0] || "User",
      },
    });
  }
}
