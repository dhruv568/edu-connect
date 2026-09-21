import { NextRequest } from "next/server";
import { cashfreePayoutClient } from "@/lib/cashfree-payout";
import { WithdrawalService } from "@/services/withdrawal-service";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiBadRequest, handleApiError } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature =
      request.headers.get("x-webhook-signature") ||
      request.headers.get("x-cashfree-signature") ||
      "";
    const timestamp =
      request.headers.get("x-webhook-timestamp") ||
      request.headers.get("x-cashfree-timestamp") ||
      "";

    // Signature verification
    const isValid = cashfreePayoutClient.verifyWebhookSignature(
      rawBody,
      timestamp,
      signature
    );

    if (!isValid) {
      console.warn("⚠️ Invalid Cashfree Payout Webhook Signature.");
      return apiBadRequest("Invalid webhook signature.");
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return apiBadRequest("Invalid JSON payload.");
    }

    const eventType = payload.event_type || payload.type || "UNKNOWN";
    const transferId =
      payload.data?.transfer?.transfer_id ||
      payload.data?.transfer_id ||
      payload.transfer_id ||
      `evt_${Date.now()}`;

    const eventId = `payout_${eventType}_${transferId}`;

    // Webhook idempotency via PaymentWebhookEvent
    const existing = await prisma.paymentWebhookEvent.findFirst({
      where: {
        provider: "CASHFREE_PAYOUT",
        eventId,
      },
    });

    if (existing?.processed) {
      return apiSuccess({ received: true, idempotent: true });
    }

    const webhookRecord =
      existing ||
      (await prisma.paymentWebhookEvent.create({
        data: {
          provider: "CASHFREE_PAYOUT",
          eventId,
          eventType,
          payload: rawBody,
          processed: false,
        },
      }));

    // Process payout event
    const result = await WithdrawalService.processPayoutWebhook(payload);

    await prisma.paymentWebhookEvent.update({
      where: { id: webhookRecord.id },
      data: {
        processed: true,
        processedAt: new Date(),
      },
    });

    return apiSuccess({ received: true, result });
  } catch (error: any) {
    return handleApiError(error);
  }
}
