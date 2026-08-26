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
    const { searchParams } = new URL(req.url);

    const filter = (searchParams.get("filter") || "ALL") as any;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const result = await NotificationService.getUserNotifications(userId, {
      filter,
      page,
      limit,
    });

    return apiSuccess(result);
  } catch (error: any) {
    console.error("[GET /api/notifications error]:", error);
    return apiError("Failed to fetch notifications.", 500);
  }
}
