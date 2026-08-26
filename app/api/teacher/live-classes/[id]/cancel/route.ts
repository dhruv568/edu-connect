import { NextRequest } from "next/server";
import { LiveClassService } from "@/services/live-class-service";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["TEACHER"]);
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const slot = await LiveClassService.cancelLiveClass(session.userId, id, body.reason);
    return apiSuccess({ message: "Live class cancelled!", slot });
  } catch (error: any) {
    return handleApiError(error);
  }
}
