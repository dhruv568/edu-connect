import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { PaymentService } from "@/services/payment-service";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();

    const { transactionId, reason, notes } = body;

    if (!transactionId) {
      throw new Error("VALIDATION_ERROR: Transaction ID is required.");
    }
    if (!reason || !reason.trim()) {
      throw new Error("VALIDATION_ERROR: Refund reason is required.");
    }

    // For non-admin (students), create a moderated refund request with status PENDING
    if (session.role !== "ADMIN") {
      const refund = await PaymentService.requestRefund({
        transactionId,
        requestedBy: session.userId,
        reason,
        notes,
        isAdmin: false,
      });

      return apiSuccess({
        message:
          "Your refund request has been submitted successfully. Our team will review your request and update the refund status.",
        refund,
      });
    }

    // Admin direct processing
    const refund = await PaymentService.processRefund({
      transactionId,
      requestedBy: session.userId,
      reason,
      isAdmin: true,
    });

    return apiSuccess({
      message: "Refund processed successfully.",
      refund,
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
