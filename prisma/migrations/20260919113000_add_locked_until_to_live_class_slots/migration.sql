-- AlterTable
ALTER TABLE "live_class_slots" ADD COLUMN IF NOT EXISTS "lockedUntil" TIMESTAMP(3);
