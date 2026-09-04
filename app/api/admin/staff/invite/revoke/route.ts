import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions/permission-engine";
import { apiBadRequest, apiError, apiNotFound, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit-logger";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requirePermission("staff.invite_revoke");

    const body = await req.json();
    const { invitationId } = body;

    if (!invitationId) {
      return apiBadRequest("Invitation ID is required.");
    }

    const invitation = await prisma.staffInvitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      return apiNotFound("Invitation not found.");
    }

    if (invitation.status === "ACCEPTED") {
      return apiBadRequest("Cannot revoke an already accepted invitation.");
    }

    const updated = await prisma.staffInvitation.update({
      where: { id: invitation.id },
      data: {
        status: "REVOKED",
      },
    });

    await logAuditEvent(userId, "STAFF_INVITE_REVOKED", {
      invitationId: updated.id,
      email: updated.email,
    });

    return apiSuccess({ revoked: true }, "Invitation revoked successfully.");
  } catch (error: any) {
    if (error.message?.startsWith("UNAUTHORIZED")) return apiError(error.message, 401);
    if (error.message?.startsWith("FORBIDDEN")) return apiError(error.message, 403);
    return apiError(error.message || "Failed to revoke invitation.", 500);
  }
}
