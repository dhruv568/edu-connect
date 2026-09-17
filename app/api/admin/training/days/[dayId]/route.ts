import { NextRequest } from "next/server";
import { requireStaffOrAdmin } from "@/lib/auth/guards";
import { TrainingService } from "@/services/training-service";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiNotFound, handleApiError } from "@/lib/api-response";

export async function GET(req: NextRequest, { params }: { params: { dayId: string } }) {
  try {
    await requireStaffOrAdmin();
    const day = await prisma.trainingDay.findUnique({
      where: { id: params.dayId },
      include: { quiz: true },
    });

    if (!day) return apiNotFound("Training day not found");

    return apiSuccess({
      ...day,
      learningObjectives: day.learningObjectives ? JSON.parse(day.learningObjectives) : [],
      resources: day.resources ? JSON.parse(day.resources) : [],
    });
  } catch (err: any) {
    return handleApiError(err, "Failed to load training day");
  }
}

export async function PUT(req: NextRequest, { params }: { params: { dayId: string } }) {
  try {
    await requireStaffOrAdmin();
    const body = await req.json().catch(() => ({}));

    const updated = await TrainingService.updateDay(params.dayId, body);
    return apiSuccess(updated, "Training day updated successfully");
  } catch (err: any) {
    return handleApiError(err, "Failed to update training day");
  }
}
