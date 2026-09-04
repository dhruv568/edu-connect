import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions/permission-engine";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { AdminService } from "@/services/admin-service";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await requirePermission("reports.resolve");
    const body = await request.json();
    const { status, actionTaken } = body;

    const report = await AdminService.updateReportStatus(userId, params.id, status, actionTaken);
    return apiSuccess({ message: `Report status updated to ${status}.`, report });
  } catch (error: any) {
    return handleApiError(error);
  }
}
