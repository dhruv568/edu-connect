import { NextRequest } from "next/server";
import { getSession, setSessionCookie } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiUnauthorized, apiError } from "@/lib/api-response";
import { logAuditEvent } from "@/lib/audit-logger";

/**
 * GET /api/profile
 * Returns authenticated user's profile and role details.
 */
export async function GET() {
  const session = await getSession();
  if (!session) return apiUnauthorized();

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      profile: true,
      teacherProfile: true,
      studentProfile: true,
    },
  });

  if (!user) return apiError("User profile not found", 404);

  // Calculate profile completion percentage based on filled fields
  let totalFields = 4;
  let filledFields = 2; // email & role

  if (user.profile?.firstName) filledFields++;
  if (user.profile?.bio) filledFields++;
  if (user.profile?.avatarUrl) filledFields++;

  if (user.role === "TEACHER" && user.teacherProfile) {
    totalFields += 3;
    if (user.teacherProfile.headline) filledFields++;
    if (user.teacherProfile.subjects) filledFields++;
    if (user.teacherProfile.qualifications) filledFields++;
  } else if (user.role === "STUDENT" && user.studentProfile) {
    totalFields += 2;
    if (user.studentProfile.gradeLevel) filledFields++;
    if (user.studentProfile.interests) filledFields++;
  }

  const completionPercentage = Math.min(100, Math.round((filledFields / totalFields) * 100));

  return apiSuccess({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      firstName: user.profile?.firstName || "",
      lastName: user.profile?.lastName || "",
      avatarUrl: user.profile?.avatarUrl || null,
      phone: user.profile?.phone || "",
      bio: user.profile?.bio || "",
      teacherProfile: user.teacherProfile || null,
      studentProfile: user.studentProfile || null,
      completionPercentage,
    },
  });
}

/**
 * PATCH /api/profile
 * Updates permitted user profile information.
 */
export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) return apiUnauthorized();

  try {
    const body = await request.json();
    const { firstName, lastName, bio, phone, avatarUrl, headline, subjects, qualifications, gradeLevel, interests } = body;

    const updatedUser = await prisma.$transaction(async (tx) => {
      // Update basic profile
      await tx.profile.update({
        where: { userId: session.id },
        data: {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(bio !== undefined && { bio }),
          ...(phone !== undefined && { phone }),
          ...(avatarUrl !== undefined && { avatarUrl }),
        },
      });

      // Update role-specific profile
      if (session.role === "TEACHER") {
        await tx.teacherProfile.update({
          where: { userId: session.id },
          data: {
            ...(headline !== undefined && { headline }),
            ...(subjects !== undefined && { subjects }),
            ...(qualifications !== undefined && { qualifications }),
          },
        });
      } else if (session.role === "STUDENT") {
        await tx.studentProfile.update({
          where: { userId: session.id },
          data: {
            ...(gradeLevel !== undefined && { gradeLevel }),
            ...(interests !== undefined && { interests }),
          },
        });
      }

      return tx.user.findUnique({
        where: { id: session.id },
        include: { profile: true },
      });
    });

    // Update active cookie session
    if (updatedUser?.profile) {
      await setSessionCookie({
        ...session,
        firstName: updatedUser.profile.firstName,
        lastName: updatedUser.profile.lastName,
      });
    }

    await logAuditEvent(session.id, "PROFILE_UPDATED");

    return apiSuccess({ success: true }, "Profile updated successfully!");
  } catch (error: any) {
    return apiError(error.message || "Failed to update profile.", 400);
  }
}
