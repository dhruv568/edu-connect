import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { AdminService } from "@/services/admin-service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(["ADMIN"]);
    const userId = params.id;
    const userDetails = await AdminService.getUserDetails(userId);
    return apiSuccess(userDetails);
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireRole(["ADMIN"]);
    const userId = params.id;
    const body = await request.json();

    const { status, reason } = body;
    if (!status || !["ACTIVE", "SUSPENDED", "DEACTIVATED"].includes(status)) {
      return apiError("VALIDATION_ERROR: Target status must be ACTIVE, SUSPENDED, or DEACTIVATED.", 400);
    }

    const updatedUser = await AdminService.updateUserStatus(admin.userId, userId, status, reason);
    return apiSuccess(updatedUser);
  } catch (error: any) {
    return handleApiError(error);
  }
}
