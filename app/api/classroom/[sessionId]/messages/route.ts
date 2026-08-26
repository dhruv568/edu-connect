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
      return apiError("Unauthorized to view classroom messages.", 403);
    }

    const messages = await prisma.classroomMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
      take: 100,
    });

    return apiSuccess({
      messages: messages.map((m) => ({
        id: m.id,
        sessionId: m.sessionId,
        senderId: m.senderId,
        senderName: m.senderName,
        senderRole: m.senderRole,
        message: m.message,
        createdAt: m.createdAt.toISOString(),
      })),
    });
  } catch (error: any) {
    console.error("[Get Chat Messages Error]:", error);
    return apiError("Failed to fetch classroom messages.", 500);
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
    if (!accessCheck.authorized) {
      return apiError("Unauthorized to send classroom messages.", 403);
    }

    const body = await req.json();
    const rawMessage = (body.message || "").trim();

    if (!rawMessage) {
      return apiError("Message content cannot be empty.", 400);
    }

    if (rawMessage.length > 1000) {
      return apiError("Message exceeds maximum length of 1000 characters.", 400);
    }

    // Basic sanitization
    const sanitized = rawMessage.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const senderName = `${session.firstName} ${session.lastName}`.trim() || session.email;

    const newMessage = await prisma.classroomMessage.create({
      data: {
        sessionId,
        senderId: session.id,
        senderName,
        senderRole: session.role,
        message: sanitized,
      },
    });

    return apiSuccess({
      id: newMessage.id,
      sessionId: newMessage.sessionId,
      senderId: newMessage.senderId,
      senderName: newMessage.senderName,
      senderRole: newMessage.senderRole,
      message: newMessage.message,
      createdAt: newMessage.createdAt.toISOString(),
    }, "Message sent successfully.");
  } catch (error: any) {
    console.error("[Send Chat Message Error]:", error);
    return apiError("Failed to send classroom message.", 500);
  }
}
