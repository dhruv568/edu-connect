import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: { transactionId: string } }) {
  try {
    const session = await requireAuth();

    const transaction = await prisma.paymentTransaction.findUnique({
      where: { id: params.transactionId },
      include: {
        course: { select: { id: true, title: true, slug: true, price: true, teacher: { include: { user: { include: { profile: true } } } } } },
        liveClassSlot: { select: { id: true, title: true, price: true, startTime: true, endTime: true, teacher: { include: { user: { include: { profile: true } } } } } },
      },
    });

    if (!transaction) {
      throw new Error("NOT_FOUND: Payment transaction not found.");
    }

    // Role ownership check
    if (session.role === "STUDENT" && transaction.userId !== session.userId) {
      throw new Error("FORBIDDEN: Access denied.");
    }

    const teacherObj = transaction.course?.teacher || transaction.liveClassSlot?.teacher;
    const teacherName = teacherObj?.user?.profile
      ? `${teacherObj.user.profile.firstName} ${teacherObj.user.profile.lastName}`
      : "EduConnect Educator";

    return apiSuccess({
      transaction: {
        id: transaction.id,
        type: transaction.type,
        status: transaction.status,
        amountPaise: transaction.amountPaise,
        amount: transaction.amountPaise / 100,
        currency: transaction.currency,
        provider: transaction.provider,
        providerOrderId: transaction.providerOrderId,
        providerPaymentId: transaction.providerPaymentId,
        internalReference: transaction.internalReference,
        productTitle: transaction.course?.title || transaction.liveClassSlot?.title || "Product",
        teacherName,
        capturedAt: transaction.capturedAt,
        createdAt: transaction.createdAt,
      },
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
