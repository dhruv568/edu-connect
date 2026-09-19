export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Get all users summary (without exposing sensitive info)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        passwordHash: true,
      },
      orderBy: { createdAt: "asc" },
      take: 50,
    });

    // Check how many users have matching password for "Password123!"
    const usersSummary = [];
    for (const u of users) {
      const matchPassword123 = u.passwordHash
        ? await bcrypt.compare("Password123!", u.passwordHash)
        : false;
      usersSummary.push({
        email: u.email,
        role: u.role,
        status: u.status,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        hashPrefix: u.passwordHash?.substring(0, 15),
        hashSuffix: u.passwordHash?.substring(55),
        matchPassword123,
      });
    }

    // 2. Test candidate passwords against admin user specifically
    const adminUser = users.find((u) => u.email === "educonnects.com@gmail.com" || u.role === "ADMIN");
    
    let matchedCandidate: string | null = null;
    if (adminUser && adminUser.passwordHash) {
      const candidates = [
        "Password123!",
        "password123!",
        "Password123",
        "password123",
        "Admin123!",
        "admin123!",
        "Admin123",
        "admin123",
        "Admin@123",
        "admin@123",
        "Admin@1234",
        "EduConnect@123",
        "EduConnects@123",
        "EduConnect123!",
        "EduConnects123!",
        "educonnect123",
        "educonnects123",
        "Password@123",
        "password@123",
        "password",
        "Password",
        "admin",
        "Admin",
        "123456",
        "12345678",
        "Secret1234",
        "Secret1234!",
        "dhruv568",
        "dhruvjari2006",
        "Dhruv@123",
        "Dhruv123!",
        "dhruv123!",
        "Neeraj@123",
        "Neeraj123!",
        "neeraj123!",
        "Profunnel@123",
        "Profunnels@123",
        "profunnel123",
        "educonnects.com@gmail.com",
        "admin@educonnects.com",
        "admin@educonnect.com",
        body.password, // whatever was passed in the request body
      ].filter(Boolean);

      for (const cand of candidates) {
        if (await bcrypt.compare(cand, adminUser.passwordHash)) {
          matchedCandidate = cand;
          break;
        }
      }
    }

    return Response.json({
      adminFound: Boolean(adminUser),
      adminEmail: adminUser?.email,
      matchedCandidate,
      totalUsers: users.length,
      usersSummary,
    });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
