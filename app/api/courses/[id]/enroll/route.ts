import { NextRequest } from "next/server";
import { LmsService } from "@/services/lms-service";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(["STUDENT"]);
    const result = await LmsService.enrollStudent(session.userId, params.id);

    return apiSuccess({
      message: result.alreadyEnrolled
        ? "You are already enrolled in this course."
        : result.enrollment.status === "ACTIVE"
        ? "Successfully enrolled in course!"
        : "Enrollment initialized. Payment required.",
      enrollment: result.enrollment,
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
