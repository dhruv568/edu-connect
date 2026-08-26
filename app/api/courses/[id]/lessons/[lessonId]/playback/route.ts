import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { generateMuxSignedPlaybackToken } from "@/lib/mux/mux-client";
import { apiError, apiSuccess } from "@/lib/api-response";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; lessonId: string } }
) {
  try {
    const session = await getSession();
    const courseId = params.id;
    const lessonId = params.lessonId;

    if (!courseId || !lessonId) {
      return apiError("courseId and lessonId required.", 400);
    }

    // 1. Fetch lesson & course details
    const lesson = await prisma.courseLesson.findFirst({
      where: {
        id: lessonId,
        section: { courseId },
      },
      include: {
        section: {
          include: {
            course: true,
          },
        },
        videoAssets: true,
      },
    });

    if (!lesson) {
      return apiError("Lesson not found.", 404);
    }

    const course = lesson.section.course;

    // 2. Authorization Check
    let isAuthorized = false;

    // Public preview check
    if (lesson.isPreview) {
      isAuthorized = true;
    } else if (session) {
      // Teacher ownership check
      if (session.role === "TEACHER") {
        const teacherProfile = await prisma.teacherProfile.findUnique({
          where: { userId: session.id },
        });
        if (teacherProfile && teacherProfile.id === course.teacherId) {
          isAuthorized = true;
        }
      }

      // Admin check
      if (session.role === "ADMIN") {
        isAuthorized = true;
      }

      // Student enrollment check
      if (!isAuthorized && session.role === "STUDENT") {
        const enrollment = await prisma.enrollment.findFirst({
          where: {
            studentId: session.id,
            courseId,
            status: "ACTIVE",
          },
        });
        if (enrollment) {
          isAuthorized = true;
        }
      }
    }

    if (!isAuthorized) {
      return apiError("You do not have access to this video lesson.", 403);
    }

    // 3. Find video asset
    const videoAsset = lesson.videoAssets?.[0] || await prisma.videoAsset.findFirst({
      where: { lessonId: lesson.id },
    });

    if (!videoAsset || !videoAsset.playbackId) {
      // Fallback: If local video URL exists or asset id is mapped
      if (lesson.videoUrl) {
        return apiSuccess({
          playbackId: null,
          playbackUrl: lesson.videoUrl,
          signedToken: null,
          isMux: false,
        });
      }
      return apiError("Video asset is processing or unavailable.", 404);
    }

    if (videoAsset.status !== "READY" && videoAsset.status !== "UPLOADING") {
      return apiError("Video is still processing. Please try again shortly.", 400);
    }

    // 4. Generate short-lived Mux signed playback token
    const signedToken = generateMuxSignedPlaybackToken(videoAsset.playbackId);

    return apiSuccess({
      playbackId: videoAsset.playbackId,
      signedToken,
      isMux: true,
      duration: videoAsset.duration || lesson.durationSeconds,
      aspectRatio: videoAsset.aspectRatio || "16:9",
    });
  } catch (error: any) {
    console.error("[Mux Playback Token Error]:", error);
    return apiError("Failed to issue playback token.", 500);
  }
}
