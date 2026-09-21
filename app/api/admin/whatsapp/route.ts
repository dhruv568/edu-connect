import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireRole(["ADMIN", "STAFF"]);

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const status = searchParams.get("status");
    const eventType = searchParams.get("eventType");
    const search = searchParams.get("search");

    const where: any = {};

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (eventType && eventType !== "ALL") {
      where.eventType = eventType;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { phoneNumber: { contains: q, mode: "insensitive" } },
        { templateName: { contains: q, mode: "insensitive" } },
        { metaMessageId: { contains: q, mode: "insensitive" } },
        { user: { email: { contains: q, mode: "insensitive" } } },
      ];
    }

    const [messages, total, totalSent, totalDelivered, totalRead, totalFailed] = await Promise.all([
      prisma.whatsAppMessage.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.whatsAppMessage.count({ where }),
      prisma.whatsAppMessage.count({ where: { status: "SENT" } }),
      prisma.whatsAppMessage.count({ where: { status: "DELIVERED" } }),
      prisma.whatsAppMessage.count({ where: { status: "READ" } }),
      prisma.whatsAppMessage.count({ where: { status: "FAILED" } }),
    ]);

    const totalAll = totalSent + totalDelivered + totalRead + totalFailed;

    return apiSuccess({
      messages,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        total: totalAll,
        sent: totalSent,
        delivered: totalDelivered,
        read: totalRead,
        failed: totalFailed,
      },
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
