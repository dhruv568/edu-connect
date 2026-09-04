import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions/permission-engine";
import { AnalyticsService } from "@/services/analytics-service";
import { apiError, apiSuccess } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const { auth } = await requirePermission("dashboard.view");
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
