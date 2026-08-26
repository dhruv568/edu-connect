import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { NotificationService } from "@/services/notification-service";
import { apiError, apiSuccess } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return apiError("Authentication required.", 401);
    }

    const userId = session.userId || session.id;
    await NotificationService.markAllAsRead(userId);

    return apiSuccess({ message: "All notifications marked as read." });
  } catch (error: any) {
    console.error("[POST /api/notifications/read-all error]:", error);
    return apiError("Failed to mark all notifications as read.", 500);
  }
}
