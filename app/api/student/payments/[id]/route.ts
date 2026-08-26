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
      },
    });

    if (!transaction) {
      throw new Error("NOT_FOUND: Payment receipt not found.");
    }

    const teacherObj = transaction.course?.teacher || transaction.liveClassSlot?.teacher;
    const teacherName = teacherObj?.user?.profile
      ? `${teacherObj.user.profile.firstName} ${teacherObj.user.profile.lastName}`
      : "EduConnect Educator";

    const studentName = transaction.user.profile
      ? `${transaction.user.profile.firstName} ${transaction.user.profile.lastName}`
      : transaction.user.email;

    return apiSuccess({
      receipt: {
        id: transaction.id,
        internalReference: transaction.internalReference,
        providerOrderId: transaction.providerOrderId,
        providerPaymentId: transaction.providerPaymentId,
        productTitle: transaction.course?.title || transaction.liveClassSlot?.title || "EduConnect Product",
        productType: transaction.type,
        studentName,
        studentEmail: transaction.user.email,
        teacherName,
        amountPaise: transaction.amountPaise,
        amount: transaction.amountPaise / 100,
        currency: transaction.currency,
        status: transaction.status,
        capturedAt: transaction.capturedAt,
        createdAt: transaction.createdAt,
      },
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
