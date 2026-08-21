import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, apiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(["TEACHER"]);

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: {
        profile: true,
        teacherProfile: {
          include: {
            verificationHistories: { orderBy: { createdAt: "desc" } },
          },
        },
      },
    });

    if (!user || !user.teacherProfile) {
      return apiError("Teacher profile not found", 404);
    }

    const tp = user.teacherProfile;

    return apiSuccess({
      emailVerified: user.emailVerified,
      verificationStatus: tp.verificationStatus,
      submittedAt: tp.submittedAt,
      verifiedAt: tp.verifiedAt,
      rejectedAt: tp.rejectedAt,
      suspendedAt: tp.suspendedAt,
      rejectionReason: tp.rejectionReason,
      suspensionReason: tp.suspensionReason,
      history: tp.verificationHistories,
    });
  } catch (error: any) {
    return apiError(error.message || "Failed to fetch verification status", 500);
  }
}
