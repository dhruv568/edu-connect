import { prisma } from "../lib/prisma";
import { AdminService } from "../services/admin-service";
import { AnalyticsService } from "../services/analytics-service";
import { hashPassword } from "../lib/auth/password";

async function runModule10AdminTests() {
  console.log("\n🧪 Running EduConnect Module 10 Admin Governance Automated Tests...\n");

  let testAdminUser: any;
  let testStudentUser: any;
  let testTeacherUser: any;
  let testTeacherProfile: any;
  let testCourse: any;
  let testLiveClassSlot: any;
  let testTransaction: any;
  let testRefund: any;
  let testReport: any;

  try {
    // Setup: Create test Admin, Student, and Teacher users
    const passwordHash = await hashPassword("AdminSecret123!");

    testAdminUser = await prisma.user.create({
      data: {
        email: `test.admin.${Date.now()}@educonnect.com`,
        passwordHash,
        role: "ADMIN",
        status: "ACTIVE",
        emailVerified: true,
        emailVerifiedAt: new Date(),
        profile: {
          create: { firstName: "Sys", lastName: "Admin" },
        },
      },
    });

    testStudentUser = await prisma.user.create({
      data: {
        email: `test.student.admin.${Date.now()}@educonnect.com`,
        passwordHash,
        role: "STUDENT",
        status: "ACTIVE",
        emailVerified: true,
        emailVerifiedAt: new Date(),
        profile: {
          create: { firstName: "Test", lastName: "Student" },
        },
        studentProfile: {
          create: { gradeLevel: "Grade 10" },
        },
      },
    });

    testTeacherUser = await prisma.user.create({
      data: {
        email: `test.teacher.admin.${Date.now()}@educonnect.com`,
        passwordHash,
        role: "TEACHER",
        status: "ACTIVE",
        emailVerified: true,
        emailVerifiedAt: new Date(),
        profile: {
          create: { firstName: "Test", lastName: "Teacher" },
        },
      },
    });

    testTeacherProfile = await prisma.teacherProfile.create({
      data: {
        userId: testTeacherUser.id,
        headline: "Expert Physics Educator",
        subjects: "Physics, Science",
        experienceYears: 6,
        hourlyRate: 500,
        verificationStatus: "PENDING",
      },
    });

    console.log("✅ Test 1: Created test Admin, Student, and Teacher users.");

    // Test 2: User Governance & Status Mutation (SUSPEND / RESTORE)
    console.log("\nTest 2: Testing User Account Status Mutations...");
    const suspendedStudent = await AdminService.updateUserStatus(
      testAdminUser.id,
      testStudentUser.id,
      "SUSPENDED",
      "Policy violation in discussion forum"
    );
    if (suspendedStudent.status !== "SUSPENDED") {
      throw new Error(`Expected student status to be SUSPENDED, got ${suspendedStudent.status}`);
    }

    const restoredStudent = await AdminService.updateUserStatus(
      testAdminUser.id,
      testStudentUser.id,
      "ACTIVE"
    );
    if (restoredStudent.status !== "ACTIVE") {
      throw new Error(`Expected student status to be ACTIVE, got ${restoredStudent.status}`);
    }

    // Verify Admin cannot be suspended via updateUserStatus
    try {
      await AdminService.updateUserStatus(testAdminUser.id, testAdminUser.id, "SUSPENDED");
      throw new Error("Admin self-suspension should have failed.");
    } catch (err: any) {
      if (!err.message.includes("FORBIDDEN")) throw err;
    }
    console.log("✅ Passed: User account status mutation (SUSPEND, RESTORE, Admin protection).");

    // Test 3: Teacher Verification Review (APPROVE / REJECT)
    console.log("\nTest 3: Testing Teacher Verification Review...");
    const approvedTeacher = await AdminService.reviewTeacher(
      testAdminUser.id,
      testTeacherProfile.id,
      "APPROVE"
    );
    if (approvedTeacher.verificationStatus !== "VERIFIED") {
      throw new Error(`Expected teacher status to be VERIFIED, got ${approvedTeacher.verificationStatus}`);
    }

    // Verify TeacherVerificationHistory audit record created
    const vHistories = await prisma.teacherVerificationHistory.findMany({
      where: { teacherId: testTeacherProfile.id },
    });
    if (vHistories.length === 0) {
      throw new Error("Teacher verification history log not recorded.");
    }
    console.log("✅ Passed: Teacher verification review and audit history recording.");

    // Test 4: Course Moderation & Publishing Validation
    console.log("\nTest 4: Testing Course Moderation & Validation...");
    testCourse = await prisma.course.create({
      data: {
        title: "Advanced Quantum Mechanics",
        slug: `quantum-physics-${Date.now()}`,
        description: "Comprehensive physics course",
        subject: "Physics",
        price: 999,
        teacherId: testTeacherProfile.id,
        status: "DRAFT",
      },
    });

    // Approving course without lessons must fail validation
    try {
      await AdminService.moderateCourse(testAdminUser.id, testCourse.id, "APPROVE");
      throw new Error("Course publishing without lessons should have failed.");
    } catch (err: any) {
      if (!err.message.includes("VALIDATION_ERROR")) throw err;
    }

    // Add a section & lesson to course
    const section = await prisma.courseSection.create({
      data: {
        courseId: testCourse.id,
        title: "Section 1: Foundations",
      },
    });

    await prisma.courseLesson.create({
      data: {
        sectionId: section.id,
        title: "Lesson 1: Introduction to Quanta",
        durationSeconds: 300,
        status: "READY",
      },
    });

    // Now approving should succeed
    const publishedCourse = await AdminService.moderateCourse(testAdminUser.id, testCourse.id, "APPROVE");
    if (publishedCourse.status !== "PUBLISHED") {
      throw new Error(`Expected course status to be PUBLISHED, got ${publishedCourse.status}`);
    }
    console.log("✅ Passed: Course moderation validation and publishing approval.");

    // Test 5: Live Class Administrative Cancellation
    console.log("\nTest 5: Testing Live Class Cancellation...");
    const now = new Date();
    testLiveClassSlot = await prisma.liveClassSlot.create({
      data: {
        teacherId: testTeacherProfile.id,
        title: "Live Quantum Q&A",
        subject: "Physics",
        startTime: new Date(now.getTime() + 86400000),
        endTime: new Date(now.getTime() + 90000000),
        price: 250,
        status: "SCHEDULED",
      },
    });

    const cancelledSlot = await AdminService.cancelLiveClass(
      testAdminUser.id,
      testLiveClassSlot.id,
      "Educator emergency schedule conflict"
    );
    if (cancelledSlot.status !== "CANCELLED") {
      throw new Error(`Expected slot status to be CANCELLED, got ${cancelledSlot.status}`);
    }
    console.log("✅ Passed: Live class administrative cancellation.");

    // Test 6: Refund Approval & Financial Ledger Reversal
    console.log("\nTest 6: Testing Refund Approval & Ledger Reversal...");
    testTransaction = await prisma.paymentTransaction.create({
      data: {
        userId: testStudentUser.id,
        type: "COURSE_ENROLLMENT",
        status: "CAPTURED",
        amountPaise: 99900,
        currency: "INR",
        provider: "RAZORPAY",
        providerOrderId: `order_test_${Date.now()}`,
        providerPaymentId: `pay_test_${Date.now()}`,
        internalReference: `ref_test_${Date.now()}`,
        courseId: testCourse.id,
      },
    });

    testRefund = await prisma.refund.create({
      data: {
        transactionId: testTransaction.id,
        amountPaise: 99900,
        reason: "Course content incomplete",
        status: "REFUND_REQUESTED",
        requestedBy: testStudentUser.id,
      },
    });

    const processedRefund = await AdminService.processRefund(testAdminUser.id, testRefund.id, "APPROVE");
    if (processedRefund.status !== "REFUNDED") {
      throw new Error(`Expected refund status to be REFUNDED, got ${processedRefund.status}`);
    }

    // Verify FinancialLedgerEntry REFUND entry was created
    const refundLedger = await prisma.financialLedgerEntry.findFirst({
      where: { transactionId: testTransaction.id, type: "REFUND" },
    });
    if (!refundLedger) {
      throw new Error("Financial ledger refund entry was not created.");
    }
    console.log("✅ Passed: Refund approval with financial ledger entry creation.");

    // Test 7: Platform Commission Settings & Category Management
    console.log("\nTest 7: Testing Platform Commission & Categories...");
    const updatedCommission = await AdminService.updateCommissionSettings(testAdminUser.id, 20.0);
    if (updatedCommission.percentage !== 20.0) {
      throw new Error(`Expected commission to be 20.0, got ${updatedCommission.percentage}`);
    }

    const testCategory = await AdminService.createCategory(testAdminUser.id, {
      name: `Quantum Sciences ${Date.now()}`,
      description: "Advanced physics and quantum topics",
    });

    const toggledCategory = await AdminService.toggleCategoryActive(testAdminUser.id, testCategory.id, false);
    if (toggledCategory.isActive !== false) {
      throw new Error("Expected category to be deactivated.");
    }
    console.log("✅ Passed: Commission settings and category management.");

    // Test 8: Report Lifecycle Management
    console.log("\nTest 8: Testing Content & User Report Moderation...");
    testReport = await prisma.report.create({
      data: {
        reporterId: testStudentUser.id,
        targetType: "COURSE",
        targetId: testCourse.id,
        reason: "Misleading description",
        status: "OPEN",
      },
    });

    const resolvedReport = await AdminService.updateReportStatus(
      testAdminUser.id,
      testReport.id,
      "RESOLVED",
      "Course updated by teacher"
    );
    if (resolvedReport.status !== "RESOLVED") {
      throw new Error(`Expected report status to be RESOLVED, got ${resolvedReport.status}`);
    }
    console.log("✅ Passed: Report status lifecycle resolution.");

    // Test 9: System Health Audit
    console.log("\nTest 9: Testing Admin System Health Check...");
    const health = await AnalyticsService.getAdminSystemHealth();
    if (!health.status || !health.services?.database) {
      throw new Error("Invalid system health payload.");
    }
    console.log("✅ Passed: Admin system health status reporting.");

    console.log("\n🎉 ALL MODULE 10 ADMIN GOVERNANCE TESTS PASSED SUCCESSFULLY! 🚀\n");
  } finally {
    // Clean up created records
    try {
      if (testReport) await prisma.report.delete({ where: { id: testReport.id } }).catch(() => {});
      if (testRefund) await prisma.refund.delete({ where: { id: testRefund.id } }).catch(() => {});
      if (testTransaction) await prisma.paymentTransaction.delete({ where: { id: testTransaction.id } }).catch(() => {});
      if (testLiveClassSlot) await prisma.liveClassSlot.delete({ where: { id: testLiveClassSlot.id } }).catch(() => {});
      if (testCourse) await prisma.course.delete({ where: { id: testCourse.id } }).catch(() => {});
      if (testTeacherProfile) await prisma.teacherProfile.delete({ where: { id: testTeacherProfile.id } }).catch(() => {});
      if (testTeacherUser) await prisma.user.delete({ where: { id: testTeacherUser.id } }).catch(() => {});
      if (testStudentUser) await prisma.user.delete({ where: { id: testStudentUser.id } }).catch(() => {});
      if (testAdminUser) await prisma.user.delete({ where: { id: testAdminUser.id } }).catch(() => {});
    } catch {}
  }
}

runModule10AdminTests().catch((err) => {
  console.error("❌ Module 10 Admin Test Failed:", err);
  process.exit(1);
});
