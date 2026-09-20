import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(["STUDENT"]);

    const transaction = await prisma.paymentTransaction.findFirst({
      where: { id: params.id, userId: session.userId },
      include: {
        course: { select: { id: true, title: true, slug: true, price: true, teacher: { include: { user: { include: { profile: true } } } } } },
        liveClassSlot: { select: { id: true, title: true, price: true, startTime: true, endTime: true, teacher: { include: { user: { include: { profile: true } } } } } },
        user: { include: { profile: true } },
        order: true,
        refunds: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!transaction) {
      throw new Error("NOT_FOUND: Payment receipt not found.");
    }

    const teacherObj = transaction.course?.teacher || transaction.liveClassSlot?.teacher;
    const teacherName = teacherObj?.user?.profile
      ? `${teacherObj.user.profile.firstName} ${teacherObj.user.profile.lastName}`
      : "EduConnects Educator";

    const studentName = transaction.user.profile
      ? `${transaction.user.profile.firstName} ${transaction.user.profile.lastName}`
      : transaction.user.email;

    const latestRefund = transaction.refunds && transaction.refunds[0] ? {
      id: transaction.refunds[0].id,
      status: transaction.refunds[0].status,
      reason: transaction.refunds[0].reason,
      providerRefundId: transaction.refunds[0].providerRefundId,
      createdAt: transaction.refunds[0].createdAt,
    } : null;

    let orderNotes: any = null;
    if (transaction.order?.notes) {
      try {
        orderNotes = JSON.parse(transaction.order.notes);
      } catch {
        // Not JSON
      }
    }

    const originalPrice = transaction.course?.price || transaction.liveClassSlot?.price || (transaction.amountPaise / 100);
    const paidAmount = transaction.amountPaise / 100;
    const discountAmount = orderNotes?.discountAmount || (originalPrice > paidAmount ? originalPrice - paidAmount : 0);

    return apiSuccess({
      receipt: {
        id: transaction.id,
        internalReference: transaction.internalReference,
        providerOrderId: transaction.providerOrderId,
        providerPaymentId: transaction.providerPaymentId,
        paymentMethod: transaction.paymentMethod || "Online Payment",
        productTitle: transaction.course?.title || transaction.liveClassSlot?.title || "EduConnects Learning Program",
        productType: transaction.type,
        studentName,
        studentEmail: transaction.user.email,
        teacherName,
        amountPaise: transaction.amountPaise,
        amount: paidAmount,
        originalPrice,
        discountAmount,
        offerCode: orderNotes?.offerCode || null,
        currency: transaction.currency,
        status: transaction.status,
        capturedAt: transaction.capturedAt,
        createdAt: transaction.createdAt,
        refund: latestRefund,
      },
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
