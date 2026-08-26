import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { AdminService } from "@/services/admin-service";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireRole(["ADMIN"]);
    const body = await request.json();
    const { status, actionTaken } = body;

    const report = await AdminService.updateReportStatus(admin.userId, params.id, status, actionTaken);
    return apiSuccess({ message: `Report status updated to ${status}.`, report });
  } catch (error: any) {
    return handleApiError(error);
  }
}
