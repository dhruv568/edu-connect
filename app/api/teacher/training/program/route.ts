import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { TrainingService } from "@/services/training-service";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const roadmap = await TrainingService.getEducatorRoadmap(session.userId);

    return apiSuccess(roadmap);
  } catch (err: any) {
    return handleApiError(err, "Failed to load training program roadmap");
  }
}
