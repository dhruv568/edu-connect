import { NextRequest } from "next/server";
import { LmsService } from "@/services/lms-service";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(["TEACHER"]);
    const body = await request.json();

    const section = await LmsService.updateSection(session.userId, params.id, body.title, body.description);
    return apiSuccess({ message: "Section updated", section });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(["TEACHER"]);
    await LmsService.deleteSection(session.userId, params.id);
    return apiSuccess({ message: "Section deleted successfully" });
  } catch (error: any) {
    return handleApiError(error);
  }
}
