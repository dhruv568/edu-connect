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

    const rawName = `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim();
    const teacher = {
      id: user.id,
      teacherProfileId: user.teacherProfile.id,
      name: rawName || "Educator",
      avatarUrl: user.profile?.avatarUrl || "/images/educators/educator_01.jpg",
      bio: user.profile?.bio || user.teacherProfile.bio || "Passionate educator dedicated to student success.",
      headline: user.teacherProfile.headline || "Senior Educator",
      subjects: user.teacherProfile.subjects ? user.teacherProfile.subjects.split(",").map((s) => s.trim()) : [],
      experienceYears: user.teacherProfile.experienceYears,
      hourlyRate: user.teacherProfile.hourlyRate || 300.0,
      rating: user.teacherProfile.rating,
      location: user.teacherProfile.location || "India",
      languages: user.teacherProfile.languages || "English, Hindi",
      teachingMode: user.teacherProfile.teachingMode || "ONLINE",
      verificationStatus: user.teacherProfile.verificationStatus,
      isVerified: user.teacherProfile.verificationStatus === "VERIFIED" || user.teacherProfile.verificationStatus === "APPROVED",
      courses: (user.teacherProfile.verificationStatus === "VERIFIED" || user.teacherProfile.verificationStatus === "APPROVED")
        ? user.teacherProfile.courses
        : [],
      liveClassSlots: (user.teacherProfile.verificationStatus === "VERIFIED" || user.teacherProfile.verificationStatus === "APPROVED")
        ? user.teacherProfile.liveClassSlots.map((s) => ({
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
          }))
        : [],
    };

    return apiSuccess({ teacher });
  } catch (error: any) {
    return handleApiError(error);
  }
}
