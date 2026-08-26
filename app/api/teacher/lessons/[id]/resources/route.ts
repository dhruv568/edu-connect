import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { saveResourceFile } from "@/lib/lms-storage";
import { LmsService } from "@/services/lms-service";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(["TEACHER"]);

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) return apiError("No resource file provided", 400);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const saved = await saveResourceFile(buffer, file.name, file.type || "application/pdf");

    const resource = await LmsService.addResource(session.userId, params.id, {
      name: file.name,
      storageKey: saved.storageKey,
      mimeType: saved.fileType,
      size: saved.fileSize,
    });

    return apiSuccess({ message: "Resource attached to lesson", resource }, 201);
  } catch (error: any) {
    return handleApiError(error);
  }
}
