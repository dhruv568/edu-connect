import { NextRequest } from "next/server";
import crypto from "crypto";
import { requirePermission } from "@/lib/permissions/permission-engine";
import { apiBadRequest, apiError, apiNotFound, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit-logger";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requirePermission("staff.invite_resend");

    const body = await req.json();
    const { invitationId, expiresInDays = 7 } = body;

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

    // Generate fresh secure token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    const days = Math.max(1, Math.min(30, Number(expiresInDays) || 7));
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const updated = await prisma.staffInvitation.update({
      where: { id: invitation.id },
      data: {
        tokenHash,
        status: "PENDING",
        expiresAt,
      },
    });

    const baseUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
    const inviteUrl = `${baseUrl}/staff/invite/${rawToken}`;

    await logAuditEvent(userId, "STAFF_INVITE_RESENT", {
      invitationId: updated.id,
      email: updated.email,
      expiresAt,
    });

    return apiSuccess({
      invitation: {
        id: updated.id,
        email: updated.email,
        expiresAt: updated.expiresAt,
        inviteUrl,
      },
    }, "Invitation regenerated successfully.");
  } catch (error: any) {
    if (error.message?.startsWith("UNAUTHORIZED")) return apiError(error.message, 401);
    if (error.message?.startsWith("FORBIDDEN")) return apiError(error.message, 403);
    return apiError(error.message || "Failed to resend invitation.", 500);
  }
}
