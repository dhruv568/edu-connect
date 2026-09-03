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

    const firstName = user?.profile?.firstName || session.firstName || "";
    const lastName = user?.profile?.lastName || session.lastName || "";
    const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
    const resolvedName =
      fullName ||
      (session.email ? session.email.split("@")[0] : "") ||
      (session.role === "ADMIN" ? "System Administrator" : session.role === "TEACHER" ? "Educator" : "Student");

    return apiSuccess({
      user: {
        ...session,
        id: user?.id || session.id,
        userId: user?.id || session.userId || session.id,
        email: user?.email || session.email,
        role: user?.role || session.role,
        firstName,
        lastName,
        name: resolvedName,
        avatarUrl: user?.profile?.avatarUrl || null,
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
