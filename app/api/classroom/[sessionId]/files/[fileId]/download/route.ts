import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { verifyRoomAccess } from "@/lib/classroom/classroom-token";
import { apiError } from "@/lib/api-response";
import path from "path";
import fs from "fs/promises";

export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string; fileId: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return apiError("Authentication required.", 401);
    }

    const { sessionId, fileId } = params;
    const accessCheck = await verifyRoomAccess(sessionId, session);
    if (!accessCheck.authorized) {
      return apiError("Unauthorized access to classroom file.", 403);
    }

    const fileRecord = await prisma.classroomFile.findFirst({
      where: { id: fileId, sessionId },
    });

    if (!fileRecord) {
      return apiError("File not found.", 404);
    }

    const filePath = path.join(process.cwd(), "storage", "classroom_files", fileRecord.storageKey);
    try {
      const fileBuffer = await fs.readFile(filePath);
      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": fileRecord.mimeType || "application/octet-stream",
          "Content-Disposition": `inline; filename="${encodeURIComponent(fileRecord.fileName)}"`,
          "Content-Length": fileRecord.size.toString(),
        },
      });
    } catch {
      return apiError("Physical file storage missing.", 404);
    }
  } catch (error: any) {
    console.error("[Secure File Download Error]:", error);
    return apiError("Failed to download file.", 500);
  }
}
