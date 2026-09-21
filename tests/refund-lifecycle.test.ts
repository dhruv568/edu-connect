import { prisma } from "../lib/prisma";
import { PaymentService } from "../services/payment-service";
import { AdminService } from "../services/admin-service";
import crypto from "crypto";

async function runRefundLifecycleTests() {
  console.log("\n=======================================================");
  console.log("🧪 TESTING MODERATED REFUND REQUEST & APPROVAL LIFECYCLE");
  console.log("=======================================================\n");

  let passed = 0;
  function assert(condition: boolean, message: string) {
    if (!condition) {
      console.error(`❌ Assertion Failed: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
    console.log(`   ✅ ${message}`);
    passed++;
  }

  const timestamp = Date.now();
  const testEmail = `student.refund.${timestamp}@example.com`;
  const adminEmail = `admin.refund.${timestamp}@example.com`;
  const teacherEmail = `teacher.refund.${timestamp}@example.com`;

  let testStudent: any;
  let testAdmin: any;
  let testTeacher: any;
  let testCourse: any;
  let testTx: any;
  let testEnrollment: any;

  try {
    // 1. Setup mock user records
    testStudent = await prisma.user.create({
      data: {
        email: testEmail,
        passwordHash: "mock-hash",
        role: "STUDENT",
        status: "ACTIVE",
        profile: {
          create: {
            firstName: "Alex",
            lastName: "Tester",
          },
        },
      },
      include: { profile: true },
    });

    testAdmin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: "mock-hash",
        role: "ADMIN",
        status: "ACTIVE",
        profile: {
          create: {
            firstName: "Super",
            lastName: "Admin",
          },
        },
      },
    });

    testTeacher = await prisma.user.create({
      data: {
        email: teacherEmail,
        passwordHash: "mock-hash",
        role: "TEACHER",
        status: "ACTIVE",
        teacherProfile: {
          create: {
            headline: "Expert Physics Tutor",
            hourlyRate: 500,
            verificationStatus: "VERIFIED",
          },
        },
      },
      include: { teacherProfile: true },
    });

    testCourse = await prisma.course.create({
      data: {
        title: `Test Course for Refund ${timestamp}`,
        slug: `test-course-refund-${timestamp}`,
        description: "Test Course Description for refund lifecycle test",
        subject: "Physics",
        price: 999,
        status: "PUBLISHED",
        teacherId: testTeacher.teacherProfile.id,
      },
    });

    testEnrollment = await prisma.enrollment.create({
      data: {
        studentId: testStudent.id,
        courseId: testCourse.id,
        status: "ACTIVE",
      },
    });

    testTx = await prisma.paymentTransaction.create({
      data: {
        userId: testStudent.id,
        courseId: testCourse.id,
        enrollmentId: testEnrollment.id,
        type: "COURSE_ENROLLMENT",
        status: "CAPTURED",
        amountPaise: 99900,
        currency: "INR",
        provider: "CASHFREE",
        providerOrderId: `cf_order_${timestamp}`,
        providerPaymentId: `cf_pay_${timestamp}`,
        internalReference: `EDU-TEST-${timestamp}`,
      },
    });

    console.log("📋 Step 1: Learner Submits Refund Request...");
    const refundRequest = await PaymentService.requestRefund({
      transactionId: testTx.id,
      requestedBy: testStudent.id,
      reason: "Course content did not match syllabus",
      notes: "Topics covered in module 2 were different from preview.",
    });

    assert(refundRequest.status === "PENDING", "Refund record created with status 'PENDING'");
    assert(
      Boolean(refundRequest.reason?.includes("Course content did not match syllabus")),
      "Refund reason properly captured"
    );

    // Verify transaction remains CAPTURED and enrollment remains ACTIVE
    const txAfterRequest = await prisma.paymentTransaction.findUnique({ where: { id: testTx.id } });
    assert(txAfterRequest?.status === "CAPTURED", "Transaction status remains 'CAPTURED' while pending review");

    const enrollmentAfterRequest = await prisma.enrollment.findUnique({ where: { id: testEnrollment.id } });
    assert(enrollmentAfterRequest?.status === "ACTIVE", "Student enrollment remains 'ACTIVE' while pending review");

    console.log("\n📋 Step 2: Prevent Duplicate Requests While Pending...");
    let duplicateBlocked = false;
    try {
      await PaymentService.requestRefund({
        transactionId: testTx.id,
        requestedBy: testStudent.id,
        reason: "Duplicate attempt",
      });
    } catch (err: any) {
      if (err.message.includes("CONFLICT")) {
        duplicateBlocked = true;
      }
    }
    assert(duplicateBlocked, "Duplicate refund request is blocked with CONFLICT error");

    console.log("\n📋 Step 3: Admin Review & Filter Queries...");
    const pendingList = await AdminService.getRefunds({ status: "PENDING" });
    const foundPending = pendingList.refunds.some((r) => r.id === refundRequest.id);
    assert(foundPending, "Admin can query pending refund request under 'PENDING' filter");

    console.log("\n📋 Step 4: Admin Rejection Flow...");
    const rejectedRefund = await AdminService.processRefund(
      testAdmin.id,
      refundRequest.id,
      "REJECT",
      "Request submitted past initial review criteria."
    );
    assert(rejectedRefund.status === "REJECTED", "Refund request status transitioned to 'REJECTED'");

    const txAfterRejection = await prisma.paymentTransaction.findUnique({ where: { id: testTx.id } });
    assert(txAfterRejection?.status === "CAPTURED", "Transaction remains 'CAPTURED' after rejection");

    console.log("\n📋 Step 5: Learner Resubmission & Admin Approval...");
    const secondRequest = await PaymentService.requestRefund({
      transactionId: testTx.id,
      requestedBy: testStudent.id,
      reason: "Class schedule conflict",
      notes: "Resubmitting with updated details.",
    });
    assert(secondRequest.status === "PENDING", "Second refund request created after previous was rejected");

    const approvedRefund = await AdminService.processRefund(
      testAdmin.id,
      secondRequest.id,
      "APPROVE"
    );
    assert(approvedRefund.status === "REFUNDED", "Approved refund transitioned to 'REFUNDED'");

    const txAfterApproval = await prisma.paymentTransaction.findUnique({ where: { id: testTx.id } });
    assert(txAfterApproval?.status === "REFUNDED", "Transaction transitioned to 'REFUNDED' upon approval");

    const enrollmentAfterApproval = await prisma.enrollment.findUnique({ where: { id: testEnrollment.id } });
    assert(enrollmentAfterApproval?.status === "CANCELLED", "Enrollment revoked and marked 'CANCELLED' upon approval");

    console.log("\n📋 Step 6: Prevent Request for Already Refunded Purchase...");
    let refundedBlocked = false;
    try {
      await PaymentService.requestRefund({
        transactionId: testTx.id,
        requestedBy: testStudent.id,
        reason: "Attempt after refunded",
      });
    } catch (err: any) {
      if (err.message.includes("CONFLICT") || err.message.includes("INVALID_STATE")) {
        refundedBlocked = true;
      }
    }
    assert(refundedBlocked, "Refund request on already refunded transaction blocked");

    console.log("\n=======================================================");
    console.log(`🎉 ALL ${passed} REFUND LIFECYCLE TESTS PASSED!`);
    console.log("=======================================================\n");

  } finally {
    // Cleanup
    if (testTx?.id) {
      await prisma.financialLedgerEntry.deleteMany({ where: { transactionId: testTx.id } });
      await prisma.refund.deleteMany({ where: { transactionId: testTx.id } });
      await prisma.paymentTransaction.deleteMany({ where: { id: testTx.id } });
    }
    if (testEnrollment?.id) {
      await prisma.enrollment.deleteMany({ where: { id: testEnrollment.id } });
    }
    if (testCourse?.id) {
      await prisma.course.deleteMany({ where: { id: testCourse.id } });
    }
    if (testTeacher?.id) {
      await prisma.teacherProfile.deleteMany({ where: { userId: testTeacher.id } });
      await prisma.user.deleteMany({ where: { id: testTeacher.id } });
    }
    if (testStudent?.id) {
      await prisma.user.deleteMany({ where: { id: testStudent.id } });
    }
    if (testAdmin?.id) {
      await prisma.user.deleteMany({ where: { id: testAdmin.id } });
    }
  }
}

runRefundLifecycleTests().catch((err) => {
  console.error("Refund Lifecycle Tests Failed:", err);
  process.exit(1);
});
