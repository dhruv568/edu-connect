import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { AnalyticsService } from "@/services/analytics-service";
import { apiError, apiSuccess } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(["STUDENT"]);
    const dashboardData = await AnalyticsService.getStudentDashboardData(session.userId);

    return apiSuccess({
      learningTime: {
        courseHours: dashboardData.stats.courseHours,
        liveClassHours: dashboardData.stats.liveClassHours,
        totalHours: dashboardData.stats.totalHours,
      },
      stats: dashboardData.stats,
      continueLearning: dashboardData.continueLearning,
    });
  } catch (error: any) {
    if (error.message?.startsWith("UNAUTHORIZED")) {
      return apiError(error.message, 401);
    }
    if (error.message?.startsWith("UNVERIFIED") || error.message?.startsWith("FORBIDDEN")) {
      return apiError(error.message, 403);
    }
    console.error("[GET /api/student/analytics error]:", error);
    return apiError(error.message || "Failed to fetch student analytics.", 500);
  }
}
