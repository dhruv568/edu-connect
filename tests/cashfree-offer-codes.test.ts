import { prisma } from "../lib/prisma";
import { OfferService } from "../services/offer-service";
import { PaymentService } from "../services/payment-service";
import { cashfreeClient } from "../lib/cashfree";
import crypto from "crypto";

async function runOfferCodeTests() {
  process.env.EMAIL_PROVIDER = "console";
  console.log("\n=======================================================");
  console.log("🧪 STARTING CASHFREE OFFER CODE & DISCOUNT VERIFICATION");
  console.log("=======================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (!condition) {
      console.error(`❌ Assertion Failed: ${message}`);
      failed++;
      throw new Error(`Assertion failed: ${message}`);
    }
    console.log(`   ✅ ${message}`);
    passed++;
  }

  const timestamp = Date.now();
  const randomSuffix = crypto.randomBytes(4).toString("hex");

  let testTeacher: any;
  let testStudent: any;
  let testCourse: any;

  try {
    // -------------------------------------------------------------
    // SETUP: Test Teacher, Student, and Course
    // -------------------------------------------------------------
    console.log("📋 Setup: Initializing test entities...");

    testTeacher = await prisma.user.create({
      data: {
        email: `teacher.offer.${timestamp}@educonnects.com`,
        passwordHash: "test_hash",
        role: "TEACHER",
        emailVerified: true,
        profile: { create: { firstName: "Offer", lastName: "Teacher" } },
        teacherProfile: {
          create: {
            headline: "Top Math Faculty",
            bio: "Experienced Educator",
            verificationStatus: "VERIFIED",
          },
        },
      },
      include: { teacherProfile: true },
    });

    testStudent = await prisma.user.create({
      data: {
        email: `student.offer.${timestamp}@educonnects.com`,
        passwordHash: "test_hash",
        role: "STUDENT",
        emailVerified: true,
        profile: { create: { firstName: "Discount", lastName: "Learner" } },
      },
    });

    testCourse = await prisma.course.create({
      data: {
        title: `Advanced Calculus ${timestamp}`,
        slug: `adv-calc-${timestamp}`,
        description: "Master Advanced Calculus",
        subject: "Mathematics",
        price: 1000.0, // ₹1,000 (100,000 paise)
        status: "PUBLISHED",
        teacherId: testTeacher.teacherProfile!.id,
      },
    });

    console.log("   ✅ Test entities created: Course price ₹1,000");

    // -------------------------------------------------------------
    // TEST 1: Verify Code "900FF" (90% Discount)
    // -------------------------------------------------------------
    console.log("\n📋 Test 1: Offer Code '900FF' Validation & Calculation...");

    const offer90 = await OfferService.validateOfferCode("900FF", 100000);
    assert(offer90.isValid === true, "Code 900FF is recognized as valid");
    assert(offer90.discountValue === 90, "Code 900FF discount percentage is 90%");
    assert(offer90.discountAmountPaise === 90000, "Calculated discount is 90,000 paise (₹900)");
    assert(offer90.finalAmountPaise === 10000, "Calculated payable amount is 10,000 paise (₹100)");
    assert(offer90.finalAmountRupees === 100, "Payable in Rupees is ₹100.00");
    assert(offer90.isFree === false, "Product is not free (₹100 payable)");

    // Test case insensitivity and alternate spelling (90OFF vs 900FF)
    const offer90Alt = await OfferService.validateOfferCode("90off", 100000);
    assert(offer90Alt.isValid === true, "Lowercase '90off' resolves cleanly");
    assert(offer90Alt.finalAmountPaise === 10000, "Payable amount is ₹100 for '90off'");

    // -------------------------------------------------------------
    // TEST 2: Dynamic Admin-Created Percentage Offer Code
    // -------------------------------------------------------------
    console.log("\n📋 Test 2: Dynamic Admin Percentage Offer Code (e.g. FLASH30)...");

    const flash30Offer = await prisma.offer.create({
      data: {
        title: `Flash 30% Discount ${timestamp}`,
        code: `FLASH30_${timestamp}`,
        discountText: "30% OFF",
        discountType: "PERCENTAGE",
        discountValue: 30,
        startDate: new Date(Date.now() - 3600000),
        endDate: new Date(Date.now() + 86400000 * 5),
        isActive: true,
        targetAudience: "ALL",
      },
    });

    const flash30Result = await OfferService.validateOfferCode(
      `FLASH30_${timestamp}`,
      100000
    );
    assert(flash30Result.isValid === true, "Dynamic code FLASH30 validated");
    assert(flash30Result.discountAmountPaise === 30000, "Discount is 30,000 paise (₹300)");
    assert(flash30Result.finalAmountPaise === 70000, "Payable is 70,000 paise (₹700)");

    // -------------------------------------------------------------
    // TEST 3: Dynamic Fixed Rupee Discount Offer Code (e.g. ₹250 FLAT OFF)
    // -------------------------------------------------------------
    console.log("\n📋 Test 3: Dynamic Fixed Rupee Discount Code (e.g. FLAT250)...");

    const flat250Offer = await prisma.offer.create({
      data: {
        title: `Flat ₹250 Off ${timestamp}`,
        code: `FLAT250_${timestamp}`,
        discountText: "FLAT ₹250 OFF",
        discountType: "FIXED",
        discountValue: 250,
        startDate: new Date(Date.now() - 3600000),
        endDate: new Date(Date.now() + 86400000 * 5),
        isActive: true,
        targetAudience: "ALL",
      },
    });

    const flat250Result = await OfferService.validateOfferCode(
      `FLAT250_${timestamp}`,
      100000
    );
    assert(flat250Result.isValid === true, "Fixed discount code validated");
    assert(flat250Result.discountAmountPaise === 25000, "Discount is 25,000 paise (₹250)");
    assert(flat250Result.finalAmountPaise === 75000, "Payable is 75,000 paise (₹750)");

    // -------------------------------------------------------------
    // TEST 4: Invalid, Expired, Inactive, and Limit-Exceeded Rejections
    // -------------------------------------------------------------
    console.log("\n📋 Test 4: Rejection of Invalid, Expired, Inactive, & Limit-Exceeded Codes...");

    // 4a. Non-existent code
    let rejectedNotFound = false;
    try {
      await OfferService.validateOfferCode("TOTALLY_FAKE_CODE_999", 100000);
    } catch (err: any) {
      rejectedNotFound = err.message.includes("NOT_FOUND");
    }
    assert(rejectedNotFound, "Non-existent code is rejected with NOT_FOUND");

    // 4b. Expired code
    const expiredOffer = await prisma.offer.create({
      data: {
        title: `Expired Offer ${timestamp}`,
        code: `EXPIRED_${timestamp}`,
        discountText: "50% OFF",
        discountType: "PERCENTAGE",
        discountValue: 50,
        startDate: new Date(Date.now() - 86400000 * 10),
        endDate: new Date(Date.now() - 86400000 * 2), // Expired 2 days ago
        isActive: true,
      },
    });

    let rejectedExpired = false;
    try {
      await OfferService.validateOfferCode(`EXPIRED_${timestamp}`, 100000);
    } catch (err: any) {
      rejectedExpired = err.message.includes("OFFER_EXPIRED");
    }
    assert(rejectedExpired, "Expired offer code is rejected with OFFER_EXPIRED");

    // 4c. Inactive code
    const inactiveOffer = await prisma.offer.create({
      data: {
        title: `Inactive Offer ${timestamp}`,
        code: `INACTIVE_${timestamp}`,
        discountText: "50% OFF",
        discountType: "PERCENTAGE",
        discountValue: 50,
        isActive: false, // Inactive
      },
    });

    let rejectedInactive = false;
    try {
      await OfferService.validateOfferCode(`INACTIVE_${timestamp}`, 100000);
    } catch (err: any) {
      rejectedInactive = err.message.includes("OFFER_INACTIVE");
    }
    assert(rejectedInactive, "Deactivated offer code is rejected with OFFER_INACTIVE");

    // 4d. Usage limit exceeded
    const limitOffer = await prisma.offer.create({
      data: {
        title: `Limited Offer ${timestamp}`,
        code: `LIMIT_${timestamp}`,
        discountText: "50% OFF",
        discountType: "PERCENTAGE",
        discountValue: 50,
        usageLimit: 3,
        usedCount: 3, // Already used 3 times
        isActive: true,
      },
    });

    let rejectedLimit = false;
    try {
      await OfferService.validateOfferCode(`LIMIT_${timestamp}`, 100000);
    } catch (err: any) {
      rejectedLimit = err.message.includes("USAGE_LIMIT_EXCEEDED");
    }
    assert(rejectedLimit, "Usage-limit-exceeded code is rejected with USAGE_LIMIT_EXCEEDED");

    // 4e. Minimum order amount not met
    const minOrderOffer = await prisma.offer.create({
      data: {
        title: `Min Order Offer ${timestamp}`,
        code: `MIN5000_${timestamp}`,
        discountText: "10% OFF",
        discountType: "PERCENTAGE",
        discountValue: 10,
        minOrderAmount: 5000, // Requires ₹5,000 minimum
        isActive: true,
      },
    });

    let rejectedMinOrder = false;
    try {
      await OfferService.validateOfferCode(`MIN5000_${timestamp}`, 100000); // Only ₹1,000
    } catch (err: any) {
      rejectedMinOrder = err.message.includes("MIN_PURCHASE_NOT_MET");
    }
    assert(rejectedMinOrder, "Order below minOrderAmount is rejected with MIN_PURCHASE_NOT_MET");

    // -------------------------------------------------------------
    // TEST 5: Cashfree Order Creation with "900FF"
    // -------------------------------------------------------------
    console.log("\n📋 Test 5: End-to-End Cashfree Checkout Order with '900FF'...");

    const orderWith900FF = await PaymentService.createPaymentOrder({
      userId: testStudent.id,
      type: "COURSE_ENROLLMENT",
      courseId: testCourse.id,
      offerCode: "900FF",
    });

    assert(orderWith900FF.isFree === false, "Product is not free");
    assert(orderWith900FF.amountPaise === 10000, "Order amount is 10,000 paise (₹100)");
    assert(orderWith900FF.amount === 100, "Rupee amount passed to Cashfree is ₹100.00");
    assert(Boolean(orderWith900FF.paymentSessionId), "Cashfree payment session ID generated");
    assert(Boolean(orderWith900FF.cfOrderId), "Cashfree order ID generated");
    assert(orderWith900FF.appliedOffer?.code === "900FF", "Applied offer code reported as 900FF");
    assert(
      orderWith900FF.appliedOffer?.discountAmountPaise === 90000,
      "Reported discount is 90,000 paise"
    );

    // Verify DB PaymentOrder record stores discount notes
    const dbOrder = await prisma.paymentOrder.findUnique({
      where: { id: orderWith900FF.orderId },
    });
    assert(Boolean(dbOrder?.notes), "PaymentOrder stores offer metadata in notes");
    const parsedNotes = JSON.parse(dbOrder!.notes!);
    assert(parsedNotes.offerCode === "900FF", "Notes contain offerCode: 900FF");
    assert(parsedNotes.discountAmountPaise === 90000, "Notes contain discountAmountPaise: 90000");

    // -------------------------------------------------------------
    // TEST 6: Payment Verification & Offer Usage Increment
    // -------------------------------------------------------------
    console.log("\n📋 Test 6: Payment Verification & Offer Usage Count Increment...");

    const offerRecordBefore = await prisma.offer.findUnique({
      where: { id: parsedNotes.offerId },
    });
    const usageBefore = offerRecordBefore?.usedCount || 0;

    const verifyResult = await PaymentService.verifyAndCompletePayment({
      userId: testStudent.id,
      orderId: orderWith900FF.cfOrderId!,
      cfPaymentId: `cf_pay_offer_${timestamp}`,
      paymentStatus: "SUCCESS",
    });

    assert(verifyResult.status === "CAPTURED", "Payment captured successfully");

    // Verify usedCount incremented
    const offerRecordAfter = await prisma.offer.findUnique({
      where: { id: parsedNotes.offerId },
    });
    assert(
      offerRecordAfter?.usedCount === usageBefore + 1,
      `Offer usedCount incremented from ${usageBefore} to ${offerRecordAfter?.usedCount}`
    );

    // Clean up enrollment for subsequent test
    await prisma.enrollment.deleteMany({ where: { studentId: testStudent.id } });
    await prisma.paymentTransaction.deleteMany({ where: { userId: testStudent.id } });
    await prisma.paymentOrder.deleteMany({ where: { userId: testStudent.id } });

    // -------------------------------------------------------------
    // TEST 7: 100% Free Discount Handling
    // -------------------------------------------------------------
    console.log("\n📋 Test 7: 100% Free Discount Code Handling...");

    const free100Offer = await prisma.offer.create({
      data: {
        title: `100% Free Coupon ${timestamp}`,
        code: `FREE100_${timestamp}`,
        discountText: "100% OFF",
        discountType: "PERCENTAGE",
        discountValue: 100,
        isActive: true,
      },
    });

    const freeOrderResult = await PaymentService.createPaymentOrder({
      userId: testStudent.id,
      type: "COURSE_ENROLLMENT",
      courseId: testCourse.id,
      offerCode: `FREE100_${timestamp}`,
    });

    assert(freeOrderResult.isFree === true, "100% discount treated as free order");
    assert(freeOrderResult.amountPaise === 0, "Payable amount is 0 paise");

    const freeEnrollment = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId: testStudent.id, courseId: testCourse.id } },
    });
    assert(freeEnrollment?.status === "ACTIVE", "Student course enrollment activated for 100% free order");

    // -------------------------------------------------------------
    // CLEANUP
    // -------------------------------------------------------------
    console.log("\n🧹 Cleaning up test artifacts...");
    await prisma.enrollment.deleteMany({ where: { studentId: testStudent.id } });
    await prisma.paymentTransaction.deleteMany({ where: { userId: testStudent.id } });
    await prisma.paymentOrder.deleteMany({ where: { userId: testStudent.id } });
    await prisma.course.delete({ where: { id: testCourse.id } });
    await prisma.user.delete({ where: { id: testStudent.id } });
    await prisma.user.delete({ where: { id: testTeacher.id } });
    await prisma.offer.deleteMany({
      where: {
        id: {
          in: [
            flash30Offer.id,
            flat250Offer.id,
            expiredOffer.id,
            inactiveOffer.id,
            limitOffer.id,
            minOrderOffer.id,
            free100Offer.id,
          ],
        },
      },
    });

    console.log("\n=======================================================");
    console.log(`🎉 ALL ${passed} CASHFREE OFFER CODE TESTS PASSED! (${failed} FAILED)`);
    console.log("=======================================================\n");

  } catch (err: any) {
    console.error("FATAL OFFER CODE TEST ERROR:", err);
    process.exit(1);
  }
}

runOfferCodeTests().catch((err) => {
  console.error("Offer Code Test Run Failed:", err);
  process.exit(1);
});
