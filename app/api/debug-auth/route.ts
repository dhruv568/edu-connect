export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body.email?.toLowerCase().trim();
    
    if (!email) {
      return Response.json({ error: "Email required" }, { status: 400 });
    }
    
    const user = await prisma.user.findUnique({
      where: { email },
      select: { 
        id: true, 
        email: true, 
        role: true, 
        status: true,
        passwordHash: true,
      }
    });
    
    if (!user) {
      // Check by role fallback
      const adminByRole = await prisma.user.findFirst({
        where: { role: "ADMIN" },
        select: { id: true, email: true, role: true, status: true },
      });
      return Response.json({ 
        found: false, 
        email,
        adminByRole: adminByRole ? { email: adminByRole.email, status: adminByRole.status } : null,
        totalAdmins: await prisma.user.count({ where: { role: "ADMIN" } }),
        totalUsers: await prisma.user.count(),
      });
    }
    
    // Extract DB hostname for environment verification (safe - no credentials)
    const dbUrl = process.env.DATABASE_URL || "";
    const dbHostMatch = dbUrl.match(/@([^:/]+)/);
    const dbHost = dbHostMatch ? dbHostMatch[1] : "unknown";
    
    const hashInfo: Record<string, any> = {
      found: true,
      email: user.email,
      role: user.role,
      status: user.status,
      hashLength: user.passwordHash?.length,
      hashPrefix: user.passwordHash?.substring(0, 20),
      hashSuffix: user.passwordHash?.substring(55),
      hashValid: user.passwordHash?.startsWith("$2a$") || user.passwordHash?.startsWith("$2b$"),
      dbHost,
      nodeVersion: process.version,
      bcryptjsVersion: typeof bcrypt.getRounds === "function" ? "bcryptjs" : "unknown",
      totalAdmins: await prisma.user.count({ where: { role: "ADMIN" } }),
      totalUsers: await prisma.user.count(),
    };
    
    if (body.password && user.passwordHash) {
      try {
        // Test 1: Direct bcrypt compare (raw password, raw hash)
        const match1 = await bcrypt.compare(body.password, user.passwordHash);
        hashInfo.bcryptMatch_raw = match1;
        
        // Test 2: Trimmed password, trimmed hash
        const match2 = await bcrypt.compare(body.password.trim(), user.passwordHash.trim());
        hashInfo.bcryptMatch_trimmed = match2;
        
        // Test 3: Generate a fresh hash from the given password and verify round-trip
        const freshHash = await bcrypt.hash(body.password, 10);
        const match3 = await bcrypt.compare(body.password, freshHash);
        hashInfo.bcryptRoundTrip = match3;
        hashInfo.freshHashPrefix = freshHash.substring(0, 20);
        
        // Test 4: Check if hash has any invisible/weird characters
        const hashBytes = Buffer.from(user.passwordHash);
        hashInfo.hashBytesLength = hashBytes.length;
        hashInfo.hashHasNonAscii = hashBytes.some((b: number) => b > 127);
        hashInfo.hashCharCodes_first30 = Array.from(user.passwordHash.substring(0, 30)).map((c: string) => c.charCodeAt(0));
        hashInfo.hashCharCodes_last10 = Array.from(user.passwordHash.substring(50)).map((c: string) => c.charCodeAt(0));
        
        // Test 5: Check bcrypt.getRounds on the stored hash
        try {
          hashInfo.hashRounds = bcrypt.getRounds(user.passwordHash);
        } catch (e: any) {
          hashInfo.hashRoundsError = e.message;
        }
        
      } catch (err: any) {
        hashInfo.bcryptError = err.message;
      }
    }
    
    return Response.json(hashInfo);
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
