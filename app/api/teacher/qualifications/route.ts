import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(["TEACHER"]);
    const body = await request.json();

    const { degree, institution, specialization, year, description } = body;

    if (!degree || !institution || !year) {
      return apiError("Degree, institution, and completion year are required", 400);
    }

    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId: session.id },
    });

    if (!teacher) {
      return apiError("Teacher profile not found", 404);
    }

    const qualification = await prisma.teacherQualification.create({
      data: {
        teacherId: teacher.id,
        degree,
        institution,
        specialization: specialization || null,
        year: Number(year),
        description: description || null,
      },
    });

    return apiSuccess({ qualification }, "Qualification added successfully", 201);
  } catch (error: any) {
    return apiError(error.message || "Failed to add qualification", 500);
  }
}
