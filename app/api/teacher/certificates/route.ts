import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(["TEACHER"]);
    const body = await request.json();

    const { name, issuer, issueDate, expiryDate, documentId, description } = body;

    if (!name || !issuer || !issueDate) {
      return apiError("Certificate name, issuing organization, and issue date are required", 400);
    }

    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId: session.id },
    });

    if (!teacher) {
      return apiError("Teacher profile not found", 404);
    }

    const certificate = await prisma.teacherCertificate.create({
      data: {
        teacherId: teacher.id,
        name,
        issuer,
        issueDate: new Date(issueDate),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        documentId: documentId || null,
        description: description || null,
      },
    });

    return apiSuccess({ certificate }, "Certificate added successfully", 201);
  } catch (error: any) {
    return apiError(error.message || "Failed to add certificate", 500);
  }
}
