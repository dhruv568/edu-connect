import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

// GET: List all offers with summary statistics
export async function GET(request: NextRequest) {
  try {
    await requireRole(["ADMIN", "STAFF"]);

    const offers = await prisma.offer.findMany({
      orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    });

    const now = new Date();
    const stats = {
      total: offers.length,
      active: offers.filter((o) => {
        if (!o.isActive) return false;
        if (o.startDate && new Date(o.startDate) > now) return false;
        if (o.endDate && new Date(o.endDate) < now) return false;
        return true;
      }).length,
      scheduled: offers.filter(
        (o) => o.isActive && o.startDate && new Date(o.startDate) > now
      ).length,
      expired: offers.filter(
        (o) => o.endDate && new Date(o.endDate) < now
      ).length,
    };

    return apiSuccess({ offers, stats });
  } catch (error: any) {
    return handleApiError(error);
  }
}

// POST: Create a new offer
export async function POST(request: NextRequest) {
  try {
    await requireRole(["ADMIN"]);
    const body = await request.json();

    const title = body.title?.trim();
    if (!title) {
      return NextResponse.json(
        { success: false, error: "Offer title is required." },
        { status: 400 }
      );
    }

    const description = body.description?.trim() || null;
    const discountText = body.discountText?.trim() || null;
    const code = body.code?.trim()?.toUpperCase() || null;
    const discountType = body.discountType?.trim()?.toUpperCase() === "FIXED" ? "FIXED" : "PERCENTAGE";
    const discountValue = body.discountValue !== undefined && body.discountValue !== null ? Number(body.discountValue) : 0;
    const minOrderAmount = body.minOrderAmount ? Number(body.minOrderAmount) : null;
    const maxDiscount = body.maxDiscount ? Number(body.maxDiscount) : null;
    const usageLimit = body.usageLimit ? parseInt(body.usageLimit, 10) : null;
    const ctaText = body.ctaText?.trim() || "Explore Now";
    const ctaLink = body.ctaLink?.trim() || "/courses";
    const targetAudience = body.targetAudience?.trim() || "ALL"; // ALL | MAIN | LEARNERS | EDUCATORS
    const isActive = body.isActive !== undefined ? Boolean(body.isActive) : true;

    if (code) {
      const existingWithCode = await prisma.offer.findUnique({
        where: { code },
      });
      if (existingWithCode) {
        return NextResponse.json(
          { success: false, error: `An offer with code "${code}" already exists.` },
          { status: 400 }
        );
      }
    }

    const startDate = body.startDate ? new Date(body.startDate) : null;
    const endDate = body.endDate ? new Date(body.endDate) : null;

    if (startDate && isNaN(startDate.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid start date format." },
        { status: 400 }
      );
    }

    if (endDate && isNaN(endDate.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid end date format." },
        { status: 400 }
      );
    }

    if (startDate && endDate && startDate > endDate) {
      return NextResponse.json(
        { success: false, error: "Start date cannot be after end date." },
        { status: 400 }
      );
    }

    const newOffer = await prisma.offer.create({
      data: {
        title,
        description,
        discountText,
        code,
        discountType,
        discountValue,
        minOrderAmount,
        maxDiscount,
        usageLimit,
        ctaText,
        ctaLink,
        startDate,
        endDate,
        isActive,
        targetAudience,
      },
    });

    return apiSuccess({ offer: newOffer }, 201);
  } catch (error: any) {
    return handleApiError(error);
  }
}

// PUT: Edit existing offer
export async function PUT(request: NextRequest) {
  try {
    await requireRole(["ADMIN"]);
    const body = await request.json();
    const {
      id,
      title,
      description,
      discountText,
      code,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      ctaText,
      ctaLink,
      startDate,
      endDate,
      isActive,
      targetAudience,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Offer ID is required." },
        { status: 400 }
      );
    }

    const trimmedTitle = title?.trim();
    if (!trimmedTitle) {
      return NextResponse.json(
        { success: false, error: "Offer title is required." },
        { status: 400 }
      );
    }

    const trimmedCode = code?.trim()?.toUpperCase() || null;
    if (trimmedCode) {
      const existingWithCode = await prisma.offer.findFirst({
        where: { code: trimmedCode, NOT: { id } },
      });
      if (existingWithCode) {
        return NextResponse.json(
          { success: false, error: `An offer with code "${trimmedCode}" already exists.` },
          { status: 400 }
        );
      }
    }

    const parsedStartDate = startDate ? new Date(startDate) : null;
    const parsedEndDate = endDate ? new Date(endDate) : null;

    if (parsedStartDate && isNaN(parsedStartDate.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid start date format." },
        { status: 400 }
      );
    }

    if (parsedEndDate && isNaN(parsedEndDate.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid end date format." },
        { status: 400 }
      );
    }

    if (parsedStartDate && parsedEndDate && parsedStartDate > parsedEndDate) {
      return NextResponse.json(
        { success: false, error: "Start date cannot be after end date." },
        { status: 400 }
      );
    }

    const updated = await prisma.offer.update({
      where: { id },
      data: {
        title: trimmedTitle,
        description: description?.trim() || null,
        discountText: discountText?.trim() || null,
        code: trimmedCode,
        discountType: discountType?.trim()?.toUpperCase() === "FIXED" ? "FIXED" : "PERCENTAGE",
        discountValue: discountValue !== undefined && discountValue !== null ? Number(discountValue) : 0,
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : null,
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
        ctaText: ctaText?.trim() || "Explore Now",
        ctaLink: ctaLink?.trim() || "/courses",
        targetAudience: targetAudience?.trim() || "ALL",
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
    });

    return apiSuccess({ offer: updated });
  } catch (error: any) {
    return handleApiError(error);
  }
}

// PATCH: Toggle active state of offer
export async function PATCH(request: NextRequest) {
  try {
    await requireRole(["ADMIN", "STAFF"]);
    const body = await request.json();
    const { id, isActive } = body;

    if (!id || typeof isActive !== "boolean") {
      return NextResponse.json(
        { success: false, error: "Offer ID and isActive boolean are required." },
        { status: 400 }
      );
    }

    const updated = await prisma.offer.update({
      where: { id },
      data: { isActive },
    });

    return apiSuccess({ offer: updated });
  } catch (error: any) {
    return handleApiError(error);
  }
}

// DELETE: Delete an offer
export async function DELETE(request: NextRequest) {
  try {
    await requireRole(["ADMIN"]);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Offer ID is required." },
        { status: 400 }
      );
    }

    await prisma.offer.delete({
      where: { id },
    });

    return apiSuccess({ deleted: true });
  } catch (error: any) {
    return handleApiError(error);
  }
}
