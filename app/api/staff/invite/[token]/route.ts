import { NextRequest } from "next/server";
import crypto from "crypto";
import { apiBadRequest, apiError, apiNotFound, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  try {
    const rawToken = params.token;
    if (!rawToken || rawToken.length < 16) {
      return apiBadRequest("Invalid invitation link format.");
    }

    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    const invitation = await prisma.staffInvitation.findUnique({
      where: { tokenHash },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
          },
        },
      },
    });

    if (!invitation) {
      return apiNotFound("Invitation not found. Please check your invitation link.");
    }

    if (invitation.status === "REVOKED") {
      return apiError("This invitation has been revoked. Please contact your platform administrator.", 410);
    }

    if (invitation.status === "ACCEPTED") {
      return apiError("This invitation has already been used. Please log in with your credentials.", 400);
    }

    if (invitation.status === "EXPIRED" || new Date() > invitation.expiresAt) {
      return apiError("This invitation has expired. Please contact the administrator for a new invite.", 410);
    }

    return apiSuccess({
      invitation: {
        email: invitation.email,
        fullName: invitation.fullName,
        roleName: invitation.role.name,
        roleDescription: invitation.role.description,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error: any) {
    return apiError(error.message || "Failed to validate invitation.", 500);
  }
}
