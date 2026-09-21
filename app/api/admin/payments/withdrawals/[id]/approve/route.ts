import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions/permission-engine";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { WithdrawalService } from "@/services/withdrawal-service";
import { logAuditEvent } from "@/lib/audit-logger";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requirePermission("payouts.manage");
    const body = await request.json().catch(() => ({}));
    const { adminNotes, autoDisburse = true } = body;

    const result = await WithdrawalService.approveWithdrawal({
      withdrawalId: params.id,
      adminUserId: auth.userId,
      adminNotes,
      autoDisburse,
    });

    await logAuditEvent(auth.userId, "WITHDRAWAL_APPROVED", {
      withdrawalId: params.id,
      autoDisburse,
      status: "status" in result ? result.status : undefined,
    }).catch(() => {});

    return apiSuccess({
      message: "Withdrawal approved successfully.",
      ...result,
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
