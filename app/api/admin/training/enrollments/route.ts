import { NextRequest } from "next/server";
import { requireStaffOrAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    await requireStaffOrAdmin();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "ALL";

    const where: any = {};
    if (status !== "ALL") {
      where.status = status;
    }

    if (search.trim()) {
      const q = search.trim();
      where.user = {
        OR: [
          { email: { contains: q, mode: "insensitive" } },
          { profile: { firstName: { contains: q, mode: "insensitive" } } },
          { profile: { lastName: { contains: q, mode: "insensitive" } } },
        ],
      };
    }

    const enrollments = await prisma.trainingEnrollment.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            profile: true,
            teacherProfile: {
              select: {
                verificationStatus: true,
                rating: true,
              },
            },
          },
        },
        certificate: {
          select: {
            id: true,
            certificateNumber: true,
            status: true,
            issueDate: true,
          },
        },
        dayProgress: {
          select: {
            dayNumber: true,
            isCompleted: true,
            bestScore: true,
            videoWatched: true,
            completedAt: true,
          },
        },
      },
    });

    const formatted = enrollments.map((e) => {
      const name =
        [e.user.profile?.firstName, e.user.profile?.lastName].filter(Boolean).join(" ") ||
        e.user.email.split("@")[0];

      return {
        id: e.id,
        userId: e.userId,
        userName: name,
        userEmail: e.user.email,
        teacherStatus: e.user.teacherProfile?.verificationStatus || "PENDING",
        status: e.status,
        currentDay: e.currentDay,
        completedDaysCount: e.completedDaysCount,
        completionPercentage: e.completionPercentage,
        startDate: e.startDate,
        completedAt: e.completedAt,
        certificate: e.certificate,
        progress: e.dayProgress,
      };
    });

    return apiSuccess({ enrollments: formatted });
  } catch (err: any) {
    return handleApiError(err, "Failed to load enrolled educators");
  }
}
