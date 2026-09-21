import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions/permission-engine";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { WithdrawalService } from "@/services/withdrawal-service";

export async function GET(request: NextRequest) {
  try {
    await requirePermission("payouts.view");

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "ALL";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const result = await WithdrawalService.getAdminWithdrawals({
      search,
      status,
      page,
      limit,
    });

    return apiSuccess(result);
  } catch (error: any) {
    return handleApiError(error);
  }
}
