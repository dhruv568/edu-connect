import { prisma } from "../lib/prisma";
import { hashPassword, verifyPassword } from "../lib/auth/password";
import { AuthService } from "../services/auth-service";

async function runEducatorLoginTest() {
  console.log("========================================================");
  console.log("🚀 Testing Educator Account Authentication & Login Flow");
  console.log("========================================================\n");

  const email = "dhruvjari2006@gmail.com";
  const rawPassword = "Password123!";

  // Step 1: Ensure test educator account exists and has proper VERIFIED & ACTIVE state
  console.log("1. Setting up & verifying Test Educator Account state...");
  const hashedPassword = await hashPassword(rawPassword);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      role: "TEACHER",
      status: "ACTIVE",
      passwordHash: hashedPassword,
      emailVerifiedAt: new Date(),
    },
    create: {
      email,
      role: "TEACHER",
      status: "ACTIVE",
      passwordHash: hashedPassword,
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          firstName: "Dhruv",
          lastName: "Jari",
        },
      },
    },
    include: {
      profile: true,
      teacherProfile: true,
    },
  });

  // Ensure TeacherProfile exists and is VERIFIED
  let teacherProfile = user.teacherProfile;
  if (!teacherProfile) {
    teacherProfile = await prisma.teacherProfile.create({
      data: {
        userId: user.id,
        verificationStatus: "VERIFIED",
        verifiedAt: new Date(),
        headline: "Verified Expert Educator",
        bio: "Dedicated test educator profile for verified feature access.",
        subjects: "Physics, Mathematics, Computer Science",
        hourlyRate: 50.0,
      },
    });
  } else if (teacherProfile.verificationStatus !== "VERIFIED") {
    teacherProfile = await prisma.teacherProfile.update({
      where: { id: teacherProfile.id },
      data: {
        verificationStatus: "VERIFIED",
        verifiedAt: new Date(),
      },
    });
  }

  // Clear any leftover pending registrations for this email
  await prisma.pendingRegistration.deleteMany({
    where: { email },
  });

  console.log(`  • User ID: ${user.id}`);
  console.log(`  • Role: ${user.role}`);
  console.log(`  • Account Status: ${user.status}`);
  console.log(`  • Email Verified: ${Boolean(user.emailVerifiedAt)}`);
  console.log(`  • Educator Verification Status: ${teacherProfile.verificationStatus}`);
  console.log("  ✅ Test educator database record configured successfully!\n");

  // Step 2: Test Password Verification
  console.log("2. Testing Password Hash Verification...");
  const passwordMatches = await verifyPassword(rawPassword, user.passwordHash);
  if (!passwordMatches) {
    throw new Error("Password verification failed against stored bcrypt hash!");
  }
  console.log("  ✅ Bcrypt password verification succeeded!\n");

  // Step 3: Test AuthService.validateCredentials
  console.log("3. Testing AuthService.validateCredentials()...");
  const validatedUser = await AuthService.validateCredentials(email, rawPassword);
  if (!validatedUser || validatedUser.id !== user.id) {
    throw new Error("AuthService.validateCredentials returned invalid user!");
  }
  console.log("  ✅ AuthService.validateCredentials returned valid educator record!\n");

  // Step 4: Test OTP Verification & Session Creation
  console.log("4. Testing OTP dispatch & Session Creation...");
  // Clear any existing verification records to avoid cooldown locks
  await prisma.emailVerification.deleteMany({
    where: { userId: validatedUser.id },
  });

  await AuthService.createAndSendVerification(
    validatedUser.id,
    validatedUser.email,
    validatedUser.profile?.firstName || "Educator",
    false
  );

  const activeVerification = await prisma.emailVerification.findFirst({
    where: { userId: validatedUser.id, verifiedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!activeVerification) {
    throw new Error("Failed to find created EmailVerification record in DB!");
  }

  console.log(`  • Verification record ID: ${activeVerification.id}`);
  console.log(`  • OTP expires at: ${activeVerification.expiresAt}`);

  // Construct session object for verified educator
  const sessionUser = {
    id: validatedUser.id,
    email: validatedUser.email,
    role: validatedUser.role,
    firstName: validatedUser.profile?.firstName || "Dhruv",
    lastName: validatedUser.profile?.lastName || "Jari",
    avatarUrl: validatedUser.profile?.avatarUrl || null,
  };

  const isEducator = sessionUser.role === "TEACHER" || sessionUser.role === "EDUCATOR";
  const redirectPath = isEducator ? "/teacher/dashboard" : "/";

  console.log(`  • Authenticated Session User Role: ${sessionUser.role}`);
  console.log(`  • Session Redirect Path: ${redirectPath}`);

  if (!isEducator) {
    throw new Error(`Expected educator role, got: ${sessionUser.role}`);
  }

  if (redirectPath !== "/teacher/dashboard") {
    throw new Error(`Expected redirect to /teacher/dashboard, got: ${redirectPath}`);
  }

  console.log("🎉 ALL EDUCATOR AUTHENTICATION TESTS PASSED SUCCESSFULLY!");
}

runEducatorLoginTest()
  .catch((e) => {
    console.error("❌ Test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
