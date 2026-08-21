import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, apiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    await requireRole(["ADMIN"]);

    let totalUsers = 0,
      totalTeachers = 0,
      totalStudents = 0,
      pendingVerifications = 0,
      verifiedTeachers = 0,
      rejectedTeachers = 0,
      suspendedTeachers = 0;

    try {
      [
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
    } catch (dbError) {
      console.error("Database query error in admin metrics:", dbError);
    }

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
    const isAuthError = error.message?.includes("UNAUTHORIZED") || error.message?.includes("FORBIDDEN");
    return apiError(error.message || "Failed to fetch admin metrics", isAuthError ? 401 : 400);
  }
}
