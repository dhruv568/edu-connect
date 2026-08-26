import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { AdminService } from "@/services/admin-service";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireRole(["ADMIN"]);
    const body = await request.json();
    const { reason } = body;

    const refund = await AdminService.processRefund(admin.userId, params.id, "REJECT", reason);
    return apiSuccess({ message: "Refund request rejected.", refund });
  } catch (error: any) {
    return handleApiError(error);
  }
}
