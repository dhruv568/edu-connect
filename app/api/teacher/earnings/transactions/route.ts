import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { LedgerService } from "@/services/ledger-service";

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(["TEACHER"]);

    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!teacherProfile) {
      throw new Error("NOT_FOUND: Teacher profile not found.");
    }

    const transactions = await LedgerService.getTeacherLedgerTransactions(teacherProfile.id);

    return apiSuccess({ transactions });
  } catch (error: any) {
    return handleApiError(error);
  }
}
