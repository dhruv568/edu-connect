import { NextRequest } from "next/server";
import { LiveClassService } from "@/services/live-class-service";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(["TEACHER"]);
    const data = await LiveClassService.getTeacherAvailability(session.userId);
    return apiSuccess(data);
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireRole(["TEACHER"]);
    const body = await request.json();

    const updated = await LiveClassService.updateTeacherAvailability(session.userId, body);
    return apiSuccess({
      message: "Availability updated successfully!",
      ...updated,
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(["TEACHER"]);
    const body = await request.json();

    if (body.action === "BLOCK_SLOT") {
      const blocked = await LiveClassService.blockSlot(session.userId, body);
      return apiSuccess({ message: "Slot blocked successfully!", blocked });
    } else if (body.action === "UNBLOCK_SLOT") {
      const unblocked = await LiveClassService.unblockSlot(session.userId, body);
      return apiSuccess({ message: "Slot unblocked successfully!", unblocked });
    } else {
      const override = await LiveClassService.addDateOverride(session.userId, body);
      return apiSuccess({ message: "Date availability updated successfully!", override });
    }
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireRole(["TEACHER"]);
    const { searchParams } = new URL(request.url);
    const overrideId = searchParams.get("overrideId");
    const slotId = searchParams.get("slotId");

    if (overrideId) {
      await LiveClassService.deleteDateOverride(session.userId, overrideId);
    } else if (slotId) {
      await LiveClassService.unblockSlot(session.userId, { slotId });
    }

    return apiSuccess({ message: "Override removed successfully!" });
  } catch (error: any) {
    return handleApiError(error);
  }
}
