import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { saveVideoFile } from "@/lib/lms-storage";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    await requireRole(["TEACHER"]);

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const lessonId = formData.get("lessonId") as string | null;

    if (!file) {
      return apiError("No video file provided", 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const saved = await saveVideoFile(buffer, file.name, file.type || "video/mp4");
    const videoUrl = `/api/videos/${saved.storageKey}/stream`;
    const videoAssetId = saved.storageKey;

    if (lessonId) {
      const lesson = await prisma.courseLesson.findUnique({ where: { id: lessonId } });
      if (lesson) {
        await prisma.courseLesson.update({
          where: { id: lessonId },
          data: {
            videoUrl,
            videoAssetId,
            videoProvider: "LOCAL",
            status: "READY",
          },
        });
      }
    }

    return apiSuccess({
      message: "Video uploaded successfully",
      videoUrl,
      videoAssetId,
      storageKey: saved.storageKey,
    }, 201);
  } catch (error: any) {
    return handleApiError(error);
  }
}
