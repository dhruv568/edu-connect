import fs from "node:fs";
import path from "node:path";
import { prisma } from "../lib/prisma";
import { hashPassword, verifyPassword } from "../lib/auth/password";
import { AuthService } from "../services/auth-service";

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

async function main() {
  const email = process.env.TEST_EDUCATOR_EMAIL || "dhruvjari2006@gmail.com";
  const rawPassword = process.env.TEST_EDUCATOR_PASSWORD || "Password123!";
  console.log(`Checking database for ${email}...`);
  const newHash = await hashPassword(rawPassword);
  const now = new Date();

  // 1. Inspect user in database
  let user = await prisma.user.findUnique({
    where: { email },
    include: { profile: true, teacherProfile: true },
  });

  if (!user) {
    console.log(`User not found in DB. Creating new EDUCATOR user: ${email}...`);
    user = await prisma.user.create({
      data: {
        email,
        passwordHash: newHash,
        role: "TEACHER",
        status: "ACTIVE",
        emailVerified: true,
        emailVerifiedAt: now,
        profile: {
          create: {
            firstName: "Dhruv",
            lastName: "Jari",
            bio: "Dedicated Test Educator Account",
          },
        },
        teacherProfile: {
          create: {
            headline: "Verified Educator",
            subjects: "Mathematics, Physics",
            experienceYears: 5,
            teachingMode: "BOTH",
            verificationStatus: "VERIFIED",
            verifiedAt: now,
            isSeededProfile: false,
          },
        },
      },
      include: { profile: true, teacherProfile: true },
    });
  } else {
    console.log(`Found existing user (ID: ${user.id}). Verifying attributes & password hash...`);

    const isMatch = await verifyPassword(rawPassword, user.passwordHash);
    console.log(`Existing password match: ${isMatch}`);

    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newHash,
        role: "TEACHER",
        status: "ACTIVE",
        emailVerified: true,
        emailVerifiedAt: user.emailVerifiedAt || now,
      },
      include: { profile: true, teacherProfile: true },
    });

    if (user.profile) {
      await prisma.profile.update({
        where: { id: user.profile.id },
        data: {
          firstName: user.profile.firstName || "Dhruv",
          lastName: user.profile.lastName || "Jari",
        },
      });
    } else {
      await prisma.profile.create({
        data: {
          userId: user.id,
          firstName: "Dhruv",
          lastName: "Jari",
          bio: "Dedicated Test Educator Account",
        },
      });
    }

    if (user.teacherProfile) {
      await prisma.teacherProfile.update({
        where: { id: user.teacherProfile.id },
        data: {
          verificationStatus: "VERIFIED",
          verifiedAt: user.teacherProfile.verifiedAt || now,
          isSeededProfile: false,
        },
      });
    } else {
      await prisma.teacherProfile.create({
        data: {
          userId: user.id,
          headline: "Verified Educator",
          subjects: "Mathematics, Physics",
          experienceYears: 5,
          teachingMode: "BOTH",
          verificationStatus: "VERIFIED",
          verifiedAt: now,
          isSeededProfile: false,
        },
      });
    }
  }

  // Clean up any pending registrations or stale OTP verifications to ensure clean login flow
  await prisma.pendingRegistration.deleteMany({ where: { email } });
  await prisma.emailVerification.deleteMany({ where: { userId: user.id } });

  console.log("\n--- DATABASE VERIFICATION ---");
  const updatedUser = await prisma.user.findUnique({
    where: { email },
    include: { profile: true, teacherProfile: true },
  });

  if (!updatedUser) throw new Error("User record missing after update.");

  const passwordValid = await verifyPassword(rawPassword, updatedUser.passwordHash);
  console.log(`User ID: ${updatedUser.id}`);
  console.log(`Email: ${updatedUser.email}`);
  console.log(`Role: ${updatedUser.role}`);
  console.log(`Status: ${updatedUser.status}`);
  console.log(`Email Verified: ${updatedUser.emailVerified}`);
  console.log(`Password Validated: ${passwordValid}`);
  console.log(`Teacher Verification Status: ${updatedUser.teacherProfile?.verificationStatus}`);
  console.log(`Is Seeded Profile: ${updatedUser.teacherProfile?.isSeededProfile}`);

  // 2. Test actual login flow using AuthService
  console.log("\n--- TESTING LOGIN FLOW ---");
  const validatedCredentials = await AuthService.validateCredentials(email, rawPassword);
  console.log(`✅ AuthService.validateCredentials passed for user ID: ${validatedCredentials.id}`);

  // Test OTP generation / dispatch for login
  await AuthService.createAndSendVerification(
    updatedUser.id,
    updatedUser.email,
    updatedUser.profile?.firstName || "Educator",
    false
  );

  const activeCode = await prisma.emailVerification.findFirst({
    where: { userId: updatedUser.id, verifiedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!activeCode) {
    throw new Error("FAILED: Verification code record not found after dispatch.");
  }

  console.log(`✅ Active OTP record created successfully in DB (ID: ${activeCode.id})`);
  console.log(`Expires At: ${activeCode.expiresAt}`);
  console.log("\n✅ ALL CHECKS PASSED SUCCESSFULLY: Test educator account is active, verified, with valid password and reaches OTP verification!");
}

main()
  .catch((e) => {
    console.error("❌ Error in fix script:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
