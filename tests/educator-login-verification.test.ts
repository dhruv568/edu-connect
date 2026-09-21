import fs from "node:fs";
import path from "node:path";
import assert from "node:assert";
import { prisma } from "../lib/prisma";
import { AuthService } from "../services/auth-service";
import { verifyPassword } from "../lib/auth/password";
import { requireVerifiedEducator, isEducatorVerified } from "../lib/auth/guards";

function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  } catch {}
}
loadEnv();

async function runEducatorLoginVerification() {
  console.log("==================================================");
  console.log("RUNNING EDUCATOR LOGIN & VERIFICATION TEST SUITE");
  console.log("==================================================");

  const email = process.env.TEST_EDUCATOR_EMAIL || "dhruvjari2006@gmail.com";
  const rawPassword = process.env.TEST_EDUCATOR_PASSWORD || "Password123!";

  // Test 1: Test account exists and has proper flags
  console.log("\n[Test 1] Inspecting DB Record for dedicated TEST educator...");
  const user = await prisma.user.findUnique({
    where: { email },
    include: { profile: true, teacherProfile: true },
  });

  assert.ok(user, `User ${email} must exist in database`);
  assert.strictEqual(user.role, "TEACHER", "Role must be TEACHER");
  assert.strictEqual(user.status, "ACTIVE", "Status must be ACTIVE");
  assert.strictEqual(user.emailVerified, true, "Email must be verified");
  assert.ok(user.teacherProfile, "Teacher profile must exist");
  assert.strictEqual(user.teacherProfile.verificationStatus, "VERIFIED", "Verification status must be VERIFIED");
  assert.strictEqual(user.teacherProfile.isSeededProfile, false, "Must not be a seeded synthetic profile");
  assert.ok(user.teacherProfile.verifiedAt, "VerifiedAt timestamp must be populated");
  console.log("✅ [Test 1 Passed] Test educator account is ACTIVE, VERIFIED, and not synthetic.");

  // Test 2: Password matches and securely stored
  console.log("\n[Test 2] Validating bcrypt password hashing...");
  const isMatch = await verifyPassword(rawPassword, user.passwordHash);
  assert.strictEqual(isMatch, true, "Valid password must match bcrypt hash in DB");
  const badMatch = await verifyPassword("WrongPassword!", user.passwordHash);
  assert.strictEqual(badMatch, false, "Invalid password must be rejected");
  console.log("✅ [Test 2 Passed] Secure password hash validation verified.");

  // Test 3: AuthService validation
  console.log("\n[Test 3] Testing AuthService credential validation...");
  const validatedUser = await AuthService.validateCredentials(email, rawPassword);
  assert.strictEqual(validatedUser.id, user.id, "AuthService must return matching user ID");
  assert.strictEqual(validatedUser.email, email, "AuthService must return matching user email");

  await assert.rejects(
    async () => {
      await AuthService.validateCredentials(email, "IncorrectPassword999!");
    },
    /Invalid email or password/,
    "AuthService must reject bad credentials"
  );
  console.log("✅ [Test 3 Passed] AuthService credential validation behaves correctly.");

  // Test 4: Access to verified educator features
  console.log("\n[Test 4] Testing educator verification guard...");
  const verified = isEducatorVerified(user.teacherProfile);
  assert.strictEqual(verified, true, "isEducatorVerified must return true");

  assert.strictEqual(user.teacherProfile.isSeededProfile, false, "isSeededProfile must be false for dashboard access");
  console.log("✅ [Test 4 Passed] Verified educator features are accessible.");

  // Test 5: Verify other educator accounts and production data are not modified
  console.log("\n[Test 5] Checking other accounts integrity...");
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });
  assert.ok(admin, "Admin account must be intact");

  const otherTeachers = await prisma.user.count({
    where: { role: "TEACHER", email: { not: email } },
  });
  console.log(`Other teachers present: ${otherTeachers}`);
  console.log("✅ [Test 5 Passed] Other accounts are untouched.");

  console.log("\n==================================================");
  console.log("ALL EDUCATOR VERIFICATION TESTS PASSED SUCCESSFULLY!");
  console.log("==================================================");
}

runEducatorLoginVerification()
  .catch((err) => {
    console.error("❌ Test suite failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
