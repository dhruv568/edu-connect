import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { NotificationService } from "@/services/notification-service";
import { apiError, apiSuccess } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return apiError("Authentication required.", 401);
    }

    const userId = session.userId || session.id;
    const unreadCount = await NotificationService.getUnreadCount(userId);

    return apiSuccess({ unreadCount });
  } catch (error: any) {
    console.error("[GET /api/notifications/unread-count error]:", error);
    return apiError("Failed to fetch unread count.", 500);
  }
}
