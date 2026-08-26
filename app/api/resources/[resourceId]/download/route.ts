import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

const RESOURCES_DIR = path.join(process.cwd(), "storage", "resources");

export async function GET(request: NextRequest, { params }: { params: { resourceId: string } }) {
  try {
    const resource = await prisma.courseResource.findUnique({
      where: { id: params.resourceId },
      include: {
        lesson: {
          include: {
            section: { include: { course: true } },
          },
        },
      },
    });

    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const currentUserId = session.userId || session.id;
    const courseId = resource.lesson.section.courseId;
    const isTeacher = resource.lesson.section.course.teacherId === currentUserId;
    const isAdmin = session.role === "ADMIN";

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: currentUserId,
          courseId,
        },
      },
    });

    const isEnrolled = enrollment && (enrollment.status === "ACTIVE" || enrollment.status === "COMPLETED");

    if (!isTeacher && !isAdmin && !isEnrolled && !resource.lesson.isPreview) {
      return NextResponse.json({ error: "Enrollment required to download resource" }, { status: 403 });
    }

    const filePath = path.join(RESOURCES_DIR, path.basename(resource.storageKey));
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found on storage" }, { status: 404 });
    }

    const buffer = await fs.promises.readFile(filePath);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": resource.mimeType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(resource.name)}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to download resource" }, { status: 500 });
  }
}
