export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import path from "path";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { saveAvatarFile } from "@/lib/lms-storage";
import { apiSuccess, apiError, apiUnauthorized, handleApiError } from "@/lib/api-response";
import { logAuditEvent } from "@/lib/audit-logger";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return apiUnauthorized("You must be logged in to upload a profile photo.");
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: { profile: true },
    });

    if (!user || user.status !== "ACTIVE") {
      return apiUnauthorized("User account inactive or not found.");
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return apiError("No image file provided. Please select an image to upload.", 400);
    }

    // 1. Validate File Size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return apiError(
        `Image size exceeds maximum limit of 5MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
        400
      );
    }

    // 2. Validate MIME Type
    const cleanMime = (file.type || "").split(";")[0].trim().toLowerCase();
    if (!ALLOWED_MIME_TYPES.includes(cleanMime)) {
      return apiError(
        `Invalid file type '${cleanMime || "unknown"}'. Only JPG, JPEG, PNG, and WebP images are allowed.`,
        400
      );
    }

    // 3. Validate File Extension
    const ext = path.extname(file.name || "").toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return apiError(
        `Invalid file extension '${ext || "none"}'. Only .jpg, .jpeg, .png, and .webp files are allowed.`,
        400
      );
    }

    // Read and save buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const avatarUrl = await saveAvatarFile(buffer, file.name, cleanMime);

    // Update Profile record
    await prisma.profile.upsert({
      where: { userId: session.id },
      create: {
        userId: session.id,
        firstName: session.firstName || "",
        lastName: session.lastName || "",
        avatarUrl,
      },
      update: {
        avatarUrl,
      },
    });

    await logAuditEvent(session.id, "PROFILE_PHOTO_UPLOADED", {
      userId: session.id,
      avatarUrl,
    });

    return apiSuccess(
      {
        avatarUrl,
        message: "Profile photo updated successfully.",
      },
      200
    );
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function DELETE() {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return apiUnauthorized("You must be logged in to remove your profile photo.");
    }

    await prisma.profile.update({
      where: { userId: session.id },
      data: { avatarUrl: null },
    });

    await logAuditEvent(session.id, "PROFILE_PHOTO_REMOVED", {
      userId: session.id,
    });

    return apiSuccess(
      {
        avatarUrl: null,
        message: "Profile photo removed successfully.",
      },
      200
    );
  } catch (error: any) {
    return handleApiError(error);
  }
}
