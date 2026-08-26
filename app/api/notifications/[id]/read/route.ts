import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { NotificationService } from "@/services/notification-service";
import { apiError, apiSuccess } from "@/lib/api-response";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) {
      return apiError("Authentication required.", 401);
    }

    const userId = session.userId || session.id;
    const notificationId = params.id;

    const updated = await NotificationService.markAsRead(notificationId, userId);
    return apiSuccess({ notification: updated });
  } catch (error: any) {
    console.error("[PATCH /api/notifications/[id]/read error]:", error);
    return apiError(error.message || "Failed to mark notification as read.", 400);
  }
}
