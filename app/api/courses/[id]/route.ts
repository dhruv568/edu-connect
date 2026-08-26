import { NextRequest } from "next/server";
import { LmsService } from "@/services/lms-service";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    const course = await LmsService.getCourseBySlug(params.id, session?.userId);

    if (!course) {
      return apiError("Course not found", 404);
    }

    return apiSuccess({ course });
  } catch (error: any) {
    return handleApiError(error);
  }
}
