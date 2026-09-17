import { NextRequest } from "next/server";
import { requireStaffOrAdmin } from "@/lib/auth/guards";
import { TrainingService } from "@/services/training-service";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    await requireStaffOrAdmin();
    const data = await TrainingService.getAdminProgramOverview();
    return apiSuccess(data);
  } catch (err: any) {
    return handleApiError(err, "Failed to load training program overview");
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireStaffOrAdmin();
    const program = await TrainingService.ensureDefaultProgram();
    return apiSuccess({ program }, "Training program synchronized successfully");
  } catch (err: any) {
    return handleApiError(err, "Failed to initialize training program");
  }
}
