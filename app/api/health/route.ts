import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET() {
  try {
    // Check DB query execution
    const userCount = await prisma.user.count();
    return apiSuccess({
      status: "healthy",
      database: "connected",
      registeredUsers: userCount,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  } catch (error: any) {
    return apiError(`Health Check Failed: ${error.message}`, 500);
  }
}
