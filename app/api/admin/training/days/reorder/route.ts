import { NextRequest } from "next/server";
import { requireStaffOrAdmin } from "@/lib/auth/guards";
import { TrainingService } from "@/services/training-service";
import { apiSuccess, apiBadRequest, handleApiError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    await requireStaffOrAdmin();
    const body = await req.json().catch(() => ({}));

    if (!Array.isArray(body.items)) {
      return apiBadRequest("Expected items array: [{ id, orderIndex }]");
    }

    await TrainingService.reorderDays(body.items);
    return apiSuccess({ reordered: true }, "Training days reordered successfully");
  } catch (err: any) {
    return handleApiError(err, "Failed to reorder training days");
  }
}
