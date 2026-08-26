import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { AdminService } from "@/services/admin-service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireRole(["ADMIN"]);
    const categories = await AdminService.getCategories();
    return apiSuccess({ categories });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireRole(["ADMIN"]);
    const body = await request.json();

    const category = await AdminService.createCategory(admin.userId, body);
    return apiSuccess({ message: "Category created successfully.", category });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireRole(["ADMIN"]);
    const body = await request.json();
    const { id, isActive } = body;

    const updated = await AdminService.toggleCategoryActive(admin.userId, id, isActive);
    return apiSuccess({ message: "Category status updated.", category: updated });
  } catch (error: any) {
    return handleApiError(error);
  }
}
