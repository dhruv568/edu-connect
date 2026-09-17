import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { TrainingService } from "@/services/training-service";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function POST(req: NextRequest, { params }: { params: { dayNumber: string } }) {
  try {
    const session = await requireAuth();
    const dayNumber = parseInt(params.dayNumber, 10);

    if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 15) {
      throw new Error("Invalid training day number.");
    }

    const progress = await TrainingService.completeDayContent(session.userId, dayNumber, true);

    return apiSuccess({ progress }, `Day ${dayNumber} content completed`);
  } catch (err: any) {
    return handleApiError(err, "Failed to complete training day content");
  }
}
