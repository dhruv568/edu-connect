import { NextRequest, NextResponse } from "next/server";
import { ExamService } from "@/services/exam-service";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { examId, answers } = body;

    if (!examId) {
      return NextResponse.json(
        { success: false, error: "Exam ID is required for submission." },
        { status: 400 }
      );
    }

    const gradingResult = await ExamService.submitExam({
      examId,
      answers: answers || {},
    });

    return apiSuccess(gradingResult);
  } catch (error: any) {
    return handleApiError(error);
  }
}
