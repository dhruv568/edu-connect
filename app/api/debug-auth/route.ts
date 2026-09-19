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
      return Response.json({ 
        found: false, 
        email,
        totalAdmins: await prisma.user.count({ where: { role: "ADMIN" } })
      });
    }
    
    const hashInfo = {
      found: true,
      email: user.email,
      role: user.role,
      status: user.status,
      hashLength: user.passwordHash?.length,
      hashPrefix: user.passwordHash?.substring(0, 7),
      hashValid: user.passwordHash?.startsWith("$2a$") || user.passwordHash?.startsWith("$2b$"),
    };
    
    if (body.password && user.passwordHash) {
      try {
        const match = await bcrypt.compare(body.password, user.passwordHash);
        return Response.json({ ...hashInfo, bcryptMatch: match });
      } catch (err: any) {
        return Response.json({ ...hashInfo, bcryptError: err.message });
      }
    }
    
    return Response.json(hashInfo);
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
