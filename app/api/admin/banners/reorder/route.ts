import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

interface ReorderItem {
  id: string;
  displayOrder: number;
}

/**
 * POST /api/admin/banners/reorder
 * Batch update displayOrder for an array of banners.
 */
export async function POST(request: NextRequest) {
  try {
    await requireRole(["ADMIN", "STAFF"]);
    const body = await request.json();

    if (!Array.isArray(body.items)) {
      return apiError("Expected 'items' array of { id, displayOrder }", 400);
    }

    const items: ReorderItem[] = body.items;

    // Validate entries
    for (const item of items) {
      if (!item.id || typeof item.id !== "string" || typeof item.displayOrder !== "number") {
        return apiError("Each item must have a valid string id and numeric displayOrder", 400);
      }
    }

    // Execute in transaction
    await prisma.$transaction(
      items.map((item) =>
        prisma.promotionalBanner.update({
          where: { id: item.id },
          data: { displayOrder: Math.max(0, Math.floor(item.displayOrder)) },
        })
      )
    );

    return apiSuccess({ updatedCount: items.length });
  } catch (error: any) {
    return handleApiError(error);
  }
}
