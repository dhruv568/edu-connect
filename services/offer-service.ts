import { prisma } from "@/lib/prisma";
import { fromPaise, toPaise } from "@/lib/currency";

export interface OfferValidationResult {
  isValid: boolean;
  offerId: string;
  code: string;
  title: string;
  description: string | null;
  discountText: string | null;
  discountType: string; // "PERCENTAGE" | "FIXED"
  discountValue: number;
  originalAmountPaise: number;
  originalAmountRupees: number;
  discountAmountPaise: number;
  discountAmountRupees: number;
  finalAmountPaise: number;
  finalAmountRupees: number;
  isFree: boolean;
  summaryText: string;
}

export class OfferService {
  /**
   * Find an offer dynamically by code (case-insensitive, trims whitespace, handles 90OFF/900FF variants and legacy offers)
   */
  static async findOfferByCode(rawCode: string) {
    if (!rawCode) return null;
    const cleanCode = rawCode.trim().toUpperCase();
    if (!cleanCode) return null;

    const candidates = new Set<string>();
    candidates.add(cleanCode);

    // Common typo substitutions (e.g. 90OFF <-> 900FF)
    if (cleanCode.includes("90OFF")) {
      candidates.add(cleanCode.replace(/90OFF/g, "900FF"));
    }
    if (cleanCode.includes("900FF")) {
      candidates.add(cleanCode.replace(/900FF/g, "90OFF"));
    }
    if (cleanCode.includes("0FF")) {
      candidates.add(cleanCode.replace(/0FF/g, "OFF"));
    }
    if (cleanCode.includes("OFF")) {
      candidates.add(cleanCode.replace(/OFF/g, "0FF"));
    }
    candidates.add(cleanCode.replace(/O/g, "0"));
    candidates.add(cleanCode.replace(/0/g, "O"));

    const candidateList = Array.from(candidates);

    // 1. Direct code match (case-insensitive across candidates)
    let offer = await prisma.offer.findFirst({
      where: {
        code: {
          in: candidateList,
          mode: "insensitive",
        },
      },
    });

    if (offer) return offer;

    // 2. Fallback: match inside discountText or title
    offer = await prisma.offer.findFirst({
      where: {
        OR: candidateList.flatMap((cand) => [
          { discountText: { contains: cand, mode: "insensitive" } },
          { title: { contains: cand, mode: "insensitive" } },
        ]),
      },
      orderBy: { createdAt: "desc" },
    });

    return offer;
  }

  /**
   * Parse effective discount type and value from offer, with fallback extraction from discountText
   */
  static parseOfferDiscount(offer: any): { discountType: string; discountValue: number } {
    let discountType = offer.discountType || "PERCENTAGE";
    let discountValue = Number(offer.discountValue || 0);

    if (discountValue <= 0 && offer.discountText) {
      const text = String(offer.discountText).toUpperCase();
      // Match "90% OFF" or "90OFF" or "900FF" or "FLAT 90%" or "FLAT 40"
      const percentMatch =
        text.match(/(\d{1,3})\s*(?:%|OFF|PERCENT)/i) ||
        text.match(/FLAT\s*(\d{1,3})/i) ||
        text.match(/(?:CODE|USE)?\s*(\d{1,3})(?:OFF|0FF)/i);

      if (percentMatch && percentMatch[1]) {
        discountType = "PERCENTAGE";
        discountValue = Math.min(100, Math.max(1, parseInt(percentMatch[1], 10)));
      } else {
        const flatRupeesMatch = text.match(/₹\s*(\d+)/i) || text.match(/RS\.?\s*(\d+)/i);
        if (flatRupeesMatch && flatRupeesMatch[1]) {
          discountType = "FIXED";
          discountValue = parseInt(flatRupeesMatch[1], 10);
        }
      }
    }

    return { discountType, discountValue };
  }

