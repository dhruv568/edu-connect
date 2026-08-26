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
    const preferences = await NotificationService.getPreferences(userId);

    return apiSuccess({ preferences });
  } catch (error: any) {
    console.error("[GET /api/settings/notifications error]:", error);
    return apiError("Failed to fetch notification preferences.", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return apiError("Authentication required.", 401);
    }

    const userId = session.userId || session.id;
    const body = await req.json();

    const updated = await NotificationService.updatePreferences(userId, body);
    return apiSuccess({ preferences: updated });
  } catch (error: any) {
    console.error("[PUT /api/settings/notifications error]:", error);
    return apiError("Failed to update notification preferences.", 400);
  }
}
