import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions/permission-engine";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { AdminService } from "@/services/admin-service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requirePermission("users.view");
    const userId = params.id;
    const userDetails = await AdminService.getUserDetails(userId);
    return apiSuccess(userDetails);
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id;
    const body = await request.json();

    const { status, reason } = body;
    if (!status || !["ACTIVE", "SUSPENDED", "DEACTIVATED"].includes(status)) {
      return apiError("VALIDATION_ERROR: Target status must be ACTIVE, SUSPENDED, or DEACTIVATED.", 400);
    }

    const requiredPerm = status === "SUSPENDED" || status === "DEACTIVATED" ? "users.suspend" : "users.activate";
    const { userId: adminUserId } = await requirePermission(requiredPerm);

    const updatedUser = await AdminService.updateUserStatus(adminUserId, userId, status, reason);
    return apiSuccess(updatedUser);
  } catch (error: any) {
    return handleApiError(error);
  }
}
