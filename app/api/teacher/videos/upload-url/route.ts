import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { createMuxDirectUpload } from "@/lib/mux/mux-client";
import { apiError, apiSuccess } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "TEACHER") {
      return apiError("Teacher authorization required.", 403);
    }

    const body = await req.json().catch(() => ({}));
    const { courseId, lessonId } = body;

    if (!courseId || !lessonId) {
      return apiError("courseId and lessonId are required.", 400);
    }

    // 1. Verify course & lesson ownership
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        teacher: { userId: session.id },
      },
    });

    if (!course) {
      return apiError("Course not found or unauthorized.", 404);
    }

    const lesson = await prisma.courseLesson.findFirst({
      where: {
        id: lessonId,
        section: { courseId },
      },
    });

    if (!lesson) {
      return apiError("Lesson not found under this course.", 404);
    }

    // 2. Create Mux Direct Upload
    const upload = await createMuxDirectUpload("*");

    // 3. Create or update VideoAsset record in database
    const videoAsset = await prisma.videoAsset.create({
      data: {
        lessonId: lesson.id,
        uploadId: upload.id,
        provider: "MUX",
        status: "UPLOADING",
      },
    });

    // 4. Update CourseLesson status
    await prisma.courseLesson.update({
      where: { id: lesson.id },
      data: {
        videoProvider: "MUX",
        videoAssetId: videoAsset.id,
        status: "UPLOADING",
      },
    });

    return apiSuccess({
      uploadUrl: upload.url,
      uploadId: upload.id,
      assetId: videoAsset.id,
    });
  } catch (error: any) {
    console.error("[Mux Upload URL Error]:", error);
    return apiError("Failed to create video upload URL.", 500);
  }
}
