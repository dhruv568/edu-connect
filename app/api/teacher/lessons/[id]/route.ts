import { NextRequest } from "next/server";
import { LmsService } from "@/services/lms-service";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(["TEACHER"]);
    const body = await request.json();

    const lesson = await LmsService.updateLesson(session.userId, params.id, body);
    return apiSuccess({ message: "Lesson updated successfully", lesson });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(["TEACHER"]);
    await LmsService.deleteLesson(session.userId, params.id);
    return apiSuccess({ message: "Lesson deleted successfully" });
  } catch (error: any) {
    return handleApiError(error);
  }
}
