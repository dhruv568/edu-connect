import { prisma } from "../lib/prisma";
import { verifyPassword, hashPassword } from "../lib/auth/password";
import { AuthService } from "../services/auth-service";

async function main() {
  const email = "dhruvjari2006@gmail.com";
  console.log("=== DIAGNOSING TEST EDUCATOR ACCOUNT ===");
  console.log(`Checking email: ${email}`);

  // 1. Check exact user in DB
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      profile: true,
      teacherProfile: true,
      studentProfile: true,
    },
  });

  if (!user) {
    console.log("❌ USER RECORD DOES NOT EXIST IN `users` TABLE!");
    const pending = await prisma.pendingRegistration.findFirst({
      where: { email },
    });
    if (pending) {
      console.log("⚠️ Found record in `pending_registrations` table!");
    } else {
      console.log("❌ No pending registration found either!");
    }
    return;
  }

  console.log("✅ User record found:");
  console.log(`  ID: ${user.id}`);
  console.log(`  Email: ${user.email}`);
  console.log(`  Role: ${user.role}`);
  console.log(`  Status: ${user.status}`);
  console.log(`  Email Verified At: ${user.emailVerifiedAt}`);
  console.log(`  Has Password Hash: ${Boolean(user.passwordHash)}`);

  console.log("\n--- Checking Teacher Profile ---");
  if (user.teacherProfile) {
    console.log(`  Teacher Profile ID: ${user.teacherProfile.id}`);
    console.log(`  Verification Status: ${user.teacherProfile.verificationStatus}`);
    console.log(`  Verified At: ${user.teacherProfile.verifiedAt}`);
  } else {
    console.log("⚠️ Teacher Profile is MISSING!");
  }

  // Test password verification with intended password
  const testPassword = "Password123!";
  const isValid = await verifyPassword(testPassword, user.passwordHash);
  console.log(`\n--- Password Check for '${testPassword}' ---`);
  console.log(`  Is Password Valid: ${isValid}`);

  // Test AuthService.validateCredentials
  console.log("\n--- Testing AuthService.validateCredentials ---");
  try {
    const validated = await AuthService.validateCredentials(email, testPassword);
    console.log(`✅ validateCredentials succeeded for user ID: ${validated.id}`);
  } catch (err: any) {
    console.log(`❌ validateCredentials FAILED: ${err.message}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
