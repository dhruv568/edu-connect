import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { saveBannerImage } from "@/lib/banners/banner-storage";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/banners/upload
 * Admin file upload for promotional banner images.
 */
export async function POST(request: NextRequest) {
  try {
    await requireRole(["ADMIN", "STAFF"]);

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return apiError("No image file provided in form data", 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const bannerUrl = await saveBannerImage(
      buffer,
      file.name || "banner.jpg",
      file.type || "image/jpeg"
    );

    return apiSuccess(
      {
        message: "Banner image uploaded successfully",
        url: bannerUrl,
        fileName: file.name,
        size: buffer.length,
      },
      201
    );
  } catch (error: any) {
    return handleApiError(error);
  }
}
