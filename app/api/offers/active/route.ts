import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedAudience = searchParams.get("audience")?.toUpperCase(); // "MAIN" | "LEARNERS" | "EDUCATORS" | null

    const now = new Date();

    // Query active offers within valid date window
    const activeOffers = await prisma.offer.findMany({
      where: {
        isActive: true,
        OR: [
          { startDate: null },
          { startDate: { lte: now } },
        ],
        AND: [
          {
            OR: [
              { endDate: null },
              { endDate: { gte: now } },
            ],
          },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    // Filter by audience: "ALL" matches everywhere, or specific audience match
    const matchingOffer = activeOffers.find((offer) => {
      if (offer.targetAudience === "ALL") return true;
      if (requestedAudience && offer.targetAudience === requestedAudience) return true;
      return false;
    });

    return apiSuccess({
      offer: matchingOffer || null,
      activeCount: activeOffers.length,
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
