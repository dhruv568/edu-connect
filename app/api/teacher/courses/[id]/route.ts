import { NextRequest } from "next/server";
import { LmsService } from "@/services/lms-service";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(["TEACHER"]);
    const course = await LmsService.getTeacherCourseEditorDetails(session.userId, params.id);
    return apiSuccess({ course });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(["TEACHER"]);
    const body = await request.json();

    const course = await LmsService.updateCourse(session.userId, params.id, body);
    return apiSuccess({ message: "Course updated successfully", course });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(["TEACHER"]);

    // Verify ownership
    await LmsService.getTeacherCourseEditorDetails(session.userId, params.id);

    await prisma.course.delete({ where: { id: params.id } });
    return apiSuccess({ message: "Course deleted successfully" });
  } catch (error: any) {
    return handleApiError(error);
  }
}
