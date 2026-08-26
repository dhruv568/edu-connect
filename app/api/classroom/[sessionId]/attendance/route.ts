import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { verifyRoomAccess } from "@/lib/classroom/classroom-token";
import { apiError, apiSuccess } from "@/lib/api-response";

export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return apiError("Authentication required.", 401);
    }

    const { sessionId } = params;
    const accessCheck = await verifyRoomAccess(sessionId, session);
    if (!accessCheck.authorized) {
      return apiError("Unauthorized to view attendance.", 403);
    }

    const attendances = await prisma.classAttendance.findMany({
      where: { sessionId },
      include: {
        student: {
          include: { profile: true },
        },
      },
      orderBy: { joinedAt: "asc" },
    });

    return apiSuccess({
      attendances: attendances.map((a) => ({
        id: a.id,
        sessionId: a.sessionId,
        studentId: a.studentId,
        studentName: `${a.student.profile?.firstName || ""} ${a.student.profile?.lastName || ""}`.trim() || a.student.email,
        studentAvatarUrl: a.student.profile?.avatarUrl || null,
        joinedAt: a.joinedAt.toISOString(),
        leftAt: a.leftAt?.toISOString() || null,
        durationMinutes: Math.round(a.duration / 60),
        status: a.status,
      })),
    });
  } catch (error: any) {
    console.error("[Get Attendance Error]:", error);
    return apiError("Failed to fetch attendance records.", 500);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT") {
      return apiSuccess({ ignored: true }, "Only student participation is logged in attendance.");
    }

    const { sessionId } = params;
    const accessCheck = await verifyRoomAccess(sessionId, session);
    if (!accessCheck.authorized) {
      return apiError("Unauthorized attendance heartbeat.", 403);
    }

    const body = await req.json().catch(() => ({}));
    const secondsElapsed = Math.min(120, Math.max(1, body.secondsElapsed || 30)); // 30 sec heartbeat default

    const existing = await prisma.classAttendance.findFirst({
      where: { sessionId, studentId: session.id },
    });

    const now = new Date();
    if (!existing) {
      const created = await prisma.classAttendance.create({
        data: {
          sessionId,
          studentId: session.id,
          joinedAt: now,
          duration: secondsElapsed,
          status: "PARTIAL",
        },
      });
      return apiSuccess({ attendanceId: created.id, durationSeconds: created.duration }, "Attendance logged.");
    } else {
      const newDuration = existing.duration + secondsElapsed;
      const updated = await prisma.classAttendance.update({
        where: { id: existing.id },
        data: {
          duration: newDuration,
          leftAt: now,
        },
      });
      return apiSuccess({ attendanceId: updated.id, durationSeconds: updated.duration }, "Heartbeat updated.");
    }
  } catch (error: any) {
    console.error("[Attendance Heartbeat Error]:", error);
    return apiError("Failed to update attendance heartbeat.", 500);
  }
}
