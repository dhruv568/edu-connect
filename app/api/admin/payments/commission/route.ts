import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { AdminService } from "@/services/admin-service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireRole(["ADMIN"]);
    const commission = await AdminService.getCommissionSettings();
    return apiSuccess(commission);
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await requireRole(["ADMIN"]);
    const body = await request.json();

    const percent = parseFloat(body.percentage ?? body.percent);
    const result = await AdminService.updateCommissionSettings(admin.userId, percent);

    return apiSuccess({
      message: `Default platform commission updated to ${result.percentage}%.`,
      ...result,
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
