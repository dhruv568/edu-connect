import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions/permission-engine";
import { apiError, apiNotFound, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit-logger";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requirePermission("courses.view");

    const course = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        teacher: { include: { user: { include: { profile: true } } } },
        sections: { include: { lessons: true } },
      },
    });

    if (!course) {
      return apiNotFound("Course not found.");
    }

    return apiSuccess({ course });
  } catch (error: any) {
    if (error.message?.startsWith("UNAUTHORIZED")) return apiError(error.message, 401);
    if (error.message?.startsWith("FORBIDDEN")) return apiError(error.message, 403);
    return apiError(error.message || "Failed to fetch course.", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await requirePermission("courses.delete");

    const course = await prisma.course.findUnique({
      where: { id: params.id },
    });

    if (!course) {
      return apiNotFound("Course not found.");
    }

    await prisma.course.delete({
      where: { id: params.id },
    });

    await logAuditEvent(userId, "COURSE_DELETED", {
      courseId: params.id,
      title: course.title,
    });

    return apiSuccess({ deleted: true }, "Course deleted successfully.");
  } catch (error: any) {
    if (error.message?.startsWith("UNAUTHORIZED")) return apiError(error.message, 401);
    if (error.message?.startsWith("FORBIDDEN")) return apiError(error.message, 403);
    return apiError(error.message || "Failed to delete course.", 500);
  }
}
