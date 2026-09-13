import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { AssistantRole } from "@/services/ai-service";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    let role: AssistantRole = "guest";
    if (session?.role) {
      const r = String(session.role).toUpperCase();
      if (r === "ADMIN" || r === "STAFF") role = "ADMIN";
      else if (r === "TEACHER") role = "EDUCATOR";
      else if (r === "STUDENT") role = "LEARNER";
    }

    const conversationId = req.nextUrl.searchParams.get("conversationId");
    let messages: { id: string; role: string; content: string; createdAt: Date }[] = [];

    if (conversationId) {
      const conv = await prisma.aiConversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            take: 30,
          },
        },
      });

      if (conv) {
        messages = conv.messages;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        role,
        user: session
          ? {
              firstName: session.firstName,
              role: session.role,
            }
          : null,
        messages,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to retrieve assistant state." },
      { status: 500 }
    );
  }
}
