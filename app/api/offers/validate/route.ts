import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { OfferService } from "@/services/offer-service";
import { toPaise } from "@/lib/currency";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, courseId, liveClassSlotId, type, amountPaise } = body;

    if (!code || typeof code !== "string" || !code.trim()) {
      return handleApiError(new Error("BAD_REQUEST: Offer code is required."));
    }

    let baseAmountPaise = 0;

    // Resolve accurate server-side base amount if product IDs are passed
    if (courseId) {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { price: true, status: true },
      });
      if (!course) {
        return handleApiError(new Error("NOT_FOUND: Course not found."));
      }
      baseAmountPaise = toPaise(course.price);
    } else if (liveClassSlotId) {
      const slot = await prisma.liveClassSlot.findUnique({
        where: { id: liveClassSlotId },
        select: { price: true, status: true },
      });
      if (!slot) {
        return handleApiError(new Error("NOT_FOUND: Live class slot not found."));
      }
      baseAmountPaise = toPaise(slot.price);
    } else if (amountPaise && typeof amountPaise === "number") {
      baseAmountPaise = Math.max(0, Math.round(amountPaise));
    }

    if (baseAmountPaise <= 0) {
      return handleApiError(
        new Error("BAD_REQUEST: Cannot apply offer to a free or zero-amount item.")
      );
    }

    const validationResult = await OfferService.validateOfferCode(
      code,
      baseAmountPaise,
      {
        courseId,
        liveClassSlotId,
        targetAudience: "LEARNERS",
      }
    );

    return apiSuccess(validationResult);
  } catch (error: any) {
    return handleApiError(error);
  }
}
