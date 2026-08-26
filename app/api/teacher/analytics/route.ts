import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { AnalyticsService } from "@/services/analytics-service";
import { apiError, apiSuccess } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(["TEACHER"]);
    const { searchParams } = new URL(req.url);

    const range = searchParams.get("range") || "30d";
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    const analytics = await AnalyticsService.getTeacherAnalyticsData(session.userId, {
      range,
      startDate,
      endDate,
    });

    return apiSuccess(analytics);
  } catch (error: any) {
    if (error.message?.startsWith("UNAUTHORIZED")) {
      return apiError(error.message, 401);
    }
    if (error.message?.startsWith("UNVERIFIED") || error.message?.startsWith("FORBIDDEN")) {
      return apiError(error.message, 403);
    }
    console.error("[GET /api/teacher/analytics error]:", error);
    return apiError(error.message || "Failed to fetch teacher analytics.", 500);
  }
}
