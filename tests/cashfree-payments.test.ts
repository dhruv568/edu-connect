import { prisma } from "../lib/prisma";
import {
  cashfreeClient,
  verifyCashfreeWebhookSignature,
  CashfreeClient,
} from "../lib/cashfree";
import { PaymentService } from "../services/payment-service";
import { LedgerService } from "../services/ledger-service";
import { RouteService } from "../services/route-service";
import crypto from "crypto";

async function runCashfreePaymentTests() {
  console.log("\n=======================================================");
  console.log("🧪 STARTING CASHFREE PAYMENTS & SPLIT INTEGRATION TESTS");
  console.log("=======================================================\n");

  const originalEnv = { ...process.env };
  process.env.EMAIL_PROVIDER = "console";
  let passedCount = 0;

  function assert(condition: boolean, message: string) {
    if (!condition) {
      console.error(`❌ Assertion Failed: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
    console.log(`   ✅ ${message}`);
    passedCount++;
  }

  const timestamp = Date.now();
  const randomSuffix = crypto.randomBytes(4).toString("hex");

  let testStudent: any;
  let testTeacher: any;
  let testCourse: any;

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
    // -------------------------------------------------------------
    // TEST 1: Cashfree Client Configuration
    // -------------------------------------------------------------
    console.log("📋 Test 1: Cashfree Client Configuration & Headers...");
    
    assert(cashfreeClient.getApiVersion() === "2023-08-01", "Cashfree API Version is 2023-08-01");
    assert(Boolean(cashfreeClient.getAppId()), "Cashfree App ID is configured");
    assert(
      cashfreeClient.getEnv() === "SANDBOX" || cashfreeClient.getEnv() === "PRODUCTION",
      "Cashfree Environment is valid (SANDBOX or PRODUCTION)"
    );

    // -------------------------------------------------------------
    // TEST 2: Webhook HMAC-SHA256 Signature Verification
    // -------------------------------------------------------------
    console.log("\n📋 Test 2: Cashfree Webhook HMAC-SHA256 Signature Verification...");

    const testSecretKey = "test_cf_secret_key_abcdef123456";
    const testPayload = JSON.stringify({
      data: {
        order: { order_id: "CF_ORDER_12345", order_amount: 999.0 },
        payment: { cf_payment_id: 888777, payment_status: "SUCCESS" },
      },
      type: "PAYMENT_SUCCESS_WEBHOOK",
    });
    const testTimestamp = `${Date.now()}`;

    // Compute expected base64 signature
    const signaturePayload = `${testTimestamp}${testPayload}`;
    const validSignature = crypto
      .createHmac("sha256", testSecretKey)
      .update(signaturePayload)
      .digest("base64");

    const isSigValid = verifyCashfreeWebhookSignature(
      testPayload,
      testTimestamp,
      validSignature,
      testSecretKey
    );
    assert(isSigValid === true, "Valid HMAC-SHA256 base64 webhook signature passes verification");

    const isBadSigValid = verifyCashfreeWebhookSignature(
      testPayload,
      testTimestamp,
      "completely_invalid_signature==",
      testSecretKey
    );
    assert(isBadSigValid === false, "Tampered webhook signature is rejected");

    // -------------------------------------------------------------
    // TEST 3: Cashfree Direct Order Creation
    // -------------------------------------------------------------
    console.log("\n📋 Test 3: Cashfree Direct Order Creation...");

    const cfOrder = await cashfreeClient.createOrder({
      orderId: `CF_TEST_${timestamp}`,
      orderAmount: 499.0,
      orderCurrency: "INR",
      customerDetails: {
        customer_id: `cust_${randomSuffix}`,
        customer_email: `customer.${randomSuffix}@educonnects.com`,
        customer_name: "Test Customer",
        customer_phone: "9876543210",
      },
      orderNote: "Test Cashfree Order",
    });

    assert(Boolean(cfOrder.order_id), "Cashfree order ID returned");
    assert(Boolean(cfOrder.payment_session_id), "Cashfree payment session ID returned");
    assert(cfOrder.order_amount === 499.0, "Cashfree order amount is 499.00");
    assert(cfOrder.order_currency === "INR", "Cashfree order currency is INR");

    // -------------------------------------------------------------
    // TEST 4: End-to-End Payment Flow (Order -> Verify -> Ledger)
    // -------------------------------------------------------------
    console.log("\n📋 Test 4: End-to-End PaymentService Order & Verification...");

    testTeacher = await prisma.user.create({
      data: {
        email: `teacher.cf.${timestamp}@educonnects.com`,
        passwordHash: "test_hash",
        role: "TEACHER",
        emailVerified: true,
        profile: { create: { firstName: "Jane", lastName: "Teacher" } },
        teacherProfile: {
          create: {
            headline: "Senior Physics Faculty",
            bio: "Experienced Educator",
            verificationStatus: "VERIFIED",
          },
        },
      },
      include: { teacherProfile: true },
    });

    testStudent = await prisma.user.create({
      data: {
        email: `student.cf.${timestamp}@educonnects.com`,
        passwordHash: "test_hash",
        role: "STUDENT",
        emailVerified: true,
        profile: { create: { firstName: "Bob", lastName: "Learner" } },
      },
    });

    testCourse = await prisma.course.create({
      data: {
        title: `Quantum Physics Masterclass ${timestamp}`,
        slug: `quantum-phys-${timestamp}`,
        description: "Comprehensive Quantum Mechanics course",
        subject: "Physics",
        price: 1299.0, // ₹1,299
        status: "PUBLISHED",
        teacherId: testTeacher.teacherProfile!.id,
      },
    });

    const paymentOrderResult = await PaymentService.createPaymentOrder({
      userId: testStudent.id,
      type: "COURSE_ENROLLMENT",
      courseId: testCourse.id,
    });

    assert(paymentOrderResult.isFree === false, "Course is paid product");
    assert(paymentOrderResult.amountPaise === 129900, "Calculated price is 129900 paise");
    assert(paymentOrderResult.amount === 1299, "Amount is ₹1299");
    assert(Boolean(paymentOrderResult.cfOrderId), "Cashfree order ID assigned");
    assert(Boolean(paymentOrderResult.paymentSessionId), "Cashfree payment session ID assigned");

    // Verify DB order record
    const dbOrder = await prisma.paymentOrder.findUnique({
      where: { providerOrderId: paymentOrderResult.cfOrderId },
    });
    assert(dbOrder?.provider === "CASHFREE", "PaymentOrder provider is CASHFREE");
    assert(dbOrder?.status === "CREATED", "PaymentOrder status is CREATED");

    // Verify & Complete Payment
    const verifyResult = await PaymentService.verifyAndCompletePayment({
      userId: testStudent.id,
      orderId: paymentOrderResult.cfOrderId!,
      cfPaymentId: `cf_pay_${timestamp}`,
      paymentStatus: "SUCCESS",
    });

    assert(verifyResult.success === true, "Payment verification succeeded");
    assert(verifyResult.status === "CAPTURED", "Transaction status is CAPTURED");

    // Check Enrollment status
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: { studentId: testStudent.id, courseId: testCourse.id },
      },
    });
    assert(enrollment?.status === "ACTIVE", "Student course enrollment activated");

    // Check Financial Ledger
    const ledger = await prisma.financialLedgerEntry.findMany({
      where: { teacherId: testTeacher.teacherProfile!.id },
    });
    assert(ledger.length >= 3, "Financial ledger entries created (Gross, Commission, Teacher Share)");

    // -------------------------------------------------------------
    // TEST 5: Cashfree Refund Flow
    // -------------------------------------------------------------
    console.log("\n📋 Test 5: Cashfree Refund Processing & Access Revocation...");

    const refund = await PaymentService.processRefund({
      transactionId: verifyResult.transactionId,
      requestedBy: testStudent.id,
      reason: "Course not suited to requirements",
    });

    assert(refund.status === "REFUNDED", "Refund created with status REFUNDED");

    const updatedEnrollment = await prisma.enrollment.findUnique({
      where: { id: enrollment!.id },
    });
    assert(updatedEnrollment?.status === "CANCELLED", "Enrollment cancelled upon refund");

    // -------------------------------------------------------------
    // TEST 6: Cashfree Split Account Onboarding
    // -------------------------------------------------------------
    console.log("\n📋 Test 6: Teacher Cashfree Split Account Onboarding...");

    const splitAccount = await RouteService.initiateTeacherOnboarding({
      teacherId: testTeacher.teacherProfile!.id,
      accountName: "Jane Teacher Payout Account",
    });

    assert(splitAccount.provider === "CASHFREE_SPLIT", "Payout account provider is CASHFREE_SPLIT");
    assert(splitAccount.status === "ACTIVE", "Payout account status is ACTIVE");
    assert(splitAccount.kycStatus === "VERIFIED", "KYC status is VERIFIED");

    // Cleanup
    await prisma.financialLedgerEntry.deleteMany({ where: { teacherId: testTeacher.teacherProfile!.id } });
    await prisma.teacherPayout.deleteMany({ where: { teacherId: testTeacher.teacherProfile!.id } });
    await prisma.teacherPayoutAccount.deleteMany({ where: { teacherId: testTeacher.teacherProfile!.id } });
    await prisma.refund.deleteMany({ where: { requestedBy: testStudent.id } });
    await prisma.paymentTransaction.deleteMany({ where: { userId: testStudent.id } });
    await prisma.paymentOrder.deleteMany({ where: { userId: testStudent.id } });
    await prisma.enrollment.deleteMany({ where: { studentId: testStudent.id } });
    await prisma.course.delete({ where: { id: testCourse.id } });
    await prisma.user.delete({ where: { id: testStudent.id } });
    await prisma.user.delete({ where: { id: testTeacher.id } });

    console.log("\n=======================================================");
    console.log(`🎉 ALL ${passedCount} CASHFREE PAYMENT TESTS PASSED!`);
    console.log("=======================================================\n");

  } catch (err: any) {
    console.error("FATAL CASHFREE TEST ERROR:", err);
    throw err;
  } finally {
    process.env = originalEnv;
  }
}

runCashfreePaymentTests().catch((err) => {
  console.error("Cashfree Test Run Failed:", err);
  process.exit(1);
});
