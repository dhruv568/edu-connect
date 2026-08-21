export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireRole(["TEACHER"]);
    const body = await request.json();

    const qual = await prisma.teacherQualification.findUnique({
      where: { id: params.id },
      include: { teacher: true },
    });

    if (!qual || qual.teacher.userId !== session.id) {
      return apiError("Qualification not found or access denied", 404);
    }

    const updated = await prisma.teacherQualification.update({
      where: { id: params.id },
      data: {
        ...(body.degree !== undefined && { degree: body.degree }),
        ...(body.institution !== undefined && { institution: body.institution }),
        ...(body.specialization !== undefined && { specialization: body.specialization }),
        ...(body.year !== undefined && { year: Number(body.year) }),
        ...(body.description !== undefined && { description: body.description }),
      },
    });

    return apiSuccess({ message: "Qualification updated", qualification: updated });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireRole(["TEACHER"]);

    const qual = await prisma.teacherQualification.findUnique({
      where: { id: params.id },
      include: { teacher: true },
    });

    if (!qual || qual.teacher.userId !== session.id) {
      return apiError("Qualification not found or access denied", 404);
    }

    await prisma.teacherQualification.delete({
      where: { id: params.id },
    });

    return apiSuccess({ message: "Qualification deleted" });
  } catch (error: any) {
    return handleApiError(error);
  }
}
