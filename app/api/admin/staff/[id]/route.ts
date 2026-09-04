import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions/permission-engine";
import { apiBadRequest, apiError, apiNotFound, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit-logger";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId, auth } = await requirePermission("staff.update");

    const targetUser = await prisma.user.findUnique({
      where: { id: params.id },
      include: { customRole: true },
    });

    if (!targetUser) {
      return apiNotFound("Staff user not found.");
    }

    // Protection 1: Prevent self-modification of role or status
    if (targetUser.id === userId) {
      return apiBadRequest("Security violation: You cannot modify your own role or account status.");
    }

    // Protection 2: Prevent non-Super Admin from modifying a Super Admin
    if (targetUser.role === "ADMIN" && !auth.isSuperAdmin) {
      return apiBadRequest("Security violation: Only Super Admin can modify administrative accounts.");
    }

    const body = await req.json();
    const { roleId, status } = body;

    // Protection 3: Only allow valid status values
    if (status && !["ACTIVE", "SUSPENDED", "DEACTIVATED"].includes(status)) {
      return apiBadRequest("Invalid status. Allowed values: ACTIVE, SUSPENDED, DEACTIVATED.");
    }

    // If changing role
    let newRoleName = targetUser.customRole?.name;
    if (roleId !== undefined && roleId !== targetUser.roleId) {
      const newRole = await prisma.role.findUnique({
        where: { id: roleId },
      });

      if (!newRole) {
        return apiBadRequest("Selected role not found.");
      }

      if (newRole.status !== "ACTIVE") {
        return apiBadRequest("Cannot assign an inactive role.");
      }

      newRoleName = newRole.name;
    }

    const updated = await prisma.user.update({
      where: { id: targetUser.id },
      data: {
        ...(roleId !== undefined ? { roleId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        customRole: true,
        profile: true,
      },
    });

    await logAuditEvent(userId, "STAFF_UPDATED", {
      targetUserId: targetUser.id,
      targetEmail: targetUser.email,
      previousRole: targetUser.customRole?.name || targetUser.role,
      newRole: updated.customRole?.name || updated.role,
      previousStatus: targetUser.status,
      newStatus: updated.status,
    });

    return apiSuccess(
      {
        staff: {
          id: updated.id,
          email: updated.email,
          role: updated.role,
          roleId: updated.roleId,
          roleName: updated.customRole?.name || updated.role,
          status: updated.status,
          name: `${updated.profile?.firstName || ""} ${updated.profile?.lastName || ""}`.trim() || updated.email,
        },
      },
      "Staff account updated successfully."
    );
  } catch (error: any) {
    if (error.message?.startsWith("UNAUTHORIZED")) return apiError(error.message, 401);
    if (error.message?.startsWith("FORBIDDEN")) return apiError(error.message, 403);
    return apiError(error.message || "Failed to update staff account.", 500);
  }
}
