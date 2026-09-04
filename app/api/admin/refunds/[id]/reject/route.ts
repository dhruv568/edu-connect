import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions/permission-engine";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { AdminService } from "@/services/admin-service";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await requirePermission("refunds.reject");
    const body = await request.json();
    const { reason } = body;

    const refund = await AdminService.processRefund(userId, params.id, "REJECT", reason);
    return apiSuccess({ message: "Refund request rejected.", refund });
  } catch (error: any) {
    return handleApiError(error);
  }
}
