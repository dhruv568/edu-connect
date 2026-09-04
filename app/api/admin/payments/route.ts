import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions/permission-engine";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { LedgerService } from "@/services/ledger-service";

export async function GET(request: NextRequest) {
  try {
    await requirePermission("payments.view");

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "ALL";
    const type = searchParams.get("type") || "ALL";

    const where: any = {};

    if (status !== "ALL") {
      where.status = status;
    }

    if (type !== "ALL") {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { internalReference: { contains: search, mode: "insensitive" } },
        { providerOrderId: { contains: search, mode: "insensitive" } },
        { providerPaymentId: { contains: search, mode: "insensitive" } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { course: { title: { contains: search, mode: "insensitive" } } },
        { liveClassSlot: { title: { contains: search, mode: "insensitive" } } },
      ];
    }

    const transactions = await prisma.paymentTransaction.findMany({
      where,
      include: {
        user: { include: { profile: true } },
        course: { select: { title: true, teacher: { include: { user: { include: { profile: true } } } } } },
        liveClassSlot: { select: { title: true, teacher: { include: { user: { include: { profile: true } } } } } },
        ledgerEntries: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = transactions.map((t) => {
      const teacherObj = t.course?.teacher || t.liveClassSlot?.teacher;
      const teacherName = teacherObj?.user?.profile
        ? `${teacherObj.user.profile.firstName} ${teacherObj.user.profile.lastName}`
        : "N/A";

      const studentName = t.user.profile
        ? `${t.user.profile.firstName} ${t.user.profile.lastName}`
        : t.user.email;

      return {
        id: t.id,
        internalReference: t.internalReference,
        providerOrderId: t.providerOrderId,
        providerPaymentId: t.providerPaymentId,
        type: t.type,
        status: t.status,
        amountPaise: t.amountPaise,
        amount: t.amountPaise / 100,
        currency: t.currency,
        studentName,
        studentEmail: t.user.email,
        teacherName,
        productTitle: t.course?.title || t.liveClassSlot?.title || "EduConnect Product",
        createdAt: t.createdAt,
      };
    });

    const summary = await LedgerService.getAdminFinancialSummary();

    return apiSuccess({
      summary,
      transactions: formatted,
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
