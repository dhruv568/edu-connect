import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/api-response";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "TEACHER") {
      return apiError("Unauthorized: Teacher access required.", 403);
    }

    const userId = session.userId || session.id;
    const courseId = params.id;

    const teacher = await prisma.teacherProfile.findUnique({ where: { userId } });
    if (!teacher) return apiError("Teacher profile not found.", 404);

    const course = await prisma.course.findFirst({
      where: { id: courseId, teacherId: teacher.id },
      include: {
        sections: { include: { lessons: true } },
        enrollments: {
          include: {
            student: { include: { profile: true } },
            lessonProgresses: true,
          },
        },
        reviews: {
          include: { student: { include: { profile: true } } },
        },
      },
    });

    if (!course) {
      return apiError("Course not found or access denied.", 404);
    }

    const totalLessons = course.sections.flatMap((s) => s.lessons).length;
    let completedEnrollments = 0;
    let sumProgress = 0;

    const studentBreakdown = course.enrollments.map((e) => {
      if (e.status === "COMPLETED") completedEnrollments++;
      const completedLessons = e.lessonProgresses.filter((lp) => lp.completed).length;
      const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      sumProgress += progressPercent;

      const name = e.student.profile ? `${e.student.profile.firstName} ${e.student.profile.lastName}` : e.student.email;

      return {
        studentId: e.studentId,
        studentName: name,
        enrolledAt: e.enrolledAt,
        status: e.status,
        progressPercent,
        completedLessons,
        totalLessons,
      };
    });

    const completionRatePercent = course.enrollments.length > 0
      ? Math.round((completedEnrollments / course.enrollments.length) * 100)
      : 0;
    const averageProgressPercent = course.enrollments.length > 0
      ? Math.round(sumProgress / course.enrollments.length)
      : 0;

    return apiSuccess({
      course: {
        id: course.id,
        title: course.title,
        status: course.status,
        price: course.price,
        rating: course.rating,
        reviewCount: course.reviewCount,
        enrollmentCount: course.enrollmentCount,
      },
      analytics: {
        totalEnrollments: course.enrollments.length,
        completedEnrollments,
        completionRatePercent,
        averageProgressPercent,
        totalLessons,
      },
      students: studentBreakdown,
      reviews: course.reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        review: r.review,
        createdAt: r.createdAt,
        studentName: r.student.profile ? `${r.student.profile.firstName} ${r.student.profile.lastName}` : "Student",
      })),
    });
  } catch (error: any) {
    console.error("[GET /api/teacher/courses/[id]/analytics error]:", error);
    return apiError("Failed to fetch course analytics.", 500);
  }
}
