import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions/permission-engine";
import { apiError, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { syncFeatureRegistry, PROJECT_FEATURES, PROJECT_PERMISSIONS, ROLE_TEMPLATES } from "@/lib/permissions/registry";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Requires either roles.view or roles.create
    await requirePermission("roles.view");

    // Ensure features and permissions exist in DB
    await syncFeatureRegistry();

    const features = await prisma.feature.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        permissions: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return apiSuccess({
      features,
      rawFeatures: PROJECT_FEATURES,
      rawPermissions: PROJECT_PERMISSIONS,
      templates: ROLE_TEMPLATES,
    });
  } catch (error: any) {
    if (error.message?.startsWith("UNAUTHORIZED")) return apiError(error.message, 401);
    if (error.message?.startsWith("FORBIDDEN")) return apiError(error.message, 403);
    return apiError(error.message || "Failed to fetch features.", 500);
  }
}
