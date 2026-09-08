import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions/permission-engine";
import { apiBadRequest, apiError, apiNotFound, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit-logger";
import { EmailService } from "@/lib/email/email-service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requirePermission("staff.invite_resend");

    const body = await req.json();
    const { invitationId } = body;

    if (!invitationId) {
      return apiBadRequest("Invitation ID is required.");
    }

    const invitation = await prisma.staffInvitation.findUnique({
      where: { id: invitationId },
      include: { role: true },
    });

    if (!invitation) {
      return apiNotFound("Invitation not found.");
    }

    if (invitation.status === "ACCEPTED") {
      return apiBadRequest("This invitation has already been accepted.");
    }

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const updated = await prisma.staffInvitation.update({
      where: { id: invitation.id },
      data: {
        status: "PENDING",
        expiresAt,
      },
    });

    // Resend invitation instructions email
    await EmailService.sendStaffInvitationEmail({
      email: updated.email,
      recipientName: updated.fullName || undefined,
      roleName: invitation.role.name,
    });

    await logAuditEvent(userId, "STAFF_INVITE_RESENT", {
      invitationId: updated.id,
      email: updated.email,
    });

    return apiSuccess(
      {
        invitation: {
          id: updated.id,
          email: updated.email,
          fullName: updated.fullName,
          roleName: invitation.role.name,
          status: updated.status,
          expiresAt: updated.expiresAt,
        },
      },
      `Invitation email resent successfully to ${updated.email}.`
    );
  } catch (error: any) {
    if (error.message?.startsWith("UNAUTHORIZED")) return apiError(error.message, 401);
    if (error.message?.startsWith("FORBIDDEN")) return apiError(error.message, 403);
    return apiError(error.message || "Failed to resend invitation.", 500);
  }
}
