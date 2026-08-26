import { NextRequest } from "next/server";
import { LmsService } from "@/services/lms-service";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(["TEACHER"]);
    const body = await request.json();

    const section = await LmsService.createSection(
      session.userId,
      params.id,
      body.title,
      body.description
    );

    return apiSuccess({ message: "Section created successfully", section }, 201);
  } catch (error: any) {
    return handleApiError(error);
  }
}
