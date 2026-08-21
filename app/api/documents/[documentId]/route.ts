import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { readDocumentFromStorage } from "@/lib/document-storage";
import { logAuditEvent } from "@/lib/audit-logger";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const documentId = params.documentId;
    const documentRecord = await prisma.teacherDocument.findUnique({
      where: { id: documentId },
      include: {
        teacher: {
          select: { userId: true },
        },
      },
    });

    if (!documentRecord) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Access control: User MUST be document owner OR an ADMIN
    const isOwner = documentRecord.teacher.userId === session.id;
    const isAdmin = session.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: Access restricted to document owner or system administrator" },
        { status: 403 }
      );
    }

    if (isAdmin && !isOwner) {
      await logAuditEvent(session.id, "ADMIN_DOCUMENT_VIEWED", {
        documentId: documentRecord.id,
        teacherId: documentRecord.teacherId,
        fileName: documentRecord.fileName,
      });
    }

    const storageData = await readDocumentFromStorage(documentRecord.storageKey);
    if (!storageData) {
      return NextResponse.json({ error: "File binary not found in storage" }, { status: 404 });
    }

    return new NextResponse(new Uint8Array(storageData.buffer), {
      headers: {
        "Content-Type": documentRecord.fileType,
        "Content-Disposition": `inline; filename="${documentRecord.fileName}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: `Failed to retrieve document: ${error.message}` }, { status: 500 });
  }
}
