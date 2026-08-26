import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { LedgerService } from "@/services/ledger-service";
import { RouteService } from "@/services/route-service";

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(["TEACHER"]);

    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!teacherProfile) {
      throw new Error("NOT_FOUND: Teacher profile not found.");
    }

    const summary = await LedgerService.getTeacherEarningsSummary(teacherProfile.id);
    const payoutAccount = await RouteService.getOrCreatePayoutAccount(teacherProfile.id);

    return apiSuccess({
      summary,
      payoutAccount: {
        id: payoutAccount.id,
        providerAccountId: payoutAccount.providerAccountId,
        status: payoutAccount.status,
        kycStatus: payoutAccount.kycStatus,
        routeEnabled: RouteService.isRouteEnabled(),
      },
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
