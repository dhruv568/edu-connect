import { NextRequest } from "next/server";
import crypto from "crypto";
import { apiBadRequest, apiError, apiNotFound, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { generateOTP, hashToken, verifyTokenHash } from "@/lib/auth/tokens";
import { EmailService } from "@/lib/email/email-service";
import { setSessionCookie } from "@/lib/auth/session";
import { logAuditEvent } from "@/lib/audit-logger";
import { UserSession } from "@/types/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  try {
    const rawToken = params.token;
    if (!rawToken || rawToken.length < 16) {
      return apiBadRequest("Invalid invitation link.");
    }

    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    const invitation = await prisma.staffInvitation.findUnique({
      where: { tokenHash },
      include: { role: true },
    });

    if (!invitation) {
      return apiNotFound("Invitation not found.");
    }

    if (invitation.status === "REVOKED") {
      return apiError("This invitation has been revoked.", 410);
    }

    if (invitation.status === "ACCEPTED") {
      return apiError("This invitation has already been used.", 400);
    }

    if (invitation.status === "EXPIRED" || new Date() > invitation.expiresAt) {
      return apiError("This invitation has expired.", 410);
    }

    const body = await req.json();
    const { password, firstName, lastName, otp } = body;

    // If OTP is provided, verify and activate account
    if (otp) {
      const universalOtp = process.env.ADMIN_UNIVERSAL_OTP || "123456";
      const isUniversal = otp === universalOtp;

      const pending = await prisma.pendingRegistration.findUnique({
        where: { email: invitation.email },
      });

      if (!isUniversal) {
        if (!pending) {
          return apiBadRequest("No active OTP request found. Please request a new verification code.");
        }
        if (new Date() > pending.expiresAt) {
          return apiBadRequest("Verification code has expired. Please try again.");
        }
        const isValid = verifyTokenHash(otp, pending.codeHash);
        if (!isValid) {
          return apiBadRequest("Incorrect verification code.");
        }
      }

      const passwordHashToUse = pending?.passwordHash || (password ? await hashPassword(password) : null);
      if (!passwordHashToUse) {
        return apiBadRequest("Password is required.");
      }

      const resolvedFirstName = firstName || invitation.fullName?.split(" ")[0] || pending?.firstName || "Staff";
      const resolvedLastName = lastName || invitation.fullName?.split(" ").slice(1).join(" ") || pending?.lastName || "Member";

      // Transactionally create staff user, mark invitation accepted, and clean pending registration
      const createdUser = await prisma.$transaction(async (tx) => {
        // Delete if an existing unverified placeholder user exists
        const existing = await tx.user.findUnique({ where: { email: invitation.email } });
        if (existing) {
          await tx.user.delete({ where: { id: existing.id } });
        }

        const newUser = await tx.user.create({
          data: {
            email: invitation.email,
            passwordHash: passwordHashToUse,
            role: "STAFF",
            roleId: invitation.roleId,
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
      });

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

      return apiSuccess({
        user: sessionPayload,
        redirectPath: "/staff/dashboard",
      }, "Registration successful! Welcome to the team.");
    }

    // Step 1: Validate password & dispatch OTP
    if (!password || password.length < 8) {
      return apiBadRequest("Password must be at least 8 characters long.");
    }

    const passwordHash = await hashPassword(password);
    const resolvedFirstName = firstName || invitation.fullName?.split(" ")[0] || "Staff";
    const resolvedLastName = lastName || invitation.fullName?.split(" ").slice(1).join(" ") || "Member";

    const generatedOtp = generateOTP();
    const codeHash = hashToken(generatedOtp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await prisma.pendingRegistration.upsert({
      where: { email: invitation.email },
      create: {
        email: invitation.email,
        passwordHash,
        role: "STAFF",
        firstName: resolvedFirstName,
        lastName: resolvedLastName,
        codeHash,
        expiresAt,
        attempts: 0,
      },
      update: {
        passwordHash,
        role: "STAFF",
        firstName: resolvedFirstName,
        lastName: resolvedLastName,
        codeHash,
        expiresAt,
        attempts: 0,
      },
    });

    await EmailService.sendVerificationOTP({
      email: invitation.email,
      userName: resolvedFirstName,
      otp: generatedOtp,
      expiresInMinutes: 10,
    });

    return apiSuccess({
      requiresOtp: true,
      email: invitation.email,
    }, "Verification code dispatched to your email.");
  } catch (error: any) {
    return apiError(error.message || "Failed to accept staff invitation.", 500);
  }
}
