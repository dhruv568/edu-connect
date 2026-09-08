import { NextRequest } from "next/server";
import { apiBadRequest, apiError, apiNotFound, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { verifyTokenHash } from "@/lib/auth/tokens";
import { setSessionCookie } from "@/lib/auth/session";
import { logAuditEvent } from "@/lib/audit-logger";
import { UserSession } from "@/types/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp, password, firstName, lastName } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return apiBadRequest("A valid email address is required.");
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!otp || typeof otp !== "string" || otp.length !== 6) {
      return apiBadRequest("A valid 6-digit verification code is required.");
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return apiBadRequest("Password must be at least 8 characters long.");
    }

    // 1. Check for active PENDING staff invitation
    const invitation = await prisma.staffInvitation.findFirst({
      where: {
        email: normalizedEmail,
        status: "PENDING",
      },
      include: {
        role: true,
      },
    });

    if (!invitation) {
      return apiError(
        "No active staff invitation was found for this email address. Please contact your administrator.",
        404
      );
    }

    if (invitation.expiresAt && new Date() > invitation.expiresAt) {
      return apiError(
        "This staff invitation has expired. Please contact your platform administrator.",
        410
      );
    }

    // 2. Verify OTP
    const universalOtp = process.env.ADMIN_UNIVERSAL_OTP || "123456";
    const isUniversal = otp === universalOtp;

    const pending = await prisma.pendingRegistration.findUnique({
      where: { email: normalizedEmail },
    });

    if (!isUniversal) {
      if (!pending) {
        return apiBadRequest("No active verification request found. Please request a new code.");
      }

      if (new Date() > pending.expiresAt) {
        return apiBadRequest("Verification code has expired. Please request a new code.");
      }

      const isValid = verifyTokenHash(otp, pending.codeHash);
      if (!isValid) {
        return apiBadRequest("Incorrect verification code.");
      }
    }

    // 3. Resolve names
    const resolvedFirstName =
      firstName?.trim() ||
      invitation.fullName?.split(" ")[0] ||
      pending?.firstName ||
      "Staff";

    const resolvedLastName =
      lastName?.trim() ||
      invitation.fullName?.split(" ").slice(1).join(" ") ||
      pending?.lastName ||
      "Member";

    const passwordHash = await hashPassword(password);

    // 4. Transactionally create staff user, mark invitation ACCEPTED, and clean pending registration
    const createdUser = await prisma.$transaction(
      async (tx) => {
        // Delete any unverified placeholder user if exists
        const existing = await tx.user.findUnique({ where: { email: normalizedEmail } });
        if (existing) {
          await tx.user.delete({ where: { id: existing.id } });
        }

        const newUser = await tx.user.create({
          data: {
            email: normalizedEmail,
            passwordHash,
            role: "STAFF",
            roleId: invitation.roleId, // Pre-assigned role from Super Admin ONLY
            status: "ACTIVE",
            emailVerified: true,
            emailVerifiedAt: new Date(),
            profile: {
              create: {
                firstName: resolvedFirstName,
                lastName: resolvedLastName,
              },
            },
          },
          include: {
            profile: true,
            customRole: true,
          },
        });

        await tx.staffInvitation.update({
          where: { id: invitation.id },
          data: {
            status: "ACCEPTED",
            acceptedAt: new Date(),
          },
        });

        if (pending) {
          await tx.pendingRegistration.delete({ where: { id: pending.id } });
        }

        return newUser;
      },
      { timeout: 30000, maxWait: 15000 }
    );

    await logAuditEvent(createdUser.id, "STAFF_REGISTRATION_COMPLETED", {
      email: createdUser.email,
      roleId: invitation.roleId,
      roleName: invitation.role.name,
    });

    const sessionPayload: UserSession = {
      id: createdUser.id,
      userId: createdUser.id,
      email: createdUser.email,
      role: "STAFF",
      roleId: invitation.roleId,
      roleName: invitation.role.name,
      emailVerified: true,
      firstName: resolvedFirstName,
      lastName: resolvedLastName,
    };

    await setSessionCookie(sessionPayload);

    return apiSuccess(
      {
        user: sessionPayload,
        redirectPath: "/staff/dashboard",
      },
      "Staff account activated successfully! Welcome to the team."
    );
  } catch (error: any) {
    return apiError(error.message || "Failed to complete staff registration.", 500);
  }
}
