import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { validateBannerPayload } from "@/lib/banners/validation";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/banners
 * List all promotional banners with status metrics.
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(["ADMIN", "STAFF"]);

    const banners = await prisma.promotionalBanner.findMany({
      orderBy: [
        { displayOrder: "asc" },
        { createdAt: "desc" },
      ],
    });

    const now = new Date();
    const stats = {
      total: banners.length,
      active: banners.filter((b) => {
        if (!b.isActive) return false;
        if (b.startAt && new Date(b.startAt) > now) return false;
        if (b.endAt && new Date(b.endAt) < now) return false;
        return true;
      }).length,
      scheduled: banners.filter(
        (b) => b.isActive && b.startAt && new Date(b.startAt) > now
      ).length,
      expired: banners.filter(
        (b) => b.endAt && new Date(b.endAt) < now
      ).length,
      inactive: banners.filter((b) => !b.isActive).length,
    };

    return apiSuccess({ banners, stats });
  } catch (error: any) {
    return handleApiError(error);
  }
}

/**
 * POST /api/admin/banners
 * Create a new promotional banner.
 */
export async function POST(request: NextRequest) {
  try {
    await requireRole(["ADMIN"]);
    const body = await request.json();

    const validation = validateBannerPayload(body);
    if (!validation.isValid || !validation.data) {
      return apiError(validation.error || "Validation failed", 400);
    }

    const {
      title,
      subtitle,
      description,
      bannerType,
      imageUrl,
      imageClickUrl,
      imageClickTarget,
      ctaText,
      ctaUrl,
      placement,
      displayOrder,
      startAt,
      endAt,
      isActive,
    } = validation.data;

    const banner = await prisma.promotionalBanner.create({
      data: {
        title,
        subtitle,
        description,
        bannerType,
        imageUrl,
        imageClickUrl,
        imageClickTarget,
        ctaText,
        ctaUrl,
        placement,
        displayOrder,
        startAt,
        endAt,
        isActive,
      },
    });

    return apiSuccess({ banner }, 201);
  } catch (error: any) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/admin/banners
 * Update an existing promotional banner.
 */
export async function PUT(request: NextRequest) {
  try {
    await requireRole(["ADMIN"]);
    const body = await request.json();

    if (!body?.id || typeof body.id !== "string") {
      return apiError("Banner ID is required for update", 400);
    }

    const existing = await prisma.promotionalBanner.findUnique({
      where: { id: body.id },
    });
    if (!existing) {
      return apiError("Banner not found", 404);
    }

    const validation = validateBannerPayload(body);
    if (!validation.isValid || !validation.data) {
      return apiError(validation.error || "Validation failed", 400);
    }

    const {
      title,
      subtitle,
      description,
      bannerType,
      imageUrl,
      imageClickUrl,
      imageClickTarget,
      ctaText,
      ctaUrl,
      placement,
      displayOrder,
      startAt,
      endAt,
      isActive,
    } = validation.data;

    const updated = await prisma.promotionalBanner.update({
      where: { id: body.id },
      data: {
        title,
        subtitle,
        description,
        bannerType,
        imageUrl,
        imageClickUrl,
        imageClickTarget,
        ctaText,
        ctaUrl,
        placement,
        displayOrder,
        startAt,
        endAt,
        isActive,
      },
    });

    return apiSuccess({ banner: updated });
  } catch (error: any) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/admin/banners
 * Fast status toggle or partial banner update.
 */
export async function PATCH(request: NextRequest) {
  try {
    await requireRole(["ADMIN", "STAFF"]);
    const body = await request.json();

    if (!body?.id || typeof body.id !== "string") {
      return apiError("Banner ID is required", 400);
    }

    const existing = await prisma.promotionalBanner.findUnique({
      where: { id: body.id },
    });
    if (!existing) {
      return apiError("Banner not found", 404);
    }

    const updateData: any = {};

    if (body.isActive !== undefined) {
      updateData.isActive = Boolean(body.isActive);
    }

    if (typeof body.displayOrder === "number") {
      updateData.displayOrder = Math.max(0, Math.floor(body.displayOrder));
    }

    const updated = await prisma.promotionalBanner.update({
      where: { id: body.id },
      data: updateData,
    });

    return apiSuccess({ banner: updated });
  } catch (error: any) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/admin/banners?id=...
 * Delete a promotional banner.
 */
export async function DELETE(request: NextRequest) {
  try {
    await requireRole(["ADMIN"]);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return apiError("Banner ID is required", 400);
    }

    const existing = await prisma.promotionalBanner.findUnique({
      where: { id },
    });
    if (!existing) {
      return apiError("Banner not found", 404);
    }

    await prisma.promotionalBanner.delete({
      where: { id },
    });

    return apiSuccess({ deleted: true, id });
  } catch (error: any) {
    return handleApiError(error);
  }
}
