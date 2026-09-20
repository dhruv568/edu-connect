import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions/permission-engine";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { AdminService } from "@/services/admin-service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requirePermission("settings.view");
    const settings = await AdminService.getPlatformSettings();
    return apiSuccess(settings);
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await requirePermission("settings.manage");
    const body = await request.json();

    const socialKeys = [
      "social_youtube_url",
      "social_facebook_url",
      "social_instagram_url",
      "social_linkedin_url",
      "social_whatsapp_url",
    ];

    if (body.social_whatsapp_url && typeof body.social_whatsapp_url === "string") {
      const trimmed = body.social_whatsapp_url.trim();
      if (trimmed && !trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
        if (/^[0-9+\s\-()]+$/.test(trimmed)) {
          body.social_whatsapp_url = `https://wa.me/${trimmed.replace(/[^0-9]/g, "")}`;
        } else if (trimmed.startsWith("wa.me/")) {
          body.social_whatsapp_url = `https://${trimmed}`;
        }
      }
    }

    for (const key of socialKeys) {
      if (body[key] !== undefined && typeof body[key] === "string" && body[key].trim() !== "") {
        try {
          const parsed = new URL(body[key].trim());
          if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
            throw new Error();
          }
        } catch {
          return handleApiError(
            new Error(`VALIDATION_ERROR: ${key} must be a valid URL starting with http:// or https://`)
          );
        }
      }
    }

    const updatedSettings = await AdminService.updatePlatformSettings(userId, body);
    return apiSuccess({ message: "Platform settings updated successfully.", settings: updatedSettings });
  } catch (error: any) {
    return handleApiError(error);
  }
}
