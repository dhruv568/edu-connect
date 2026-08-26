import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { saveVideoFile } from "@/lib/lms-storage";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    await requireRole(["TEACHER"]);

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return apiError("No video file provided", 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await saveVideoFile(buffer, file.name, file.type || "video/mp4");

    return apiSuccess({
      message: "Video uploaded successfully",
      assetId: result.storageKey,
      videoUrl: `/api/videos/${result.storageKey}/stream`,
      fileName: result.fileName,
      fileSize: result.fileSize,
      mimeType: result.fileType,
    }, 201);
  } catch (error: any) {
    return handleApiError(error);
  }
}
