import { NextRequest } from "next/server";
import { LiveClassService } from "@/services/live-class-service";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(["STUDENT"]);
    const data = await LiveClassService.getStudentLiveClasses(session.userId);
    return apiSuccess(data);
  } catch (error: any) {
    return handleApiError(error);
  }
}
