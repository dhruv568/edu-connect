import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions/permission-engine";
import { AnalyticsService } from "@/services/analytics-service";
import { apiError, apiSuccess } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    await requirePermission("analytics.view");
    const { searchParams } = new URL(req.url);

    const range = searchParams.get("range") || "30d";
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    const analytics = await AnalyticsService.getAdminAnalyticsData({
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
    console.error("[GET /api/admin/analytics error]:", error);
    return apiError(error.message || "Failed to fetch admin analytics.", 500);
  }
}
