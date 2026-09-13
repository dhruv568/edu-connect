import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { processAiChat, streamAiChat, AssistantRole } from "@/services/ai-service";
import { checkRateLimit, validateAiMessage } from "@/lib/ai/rate-limiter";

/**
 * Resolve client IP for rate limiting
 */
function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}

/**
 * Map authenticated user session to AssistantRole
 */
function resolveAssistantRole(session: any): AssistantRole {
  if (!session || !session.role) {
    return "guest";
  }

  const role = String(session.role).toUpperCase();
  if (role === "ADMIN" || role === "STAFF") {
    return "ADMIN";
  }
  if (role === "TEACHER") {
    return "EDUCATOR";
  }
  if (role === "STUDENT") {
    return "LEARNER";
  }

  return "guest";
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user from session (NEVER trust client-provided role)
    const session = await getSession();
    const role = resolveAssistantRole(session);
    const userId = session?.userId || session?.id;
    const userName = session?.firstName
      ? `${session.firstName} ${session.lastName || ""}`.trim()
      : session?.name;

    // 2. Rate Limiting: Key on userId if authenticated, otherwise IP
    const clientIp = getClientIp(req);
    const rateLimitKey = userId ? `user:${userId}` : `ip:${clientIp}`;
    const rateLimitResult = checkRateLimit(rateLimitKey);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many requests. Please wait ${rateLimitResult.resetInSeconds} seconds before sending another message.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimitResult.resetInSeconds),
          },
        }
      );
    }

    // 3. Parse and validate request body
    const body = await req.json().catch(() => ({}));
    const { message, conversationId, stream } = body;

    const validation = validateAiMessage(message);
    if (!validation.valid || !validation.message) {
      return NextResponse.json(
        { success: false, error: validation.error || "Invalid message." },
        { status: 400 }
      );
    }

    const validatedMessage = validation.message;

    // 4. Handle Streaming Response if requested
    if (stream) {
      const encoder = new TextEncoder();
      const customReadable = new ReadableStream({
        async start(controller) {
          try {
            await streamAiChat(
              {
                message: validatedMessage,
                conversationId: typeof conversationId === "string" ? conversationId : undefined,
                userId,
                role,
                userName,
                userEmail: session?.email,
              },
              (chunk) => {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`)
                );
              }
            );
            controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
            controller.close();
          } catch (streamErr) {
            console.error("[AiChatApi] Stream error:", streamErr);
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  error:
                    "Sorry, the EduConnects Assistant is temporarily unavailable. Please try again in a moment.",
                })}\n\n`
              )
            );
            controller.close();
          }
        },
      });

      return new Response(customReadable, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    }

    // 5. Standard Non-Streaming JSON Response
    const result = await processAiChat({
      message: validatedMessage,
      conversationId: typeof conversationId === "string" ? conversationId : undefined,
      userId,
      role,
      userName,
      userEmail: session?.email,
    });

    return NextResponse.json({
      success: true,
      data: {
        response: result.response,
        conversationId: result.conversationId,
        role: result.role,
      },
    });
  } catch (error: any) {
    console.error("[AiChatApi] Unhandled error:", error?.message || error);
    return NextResponse.json(
      {
        success: false,
        error:
          "Sorry, the EduConnects Assistant is temporarily unavailable. Please try again in a moment.",
      },
      { status: 500 }
    );
  }
}
