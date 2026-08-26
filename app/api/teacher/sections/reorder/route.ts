import { NextRequest } from "next/server";
import { LmsService } from "@/services/lms-service";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(["TEACHER"]);
    const body = await request.json();

    await LmsService.reorderSections(session.userId, body.courseId, body.sectionIdsInOrder);
    return apiSuccess({ message: "Sections reordered successfully" });
  } catch (error: any) {
    return handleApiError(error);
  }
}
