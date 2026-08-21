export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireRole(["TEACHER"]);

    const cert = await prisma.teacherCertificate.findUnique({
      where: { id: params.id },
      include: { teacher: true },
    });

    if (!cert || cert.teacher.userId !== session.id) {
      return apiError("Certificate not found or access denied", 404);
    }

    await prisma.teacherCertificate.delete({
      where: { id: params.id },
    });

    return apiSuccess({ message: "Certificate deleted" });
  } catch (error: any) {
    return apiError(error.message || "Failed to delete certificate", 500);
  }
}
