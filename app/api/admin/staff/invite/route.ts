import { NextRequest } from "next/server";
import crypto from "crypto";
import { requirePermission } from "@/lib/permissions/permission-engine";
import { apiBadRequest, apiError, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit-logger";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requirePermission("staff.create");

    const body = await req.json();
    const { email, fullName, roleId, expiresInDays = 7 } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return apiBadRequest("A valid email address is required.");
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!roleId || typeof roleId !== "string") {
      return apiBadRequest("A valid custom role selection is required.");
    }

    // Verify role exists and is active
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      return apiBadRequest("Selected role does not exist.");
    }

    if (role.status !== "ACTIVE") {
      return apiBadRequest("Selected role is currently inactive. Please activate it first.");
    }

    // Check if user is already an active staff member
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser && (existingUser.role === "STAFF" || existingUser.role === "ADMIN")) {
      return apiBadRequest("A staff member or administrator with this email already exists.");
    }

    // Invalidate prior pending invitations for this email
    await prisma.staffInvitation.updateMany({
      where: {
        email: normalizedEmail,
        status: "PENDING",
      },
      data: {
        status: "REVOKED",
      },
    });

    // Generate cryptographically secure one-time invitation token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    const days = Math.max(1, Math.min(30, Number(expiresInDays) || 7));
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const invitation = await prisma.staffInvitation.create({
      data: {
        email: normalizedEmail,
        fullName: fullName?.trim() || null,
        roleId: role.id,
        invitedById: userId,
        tokenHash,
        status: "PENDING",
        expiresAt,
      },
      include: {
        role: true,
      },
    });

    const baseUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
    const inviteUrl = `${baseUrl}/staff/invite/${rawToken}`;

    await logAuditEvent(userId, "STAFF_INVITED", {
      invitationId: invitation.id,
      email: normalizedEmail,
      roleId: role.id,
      roleName: role.name,
      expiresAt,
    });

    return apiSuccess(
      {
        invitation: {
          id: invitation.id,
          email: invitation.email,
          fullName: invitation.fullName,
          roleName: role.name,
          expiresAt: invitation.expiresAt,
          inviteUrl,
        },
      },
      "Staff invitation generated successfully.",
      201
    );
  } catch (error: any) {
    if (error.message?.startsWith("UNAUTHORIZED")) return apiError(error.message, 401);
    if (error.message?.startsWith("FORBIDDEN")) return apiError(error.message, 403);
    return apiError(error.message || "Failed to create staff invitation.", 500);
  }
}
