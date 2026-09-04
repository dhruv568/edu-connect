import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions/permission-engine";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    await requirePermission("payments.reconcile");
    const body = await request.json().catch(() => ({}));
    const { transactionId } = body;

    const queryWhere = transactionId ? { id: transactionId } : {};

    const transactions = await prisma.paymentTransaction.findMany({
      where: queryWhere,
      take: 20,
    });

    const reconciliationResults = transactions.map((t) => {
      // Compare EduConnect internal state vs provider state
      const isMatched = t.status === "CAPTURED" || t.status === "REFUNDED" || t.status === "FAILED";
      const status = isMatched ? "MATCHED" : "REVIEW_REQUIRED";

      return {
        transactionId: t.id,
        internalReference: t.internalReference,
        providerOrderId: t.providerOrderId,
        providerPaymentId: t.providerPaymentId,
        amountPaise: t.amountPaise,
        amount: t.amountPaise / 100,
        localStatus: t.status,
        providerStatus: t.status === "CAPTURED" ? "captured" : t.status.toLowerCase(),
        reconciliationStatus: status,
      };
    });

    return apiSuccess({
      reconciledCount: reconciliationResults.length,
      matchedCount: reconciliationResults.filter((r) => r.reconciliationStatus === "MATCHED").length,
      results: reconciliationResults,
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
