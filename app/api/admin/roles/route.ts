import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions/permission-engine";
import { apiBadRequest, apiError, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit-logger";
import { syncFeatureRegistry } from "@/lib/permissions/registry";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requirePermission("roles.view");
    await syncFeatureRegistry();

    const roles = await prisma.role.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: {
          select: { id: true, email: true, profile: true },
        },
        _count: {
          select: {
            users: true,
            roleFeatures: true,
            rolePermissions: true,
            invitations: true,
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

    const formatted = roles.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      status: r.status,
      isSystem: r.isSystem,
      staffCount: r._count.users,
      invitationCount: r._count.invitations,
      featureKeys: r.roleFeatures.map((rf) => rf.feature.key),
      permissionKeys: r.rolePermissions.map((rp) => rp.permission.key),
      createdBy: r.createdBy ? `${r.createdBy.profile?.firstName || ""} ${r.createdBy.profile?.lastName || ""}`.trim() || r.createdBy.email : "System",
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    return apiSuccess({ roles: formatted });
  } catch (error: any) {
    if (error.message?.startsWith("UNAUTHORIZED")) return apiError(error.message, 401);
    if (error.message?.startsWith("FORBIDDEN")) return apiError(error.message, 403);
    return apiError(error.message || "Failed to fetch roles.", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requirePermission("roles.create");
    await syncFeatureRegistry();

    const body = await req.json();
    const { name, description, status = "ACTIVE", featureKeys = [], permissionKeys = [] } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return apiBadRequest("Role name is required.");
    }

    const trimmedName = name.trim();

    // Prevent reserved names
    if (["ADMIN", "SUPER_ADMIN", "SUPER ADMIN", "TEACHER", "STUDENT"].includes(trimmedName.toUpperCase())) {
      return apiBadRequest("Cannot create role with reserved platform name.");
    }

    // Check duplicate
    const existing = await prisma.role.findUnique({
      where: { name: trimmedName },
    });

    if (existing) {
      return apiBadRequest(`A role with the name "${trimmedName}" already exists.`);
    }

    // Resolve feature IDs from keys
    const features = await prisma.feature.findMany({
      where: { key: { in: featureKeys } },
      select: { id: true, key: true },
    });

    // Resolve permission IDs from keys
    const permissions = await prisma.permission.findMany({
      where: { key: { in: permissionKeys } },
      select: { id: true, key: true },
    });

    const newRole = await prisma.$transaction(async (tx) => {
      const created = await tx.role.create({
        data: {
          name: trimmedName,
          description: description?.trim() || null,
          status: status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
          isSystem: false,
          createdById: userId,
        },
      });

      // Attach features
      if (features.length > 0) {
        await tx.roleFeature.createMany({
          data: features.map((f) => ({
            roleId: created.id,
            featureId: f.id,
          })),
        });
      }

      // Attach permissions
      if (permissions.length > 0) {
        await tx.rolePermission.createMany({
          data: permissions.map((p) => ({
            roleId: created.id,
            permissionId: p.id,
          })),
        });
      }

      return created;
    });

    await logAuditEvent(userId, "ROLE_CREATED", {
      roleId: newRole.id,
      roleName: newRole.name,
      featuresAssigned: featureKeys,
      permissionsAssigned: permissionKeys,
    });

    return apiSuccess({ role: newRole }, "Role created successfully.", 201);
  } catch (error: any) {
    if (error.message?.startsWith("UNAUTHORIZED")) return apiError(error.message, 401);
    if (error.message?.startsWith("FORBIDDEN")) return apiError(error.message, 403);
    return apiError(error.message || "Failed to create role.", 500);
  }
}
