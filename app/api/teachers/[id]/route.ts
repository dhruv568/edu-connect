import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ id }, { teacherProfile: { id } }],
        role: "TEACHER",
      },
      include: {
        profile: true,
        teacherProfile: {
          include: { courses: true },
        },
      },
    });

    if (!user || !user.teacherProfile) {
      return apiError("Teacher profile not found", 404);
    }

    const teacher = {
      id: user.id,
      teacherProfileId: user.teacherProfile.id,
      name: `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim() || user.email,
      avatarUrl: user.profile?.avatarUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      bio: user.profile?.bio || "Passionate educator dedicated to student success.",
      headline: user.teacherProfile.headline || "Senior Educator",
      subjects: user.teacherProfile.subjects ? user.teacherProfile.subjects.split(",").map((s) => s.trim()) : [],
      experienceYears: user.teacherProfile.experienceYears,
      hourlyRate: user.teacherProfile.hourlyRate,
      rating: user.teacherProfile.rating,
      verificationStatus: user.teacherProfile.verificationStatus,
      courses: user.teacherProfile.courses,
    };

    return apiSuccess({ teacher });
  } catch (error: any) {
    return apiError(`Failed to fetch teacher profile: ${error.message}`, 500);
  }
}
