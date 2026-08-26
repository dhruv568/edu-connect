import { NextRequest } from "next/server";
import { LiveClassService } from "@/services/live-class-service";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(["TEACHER"]);
    const data = await LiveClassService.getTeacherAvailability(session.userId);
    return apiSuccess(data);
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireRole(["TEACHER"]);
    const body = await request.json();

    const updated = await LiveClassService.updateTeacherAvailability(session.userId, body);
    return apiSuccess({
      message: "Availability updated successfully!",
      ...updated,
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
