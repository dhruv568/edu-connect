import { NextRequest } from "next/server";
import { LmsService } from "@/services/lms-service";
import { requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const course = await prisma.course.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }],
      },
      select: { id: true },
    });

    if (!course) return apiError("Course not found", 404);

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    const [total, reviews] = await Promise.all([
      prisma.courseReview.count({ where: { courseId: course.id } }),
      prisma.courseReview.findMany({
        where: { courseId: course.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          student: {
            include: { profile: true },
          },
        },
      }),
    ]);

    const formatted = reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      review: r.review,
      createdAt: r.createdAt,
      studentName: `${r.student.profile?.firstName || "Student"} ${r.student.profile?.lastName || ""}`.trim(),
      studentAvatar: r.student.profile?.avatarUrl,
    }));

    return apiSuccess({
      reviews: formatted,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(["STUDENT"]);
    const body = await request.json();

    const course = await prisma.course.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }],
      },
      select: { id: true },
    });

    if (!course) return apiError("Course not found", 404);

    const review = await LmsService.createCourseReview(
      session.userId,
      course.id,
      Number(body.rating),
      body.review
    );

    return apiSuccess({
      message: "Review submitted successfully!",
      review,
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