  /**
   * Validate offer code and calculate exact discount amounts
   */
  static async validateOfferCode(
    rawCode: string,
    originalAmountPaise: number,
    options?: {
      targetAudience?: string;
      userId?: string;
      courseId?: string;
      liveClassSlotId?: string;
    }
  ): Promise<OfferValidationResult> {
    if (!rawCode || !rawCode.trim()) {
      throw new Error("BAD_REQUEST: Offer code cannot be empty.");
    }

    if (originalAmountPaise < 0) {
      throw new Error("BAD_REQUEST: Invalid order amount.");
    }

    const offer = await this.findOfferByCode(rawCode);

    if (!offer) {
      throw new Error(`NOT_FOUND: Offer code "${rawCode.trim()}" is invalid or does not exist.`);
    }

    // Check Active Status
    if (!offer.isActive) {
      throw new Error("OFFER_INACTIVE: This offer is currently inactive.");
    }

    const now = new Date();

    // Check Start Date
    if (offer.startDate && new Date(offer.startDate) > now) {
      throw new Error("OFFER_NOT_STARTED: This offer has not started yet.");
    }

    // Check End Date
    if (offer.endDate && new Date(offer.endDate) < now) {
      throw new Error("OFFER_EXPIRED: This offer has expired.");
    }

    // Check Usage Limit
    if (offer.usageLimit !== null && offer.usageLimit !== undefined && offer.usageLimit > 0) {
      if (offer.usedCount >= offer.usageLimit) {
        throw new Error("USAGE_LIMIT_EXCEEDED: This offer code has reached its maximum redemption limit.");
      }
    }

    const originalAmountRupees = fromPaise(originalAmountPaise);

    // Check Minimum Order Amount
    if (offer.minOrderAmount && originalAmountRupees < offer.minOrderAmount) {
      throw new Error(`MIN_PURCHASE_NOT_MET: Minimum order amount of ₹${offer.minOrderAmount} required for this offer.`);
    }

    // Check Target Audience if specified
    if (options?.targetAudience && offer.targetAudience !== "ALL") {
      if (offer.targetAudience !== options.targetAudience) {
        throw new Error("AUDIENCE_RESTRICTION: This offer is not applicable for your account type.");
      }
    }

    // Calculate Discount
    const { discountType, discountValue } = this.parseOfferDiscount(offer);

    let discountAmountPaise = 0;

    if (discountType === "PERCENTAGE") {
      discountAmountPaise = Math.round((originalAmountPaise * discountValue) / 100);
      if (offer.maxDiscount && offer.maxDiscount > 0) {
        discountAmountPaise = Math.min(discountAmountPaise, toPaise(offer.maxDiscount));
      }
    } else {
      // FIXED discount
      discountAmountPaise = Math.min(toPaise(discountValue), originalAmountPaise);
    }

    discountAmountPaise = Math.max(0, Math.min(discountAmountPaise, originalAmountPaise));
    const finalAmountPaise = Math.max(0, originalAmountPaise - discountAmountPaise);
    const discountAmountRupees = fromPaise(discountAmountPaise);
    const finalAmountRupees = fromPaise(finalAmountPaise);
    const isFree = finalAmountPaise === 0;

    const summaryText =
      discountType === "PERCENTAGE"
        ? `${discountValue}% OFF applied (-₹${discountAmountRupees.toFixed(2)})`
        : `₹${discountAmountRupees.toFixed(2)} FLAT OFF applied`;

    return {
      isValid: true,
      offerId: offer.id,
      code: offer.code || rawCode.trim().toUpperCase(),
      title: offer.title,
      description: offer.description,
      discountText: offer.discountText,
      discountType,
      discountValue,
      originalAmountPaise,
      originalAmountRupees,
      discountAmountPaise,
      discountAmountRupees,
      finalAmountPaise,
      finalAmountRupees,
      isFree,
      summaryText,
    };
  }

  /**
   * Atomically increment the usedCount of an offer when payment is captured
   */
  static async incrementOfferUsage(offerId: string) {
    if (!offerId) return;
    try {
      await prisma.offer.update({
        where: { id: offerId },
        data: {
          usedCount: { increment: 1 },
        },
      });
    } catch (err) {
      console.warn(`Failed to increment usage for offer ${offerId}:`, err);
    }
  }
}
