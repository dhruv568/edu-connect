import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.toLowerCase();
    const subject = searchParams.get("subject")?.toLowerCase();
    const priceMax = searchParams.get("priceMax") ? Number(searchParams.get("priceMax")) : undefined;
    const ratingMin = searchParams.get("ratingMin") ? Number(searchParams.get("ratingMin")) : undefined;
    const experienceMin = searchParams.get("experienceMin") ? Number(searchParams.get("experienceMin")) : undefined;
    const sortBy = searchParams.get("sortBy") || "recommended";
    const includeUnverified = searchParams.get("includeUnverified") === "true"; // For internal admin discovery if explicitly requested

    const teacherProfiles = await prisma.teacherProfile.findMany({
      where: {
        ...(!includeUnverified && {
          verificationStatus: "VERIFIED",
          user: { emailVerified: true },
        }),
        ...(ratingMin !== undefined && { rating: { gte: ratingMin } }),
        ...(priceMax !== undefined && { hourlyRate: { lte: priceMax } }),
        ...(experienceMin !== undefined && { experienceYears: { gte: experienceMin } }),
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    let results = teacherProfiles.map((tp) => ({
      id: tp.user.id,
      teacherProfileId: tp.id,
      name: `${tp.user.profile?.firstName || ''} ${tp.user.profile?.lastName || ''}`.trim() || tp.user.email,
      avatarUrl: tp.user.profile?.avatarUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      bio: tp.user.profile?.bio,
      headline: tp.headline || "Senior Educator",
      subjects: tp.subjects ? tp.subjects.split(",").map((s) => s.trim()) : [],
      experienceYears: tp.experienceYears,
      hourlyRate: tp.hourlyRate || 40.0,
      rating: tp.rating,
      verificationStatus: tp.verificationStatus,
    }));

    // Client-side text filtering if search or subject filter passed
    if (search) {
      results = results.filter(
        (t) =>
          t.name.toLowerCase().includes(search) ||
          t.headline.toLowerCase().includes(search) ||
          t.subjects.some((s) => s.toLowerCase().includes(search))
      );
    }

    if (subject && subject !== "all") {
      results = results.filter((t) => t.subjects.some((s) => s.toLowerCase().includes(subject)));
    }

    // Sorting
    if (sortBy === "rating") {
      results.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "price_asc") {
      results.sort((a, b) => a.hourlyRate - b.hourlyRate);
    } else if (sortBy === "price_desc") {
      results.sort((a, b) => b.hourlyRate - a.hourlyRate);
    } else if (sortBy === "experience") {
      results.sort((a, b) => b.experienceYears - a.experienceYears);
    }

    return apiSuccess({
      teachers: results,
      totalCount: results.length,
    });
  } catch (error: any) {
    return apiError(`Failed to fetch teachers: ${error.message}`, 500);
  }
}
