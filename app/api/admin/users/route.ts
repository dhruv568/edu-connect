import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/guards";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    await requireRole(["ADMIN"]);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role");
    const emailVerified = searchParams.get("emailVerified");
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.max(1, Number(searchParams.get("limit") || 10));
    const skip = (page - 1) * limit;

    const whereCondition: any = {};

    if (role && role !== "ALL") {
      whereCondition.role = role;
    }

    if (emailVerified !== null && emailVerified !== undefined && emailVerified !== "ALL") {
      whereCondition.emailVerified = emailVerified === "true";
    }

    if (search.trim()) {
      const q = search.trim();
      whereCondition.OR = [
        { email: { contains: q } },
        { profile: { firstName: { contains: q } } },
        { profile: { lastName: { contains: q } } },
      ];
    }

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereCondition,
        include: {
          profile: true,
          teacherProfile: {
            select: { verificationStatus: true, subjects: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where: whereCondition }),
    ]);

    const formattedUsers = users.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      emailVerified: u.emailVerified,
      emailVerifiedAt: u.emailVerifiedAt,
      name: `${u.profile?.firstName || ""} ${u.profile?.lastName || ""}`.trim() || u.email,
      avatarUrl: u.profile?.avatarUrl || null,
      verificationStatus: u.teacherProfile?.verificationStatus || null,
      createdAt: u.createdAt,
    }));

    return apiSuccess({
      users: formattedUsers,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error: any) {
    return apiError(error.message || "Failed to fetch users", 500);
  }
}
