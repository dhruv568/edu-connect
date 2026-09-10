import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { syncMuxAssetStatus } from "@/lib/mux/mux-client";
import { apiError, apiSuccess } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "TEACHER") {
      return apiError("Teacher authorization required.", 403);
    }

    const body = await req.json().catch(() => ({}));
    const { lessonId, uploadId } = body;

    if (!lessonId && !uploadId) {
      return apiError("lessonId or uploadId required.", 400);
    }

    // Find the corresponding VideoAsset
    const videoAsset = await prisma.videoAsset.findFirst({
      where: {
        OR: [
          ...(lessonId ? [{ lessonId }] : []),
          ...(uploadId ? [{ uploadId }] : []),
        ],
      },
    });

    if (!videoAsset) {
      return apiError("Video asset record not found.", 404);
    }

    // Perform active sync with Mux
    const syncResult = await syncMuxAssetStatus(videoAsset.uploadId, videoAsset.providerAssetId || undefined);

    if (syncResult) {
      const { status, assetId, playbackId, duration, aspectRatio } = syncResult;

      await prisma.videoAsset.update({
        where: { id: videoAsset.id },
        data: {
          ...(assetId ? { providerAssetId: assetId } : {}),
          ...(playbackId ? { playbackId } : {}),
          ...(duration ? { duration } : {}),
          ...(aspectRatio ? { aspectRatio } : {}),
          status: status as any,
        },
      });

      if (videoAsset.lessonId) {
        await prisma.courseLesson.update({
          where: { id: videoAsset.lessonId },
          data: {
            status: status as any,
            ...(duration ? { durationSeconds: Math.round(duration) } : {}),
            ...(status === "READY" ? { videoProvider: videoAsset.provider } : {}),
          },
        });
      }

      return apiSuccess({
        lessonId: videoAsset.lessonId,
        status,
        playbackId,
        duration,
      });
    }

    return apiSuccess({
      lessonId: videoAsset.lessonId,
      status: videoAsset.status,
    });
  } catch (error: any) {
    console.error("[Sync Mux Video Status Error]:", error);
    return apiError("Failed to sync video status.", 500);
  }
}
