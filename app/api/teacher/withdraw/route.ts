import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, apiBadRequest, handleApiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { WithdrawalService } from "@/services/withdrawal-service";

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(["TEACHER"]);
    const body = await request.json();

    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId: session.userId || session.id },
    });

    if (!teacher) {
      return apiBadRequest("Educator profile not found.");
    }

    const { amount, payoutMethod = "BANK_TRANSFER", upiId, idempotencyKey } = body;

    const amountRupees = Number(amount);
    if (isNaN(amountRupees) || amountRupees <= 0) {
      return apiBadRequest("Please provide a valid withdrawal amount.");
    }

    if (payoutMethod !== "BANK_TRANSFER" && payoutMethod !== "UPI") {
      return apiBadRequest("Invalid payout method. Supported options: BANK_TRANSFER, UPI.");
    }

    const result = await WithdrawalService.requestWithdrawal({
      teacherId: teacher.id,
      amountRupees,
      payoutMethod,
      upiId,
      idempotencyKey,
    });

    return apiSuccess({
      message: "Withdrawal request submitted successfully.",
      withdrawal: result.withdrawal,
      summary: result.summary,
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(["TEACHER"]);

    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId: session.userId || session.id },
    });

    if (!teacher) {
      return apiBadRequest("Educator profile not found.");
    }

    const withdrawals = await WithdrawalService.getTeacherWithdrawals(teacher.id);

    return apiSuccess({
      withdrawals,
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
