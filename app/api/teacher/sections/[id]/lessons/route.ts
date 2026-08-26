import { NextRequest } from "next/server";
import { LmsService } from "@/services/lms-service";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(["TEACHER"]);
    const body = await request.json();

    const lesson = await LmsService.createLesson(session.userId, params.id, {
      title: body.title,
      description: body.description,
      type: body.type,
      videoProvider: body.videoProvider,
      videoAssetId: body.videoAssetId,
      videoUrl: body.videoUrl,
      durationSeconds: body.durationSeconds,
      isPreview: body.isPreview,
      content: body.content,
    });

    return apiSuccess({ message: "Lesson created successfully", lesson }, 201);
  } catch (error: any) {
    return handleApiError(error);
  }
}
