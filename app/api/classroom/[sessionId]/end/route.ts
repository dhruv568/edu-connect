import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/api-response";

export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return apiError("Authentication required.", 401);
    }

    const { sessionId } = params;

    const liveSession = await prisma.liveClassSession.findUnique({
      where: { id: sessionId },
      include: {
        teacher: true,
        liveClassSlot: {
          include: {
            bookings: true,
          },
        },
      },
    });

    if (!liveSession) {
      return apiError("Classroom session not found.", 404);
    }

    if (liveSession.teacher.userId !== session.id) {
      return apiError("Only the assigned teacher can end this live class.", 403);
    }

    const now = new Date();
    const startAt = liveSession.actualStartAt || liveSession.scheduledStartAt;
    const durationMs = Math.max(0, now.getTime() - startAt.getTime());
    const durationMinutes = Math.max(1, Math.round(durationMs / (1000 * 60)));

    // 1. Update session status
    const updatedSession = await prisma.liveClassSession.update({
      where: { id: sessionId },
      data: {
        status: "ENDED",
        actualEndAt: now,
        durationMinutes,
      },
    });

    // 2. Finalize attendance for booked students
    const bookings = liveSession.liveClassSlot.bookings;
    const requiredDurationSeconds = Math.max(60, (durationMinutes * 60) * 0.75); // 75% threshold for PRESENT

    for (const booking of bookings) {
      const attendance = await prisma.classAttendance.findFirst({
        where: {
          sessionId,
          studentId: booking.studentId,
        },
      });

      if (!attendance) {
        // Student never joined -> ABSENT
        await prisma.classAttendance.create({
          data: {
            sessionId,
            studentId: booking.studentId,
            status: "ABSENT",
            duration: 0,
          },
        });
      } else {
        const studentDuration = attendance.duration || 0;
        let finalStatus = "ABSENT";
        if (studentDuration >= requiredDurationSeconds) {
          finalStatus = "PRESENT";
        } else if (studentDuration > 0) {
          finalStatus = "PARTIAL";
        }

        await prisma.classAttendance.update({
          where: { id: attendance.id },
          data: {
            status: finalStatus,
            leftAt: attendance.leftAt || now,
          },
        });
      }
    }

    // 3. Fetch summary stats
    const allAttendances = await prisma.classAttendance.findMany({
      where: { sessionId },
      include: {
        student: {
          include: { profile: true },
        },
      },
    });

    const presentCount = allAttendances.filter((a) => a.status === "PRESENT").length;
    const partialCount = allAttendances.filter((a) => a.status === "PARTIAL").length;
    const absentCount = allAttendances.filter((a) => a.status === "ABSENT").length;

    return apiSuccess({
      status: updatedSession.status,
      actualStartAt: updatedSession.actualStartAt?.toISOString(),
      actualEndAt: updatedSession.actualEndAt?.toISOString(),
      durationMinutes,
      stats: {
        totalBooked: bookings.length,
        present: presentCount,
        partial: partialCount,
        absent: absentCount,
      },
      attendances: allAttendances.map((a) => ({
        id: a.id,
        studentId: a.studentId,
        studentName: `${a.student.profile?.firstName || ""} ${a.student.profile?.lastName || ""}`.trim() || a.student.email,
        durationMinutes: Math.round(a.duration / 60),
        status: a.status,
      })),
    }, "Class ended successfully.");
  } catch (error: any) {
    console.error("[End Class Error]:", error);
    return apiError("Failed to end class session.", 500);
  }
}
