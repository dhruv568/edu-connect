import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    await requireRole(["ADMIN"]);
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const action = searchParams.get("action") || undefined;
    const actorRole = searchParams.get("role") || undefined;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (action) where.action = { contains: action, mode: "insensitive" };
    if (actorRole) where.actorRole = actorRole;

    const [activities, total] = await Promise.all([
      (prisma as any).activityLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: { actor: { include: { profile: true } } },
      }),
      (prisma as any).activityLog.count({ where }),
    ]);

    const formatted = activities.map((a: any) => ({
      id: a.id,
      action: a.action,
      actorId: a.actorId,
      actorName: a.actor?.profile ? `${a.actor.profile.firstName} ${a.actor.profile.lastName}` : a.actorId || "System",
      actorRole: a.actorRole,
      entityType: a.entityType,
      entityId: a.entityId,
      metadata: a.metadata ? (typeof a.metadata === "string" ? JSON.parse(a.metadata) : a.metadata) : null,
      createdAt: a.createdAt,
    }));

    return apiSuccess({
      activities: formatted,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    if (error.message?.startsWith("UNAUTHORIZED")) {
      return apiError(error.message, 401);
    }
    if (error.message?.startsWith("UNVERIFIED") || error.message?.startsWith("FORBIDDEN")) {
      return apiError(error.message, 403);
    }
    console.error("[GET /api/admin/activity error]:", error);
    return apiError("Failed to fetch activity logs.", 500);
  }
}
