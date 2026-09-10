import { NextRequest } from "next/server";
import { generateLiveKitRoomToken } from "@/lib/classroom/livekit-server";
import { apiSuccess, apiError } from "@/lib/api-response";
import { liveEventConfig, getEventStatus } from "@/lib/live-event-config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const userName = body.name || "Guest Learner";
    const userRole = "STUDENT";

    const status = getEventStatus();
    if (status !== "DURING_EVENT") {
      return apiSuccess(
        {
          live: false,
          status,
          message: "Live session is only accessible while the event is live.",
        },
        "Live event is currently not active."
      );
    }

    const livekitToken = await generateLiveKitRoomToken({
      sessionId: liveEventConfig.slug,
      roomId: `room-${liveEventConfig.slug}`,
      userId: `anon-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userName,
      userRole,
      isTeacher: false,
    });

    const serverUrl = process.env.LIVEKIT_URL || "wss://demo.livekit.cloud";

    return apiSuccess({
      live: true,
      token: livekitToken,
      serverUrl,
      roomName: `edu-session-${liveEventConfig.slug}`,
    });
  } catch (err: any) {
    console.error("❌ [Live Event Token Error]:", err);
    return apiError("Could not join live room.", 500);
  }
}
