import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { AdminService } from "@/services/admin-service";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireRole(["ADMIN"]);
    const body = await request.json();
    const { action, reason } = body;

    if (action === "CANCEL") {
      if (!reason) {
        return apiError("VALIDATION_ERROR: Cancellation reason is required.", 400);
      }
      const updatedSlot = await AdminService.cancelLiveClass(admin.userId, params.id, reason);
      return apiSuccess({ message: "Live class slot cancelled by administrator.", slot: updatedSlot });
    }

    return apiError(`VALIDATION_ERROR: Unsupported action '${action}'.`, 400);
  } catch (error: any) {
    return handleApiError(error);
  }
}
