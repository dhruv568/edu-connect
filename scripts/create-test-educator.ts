import { prisma } from "../lib/prisma";
import { hashPassword, verifyPassword } from "../lib/auth/password";

async function main() {
  console.log("Creating/updating test educator account for dhruvjari2006@gmail.com...");

  const email = "dhruvjari2006@gmail.com";
  const rawPassword = "Password123!";
  const passwordHash = await hashPassword(rawPassword);
  const now = new Date();

  const existingUser = await prisma.user.findUnique({
    where: { email },
    include: { profile: true, teacherProfile: true },
  });

  let userId: string;

  if (existingUser) {
    console.log(`Found existing user (ID: ${existingUser.id}). Safely updating...`);
    userId = existingUser.id;

    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        passwordHash,
        role: "TEACHER",
        status: "ACTIVE",
        emailVerified: true,
        emailVerifiedAt: existingUser.emailVerifiedAt || now,
      },
    });

    if (existingUser.profile) {
      await prisma.profile.update({
        where: { id: existingUser.profile.id },
        data: {
          firstName: existingUser.profile.firstName || "Dhruv",
          lastName: existingUser.profile.lastName || "Jari",
        },
      });
    } else {
      await prisma.profile.create({
        data: {
          userId: existingUser.id,
          firstName: "Dhruv",
          lastName: "Jari",
          bio: "Dedicated Educator Account",
        },
      });
    }

    if (existingUser.teacherProfile) {
      await prisma.teacherProfile.update({
        where: { id: existingUser.teacherProfile.id },
        data: {
          verificationStatus: "VERIFIED",
          verifiedAt: existingUser.teacherProfile.verifiedAt || now,
          isSeededProfile: false,
        },
      });
    } else {
      await prisma.teacherProfile.create({
        data: {
          userId: existingUser.id,
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
  } else {
    console.log(`User not found. Creating new user: ${email}`);
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "TEACHER",
        status: "ACTIVE",
        emailVerified: true,
        emailVerifiedAt: now,
        profile: {
          create: {
            firstName: "Dhruv",
            lastName: "Jari",
            bio: "Dedicated Educator Account",
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
    });
    userId = newUser.id;
  }

  // Verification step
  console.log("\n--- VERIFICATION ---");
  const verifiedUser = await prisma.user.findUnique({
    where: { email },
    include: { profile: true, teacherProfile: true },
  });

  if (!verifiedUser) {
    throw new Error("FAILED: User not found after creation/update.");
  }

  const isPasswordValid = await verifyPassword(rawPassword, verifiedUser.passwordHash);

  console.log(`Email: ${verifiedUser.email}`);
  console.log(`Role: ${verifiedUser.role}`);
  console.log(`Status: ${verifiedUser.status}`);
  console.log(`Email Verified: ${verifiedUser.emailVerified}`);
  console.log(`Password Match: ${isPasswordValid}`);
  console.log(`Profile Name: ${verifiedUser.profile?.firstName} ${verifiedUser.profile?.lastName}`);
  console.log(`Teacher Verification Status: ${verifiedUser.teacherProfile?.verificationStatus}`);
  console.log(`Is Seeded Profile: ${verifiedUser.teacherProfile?.isSeededProfile}`);

  if (
    verifiedUser.role === "TEACHER" &&
    verifiedUser.status === "ACTIVE" &&
    verifiedUser.emailVerified &&
    isPasswordValid &&
    verifiedUser.teacherProfile?.verificationStatus === "VERIFIED" &&
    verifiedUser.teacherProfile?.isSeededProfile === false
  ) {
    console.log("\n✅ SUCCESS: Dedicated testing Educator account setup & verified successfully!");
  } else {
    console.error("\n❌ ERROR: Account verification failed checklist.");
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error("Error executing script:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
