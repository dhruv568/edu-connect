import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { AdminService } from "@/services/admin-service";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireRole(["ADMIN"]);
    const body = await request.json();
    const { action, status, reason } = body;

    const moderationAction = action || (status === "PUBLISHED" ? "APPROVE" : status === "UNPUBLISHED" ? "UNPUBLISH" : "ARCHIVE");
    const course = await AdminService.moderateCourse(admin.userId, params.id, moderationAction, reason);

    return apiSuccess({ message: `Course moderation action '${moderationAction}' executed successfully.`, course });
  } catch (error: any) {
    return handleApiError(error);
  }
}
