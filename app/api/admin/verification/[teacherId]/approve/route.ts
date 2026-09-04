import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions/permission-engine";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { logAuditEvent } from "@/lib/audit-logger";
import { getEmailProvider } from "@/lib/email/email-service";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { teacherId: string } }
) {
  try {
    const { userId } = await requirePermission("verification.approve");
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
        adminId: userId,
        previousStatus,
        newStatus: "VERIFIED",
        reason: note,
      },
    });

    await logAuditEvent(userId, "TEACHER_APPROVED", {
      teacherProfileId: tp.id,
      teacherUserId: tp.userId,
      previousStatus,
    });

    // Dispatch event for notifications, email, and activity logging
    try {
      const { EventService } = require("@/services/event-service");
      await EventService.emit("teacher.verified", {
        userId: tp.userId,
        actorId: userId,
        actorRole: "ADMIN",
        data: {
          teacherProfileId: tp.id,
          reason: note,
          entityType: "TeacherProfile",
          entityId: tp.id,
        },
        idempotencyKey: `verify-${tp.id}-approved`,
      });
    } catch (evtErr) {
      console.error("Failed to emit teacher.verified event:", evtErr);
    }

    return apiSuccess({
      message: "Teacher approved successfully",
      verificationStatus: updated.verificationStatus,
      verifiedAt: updated.verifiedAt,
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
