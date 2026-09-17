import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { TrainingService } from "@/services/training-service";
import { generateMuxSignedPlaybackToken } from "@/lib/mux/mux-client";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET(req: NextRequest, { params }: { params: { dayNumber: string } }) {
  try {
    const session = await requireAuth();
    const dayNumber = parseInt(params.dayNumber, 10);

    if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 15) {
      throw new Error("Invalid training day number (must be 1 to 15).");
    }

    const data = await TrainingService.getEducatorDay(session.userId, dayNumber);

    let signedPlaybackToken: string | null = null;
    if (data.day.videoPlaybackId && !data.day.videoPlaybackId.startsWith("demo_")) {
      try {
        signedPlaybackToken = await generateMuxSignedPlaybackToken(data.day.videoPlaybackId);
      } catch {}
    }

    return apiSuccess({
      ...data,
      signedPlaybackToken,
    });
  } catch (err: any) {
    return handleApiError(err, "Failed to load training day");
  }
}
