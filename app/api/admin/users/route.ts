import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions/permission-engine";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { AdminService } from "@/services/admin-service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requirePermission("users.view");

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const role = searchParams.get("role") || undefined;
    const status = searchParams.get("status") || undefined;
    const verificationStatus = searchParams.get("verificationStatus") || undefined;
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.max(1, Number(searchParams.get("limit") || 15));

    const data = await AdminService.getUsers({
      search,
      role: role !== "ALL" ? role : undefined,
      status: status !== "ALL" ? status : undefined,
      verificationStatus: verificationStatus !== "ALL" ? verificationStatus : undefined,
      page,
      limit,
    });

    return apiSuccess(data);
  } catch (error: any) {
    return handleApiError(error);
  }
}
