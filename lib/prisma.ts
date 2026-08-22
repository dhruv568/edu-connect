import path from "path";
import { PrismaClient } from "@prisma/client";

function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;
  if (envUrl && !envUrl.startsWith("file:.")) {
    return envUrl;
  }
  // Construct explicit absolute path to dev.db inside prisma directory
  const dbPath = path.resolve(process.cwd(), "prisma", "dev.db").replace(/\\/g, "/");
  return `file:${dbPath}`;
}

const databaseUrl = getDatabaseUrl();
process.env.DATABASE_URL = databaseUrl;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
