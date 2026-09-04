import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions/permission-engine";
import { AnalyticsService } from "@/services/analytics-service";
import { apiError, apiSuccess } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    await requirePermission("system_health.view");
    const healthData = await AnalyticsService.getAdminSystemHealth();
    return apiSuccess(healthData);
  } catch (error: any) {
    if (error.message?.startsWith("UNAUTHORIZED")) {
      return apiError(error.message, 401);
    }
    if (error.message?.startsWith("UNVERIFIED") || error.message?.startsWith("FORBIDDEN")) {
      return apiError(error.message, 403);
    }
    console.error("[GET /api/admin/system-health error]:", error);
    return apiError("Failed to fetch system health status.", 500);
  }
}
