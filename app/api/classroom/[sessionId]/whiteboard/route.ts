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
    if (!accessCheck.authorized || !accessCheck.liveSession) {
      return apiError("Unauthorized to view whiteboard.", 403);
    }

    const liveSession = accessCheck.liveSession;
    let whiteboardElements = [];
    if (liveSession.whiteboardState) {
      try {
        whiteboardElements = JSON.parse(liveSession.whiteboardState);
      } catch {
        whiteboardElements = [];
      }
    }

    return apiSuccess({
      elements: whiteboardElements,
      studentCanDraw: liveSession.studentCanDraw,
    });
  } catch (error: any) {
    console.error("[Get Whiteboard Error]:", error);
    return apiError("Failed to fetch whiteboard state.", 500);
  }
}

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
    const accessCheck = await verifyRoomAccess(sessionId, session);
    if (!accessCheck.authorized || !accessCheck.liveSession) {
      return apiError("Unauthorized to edit whiteboard.", 403);
    }

    const liveSession = accessCheck.liveSession;
    const isTeacher = accessCheck.isTeacher || false;

    if (!isTeacher && !liveSession.studentCanDraw) {
      return apiError("Student editing is currently disabled by the teacher.", 403);
    }

    const body = await req.json();
    const { elements } = body;

    const stateJson = JSON.stringify(elements || []);

    await prisma.liveClassSession.update({
      where: { id: sessionId },
      data: {
        whiteboardState: stateJson,
      },
    });

    return apiSuccess({ elements, studentCanDraw: liveSession.studentCanDraw }, "Whiteboard state saved.");
  } catch (error: any) {
    console.error("[Save Whiteboard Error]:", error);
    return apiError("Failed to update whiteboard state.", 500);
  }
}
