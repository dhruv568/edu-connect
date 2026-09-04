import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions/permission-engine";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { AdminService } from "@/services/admin-service";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { action, status, reason } = body;

    const moderationAction = action || (status === "PUBLISHED" ? "APPROVE" : status === "UNPUBLISHED" ? "UNPUBLISH" : "ARCHIVE");
    const requiredPerm = moderationAction === "REJECT" ? "courses.reject" : "courses.approve";
    const { userId } = await requirePermission(requiredPerm);
    const course = await AdminService.moderateCourse(userId, params.id, moderationAction, reason);

    return apiSuccess({ message: `Course moderation action '${moderationAction}' executed successfully.`, course });
  } catch (error: any) {
    return handleApiError(error);
  }
}
