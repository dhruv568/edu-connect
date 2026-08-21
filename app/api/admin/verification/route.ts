import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireRole(["ADMIN"]);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "PENDING"; // Defaults to PENDING queue

    const whereCondition: any = {};
    if (status !== "ALL") {
      whereCondition.verificationStatus = status;
    }

    const pendingApplications = await prisma.teacherProfile.findMany({
      where: whereCondition,
      include: {
        user: {
          include: { profile: true },
        },
        teacherQualifications: true,
        teacherDocuments: { where: { status: "ACTIVE" } },
      },
      orderBy: { submittedAt: "asc" }, // Oldest pending first (priority queue)
    });

    const queue = pendingApplications.map((tp) => ({
      teacherProfileId: tp.id,
      userId: tp.userId,
      name: `${tp.user.profile?.firstName || ""} ${tp.user.profile?.lastName || ""}`.trim() || tp.user.email,
      email: tp.user.email,
      emailVerified: tp.user.emailVerified,
      avatarUrl: tp.user.profile?.avatarUrl || null,
      headline: tp.headline || "Teacher Applicant",
      subjects: tp.subjects ? tp.subjects.split(",").map((s) => s.trim()) : [],
      experienceYears: tp.experienceYears,
      teachingMode: tp.teachingMode || "ONLINE",
      verificationStatus: tp.verificationStatus,
      submittedAt: tp.submittedAt,
      documentCount: tp.teacherDocuments.length,
      qualificationCount: tp.teacherQualifications.length,
    }));

    return apiSuccess({ queue, count: queue.length });
  } catch (error: any) {
    return handleApiError(error);
  }
}
