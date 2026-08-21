import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.toLowerCase();
    const subject = searchParams.get("subject")?.toLowerCase();
    const priceMax = searchParams.get("priceMax") ? Number(searchParams.get("priceMax")) : undefined;
    const ratingMin = searchParams.get("ratingMin") ? Number(searchParams.get("ratingMin")) : undefined;
    const sortBy = searchParams.get("sortBy") || "recommended";

    const coursesFromDb = await prisma.course.findMany({
      where: {
        ...(ratingMin !== undefined && { rating: { gte: ratingMin } }),
        ...(priceMax !== undefined && { price: { lte: priceMax } }),
      },
      include: {
        teacher: {
          include: {
            user: {
              include: { profile: true },
            },
          },
        },
      },
    });

    let results = coursesFromDb.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      description: c.description,
      subject: c.subject,
      gradeLevel: c.gradeLevel,
      price: c.price,
      rating: c.rating,
      reviewCount: c.reviewCount,
      lessonCount: c.lessonCount,
      durationHours: c.durationHours,
      thumbnailUrl: c.thumbnailUrl || "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&auto=format&fit=crop&q=80",
      teacherName: `${c.teacher.user.profile?.firstName || ''} ${c.teacher.user.profile?.lastName || ''}`.trim(),
      teacherAvatar: c.teacher.user.profile?.avatarUrl,
    }));

    // Filter by search or subject
    if (search) {
      results = results.filter(
        (c) =>
          c.title.toLowerCase().includes(search) ||
          c.description.toLowerCase().includes(search) ||
          c.subject.toLowerCase().includes(search) ||
          c.teacherName.toLowerCase().includes(search)
      );
    }

    if (subject && subject !== "all") {
      results = results.filter((c) => c.subject.toLowerCase().includes(subject));
    }

    // Sorting
    if (sortBy === "rating") {
      results.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "price_asc") {
      results.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_desc") {
      results.sort((a, b) => b.price - a.price);
    }

    return apiSuccess({
      courses: results,
      totalCount: results.length,
    });
  } catch (error: any) {
    return apiError(`Failed to fetch courses: ${error.message}`, 500);
  }
}
