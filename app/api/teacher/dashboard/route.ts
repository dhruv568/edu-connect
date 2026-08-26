import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { AnalyticsService } from "@/services/analytics-service";
import { apiError, apiSuccess } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(["TEACHER"]);
    const dashboardData = await AnalyticsService.getTeacherDashboardData(session.userId);

    return apiSuccess(dashboardData);
  } catch (error: any) {
    if (error.message?.startsWith("UNAUTHORIZED")) {
      return apiError(error.message, 401);
    }
    if (error.message?.startsWith("UNVERIFIED") || error.message?.startsWith("FORBIDDEN")) {
      return apiError(error.message, 403);
    }
    console.error("[GET /api/teacher/dashboard error]:", error);
    return apiError(error.message || "Failed to fetch teacher dashboard.", 500);
  }
}
