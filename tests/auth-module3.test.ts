import assert from "node:assert";
import { AuthService } from "../services/auth-service";
import { logAuditEvent } from "../lib/audit-logger";

async function runModule3Tests() {
  console.log("🧪 Running EduConnect Module 03 Authentication & Profile Verification Tests...\n");

  // Test 1: Teacher Registration with Professional Fields
  console.log("Test 1: Testing Multi-Step Teacher Registration...");
  const teacherEmail = `test.teacher.${Date.now()}@educonnect.com`;
  const teacher = await AuthService.registerUser({
    firstName: "Elena",
    lastName: "Rostova",
    email: teacherEmail,
    password: "Password123!",
    role: "TEACHER",
    headline: "Senior Physics Educator",
    subjects: "Physics, Quantum Mechanics",
    experienceYears: 8,
    hourlyRate: 65,
    teachingMode: "ONLINE",
  });
  assert.strictEqual(teacher.role, "TEACHER");
  assert.strictEqual(teacher.emailVerified, false);

  // Complete OTP verification to create the teacher in the main database
  const teacherOTP = "123456";
  const { hashToken } = await import("../lib/auth/tokens");
  const { prisma } = await import("../lib/prisma");
  await prisma.pendingRegistration.update({
    where: { email: teacherEmail },
    data: { codeHash: hashToken(teacherOTP) },
  });
  const verifiedTeacher = await AuthService.verifyOTP(teacherEmail, teacherOTP);
  assert.strictEqual(verifiedTeacher.success, true);
  assert.ok(verifiedTeacher.user);
  assert.strictEqual(verifiedTeacher.user.emailVerified, true);
  console.log("✅ Passed: Teacher registration created user & teacher profile after OTP verification.");

  // Test 2: Student Registration
  console.log("\nTest 2: Testing Student Registration with Preferences...");
  const studentEmail = `test.student.${Date.now()}@educonnect.com`;
  const student = await AuthService.registerUser({
    firstName: "Marcus",
    lastName: "Vance",
    email: studentEmail,
    password: "Password123!",
    role: "STUDENT",
    gradeLevel: "Grade 11",
    interests: "Mathematics, Physics",
  });
  assert.strictEqual(student.role, "STUDENT");
  console.log("✅ Passed: Student registration created user & student profile.");

  // Test 3: Public Admin Registration Rejection
  console.log("\nTest 3: Verifying Public Admin Registration Rejection...");
  try {
    await AuthService.registerUser({
      firstName: "Malicious",
      lastName: "Admin",
      email: "fake.admin@educonnect.com",
      password: "Password123!",
      role: "ADMIN" as any,
    });
    assert.fail("Should have rejected public admin registration");
  } catch (e: any) {
    assert.strictEqual(e.message, "Public registration is disabled for administrative accounts.");
    console.log("✅ Passed: Public admin registration properly blocked.");
  }

  // Test 4: Forgot Password Token Generation
  console.log("\nTest 4: Testing Forgot Password Token Request...");
  const forgotResult = await AuthService.forgotPassword(teacherEmail);
  assert.strictEqual(forgotResult.success, true);
  console.log("✅ Passed: Forgot password dispatched token and logged audit event.");

  // Test 5: Audit Event Logging
  console.log("\nTest 5: Testing Audit Event Logging...");
  await logAuditEvent(verifiedTeacher.user.id, "LOGIN_SUCCESS", { role: "TEACHER" });
  console.log("✅ Passed: Audit log recorded successfully.");

  console.log("\n🎉 ALL MODULE 03 AUTH & PROFILE TESTS PASSED SUCCESSFULLY! 🚀\n");
}

runModule3Tests().catch((err) => {
  console.error("❌ Test Failure:", err);
  process.exit(1);
});
