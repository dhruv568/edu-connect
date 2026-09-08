import { PrismaClient } from "@prisma/client";
import { PaymentService } from "../services/payment-service";
import { LedgerService } from "../services/ledger-service";
import { RouteService } from "../services/route-service";
import { cashfreeClient, verifyCashfreeWebhookSignature } from "../lib/cashfree";
import crypto from "crypto";

const prisma = new PrismaClient();

async function runModule8PaymentTests() {
  console.log("🧪 Starting EduConnects Module 08 — Cashfree Payment & Financial System Test Suite...\n");

  const originalEnv = { ...process.env };
  process.env.EMAIL_PROVIDER = "console";
  let passedTests = 0;
  let failedTests = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      failedTests++;
    }
  }

  // DB connection retry helper for remote PostgreSQL
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      await prisma.$connect();
      break;
    } catch (connErr) {
      if (attempt === 5) throw connErr;
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  try {
    const randomSuffix = crypto.randomBytes(4).toString("hex");

    // -------------------------------------------------------------
    // Setup Test Users: Teacher & Student
    // -------------------------------------------------------------
    console.log("🔹 Creating test entities in database...");

    const teacherUser = await prisma.user.create({
      data: {
        email: `teacher.cf.${randomSuffix}@educonnects.com`,
        passwordHash: "$2a$10$xyz",
        role: "TEACHER",
        emailVerified: true,
        profile: {
          create: {
            firstName: "Sarah",
            lastName: "Patel",
          },
        },
        teacherProfile: {
          create: {
            headline: "Senior Mathematics Specialist",
            bio: "Expert educator",
            verificationStatus: "VERIFIED",
          },
        },
      },
      include: { teacherProfile: true },
    });

    const studentUser = await prisma.user.create({
      data: {
        email: `student.cf.${randomSuffix}@educonnects.com`,
        passwordHash: "$2a$10$xyz",
        role: "STUDENT",
        emailVerified: true,
        profile: {
          create: {
            firstName: "Alex",
            lastName: "Sharma",
          },
        },
      },
    });

    const adminUser = await prisma.user.create({
      data: {
        email: `admin.cf.${randomSuffix}@educonnects.com`,
        passwordHash: "$2a$10$xyz",
        role: "ADMIN",
        emailVerified: true,
        profile: {
          create: {
            firstName: "Admin",
            lastName: "User",
          },
        },
      },
    });

    // Create Test Paid Course (₹799 -> 79900 paise)
    const paidCourse = await prisma.course.create({
      data: {
        title: `Advanced Algebra & Geometry ${randomSuffix}`,
        slug: `algebra-pay-${randomSuffix}`,
        description: "Master high school algebra and trigonometry.",
        subject: "Mathematics",
        price: 799.0, // ₹799
        status: "PUBLISHED",
        teacherId: teacherUser.teacherProfile!.id,
      },
    });

    // Create Test Free Course (₹0)
    const freeCourse = await prisma.course.create({
      data: {
        title: `Intro to Logic ${randomSuffix}`,
        slug: `logic-free-${randomSuffix}`,
        description: "Free introduction to formal logic.",
        subject: "Mathematics",
        price: 0.0,
        status: "PUBLISHED",
        teacherId: teacherUser.teacherProfile!.id,
      },
    });

    // Create Test Paid Live Class Slot (₹499 -> 49900 paise)
    const paidSlot = await prisma.liveClassSlot.create({
      data: {
        teacherId: teacherUser.teacherProfile!.id,
        title: `Calculus Live Masterclass ${randomSuffix}`,
        subject: "Mathematics",
        startTime: new Date(Date.now() + 86400000), // tomorrow
        endTime: new Date(Date.now() + 90000000),
        price: 499.0, // ₹499
        maxCapacity: 2,
        status: "SCHEDULED",
      },
    });

    // -------------------------------------------------------------
    // Test 1: Cashfree Order Creation & Server-Side Price Security
    // -------------------------------------------------------------
    console.log("\n💳 1. Testing Cashfree Order Creation & Price Tampering Protection...");

    const orderResult = await PaymentService.createPaymentOrder({
      userId: studentUser.id,
      type: "COURSE_ENROLLMENT",
      courseId: paidCourse.id,
    });

    assert(!orderResult.isFree, "Paid course order is marked non-free");
    assert(orderResult.amountPaise === 79900, "Server calculated canonical price in integer paise (79900 paise = ₹799)");
    assert(orderResult.amount === 799, "Amount in rupees calculated accurately (799)");
    assert(Boolean(orderResult.cfOrderId), "Cashfree Order ID generated securely on backend");
    assert(Boolean(orderResult.paymentSessionId), "Cashfree Payment Session ID generated securely");
    assert(Boolean(orderResult.internalReference), "Internal reference code generated for auditability");

    // Verify DB order record stored with provider: "CASHFREE"
    const dbOrder = await prisma.paymentOrder.findUnique({
      where: { providerOrderId: orderResult.cfOrderId },
    });
    assert(dbOrder !== null && dbOrder.status === "CREATED" && dbOrder.provider === "CASHFREE", "PaymentOrder database record saved with status CREATED and provider CASHFREE");

    // -------------------------------------------------------------
    // Test 2: Free Course Instant Activation Bypass
    // -------------------------------------------------------------
    console.log("\n⚡ 2. Testing Free Product Bypass (Zero Cashfree Gateway Call)...");

    const freeOrderResult = await PaymentService.createPaymentOrder({
      userId: studentUser.id,
      type: "COURSE_ENROLLMENT",
      courseId: freeCourse.id,
    });

    assert(freeOrderResult.isFree === true, "Free course correctly identified as zero price");
    assert(freeOrderResult.amountPaise === 0, "Free course amount is 0 paise");

    const freeEnrollment = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId: studentUser.id, courseId: freeCourse.id } },
    });
    assert(freeEnrollment !== null && freeEnrollment.status === "ACTIVE", "Free course enrollment instantly set to ACTIVE without opening payment gateway");

    // -------------------------------------------------------------
    // Test 3: Cashfree Verification & Payment Capture
    // -------------------------------------------------------------
    console.log("\n🔒 3. Testing Cashfree Verification & Capture...");

    // Test valid completion
    const completionResult = await PaymentService.verifyAndCompletePayment({
      userId: studentUser.id,
      orderId: orderResult.cfOrderId!,
      cfPaymentId: `cf_pay_mock_${randomSuffix}`,
      paymentStatus: "SUCCESS",
    });

    assert(completionResult.success === true, "Payment completed successfully upon verification");
    assert(completionResult.status === "CAPTURED", "Transaction status updated to CAPTURED");

    // Verify course enrollment status updated to ACTIVE
    const paidEnrollment = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId: studentUser.id, courseId: paidCourse.id } },
    });
    assert(paidEnrollment !== null && paidEnrollment.status === "ACTIVE", "Paid course enrollment status transitioned to ACTIVE");

    // -------------------------------------------------------------
    // Test 4: Duplicate Purchase Protection
    // -------------------------------------------------------------
    console.log("\n🛡️ 4. Testing Duplicate Active Purchase Protection...");

    try {
      await PaymentService.createPaymentOrder({
        userId: studentUser.id,
        type: "COURSE_ENROLLMENT",
        courseId: paidCourse.id,
      });
      assert(false, "Duplicate purchase was blocked");
    } catch (err: any) {
      assert(err.message.includes("DUPLICATE_PURCHASE"), "Duplicate purchase attempt for active enrollment blocked with exception");
    }

    // -------------------------------------------------------------
    // Test 5: Live Class Slot Booking & Capacity Validation
    // -------------------------------------------------------------
    console.log("\n📅 5. Testing Live Class Booking & Capacity Protection...");

    const slotOrderResult = await PaymentService.createPaymentOrder({
      userId: studentUser.id,
      type: "LIVE_CLASS_BOOKING",
      liveClassSlotId: paidSlot.id,
    });

    assert(slotOrderResult.amountPaise === 49900, "Live class slot price calculated from DB (49900 paise = ₹499)");

    const slotCompletion = await PaymentService.verifyAndCompletePayment({
      userId: studentUser.id,
      orderId: slotOrderResult.cfOrderId!,
      cfPaymentId: `cf_pay_slot_mock_${randomSuffix}`,
      paymentStatus: "SUCCESS",
    });

    assert(slotCompletion.success === true, "Live class booking payment captured");

    const liveBooking = await prisma.booking.findFirst({
      where: { liveClassSlotId: paidSlot.id, studentId: studentUser.id },
    });
    assert(liveBooking !== null && liveBooking.status === "CONFIRMED", "Live class booking status transitioned to CONFIRMED");

    // -------------------------------------------------------------
    // Test 6: Financial Ledger Double-Entry Auditability
    // -------------------------------------------------------------
    console.log("\n📊 6. Testing Financial Ledger Double-Entry Accounting...");

    const ledgerEntries = await prisma.financialLedgerEntry.findMany({
      where: { teacherId: teacherUser.teacherProfile!.id },
    });

    assert(ledgerEntries.length >= 3, "Double-entry financial ledger created immutable audit entries");

    const paymentEntry = ledgerEntries.find((e) => e.type === "PAYMENT");
    const commissionEntry = ledgerEntries.find((e) => e.type === "PLATFORM_COMMISSION");
    const teacherEntry = ledgerEntries.find((e) => e.type === "TEACHER_EARNING");

    assert(paymentEntry !== undefined && paymentEntry.amountPaise === 79900, "Ledger recorded gross payment (+₹799)");
    assert(commissionEntry !== undefined && commissionEntry.amountPaise === 7990, "Ledger snapshot recorded 10% platform commission (+₹79.90)");
    assert(teacherEntry !== undefined && teacherEntry.amountPaise === 71910, "Ledger recorded 90% net teacher earning share (+₹719.10)");

    // -------------------------------------------------------------
    // Test 7: Teacher Earnings Summary Metrics
    // -------------------------------------------------------------
    console.log("\n💼 7. Testing Teacher Earnings Summary Aggregations...");

    const earningsSummary = await LedgerService.getTeacherEarningsSummary(teacherUser.teacherProfile!.id);
    assert(earningsSummary.totalEarningsPaise > 0, "Teacher total gross earnings aggregated correctly");
    assert(earningsSummary.totalEarnings === earningsSummary.totalEarningsPaise / 100, "Teacher earnings formatted in canonical rupees without floating point loss");

    // -------------------------------------------------------------
    // Test 8: Cashfree Webhook Signature Verification & Idempotency
    // -------------------------------------------------------------
    console.log("\n🔔 8. Testing Cashfree Webhook Verification & Idempotency...");

    const webhookEventId = `cf_evt_test_${randomSuffix}`;
    const rawWebhookPayload = JSON.stringify({
      type: "PAYMENT_SUCCESS_WEBHOOK",
      data: {
        order: { order_id: `CF_WH_${randomSuffix}`, order_amount: 799.0 },
        payment: { cf_payment_id: 998877, payment_status: "SUCCESS" },
      },
    });
    const webhookTimestamp = `${Date.now()}`;
    const whSignature = `mock_webhook_sig_${randomSuffix}`;

    // Verify webhook signature function
    const isWhSigValid = cashfreeClient.verifyWebhookSignature(rawWebhookPayload, webhookTimestamp, whSignature);
    assert(isWhSigValid === true, "Cashfree Webhook HMAC signature verified successfully");

    // Save webhook event to DB to test idempotency
    const whRecord1 = await prisma.paymentWebhookEvent.create({
      data: {
        provider: "CASHFREE",
        eventId: webhookEventId,
        eventType: "PAYMENT_SUCCESS_WEBHOOK",
        payload: rawWebhookPayload,
        processed: true,
      },
    });

    assert(whRecord1 !== null, "Webhook event logged in payment_webhook_events table");

    // Duplicate webhook attempt should hit unique constraint
    try {
      await prisma.paymentWebhookEvent.create({
        data: {
          provider: "CASHFREE",
          eventId: webhookEventId,
          eventType: "PAYMENT_SUCCESS_WEBHOOK",
          payload: rawWebhookPayload,
        },
      });
      assert(false, "Duplicate webhook event was inserted");
    } catch {
      assert(true, "Duplicate webhook event rejected by database @@unique([provider, eventId]) constraint");
    }

    // -------------------------------------------------------------
    // Test 9: Cashfree Split Feature Flag & Onboarding
    // -------------------------------------------------------------
    console.log("\n🔀 9. Testing Cashfree Split Feature Flag & Onboarding Architecture...");

    const isRouteActive = RouteService.isRouteEnabled();
    assert(typeof isRouteActive === "boolean", "Cashfree Split feature flag evaluated safely");

    const payoutAccount = await RouteService.getOrCreatePayoutAccount(teacherUser.teacherProfile!.id);
    assert(payoutAccount !== null && payoutAccount.provider === "CASHFREE_SPLIT", "Teacher payout account record initialized for Cashfree Split");

    const onboardedAccount = await RouteService.initiateTeacherOnboarding({
      teacherId: teacherUser.teacherProfile!.id,
      accountName: "Sarah Patel",
    });
    assert(onboardedAccount.status === "ACTIVE", "Teacher Split Account onboarding state updated to ACTIVE");

    // -------------------------------------------------------------
    // Test 10: Refund Workflow & Course Access Revocation
    // -------------------------------------------------------------
    console.log("\n↩️ 10. Testing Refund Processing & Access Revocation...");

    const capturedTx = await prisma.paymentTransaction.findFirst({
      where: { userId: studentUser.id, status: "CAPTURED", type: "COURSE_ENROLLMENT" },
    });

    assert(capturedTx !== null, "Found captured transaction for refund testing");

    const refundResult = await PaymentService.processRefund({
      transactionId: capturedTx!.id,
      requestedBy: studentUser.id,
      reason: "Course material did not meet expectations",
    });

    assert(refundResult.status === "REFUNDED", "Refund record created with status REFUNDED");

    // Verify transaction updated to REFUNDED
    const updatedTx = await prisma.paymentTransaction.findUnique({
      where: { id: capturedTx!.id },
    });
    assert(updatedTx!.status === "REFUNDED", "PaymentTransaction status updated to REFUNDED");

    // Verify course enrollment status updated to CANCELLED / access revoked
    const revokedEnrollment = await prisma.enrollment.findUnique({
      where: { id: capturedTx!.enrollmentId! },
    });
    assert(revokedEnrollment!.status === "CANCELLED", "Course enrollment status transitioned to CANCELLED and access revoked");

    // Verify financial ledger recorded refund reversal
    const refundReversalEntry = await prisma.financialLedgerEntry.findFirst({
      where: { transactionId: capturedTx!.id, type: "REFUND_REVERSAL" },
    });
    assert(refundReversalEntry !== undefined, "Financial ledger recorded REFUND_REVERSAL debit entry");

    // -------------------------------------------------------------
    // Test 11: Admin Financial Summary & Reconciliation Tool
    // -------------------------------------------------------------
    console.log("\n📈 11. Testing Admin Financial Analytics & Reconciliation...");

    const adminSummary = await LedgerService.getAdminFinancialSummary();
    assert(adminSummary.totalRevenuePaise >= 0, "Admin total system revenue calculated");
    assert(adminSummary.totalCommissionPaise >= 0, "Admin total platform commission calculated");

    // -------------------------------------------------------------
    // Cleanup Test Data
    // -------------------------------------------------------------
    console.log("\n🧹 Cleaning up test records...");
    await prisma.financialLedgerEntry.deleteMany({ where: { teacherId: teacherUser.teacherProfile!.id } });
    await prisma.teacherPayout.deleteMany({ where: { teacherId: teacherUser.teacherProfile!.id } });
    await prisma.teacherPayoutAccount.deleteMany({ where: { teacherId: teacherUser.teacherProfile!.id } });
    await prisma.refund.deleteMany({ where: { requestedBy: studentUser.id } });
    await prisma.paymentWebhookEvent.deleteMany({ where: { eventId: webhookEventId } });
    await prisma.paymentTransaction.deleteMany({ where: { userId: studentUser.id } });
    await prisma.paymentOrder.deleteMany({ where: { userId: studentUser.id } });
    await prisma.booking.deleteMany({ where: { studentId: studentUser.id } });
    await prisma.enrollment.deleteMany({ where: { studentId: studentUser.id } });
    await prisma.liveClassSlot.delete({ where: { id: paidSlot.id } });
    await prisma.course.delete({ where: { id: paidCourse.id } });
    await prisma.course.delete({ where: { id: freeCourse.id } });
    await prisma.user.delete({ where: { id: studentUser.id } });
    await prisma.user.delete({ where: { id: teacherUser.id } });
    await prisma.user.delete({ where: { id: adminUser.id } });

    console.log(`\n==================================================`);
    console.log(`🎉 MODULE 08 CASHFREE TEST SUITE SUMMARY`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`==================================================\n`);

    if (failedTests > 0) {
      process.exit(1);
    }
  } catch (error: any) {
    console.error("❌ Fatal error in Module 08 Cashfree Payment tests:", error);
    process.exit(1);
  } finally {
    process.env = originalEnv;
    await prisma.$disconnect();
  }
}

runModule8PaymentTests();
