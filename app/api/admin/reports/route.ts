import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { AdminService } from "@/services/admin-service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireRole(["ADMIN"]);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const targetType = searchParams.get("targetType") || undefined;
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.max(1, Number(searchParams.get("limit") || 15));

    const result = await AdminService.getReports({
      status: status !== "ALL" ? status : undefined,
      targetType: targetType !== "ALL" ? targetType : undefined,
      page,
      limit,
    });

    return apiSuccess(result);
  } catch (error: any) {
    return handleApiError(error);
  }
}
