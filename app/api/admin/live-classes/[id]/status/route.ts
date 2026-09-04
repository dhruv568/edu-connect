import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions/permission-engine";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { AdminService } from "@/services/admin-service";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await requirePermission("live_classes.cancel");
    const body = await request.json();
    const { action, reason } = body;

    if (action === "CANCEL") {
      if (!reason) {
        return apiError("VALIDATION_ERROR: Cancellation reason is required.", 400);
      }
      const updatedSlot = await AdminService.cancelLiveClass(userId, params.id, reason);
      return apiSuccess({ message: "Live class slot cancelled by administrator.", slot: updatedSlot });
    }

    return apiError(`VALIDATION_ERROR: Unsupported action '${action}'.`, 400);
  } catch (error: any) {
    return handleApiError(error);
  }
}
