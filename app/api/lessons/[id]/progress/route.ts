import { NextRequest } from "next/server";
import { LmsService } from "@/services/lms-service";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(["STUDENT"]);
    const body = await request.json();

    const progressSeconds = Number(body.progressSeconds) || 0;
    const forceComplete = Boolean(body.forceComplete);

    const result = await LmsService.updateLessonProgress(
      session.userId,
      params.id,
      progressSeconds,
      forceComplete
    );

    return apiSuccess({
      message: result.lessonCompleted ? "Lesson marked complete!" : "Progress saved",
      ...result,
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
