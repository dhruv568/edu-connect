import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions/permission-engine";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { AdminService } from "@/services/admin-service";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await requirePermission("refunds.approve");
    const refund = await AdminService.processRefund(userId, params.id, "APPROVE");
    return apiSuccess({ message: "Refund request approved successfully.", refund });
  } catch (error: any) {
    return handleApiError(error);
  }
}
