import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyMuxWebhookHeader } from "@/lib/mux/mux-client";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const headersList: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headersList[key] = value;
    });

    // 1. Verify Webhook Signature
    const isValid = verifyMuxWebhookHeader(rawBody, headersList);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const { type, data } = payload;

    console.log(`[Mux Webhook Received]: Event type ${type}`);

    // 2. Handle Mux Webhook Events
    if (type === "video.upload.asset_created") {
      const uploadId = data.id;
      const assetId = data.asset_id;

      if (uploadId && assetId) {
        await prisma.videoAsset.updateMany({
          where: { uploadId },
          data: { providerAssetId: assetId, status: "PROCESSING" },
        });
      }
    } else if (type === "video.asset.ready") {
      const assetId = data.id;
      const playbackId = data.playback_ids?.[0]?.id;
      const duration = data.duration;
      const aspect = data.aspect_ratio;
      const width = data.max_stored_resolution?.width;
      const height = data.max_stored_resolution?.height;

      // Find VideoAsset by providerAssetId or uploadId
      const videoAsset = await prisma.videoAsset.findFirst({
        where: {
          OR: [
            { providerAssetId: assetId },
            { uploadId: data.upload_id || "" },
          ],
        },
      });

      if (videoAsset) {
        await prisma.videoAsset.update({
          where: { id: videoAsset.id },
          data: {
            providerAssetId: assetId,
            playbackId,
            duration,
            aspectRatio: aspect,
            width,
            height,
            status: "READY",
          },
        });

        if (videoAsset.lessonId) {
          await prisma.courseLesson.update({
            where: { id: videoAsset.lessonId },
            data: {
              status: "READY",
              durationSeconds: Math.round(duration || 0),
            },
          });
        }
      }
    } else if (type === "video.asset.errored") {
      const assetId = data.id;
      const videoAsset = await prisma.videoAsset.findFirst({
        where: {
          OR: [
            { providerAssetId: assetId },
            { uploadId: data.upload_id || "" },
          ],
        },
      });

      if (videoAsset) {
        await prisma.videoAsset.update({
          where: { id: videoAsset.id },
          data: { status: "FAILED" },
        });

        if (videoAsset.lessonId) {
          await prisma.courseLesson.update({
            where: { id: videoAsset.lessonId },
            data: { status: "FAILED" },
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("[Mux Webhook Error]:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
