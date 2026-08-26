import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return apiError("Authentication required.", 401);
    }

    const userId = session.userId || session.id;
    const body = await req.json().catch(() => ({}));
    const { notificationId, markAll } = body;

    if (markAll) {
      await (prisma as any).notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
    } else if (notificationId) {
      await (prisma as any).notification.updateMany({
        where: { id: notificationId, userId },
        data: { isRead: true },
      });
    }

    return apiSuccess({ success: true, message: "Notifications updated." });
  } catch (error: any) {
    console.error("[POST /api/notifications/mark-read error]:", error);
    return apiError("Failed to update notifications.", 500);
  }
}
