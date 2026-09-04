export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions/permission-engine";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { logAuditEvent } from "@/lib/audit-logger";
import { getEmailProvider } from "@/lib/email/email-service";

export async function POST(
  request: NextRequest,
  { params }: { params: { teacherId: string } }
) {
  try {
    const { userId } = await requirePermission("verification.reject");
    const body = await request.json();
    const reason = body.reason;

    if (!reason || reason.trim().length === 0) {
      return apiError("A clear rejection reason must be provided by the administrator", 400);
    }

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
        verificationStatus: "REJECTED",
        rejectedAt: now,
        rejectionReason: reason.trim(),
      },
    });

    await prisma.teacherVerificationHistory.create({
      data: {
        teacherId: tp.id,
        adminId: userId,
        previousStatus,
        newStatus: "REJECTED",
        reason: reason.trim(),
      },
    });

    await logAuditEvent(userId, "TEACHER_REJECTED", {
      teacherProfileId: tp.id,
      teacherUserId: tp.userId,
      reason: reason.trim(),
    });

    // Send email notification
    try {
      const emailProvider = getEmailProvider();
      await emailProvider.sendNotificationEmail({
        email: tp.user.email,
        recipientName: tp.user.profile?.firstName || "Teacher",
        subject: "Verification Application Update - Action Required",
        headline: "Application Requires Revisions",
        statusBadgeText: "REJECTED / ACTION REQUIRED",
        statusBadgeVariant: "danger",
        bodyText: "Your teacher verification submission requires changes before it can be approved. Please review the feedback below and update your profile and documents accordingly.",
        reasonText: reason.trim(),
        actionUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/teacher/onboarding`,
        actionText: "Update Profile & Resubmit",
      });
    } catch (emailErr) {
      console.error("Failed to send rejection email notification:", emailErr);
    }

    return apiSuccess({
      message: "Teacher verification rejected",
      verificationStatus: updated.verificationStatus,
      rejectionReason: updated.rejectionReason,
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
