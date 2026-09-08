import { NextRequest } from "next/server";
import { LmsService } from "@/services/lms-service";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    const courseIdOrSlug = params.id;

    if (!courseIdOrSlug) {
      return apiError("Course ID or slug is required.", 400);
    }

    const course = await LmsService.getCoursePreview(courseIdOrSlug, session);

    return apiSuccess({ course });
  } catch (error: any) {
    if (error?.message?.startsWith("UNAUTHORIZED")) {
      return apiError(error.message.replace("UNAUTHORIZED: ", ""), 403);
    }
    if (error?.message?.startsWith("NOT_FOUND")) {
      return apiError(error.message.replace("NOT_FOUND: ", ""), 404);
    }
    return handleApiError(error);
  }
}
