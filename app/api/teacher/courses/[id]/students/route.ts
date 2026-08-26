import { NextRequest } from "next/server";
import { LmsService } from "@/services/lms-service";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["TEACHER"]);
    const { id } = await params;

    const students = await LmsService.getCourseStudents(session.userId, id);
    return apiSuccess({ students });
  } catch (error: any) {
    return handleApiError(error);
  }
}
