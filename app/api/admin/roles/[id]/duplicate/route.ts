import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions/permission-engine";
import { apiBadRequest, apiError, apiNotFound, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit-logger";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await requirePermission("roles.create");

    const sourceRole = await prisma.role.findUnique({
      where: { id: params.id },
      include: {
        roleFeatures: true,
        rolePermissions: true,
      },
    });

    if (!sourceRole) {
      return apiNotFound("Source role not found.");
    }

    const body = await req.json().catch(() => ({}));
    const newName = body.name?.trim() || `${sourceRole.name} (Copy)`;

    const existing = await prisma.role.findUnique({
      where: { name: newName },
    });

    if (existing) {
      return apiBadRequest(`A role with name "${newName}" already exists.`);
    }

    const cloned = await prisma.$transaction(async (tx) => {
      const created = await tx.role.create({
        data: {
          name: newName,
          description: body.description?.trim() || sourceRole.description,
          status: "ACTIVE",
          isSystem: false,
          createdById: userId,
        },
      });

      if (sourceRole.roleFeatures.length > 0) {
        await tx.roleFeature.createMany({
          data: sourceRole.roleFeatures.map((rf) => ({
            roleId: created.id,
            featureId: rf.featureId,
          })),
        });
      }

      if (sourceRole.rolePermissions.length > 0) {
        await tx.rolePermission.createMany({
          data: sourceRole.rolePermissions.map((rp) => ({
            roleId: created.id,
            permissionId: rp.permissionId,
          })),
        });
      }

      return created;
    });

    await logAuditEvent(userId, "ROLE_DUPLICATED", {
      sourceRoleId: sourceRole.id,
      clonedRoleId: cloned.id,
      newRoleName: cloned.name,
    });

    return apiSuccess({ role: cloned }, "Role duplicated successfully.", 201);
  } catch (error: any) {
    if (error.message?.startsWith("UNAUTHORIZED")) return apiError(error.message, 401);
    if (error.message?.startsWith("FORBIDDEN")) return apiError(error.message, 403);
    return apiError(error.message || "Failed to duplicate role.", 500);
  }
}
