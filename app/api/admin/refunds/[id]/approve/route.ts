import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { AdminService } from "@/services/admin-service";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireRole(["ADMIN"]);
    const refund = await AdminService.processRefund(admin.userId, params.id, "APPROVE");
    return apiSuccess({ message: "Refund request approved successfully.", refund });
  } catch (error: any) {
    return handleApiError(error);
  }
}
