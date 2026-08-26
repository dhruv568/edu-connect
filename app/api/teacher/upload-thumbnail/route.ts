import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { saveThumbnailFile } from "@/lib/lms-storage";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    await requireRole(["TEACHER"]);

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return apiError("No thumbnail image file provided", 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const thumbnailUrl = await saveThumbnailFile(buffer, file.name, file.type || "image/jpeg");

    return apiSuccess({
      message: "Thumbnail uploaded successfully",
      thumbnailUrl,
    }, 201);
  } catch (error: any) {
    return handleApiError(error);
  }
}
