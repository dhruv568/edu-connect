import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { NotificationService } from "@/services/notification-service";
import { apiError, apiSuccess } from "@/lib/api-response";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) {
      return apiError("Authentication required.", 401);
    }

    const userId = session.userId || session.id;
    const notificationId = params.id;

    await NotificationService.delete(notificationId, userId);
    return apiSuccess({ message: "Notification deleted successfully." });
  } catch (error: any) {
    console.error("[DELETE /api/notifications/[id] error]:", error);
    return apiError(error.message || "Failed to delete notification.", 400);
  }
}
