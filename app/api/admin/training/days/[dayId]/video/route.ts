import { NextRequest } from "next/server";
import { requireStaffOrAdmin } from "@/lib/auth/guards";
import { createMuxDirectUpload, syncMuxAssetStatus } from "@/lib/mux/mux-client";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiNotFound, apiBadRequest, handleApiError } from "@/lib/api-response";

export async function POST(req: NextRequest, { params }: { params: { dayId: string } }) {
  try {
    await requireStaffOrAdmin();
    const day = await prisma.trainingDay.findUnique({
      where: { id: params.dayId },
    });

    if (!day) return apiNotFound("Training day not found");

    // Create Mux Direct Upload
    const upload = await createMuxDirectUpload("*");

    // Update training day with upload reference
    await prisma.trainingDay.update({
      where: { id: params.dayId },
      data: {
        videoAssetId: upload.id,
      },
    });

    return apiSuccess({
      uploadUrl: upload.url,
      uploadId: upload.id,
      dayId: day.id,
    });
  } catch (err: any) {
    return handleApiError(err, "Failed to create video upload URL");
  }
}

export async function PUT(req: NextRequest, { params }: { params: { dayId: string } }) {
  try {
    await requireStaffOrAdmin();
    const body = await req.json().catch(() => ({}));
    const { uploadId, assetId } = body;

    const day = await prisma.trainingDay.findUnique({
      where: { id: params.dayId },
    });

    if (!day) return apiNotFound("Training day not found");

    const targetUploadId = uploadId || day.videoAssetId;
    if (!targetUploadId && !assetId) {
      return apiBadRequest("uploadId or assetId is required");
    }

    const syncResult = await syncMuxAssetStatus(targetUploadId || undefined, assetId || undefined);

    if (syncResult) {
      const { status, playbackId, duration } = syncResult;

      if (playbackId) {
        await prisma.trainingDay.update({
          where: { id: day.id },
          data: {
            videoPlaybackId: playbackId,
            ...(duration ? { videoDuration: Math.round(duration) } : {}),
          },
        });
      }

      return apiSuccess({
        status,
        playbackId: playbackId || day.videoPlaybackId,
        duration: duration || day.videoDuration,
      });
    }

    return apiSuccess({
      status: "PROCESSING",
      playbackId: day.videoPlaybackId,
      duration: day.videoDuration,
    });
  } catch (err: any) {
    return handleApiError(err, "Failed to sync video status");
  }
}
