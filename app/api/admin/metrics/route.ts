import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    await requireRole(["ADMIN"]);

    const [
      totalUsers,
      totalTeachers,
      totalStudents,
      pendingVerifications,
      verifiedTeachers,
      rejectedTeachers,
      suspendedTeachers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "TEACHER" } }),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.teacherProfile.count({ where: { verificationStatus: "PENDING" } }),
      prisma.teacherProfile.count({ where: { verificationStatus: "VERIFIED" } }),
      prisma.teacherProfile.count({ where: { verificationStatus: "REJECTED" } }),
      prisma.teacherProfile.count({ where: { verificationStatus: "SUSPENDED" } }),
    ]);

    return apiSuccess({
      metrics: {
        totalUsers,
        totalTeachers,
        totalStudents,
        pendingVerifications,
        verifiedTeachers,
        rejectedTeachers,
        suspendedTeachers,
      },
    });
  } catch (error: any) {
    return apiError(error.message || "Failed to fetch admin metrics", 500);
  }
}
