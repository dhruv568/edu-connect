import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

/**
 * Public Endpoint: Returns active, currently scheduled banners matching the website placement.
 * Sanitized to only expose public presentation fields.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedPlacement = searchParams.get("placement")?.toUpperCase(); // "MAIN" | "LEARNERS" | "EDUCATORS"

    const now = new Date();

    const allowedPlacements = ["ALL"];
    if (requestedPlacement && ["MAIN", "LEARNERS", "EDUCATORS"].includes(requestedPlacement)) {
      allowedPlacements.push(requestedPlacement);
    }

    const banners = await prisma.promotionalBanner.findMany({
      where: {
        isActive: true,
        placement: {
          in: allowedPlacements,
        },
        OR: [
          { startAt: null },
          { startAt: { lte: now } },
        ],
        AND: [
          {
            OR: [
              { endAt: null },
              { endAt: { gte: now } },
            ],
          },
        ],
      },
      orderBy: [
        { displayOrder: "asc" },
        { createdAt: "desc" },
      ],
      select: {
        id: true,
        title: true,
        subtitle: true,
        description: true,
        bannerType: true,
        imageUrl: true,
        imageClickUrl: true,
        imageClickTarget: true,
        ctaText: true,
        ctaUrl: true,
        placement: true,
        displayOrder: true,
      },
    });

    return apiSuccess({
      banners,
      count: banners.length,
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
