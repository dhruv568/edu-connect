import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, apiError } from "@/lib/api-response";
import { deleteDocumentFromStorage } from "@/lib/document-storage";
import { logAuditEvent } from "@/lib/audit-logger";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireRole(["TEACHER"]);

    const docRecord = await prisma.teacherDocument.findUnique({
      where: { id: params.id },
      include: { teacher: true },
    });

    if (!docRecord || docRecord.teacher.userId !== session.id) {
      return apiError("Document not found or access denied", 404);
    }

    // Remove file from storage
    await deleteDocumentFromStorage(docRecord.storageKey);

    // Delete DB record
    await prisma.teacherDocument.delete({
      where: { id: params.id },
    });

    await logAuditEvent(session.id, "DOCUMENT_DELETED", {
      documentId: docRecord.id,
      fileName: docRecord.fileName,
    });

    return apiSuccess({ message: "Document deleted successfully" });
  } catch (error: any) {
    return apiError(error.message || "Failed to delete document", 500);
  }
}
