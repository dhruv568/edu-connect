import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { verifyRoomAccess } from "@/lib/classroom/classroom-token";
import { apiError, apiSuccess } from "@/lib/api-response";
import path from "path";
import fs from "fs/promises";

const ALLOWED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg", ".doc", ".docx", ".ppt", ".pptx"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return apiError("Authentication required.", 401);
    }

    const { sessionId } = params;
    const accessCheck = await verifyRoomAccess(sessionId, session);
    if (!accessCheck.authorized) {
      return apiError("Unauthorized to view class files.", 403);
    }

    const files = await prisma.classroomFile.findMany({
      where: { sessionId },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess({
      files: files.map((f) => ({
        id: f.id,
        sessionId: f.sessionId,
        uploadedBy: f.uploadedBy,
        fileName: f.fileName,
        storageKey: f.storageKey,
        mimeType: f.mimeType,
        size: f.size,
        createdAt: f.createdAt.toISOString(),
      })),
    });
  } catch (error: any) {
    console.error("[Get Classroom Files Error]:", error);
    return apiError("Failed to fetch classroom files.", 500);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return apiError("Authentication required.", 401);
    }

    const { sessionId } = params;
    const accessCheck = await verifyRoomAccess(sessionId, session);
    if (!accessCheck.authorized) {
      return apiError("Unauthorized to upload classroom files.", 403);
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return apiError("No file uploaded.", 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return apiError("File size exceeds maximum limit of 10MB.", 400);
    }

    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return apiError(`File extension ${ext} is not allowed for educational materials. Allowed: PDF, PNG, JPG, DOC, PPT.`, 400);
    }

    // Save file buffer locally
    const buffer = Buffer.from(await file.arrayBuffer());
    const storageKey = `cls_${sessionId}_${Date.now()}_${path.basename(file.name).replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const uploadDir = path.join(process.cwd(), "storage", "classroom_files");

    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, storageKey), buffer);

    const newFile = await prisma.classroomFile.create({
      data: {
        sessionId,
        uploadedBy: session.id,
        fileName: file.name,
        storageKey,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
      },
    });

    return apiSuccess({
      id: newFile.id,
      sessionId: newFile.sessionId,
      uploadedBy: newFile.uploadedBy,
      fileName: newFile.fileName,
      storageKey: newFile.storageKey,
      mimeType: newFile.mimeType,
      size: newFile.size,
      createdAt: newFile.createdAt.toISOString(),
    }, "Material uploaded successfully.");
  } catch (error: any) {
    console.error("[Upload Classroom File Error]:", error);
    return apiError("Failed to upload classroom file.", 500);
  }
}
