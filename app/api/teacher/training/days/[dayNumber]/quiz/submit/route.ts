import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { TrainingService } from "@/services/training-service";
import { apiSuccess, apiBadRequest, handleApiError } from "@/lib/api-response";

export async function POST(req: NextRequest, { params }: { params: { dayNumber: string } }) {
  try {
    const session = await requireAuth();
    const dayNumber = parseInt(params.dayNumber, 10);

    if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 15) {
      throw new Error("Invalid training day number.");
    }

    const body = await req.json().catch(() => ({}));
    const answers = body.answers;

    if (!answers || typeof answers !== "object") {
      return apiBadRequest("Answers object mapping questionId to option key (A/B/C/D) is required.");
    }

    const result = await TrainingService.submitQuizAttempt(session.userId, dayNumber, answers);

    return apiSuccess(result, result.passed ? "Congratulations! You passed the quiz." : "Quiz submitted. Review your answers and try again.");
  } catch (err: any) {
    return handleApiError(err, "Failed to submit quiz attempt");
  }
}
