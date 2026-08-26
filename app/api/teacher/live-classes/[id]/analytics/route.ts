import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/api-response";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "TEACHER") {
      return apiError("Unauthorized: Teacher access required.", 403);
    }

    const userId = session.userId || session.id;
    const slotId = params.id;

    const teacher = await prisma.teacherProfile.findUnique({ where: { userId } });
    if (!teacher) return apiError("Teacher profile not found.", 404);

    const slot = await prisma.liveClassSlot.findFirst({
      where: { id: slotId, teacherId: teacher.id },
      include: {
        bookings: { include: { student: { include: { profile: true } } } },
        session: { include: { attendances: { include: { student: { include: { profile: true } } } } } },
      },
    });

    if (!slot) {
      return apiError("Live class slot not found or access denied.", 404);
    }

    const activeBookings = slot.bookings.filter((b) => b.status !== "CANCELLED");
    const attendances = slot.session?.attendances || [];

    const presentCount = attendances.filter((a) => a.status === "PRESENT" || a.status === "PARTIAL").length;
    const expectedCount = activeBookings.length;
    const noShowCount = Math.max(0, expectedCount - presentCount);
    const attendanceRatePercent = expectedCount > 0 ? Math.round((presentCount / expectedCount) * 100) : 0;

    const totalDurationMinutes = attendances.reduce((sum, a) => sum + a.duration, 0);
    const avgDurationMinutes = attendances.length > 0 ? Math.round(totalDurationMinutes / attendances.length) : 0;

    return apiSuccess({
      slot: {
        id: slot.id,
        title: slot.title,
        subject: slot.subject,
        startTime: slot.startTime,
        endTime: slot.endTime,
        maxCapacity: slot.maxCapacity,
        price: slot.price,
        status: slot.status,
      },
      analytics: {
        bookedStudents: expectedCount,
        attendedStudents: presentCount,
        noShowStudents: noShowCount,
        attendanceRatePercent,
        avgDurationMinutes,
      },
      attendees: attendances.map((a) => ({
        studentId: a.studentId,
        studentName: a.student.profile ? `${a.student.profile.firstName} ${a.student.profile.lastName}` : a.student.email,
        joinedAt: a.joinedAt,
        leftAt: a.leftAt,
        durationMinutes: a.duration,
        status: a.status,
      })),
    });
  } catch (error: any) {
    console.error("[GET /api/teacher/live-classes/[id]/analytics error]:", error);
    return apiError("Failed to fetch live class analytics.", 500);
  }
}
