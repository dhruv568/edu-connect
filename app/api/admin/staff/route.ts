import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions/permission-engine";
import { apiError, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requirePermission("staff.view");

    // Fetch all staff users
    const staffUsers = await prisma.user.findMany({
      where: {
        role: { in: ["STAFF", "ADMIN"] },
      },
      orderBy: { createdAt: "desc" },
      include: {
        profile: true,
        customRole: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    // Fetch all invitations
    const invitations = await prisma.staffInvitation.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        role: {
          select: { id: true, name: true },
        },
        invitedBy: {
          select: { id: true, email: true, profile: true },
        },
      },
    });

    const now = new Date();

    const formattedStaff = staffUsers.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      roleId: u.roleId,
      roleName: u.role === "ADMIN" ? "Super Administrator" : u.customRole?.name || "Unassigned Staff",
      status: u.status,
      firstName: u.profile?.firstName || "",
      lastName: u.profile?.lastName || "",
      name: `${u.profile?.firstName || ""} ${u.profile?.lastName || ""}`.trim() || u.email,
      avatarUrl: u.profile?.avatarUrl || null,
      phone: u.profile?.phone || null,
      emailVerified: u.emailVerified,
      createdAt: u.createdAt,
    }));

    const formattedInvitations = invitations.map((inv) => {
      let resolvedStatus = inv.status;
      if (inv.status === "PENDING" && now > inv.expiresAt) {
        resolvedStatus = "EXPIRED";
      }

      return {
        id: inv.id,
        email: inv.email,
        fullName: inv.fullName,
        roleId: inv.roleId,
        roleName: inv.role.name,
        status: resolvedStatus,
        expiresAt: inv.expiresAt,
        acceptedAt: inv.acceptedAt,
        createdAt: inv.createdAt,
        invitedBy: inv.invitedBy
          ? `${inv.invitedBy.profile?.firstName || ""} ${inv.invitedBy.profile?.lastName || ""}`.trim() || inv.invitedBy.email
          : "System",
      };
    });

    return apiSuccess({
      staff: formattedStaff,
      invitations: formattedInvitations,
    });
  } catch (error: any) {
    if (error.message?.startsWith("UNAUTHORIZED")) return apiError(error.message, 401);
    if (error.message?.startsWith("FORBIDDEN")) return apiError(error.message, 403);
    return apiError(error.message || "Failed to fetch staff directory.", 500);
  }
}
