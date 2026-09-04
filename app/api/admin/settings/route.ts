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

    const updatedSettings = await AdminService.updatePlatformSettings(userId, body);
    return apiSuccess({ message: "Platform settings updated successfully.", settings: updatedSettings });
  } catch (error: any) {
    return handleApiError(error);
  }
}
