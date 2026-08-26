import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(["STUDENT"]);

    const transactions = await prisma.paymentTransaction.findMany({
      where: { userId: session.userId },
      include: {
        course: { select: { id: true, title: true, slug: true, price: true, teacher: { include: { user: { include: { profile: true } } } } } },
        liveClassSlot: { select: { id: true, title: true, price: true, startTime: true, teacher: { include: { user: { include: { profile: true } } } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = transactions.map((t) => {
      const teacherObj = t.course?.teacher || t.liveClassSlot?.teacher;
      const teacherName = teacherObj?.user?.profile
        ? `${teacherObj.user.profile.firstName} ${teacherObj.user.profile.lastName}`
        : "EduConnect Educator";

      return {
        id: t.id,
        type: t.type,
        status: t.status,
        amountPaise: t.amountPaise,
        amount: t.amountPaise / 100,
        currency: t.currency,
        provider: t.provider,
        providerOrderId: t.providerOrderId,
        providerPaymentId: t.providerPaymentId,
        internalReference: t.internalReference,
        productTitle: t.course?.title || t.liveClassSlot?.title || "EduConnect Purchase",
        courseSlug: t.course?.slug,
        teacherName,
        createdAt: t.createdAt,
      };
    });

    return apiSuccess({ payments: formatted });
  } catch (error: any) {
    return handleApiError(error);
  }
}
