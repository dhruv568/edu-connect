import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { AnalyticsService } from "@/services/analytics-service";
import { apiError, apiSuccess } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    await requireRole(["ADMIN"]);
    const dashboardData = await AnalyticsService.getAdminDashboardData();

    return apiSuccess(dashboardData);
  } catch (error: any) {
    if (error.message?.startsWith("UNAUTHORIZED")) {
      return apiError(error.message, 401);
    }
    if (error.message?.startsWith("UNVERIFIED") || error.message?.startsWith("FORBIDDEN")) {
      return apiError(error.message, 403);
    }
    console.error("[GET /api/admin/dashboard error]:", error);
    return apiError(error.message || "Failed to fetch admin dashboard.", 500);
  }
}
