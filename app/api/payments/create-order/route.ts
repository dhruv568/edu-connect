import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { PaymentService } from "@/services/payment-service";

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(["STUDENT"]);
    const body = await request.json();

    const { type, courseId, liveClassSlotId } = body;

    const result = await PaymentService.createPaymentOrder({
      userId: session.userId,
      type,
      courseId,
      liveClassSlotId,
    });

    return apiSuccess(result);
  } catch (error: any) {
    return handleApiError(error);
  }
}
