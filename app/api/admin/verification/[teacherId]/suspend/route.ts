import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, apiError } from "@/lib/api-response";
import { logAuditEvent } from "@/lib/audit-logger";
import { getEmailProvider } from "@/lib/email/email-service";

export async function POST(
  request: NextRequest,
  { params }: { params: { teacherId: string } }
) {
  try {
    const adminSession = await requireRole(["ADMIN"]);
    const body = await request.json();
    const reason = body.reason;

    if (!reason || reason.trim().length === 0) {
      return apiError("A clear suspension reason must be provided by the administrator", 400);
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
        verificationStatus: "SUSPENDED",
        suspendedAt: now,
        suspensionReason: reason.trim(),
      },
    });

    await prisma.teacherVerificationHistory.create({
      data: {
        teacherId: tp.id,
        adminId: adminSession.id,
        previousStatus,
        newStatus: "SUSPENDED",
        reason: reason.trim(),
      },
    });

    await logAuditEvent(adminSession.id, "TEACHER_SUSPENDED", {
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
        subject: "Important Notice: EduConnect Teacher Account Suspended",
        headline: "Teacher Account Temporarily Suspended",
        statusBadgeText: "SUSPENDED",
        statusBadgeVariant: "warning",
        bodyText: "Your teacher account on EduConnect has been temporarily suspended by system governance. While suspended, public marketplace listings and live class hosting are disabled. Your profile data and course records remain safely preserved.",
        reasonText: reason.trim(),
        actionUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/contact`,
        actionText: "Contact Admin Support",
      });
    } catch (emailErr) {
      console.error("Failed to send suspension email notification:", emailErr);
    }

    return apiSuccess({
      message: "Teacher account suspended successfully",
      verificationStatus: updated.verificationStatus,
      suspensionReason: updated.suspensionReason,
    });
  } catch (error: any) {
    return apiError(error.message || "Failed to suspend teacher", 500);
  }
}
