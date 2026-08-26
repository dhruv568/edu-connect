import { NextRequest } from "next/server";
import { LiveClassService } from "@/services/live-class-service";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["TEACHER"]);
    const { id } = await params;

    const slot = await LiveClassService.getLiveClassDetails(session.userId, id);
    return apiSuccess({ slot });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["TEACHER"]);
    const { id } = await params;
    const body = await request.json();

    const slot = await LiveClassService.updateLiveClass(session.userId, id, body);
    return apiSuccess({ message: "Live class updated successfully!", slot });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["TEACHER"]);
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const reason = searchParams.get("reason") || undefined;

    const slot = await LiveClassService.cancelLiveClass(session.userId, id, reason);
    return apiSuccess({ message: "Live class cancelled successfully!", slot });
  } catch (error: any) {
    return handleApiError(error);
  }
}
