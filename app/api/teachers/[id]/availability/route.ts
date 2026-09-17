import { NextRequest } from "next/server";
import { LiveClassService } from "@/services/live-class-service";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teacherId = params.id;
    const { searchParams } = new URL(request.url);
    const daysAhead = parseInt(searchParams.get("days") || "14", 10);

    const data = await LiveClassService.getPublicEducatorAvailability(teacherId, daysAhead);
    return apiSuccess(data);
  } catch (error: any) {
    return handleApiError(error);
  }
}
