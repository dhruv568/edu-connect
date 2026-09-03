import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const now = new Date();
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ id }, { teacherProfile: { id } }],
        role: "TEACHER",
      },
      include: {
        profile: true,
        teacherProfile: {
          include: {
            courses: {
              where: { status: "PUBLISHED" },
              select: {
                id: true,
                title: true,
                slug: true,
                subject: true,
                level: true,
                price: true,
                thumbnailUrl: true,
                enrollmentCount: true,
              },
            },
            liveClassSlots: {
              where: {
                endTime: { gte: now },
                status: { in: ["SCHEDULED", "OPEN"] },
              },
              orderBy: { startTime: "asc" },
              include: {
                bookings: {
                  where: { status: "CONFIRMED" },
                  select: { id: true, studentId: true },
                },
              },
            },
          },
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
      liveClassSlots: user.teacherProfile.liveClassSlots.map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        subject: s.subject,
        level: s.level,
        startTime: s.startTime.toISOString(),
        endTime: s.endTime.toISOString(),
        durationMinutes: s.durationMinutes,
        price: s.price,
        maxCapacity: s.maxCapacity,
        bookedCount: s.bookings.length,
        isFull: s.bookings.length >= s.maxCapacity,
      })),
    };

    return apiSuccess({ teacher });
  } catch (error: any) {
    return handleApiError(error);
  }
}
