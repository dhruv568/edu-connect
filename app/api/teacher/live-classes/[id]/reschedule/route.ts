import { NextRequest } from "next/server";
import { LiveClassService } from "@/services/live-class-service";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["TEACHER"]);
    const { id } = await params;
    const body = await request.json();

    if (!body.startTime || !body.endTime) {
      throw new Error("New startTime and endTime are required to reschedule.");
    }

    const slot = await LiveClassService.updateLiveClass(session.userId, id, {
      startTime: body.startTime,
      endTime: body.endTime,
    });

    return apiSuccess({ message: "Live class rescheduled successfully!", slot });
  } catch (error: any) {
    return handleApiError(error);
  }
}
