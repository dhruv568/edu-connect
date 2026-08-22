import path from "path";
import { PrismaClient } from "@prisma/client";

// Normalize SQLite database file path to absolute path relative to process.cwd()
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith("file:.")) {
  const absoluteDbPath = path.join(process.cwd(), "prisma", "dev.db");
  process.env.DATABASE_URL = `file:${absoluteDbPath}`;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
