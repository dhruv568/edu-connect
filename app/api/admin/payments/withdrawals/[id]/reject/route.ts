import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions/permission-engine";
import { apiSuccess, apiBadRequest, handleApiError } from "@/lib/api-response";
import { WithdrawalService } from "@/services/withdrawal-service";
import { logAuditEvent } from "@/lib/audit-logger";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requirePermission("payouts.manage");
    const body = await request.json().catch(() => ({}));
    const { rejectionReason } = body;

    if (!rejectionReason || !rejectionReason.trim()) {
      return apiBadRequest("Please provide a reason for rejecting the withdrawal request.");
    }

    const updated = await WithdrawalService.rejectWithdrawal({
      withdrawalId: params.id,
      adminUserId: auth.userId,
      rejectionReason: rejectionReason.trim(),
    });

    await logAuditEvent(auth.userId, "WITHDRAWAL_REJECTED", {
      withdrawalId: params.id,
      rejectionReason: rejectionReason.trim(),
    }).catch(() => {});

    return apiSuccess({
      message: "Withdrawal rejected. The held funds have been released back to the educator.",
      withdrawal: updated,
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
