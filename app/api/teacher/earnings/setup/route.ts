import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { RouteService } from "@/services/route-service";

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(["TEACHER"]);
    const body = await request.json().catch(() => ({}));

    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.userId },
      include: { user: { include: { profile: true } } },
    });

    if (!teacherProfile) {
      throw new Error("NOT_FOUND: Teacher profile not found.");
    }

    const accountName = body.accountName || `${teacherProfile.user.profile?.firstName} ${teacherProfile.user.profile?.lastName}`;

    const payoutAccount = await RouteService.initiateTeacherOnboarding({
      teacherId: teacherProfile.id,
      accountName,
    });

    return apiSuccess({
      message: "Teacher Razorpay Route Linked Account onboarding updated.",
      payoutAccount: {
        id: payoutAccount.id,
        providerAccountId: payoutAccount.providerAccountId,
        status: payoutAccount.status,
        kycStatus: payoutAccount.kycStatus,
        onboardingUrl: payoutAccount.onboardingUrl,
      },
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
