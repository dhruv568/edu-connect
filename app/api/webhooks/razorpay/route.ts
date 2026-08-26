import { NextRequest, NextResponse } from "next/server";
import { razorpayClient } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";
import { LedgerService } from "@/services/ledger-service";
import { RouteService } from "@/services/route-service";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature") || "";

    // 1. Verify Webhook Signature
    const isValid = razorpayClient.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const eventId = payload.event_id || payload.id || `evt_${Date.now()}`;
    const eventType = payload.event;

    // 2. Webhook Idempotency check
    const existingEvent = await prisma.paymentWebhookEvent.findUnique({
      where: { provider_eventId: { provider: "RAZORPAY", eventId } },
    });

    if (existingEvent && existingEvent.processed) {
      return NextResponse.json({ message: "Event already processed", eventId }, { status: 200 });
    }

    // Save event
    const webhookEvent = await prisma.paymentWebhookEvent.upsert({
      where: { provider_eventId: { provider: "RAZORPAY", eventId } },
      update: { payload: rawBody },
      create: {
        provider: "RAZORPAY",
        eventId,
        eventType,
        payload: rawBody,
      },
    });

    // 3. Process Events
    if (eventType === "payment.captured" || eventType === "order.paid") {
      const paymentEntity = payload.payload?.payment?.entity;
      if (paymentEntity) {
        const orderId = paymentEntity.order_id;
        const paymentId = paymentEntity.id;

        const transaction = await prisma.paymentTransaction.findFirst({
          where: { providerOrderId: orderId },
          include: { course: true, liveClassSlot: true },
        });

        if (transaction && transaction.status !== "CAPTURED") {
          await prisma.paymentTransaction.update({
            where: { id: transaction.id },
            data: {
              status: "CAPTURED",
              providerPaymentId: paymentId,
              capturedAt: new Date(),
            },
          });

          // Activate enrollment or booking
          if (transaction.type === "COURSE_ENROLLMENT" && transaction.courseId) {
            await prisma.enrollment.upsert({
              where: { studentId_courseId: { studentId: transaction.userId, courseId: transaction.courseId } },
              update: { status: "ACTIVE", enrolledAt: new Date() },
              create: { studentId: transaction.userId, courseId: transaction.courseId, status: "ACTIVE" },
            });
          } else if (transaction.type === "LIVE_CLASS_BOOKING" && transaction.liveClassSlotId) {
            const existingBooking = await prisma.booking.findFirst({
              where: { liveClassSlotId: transaction.liveClassSlotId, studentId: transaction.userId },
            });
            if (!existingBooking) {
              await prisma.booking.create({
                data: {
                  liveClassSlotId: transaction.liveClassSlotId,
                  studentId: transaction.userId,
                  status: "CONFIRMED",
                },
              });
            }
          }

          // Ledger & Route
          const teacherId = transaction.course?.teacherId || transaction.liveClassSlot?.teacherId;
          if (teacherId) {
            const ledgerResult = await LedgerService.recordCapturedPaymentLedger({
              transactionId: transaction.id,
              teacherId,
              grossAmountPaise: transaction.amountPaise,
            });

            await RouteService.executeTransferIfEligible({
              transactionId: transaction.id,
              teacherId,
              providerPaymentId: paymentId,
              teacherSharePaise: ledgerResult.teacherSharePaise,
              ledgerEntryId: ledgerResult.teacherEntry.id,
            });
          }
        }
      }
    } else if (eventType === "payment.failed") {
      const paymentEntity = payload.payload?.payment?.entity;
      if (paymentEntity?.order_id) {
        await prisma.paymentTransaction.updateMany({
          where: { providerOrderId: paymentEntity.order_id },
          data: { status: "FAILED", failedAt: new Date() },
        });
      }
    }

    // 4. Mark event processed
    await prisma.paymentWebhookEvent.update({
      where: { id: webhookEvent.id },
      data: { processed: true, processedAt: new Date() },
    });

    return NextResponse.json({ success: true, eventId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Webhook processing error" }, { status: 500 });
  }
}
