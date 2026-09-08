import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { PaymentService } from "@/services/payment-service";

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(["STUDENT"]);
    const body = await request.json();

    const {
      order_id,
      orderId,
      cf_payment_id,
      cfPaymentId,
      payment_status,
      paymentStatus,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    const targetOrderId = order_id || orderId || razorpay_order_id;
    const targetPaymentId = cf_payment_id || cfPaymentId || razorpay_payment_id;
    const targetStatus = payment_status || paymentStatus;

    const result = await PaymentService.verifyAndCompletePayment({
      userId: session.userId,
      orderId: targetOrderId,
      cfPaymentId: targetPaymentId,
      paymentStatus: targetStatus,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

    return apiSuccess(result);
  } catch (error: any) {
    return handleApiError(error);
  }
}
