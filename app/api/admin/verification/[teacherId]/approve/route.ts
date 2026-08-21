import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, apiError } from "@/lib/api-response";
import { logAuditEvent } from "@/lib/audit-logger";
import { getEmailProvider } from "@/lib/email/email-service";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { teacherId: string } }
) {
  try {
    const adminSession = await requireRole(["ADMIN"]);
    const body = await request.json().catch(() => ({}));
    const note = body.note || "Application reviewed and approved by administrator";

    const tp = await prisma.teacherProfile.findFirst({
      where: {
        OR: [{ id: params.teacherId }, { userId: params.teacherId }],
      },
      include: { user: { include: { profile: true } } },
    });

    if (!tp) {
      return apiError("Teacher profile record not found", 404);
    }

    const previousStatus = tp.verificationStatus;
    const now = new Date();

    const updated = await prisma.teacherProfile.update({
      where: { id: tp.id },
      data: {
        verificationStatus: "VERIFIED",
        verifiedAt: now,
        rejectionReason: null,
        suspensionReason: null,
      },
    });

    await prisma.teacherVerificationHistory.create({
      data: {
        teacherId: tp.id,
        adminId: adminSession.id,
        previousStatus,
        newStatus: "VERIFIED",
        reason: note,
      },
    });

    await logAuditEvent(adminSession.id, "TEACHER_APPROVED", {
      teacherProfileId: tp.id,
      teacherUserId: tp.userId,
      previousStatus,
    });

    // Email notification
    try {
      const emailProvider = getEmailProvider();
      await emailProvider.sendNotificationEmail({
        email: tp.user.email,
        recipientName: tp.user.profile?.firstName || "Teacher",
        subject: "Congratulations! Your EduConnect Teacher Account is Verified 🎓",
        headline: "Teacher Profile Verified!",
        statusBadgeText: "VERIFIED EDUCATOR",
        statusBadgeVariant: "success",
        bodyText: "Great news! Your teacher credentials have been thoroughly reviewed and approved by EduConnect Administration. Your profile is now eligible for live marketplace listings, demo class bookings, and course creation.",
        actionUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/teacher`,
        actionText: "Go to Teacher Portal",
      });
    } catch (emailErr) {
      console.error("Failed to send approval email notification:", emailErr);
    }

    return apiSuccess({
      message: "Teacher approved successfully",
      verificationStatus: updated.verificationStatus,
      verifiedAt: updated.verifiedAt,
    });
  } catch (error: any) {
    return apiError(error.message || "Failed to approve teacher", 500);
  }
}
