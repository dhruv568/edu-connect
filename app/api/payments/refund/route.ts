import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { PaymentService } from "@/services/payment-service";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();

    const { transactionId, reason } = body;

    const refund = await PaymentService.processRefund({
      transactionId,
      requestedBy: session.userId,
      reason,
      isAdmin: session.role === "ADMIN",
    });

    return apiSuccess({
      message: "Refund request processed successfully.",
      refund,
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
