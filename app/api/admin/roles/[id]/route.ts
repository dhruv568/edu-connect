import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions/permission-engine";
import { apiBadRequest, apiError, apiNotFound, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit-logger";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requirePermission("roles.view");

    const role = await prisma.role.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: { id: true, email: true, profile: true },
        },
        users: {
          select: {
            id: true,
            email: true,
            status: true,
            profile: true,
            createdAt: true,
          },
        },
        roleFeatures: {
          include: { feature: true },
        },
        rolePermissions: {
          include: { permission: true },
        },
      },
    });

    if (!role) {
      return apiNotFound("Role not found.");
    }

    return apiSuccess({
      role: {
        id: role.id,
        name: role.name,
        description: role.description,
        status: role.status,
        isSystem: role.isSystem,
        featureKeys: role.roleFeatures.map((rf) => rf.feature.key),
        permissionKeys: role.rolePermissions.map((rp) => rp.permission.key),
        assignedStaff: role.users.map((u) => ({
          id: u.id,
          email: u.email,
          status: u.status,
          name: `${u.profile?.firstName || ""} ${u.profile?.lastName || ""}`.trim() || u.email,
          createdAt: u.createdAt,
        })),
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      },
    });
  } catch (error: any) {
    if (error.message?.startsWith("UNAUTHORIZED")) return apiError(error.message, 401);
    if (error.message?.startsWith("FORBIDDEN")) return apiError(error.message, 403);
    return apiError(error.message || "Failed to fetch role.", 500);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await requirePermission("roles.update");

    const role = await prisma.role.findUnique({
      where: { id: params.id },
      include: { roleFeatures: true, rolePermissions: true },
    });

    if (!role) {
      return apiNotFound("Role not found.");
    }

    const body = await req.json();
    const { name, description, status, featureKeys, permissionKeys } = body;

    // Name uniqueness check if changing name
    if (name && name.trim() !== role.name) {
      const trimmed = name.trim();
      if (["ADMIN", "SUPER_ADMIN", "SUPER ADMIN", "TEACHER", "STUDENT"].includes(trimmed.toUpperCase())) {
        return apiBadRequest("Cannot use reserved role name.");
      }
      const duplicate = await prisma.role.findUnique({
        where: { name: trimmed },
      });
      if (duplicate) {
        return apiBadRequest(`A role with name "${trimmed}" already exists.`);
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update basic fields
      const updatedRole = await tx.role.update({
        where: { id: role.id },
        data: {
          ...(name ? { name: name.trim() } : {}),
          ...(description !== undefined ? { description: description?.trim() || null } : {}),
          ...(status ? { status } : {}),
        },
      });

      // 2. Update feature assignments if provided
      if (Array.isArray(featureKeys)) {
        await tx.roleFeature.deleteMany({
          where: { roleId: role.id },
        });

        const features = await tx.feature.findMany({
          where: { key: { in: featureKeys } },
          select: { id: true },
        });

        if (features.length > 0) {
          await tx.roleFeature.createMany({
            data: features.map((f) => ({
              roleId: role.id,
              featureId: f.id,
            })),
          });
        }
      }

      // 3. Update permission assignments if provided
      if (Array.isArray(permissionKeys)) {
        await tx.rolePermission.deleteMany({
          where: { roleId: role.id },
        });

        const permissions = await tx.permission.findMany({
          where: { key: { in: permissionKeys } },
          select: { id: true },
        });

        if (permissions.length > 0) {
          await tx.rolePermission.createMany({
            data: permissions.map((p) => ({
              roleId: role.id,
              permissionId: p.id,
            })),
          });
        }
      }

      return updatedRole;
    });

    await logAuditEvent(userId, "ROLE_UPDATED", {
      roleId: role.id,
      roleName: updated.name,
      updatedFields: { name, description, status, featureKeys, permissionKeys },
    });

    return apiSuccess({ role: updated }, "Role updated successfully.");
  } catch (error: any) {
    if (error.message?.startsWith("UNAUTHORIZED")) return apiError(error.message, 401);
    if (error.message?.startsWith("FORBIDDEN")) return apiError(error.message, 403);
    return apiError(error.message || "Failed to update role.", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await requirePermission("roles.delete");

    const role = await prisma.role.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!role) {
      return apiNotFound("Role not found.");
    }

    // Safety checks: Cannot delete system template roles
    if (role.isSystem) {
      return apiBadRequest("System template roles cannot be deleted. You can edit their permissions or deactivate them.");
    }

    // Cannot delete if staff members are currently assigned
    if (role._count.users > 0) {
      return apiBadRequest(`Cannot delete role "${role.name}" because ${role._count.users} staff member(s) are currently assigned to it. Reassign them first.`);
    }

    await prisma.$transaction([
      prisma.roleFeature.deleteMany({ where: { roleId: role.id } }),
      prisma.rolePermission.deleteMany({ where: { roleId: role.id } }),
      prisma.staffInvitation.deleteMany({ where: { roleId: role.id } }),
      prisma.role.delete({ where: { id: role.id } }),
    ]);

    await logAuditEvent(userId, "ROLE_DELETED", {
      roleId: role.id,
      roleName: role.name,
    });

    return apiSuccess({ deleted: true }, "Role deleted successfully.");
  } catch (error: any) {
    if (error.message?.startsWith("UNAUTHORIZED")) return apiError(error.message, 401);
    if (error.message?.startsWith("FORBIDDEN")) return apiError(error.message, 403);
    return apiError(error.message || "Failed to delete role.", 500);
  }
}
