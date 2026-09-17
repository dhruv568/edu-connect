import { NextRequest } from "next/server";
import { requireStaffOrAdmin } from "@/lib/auth/guards";
import { TrainingService } from "@/services/training-service";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiNotFound, handleApiError } from "@/lib/api-response";

export async function GET(req: NextRequest, { params }: { params: { dayId: string } }) {
  try {
    await requireStaffOrAdmin();
    const quiz = await prisma.trainingQuiz.findUnique({
      where: { dayId: params.dayId },
    });

    if (!quiz) return apiNotFound("Quiz not found for this day");

    return apiSuccess({
      ...quiz,
      questions: quiz.questions ? JSON.parse(quiz.questions) : [],
    });
  } catch (err: any) {
    return handleApiError(err, "Failed to load quiz");
  }
}

export async function PUT(req: NextRequest, { params }: { params: { dayId: string } }) {
  try {
    await requireStaffOrAdmin();
    const body = await req.json().catch(() => ({}));

    const updated = await TrainingService.updateQuiz(params.dayId, body);
    return apiSuccess(
      {
        ...updated,
        questions: updated.questions ? JSON.parse(updated.questions) : [],
      },
      "Quiz updated successfully"
    );
  } catch (err: any) {
    return handleApiError(err, "Failed to update quiz");
  }
}

export async function POST(req: NextRequest, { params }: { params: { dayId: string } }) {
  try {
    await requireStaffOrAdmin();
    const body = await req.json().catch(() => ({}));
    const count = Number(body.count) || 5;

    // Generate questions using OpenAI / curated engine
    const questions = await TrainingService.generateAiQuizForDay(params.dayId, count);

    // If autoSave flag is set, persist immediately
    if (body.autoSave) {
      await TrainingService.updateQuiz(params.dayId, {
        questions,
        questionCount: questions.length,
      });
    }

    return apiSuccess({ questions }, "AI quiz questions generated successfully");
  } catch (err: any) {
    return handleApiError(err, "Failed to generate AI quiz questions");
  }
}
