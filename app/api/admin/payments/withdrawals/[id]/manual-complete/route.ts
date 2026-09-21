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
    const { referenceId, adminNotes } = body;

    if (!referenceId || !referenceId.trim()) {
      return apiBadRequest("Please provide the payment reference number (UTR / IMPS transaction ID).");
    }

    const updated = await WithdrawalService.manualCompleteWithdrawal({
      withdrawalId: params.id,
      adminUserId: auth.userId,
      referenceId: referenceId.trim(),
      adminNotes,
    });

    await logAuditEvent(auth.userId, "WITHDRAWAL_MANUAL_COMPLETED", {
      withdrawalId: params.id,
      referenceId: referenceId.trim(),
    }).catch(() => {});

    return apiSuccess({
      message: "Withdrawal marked as completed and ledger debit recorded successfully.",
      withdrawal: updated,
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
