import { NextRequest } from "next/server";
import { LmsService } from "@/services/lms-service";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const session = await requireRole(["STUDENT", "TEACHER", "ADMIN"]);
    const data = await LmsService.getStudentCourseLearning(session.userId, params.slug);
    return apiSuccess(data);
  } catch (error: any) {
    return handleApiError(error);
  }
}
