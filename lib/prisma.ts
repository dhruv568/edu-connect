import { PrismaClient } from "@prisma/client";

const NEON_DB_URL = "postgresql://neondb_owner:npg_cRqNT4WXI3QE@ep-gentle-sunset-au37ni7u.us-east-1.aws.neon.tech/neondb?sslmode=require";

// Fallback to Neon cloud PostgreSQL database URL if DATABASE_URL is not provided or invalid
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === "" || process.env.DATABASE_URL.startsWith("file:")) {
  process.env.DATABASE_URL = NEON_DB_URL;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
