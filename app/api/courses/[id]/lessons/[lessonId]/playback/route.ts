import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { generateMuxSignedPlaybackToken } from "@/lib/mux/mux-client";
import { apiError, apiSuccess } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; lessonId: string } }
) {
  try {
    const session = await getSession();
    const courseIdOrSlug = params.id;
    const lessonId = params.lessonId;

    if (!courseIdOrSlug || !lessonId) {
      return apiError("courseId and lessonId required.", 400);
    }

    // 1. Fetch lesson & course details (supports course ID or slug)
    const lesson = await prisma.courseLesson.findFirst({
      where: {
        id: lessonId,
        section: {
          course: {
            OR: [{ id: courseIdOrSlug }, { slug: courseIdOrSlug }],
          },
        },
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
      return apiError("Lesson not found under this course.", 404);
    }

    const course = lesson.section.course;
    const currentUserId = session?.userId || session?.id;

    // 2. Authorization Check
    let isAuthorized = false;

    // Public preview check
    if (lesson.isPreview) {
      // For unpublished courses, only teacher or admin can preview
      if (course.status !== "PUBLISHED") {
        if (session?.role === "ADMIN") {
          isAuthorized = true;
        } else if (session?.role === "TEACHER" && currentUserId) {
          const teacherProfile = await prisma.teacherProfile.findUnique({
            where: { userId: currentUserId },
          });
          if (teacherProfile && teacherProfile.id === course.teacherId) {
            isAuthorized = true;
          }
        }
      } else {
        isAuthorized = true;
      }
    } else if (session && currentUserId) {
      // Teacher ownership check
      if (session.role === "TEACHER") {
        const teacherProfile = await prisma.teacherProfile.findUnique({
          where: { userId: currentUserId },
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
            studentId: currentUserId,
            courseId: course.id,
            status: { in: ["ACTIVE", "COMPLETED"] },
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

    // Handle Mux Cloud Video if playbackId exists
    if (videoAsset && videoAsset.playbackId && videoAsset.provider === "MUX") {
      if (videoAsset.status === "UPLOADING" || videoAsset.status === "PROCESSING") {
        return apiError("Video is still processing. Please try again shortly.", 400);
      }
      if (videoAsset.status === "FAILED") {
        return apiError("Video processing failed. Please re-upload the video.", 400);
      }

      const signedToken = generateMuxSignedPlaybackToken(videoAsset.playbackId);
      return apiSuccess({
        playbackId: videoAsset.playbackId,
        playbackUrl: null,
        signedToken,
        isMux: true,
        status: "READY",
        duration: videoAsset.duration || lesson.durationSeconds,
        aspectRatio: videoAsset.aspectRatio || "16:9",
      });
    }

    // Handle Local or Direct Video URL (or videoAssetId / storageKey)
    const activeVideoAssetId = lesson.videoAssetId || videoAsset?.id;
    let resolvedVideoUrl =
      lesson.videoUrl ||
      (activeVideoAssetId ? `/api/videos/${activeVideoAssetId}/stream` : null);

    // Fallback sample preview video if lesson is marked as isPreview but custom video is not attached yet
    if (!resolvedVideoUrl && lesson.isPreview) {
      resolvedVideoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
    }

    if (resolvedVideoUrl) {
      return apiSuccess({
        playbackId: null,
        playbackUrl: resolvedVideoUrl,
        signedToken: null,
        isMux: false,
        status: "READY",
        duration: lesson.durationSeconds || 15,
      });
    }

    if (videoAsset?.status === "UPLOADING" || videoAsset?.status === "PROCESSING" || lesson.status === "PROCESSING" || lesson.status === "UPLOADING") {
      return apiError("Video is still processing. Please try again shortly.", 400);
    }

    if (videoAsset?.status === "FAILED" || lesson.status === "FAILED") {
      return apiError("Video processing failed. Please re-upload the video.", 400);
    }

    return apiError("This preview video is currently unavailable.", 404);
  } catch (error: any) {
    console.error("[Mux Playback Token Error]:", error);
    return apiError("Failed to issue playback token.", 500);
  }
}
