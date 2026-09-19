/**
 * Safe & Idempotent Educator Hourly Rate Migration Script
 *
 * Updates existing educator hourlyRate values to the affordable range (₹250, ₹300, ₹350/hr).
 * - Safe & non-destructive: Does NOT delete educators, users, courses, or bookings.
 * - Preserves verification status, bio, subjects, and all profile data.
 * - Idempotent: Re-running does not double-modify or corrupt data.
 *
 * Experience-based reasonable mapping for out-of-range rates (< 250 or > 350 or null):
 * - 10+ years experience -> ₹350/hr
 * - 5–9 years experience  -> ₹300/hr
 * - 0–4 years experience  -> ₹250/hr
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MIN_AFFORDABLE_RATE = 250;
const MAX_AFFORDABLE_RATE = 350;

export function calculateAffordableHourlyRate(
  currentRate: number | null | undefined,
  experienceYears: number | null | undefined
): { newRate: number; updated: boolean } {
  // If rate is already valid within ₹250–₹350, retain it idempotently
  if (
    typeof currentRate === "number" &&
    !isNaN(currentRate) &&
    currentRate >= MIN_AFFORDABLE_RATE &&
    currentRate <= MAX_AFFORDABLE_RATE
  ) {
    return { newRate: currentRate, updated: false };
  }

  // Otherwise map legacy / out-of-range / missing rates to affordable tiers
  const exp = typeof experienceYears === "number" && !isNaN(experienceYears) ? experienceYears : 0;
  let assignedRate = 250;

  if (exp >= 10) {
    assignedRate = 350;
  } else if (exp >= 5) {
    assignedRate = 300;
  } else {
    assignedRate = 250;
  }

  return { newRate: assignedRate, updated: true };
}

async function main() {
  console.log("===============================================================================");
  console.log("🚀 Starting Safe Migration: Educator Hourly Rates (Affordable Tier: ₹250–₹350)");
  console.log("===============================================================================\n");

  const educators = await prisma.teacherProfile.findMany({
    include: {
      user: {
        include: {
          profile: true,
        },
      },
    },
    orderBy: { experienceYears: "asc" },
  });

  console.log(`📊 Found ${educators.length} total TeacherProfile records in database.\n`);

  let updatedCount = 0;
  let unchangedCount = 0;

  const preDistribution: Record<string, number> = {};
  const postDistribution: Record<string, number> = {};

  for (const ed of educators) {
    const rawRateKey = ed.hourlyRate !== null && ed.hourlyRate !== undefined ? `₹${ed.hourlyRate}` : "null/undefined";
    preDistribution[rawRateKey] = (preDistribution[rawRateKey] || 0) + 1;

    const { newRate, updated } = calculateAffordableHourlyRate(ed.hourlyRate, ed.experienceYears);

    const postRateKey = `₹${newRate}`;
    postDistribution[postRateKey] = (postDistribution[postRateKey] || 0) + 1;

    const teacherName =
      `${ed.user?.profile?.firstName || ""} ${ed.user?.profile?.lastName || ""}`.trim() ||
      ed.user?.email ||
      ed.id;

    if (updated) {
      await prisma.teacherProfile.update({
        where: { id: ed.id },
        data: { hourlyRate: newRate },
      });

      console.log(
        ` [UPDATED] ${teacherName.padEnd(35)} | Status: ${ed.verificationStatus.padEnd(9)} | Exp: ${String(ed.experienceYears).padStart(2)} yrs | Old Rate: ${rawRateKey.padStart(6)} -> New Rate: ₹${newRate}`
      );
      updatedCount++;
    } else {
      unchangedCount++;
    }
  }

  console.log("\n-------------------------------------------------------------------------------");
  console.log(`✅ Migration Summary:`);
  console.log(`   Total Educator Profiles Checked : ${educators.length}`);
  console.log(`   Profiles Updated to Affordable  : ${updatedCount}`);
  console.log(`   Profiles Already in Range       : ${unchangedCount}`);
  console.log("-------------------------------------------------------------------------------");

  console.log("\n📈 Pre-Migration Rate Distribution:");
  console.table(preDistribution);

  console.log("\n📈 Post-Migration Rate Distribution (All in ₹250–₹350 range):");
  console.table(postDistribution);

  console.log("\n🎉 Safe migration completed successfully!\n");
}

main()
  .catch((err) => {
    console.error("❌ Migration error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
