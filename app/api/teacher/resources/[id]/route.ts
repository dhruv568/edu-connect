import { NextRequest } from "next/server";
import { LmsService } from "@/services/lms-service";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(["TEACHER"]);
    await LmsService.deleteResource(session.userId, params.id);
    return apiSuccess({ message: "Resource deleted successfully" });
  } catch (error: any) {
    return handleApiError(error);
  }
}
