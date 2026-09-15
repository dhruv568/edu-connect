import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// GET: List all subjects for Admin
export async function GET(request: NextRequest) {
  try {
    await requireRole(["ADMIN", "STAFF"]);

    const subjects = await prisma.courseCategory.findMany({
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess({ subjects });
  } catch (error: any) {
    return handleApiError(error);
  }
}

// POST: Add new subject
export async function POST(request: NextRequest) {
  try {
    await requireRole(["ADMIN"]);
    const body = await request.json();

    const name = body.name?.trim();
    if (!name) {
      return NextResponse.json(
        { success: false, error: "Subject name is required." },
        { status: 400 }
      );
    }

    const slug = body.slug?.trim() ? slugify(body.slug) : slugify(name);
    const description = body.description?.trim() || null;
    const isActive = body.isActive !== undefined ? Boolean(body.isActive) : true;

    // Check duplicate
    const existing = await prisma.courseCategory.findFirst({
      where: {
        OR: [{ name: { equals: name, mode: "insensitive" } }, { slug }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "A subject with this name or slug already exists." },
        { status: 400 }
      );
    }

    const newSubject = await prisma.courseCategory.create({
      data: {
        name,
        slug,
        description,
        isActive,
      },
    });

    return apiSuccess({ subject: newSubject }, 201);
  } catch (error: any) {
    return handleApiError(error);
  }
}

// PUT: Edit existing subject
export async function PUT(request: NextRequest) {
  try {
    await requireRole(["ADMIN"]);
    const body = await request.json();
    const { id, name, description, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Subject ID is required." },
        { status: 400 }
      );
    }

    const trimmedName = name?.trim();
    if (!trimmedName) {
      return NextResponse.json(
        { success: false, error: "Subject name is required." },
        { status: 400 }
      );
    }

    const updated = await prisma.courseCategory.update({
      where: { id },
      data: {
        name: trimmedName,
        slug: slugify(trimmedName),
        description: description?.trim() || null,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
    });

    return apiSuccess({ subject: updated });
  } catch (error: any) {
    return handleApiError(error);
  }
}

// PATCH: Toggle enable / disable subject
export async function PATCH(request: NextRequest) {
  try {
    await requireRole(["ADMIN", "STAFF"]);
    const body = await request.json();
    const { id, isActive } = body;

    if (!id || typeof isActive !== "boolean") {
      return NextResponse.json(
        { success: false, error: "Subject ID and isActive status are required." },
        { status: 400 }
      );
    }

    const updated = await prisma.courseCategory.update({
      where: { id },
      data: { isActive },
    });

    return apiSuccess({ subject: updated });
  } catch (error: any) {
    return handleApiError(error);
  }
}
