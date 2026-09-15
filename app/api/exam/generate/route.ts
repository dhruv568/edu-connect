import { NextRequest, NextResponse } from "next/server";
import { ExamService } from "@/services/exam-service";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subject, difficulty, count } = body;

    if (!subject || typeof subject !== "string" || !subject.trim()) {
      return NextResponse.json(
        { success: false, error: "Subject is required to generate exam." },
        { status: 400 }
      );
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const examData = await ExamService.generateExam({
      subject: subject.trim(),
      difficulty: difficulty || "Intermediate",
      count: count ? Number(count) : 5,
      userIp: ip,
    });

    return apiSuccess(examData);
  } catch (error: any) {
    return handleApiError(error);
  }
}
