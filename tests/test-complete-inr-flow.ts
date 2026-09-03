import { prisma } from "@/lib/prisma";
import { PaymentService } from "@/services/payment-service";
import { formatCurrency, formatPaise, toPaise, fromPaise, DEFAULT_CURRENCY, DEFAULT_CURRENCY_SYMBOL } from "@/lib/currency";
import crypto from "crypto";

async function runEndToEndINRTest() {
  console.log("🚀 Running End-to-End INR Currency Flow Verification...\n");

  // Step 1: Config & Currency Utility Verification
  console.log("1️⃣  Verifying Centralized Currency Configuration & Formatting:");
  console.log(`   DEFAULT_CURRENCY: ${DEFAULT_CURRENCY}`);
  console.log(`   DEFAULT_CURRENCY_SYMBOL: ${DEFAULT_CURRENCY_SYMBOL}`);
  if (DEFAULT_CURRENCY !== "INR" || DEFAULT_CURRENCY_SYMBOL !== "₹") {
    throw new Error("Currency config mismatch!");
  }

  const testPrices = [0, 45, 599, 1299, 10000];
  testPrices.forEach((p) => {
    const formatted = formatCurrency(p);
    const paise = toPaise(p);
    const fromP = fromPaise(paise);
    const formattedPaise = formatPaise(paise);
    console.log(`   Price ${p} -> Formatted: ${formatted} | Paise: ${paise} | fromPaise: ${fromP} | FormattedPaise: ${formattedPaise}`);
    if (fromP !== p) throw new Error(`Paise conversion roundtrip failed for ${p}`);
    if (p === 599 && (formatted !== "₹599" || paise !== 59900)) throw new Error("₹599 formatting check failed!");
    if (p === 1299 && (formatted !== "₹1,299" || paise !== 129900)) throw new Error("₹1,299 formatting check failed!");
    if (p === 10000 && (formatted !== "₹10,000" || paise !== 1000000)) throw new Error("₹10,000 formatting check failed!");
  });
  console.log("   ✅ Currency utility correctly formats Indian Rupee numbers and subunit conversions.\n");

  // Setup test teacher, student, and course
  const teacherUser = await prisma.user.create({
    data: {
      email: `e2e_teacher_${Date.now()}@educonnect.test`,
      passwordHash: "mock_hash_teacher",
      role: "TEACHER",
      status: "ACTIVE",
      emailVerified: true,
      profile: {
        create: {
          firstName: "E2E",
          lastName: "Teacher",
        },
      },
      teacherProfile: {
        create: {
          headline: "E2E Teacher Headline",
          hourlyRate: 500,
          verificationStatus: "VERIFIED",
        },
      },
    },
    include: { teacherProfile: true },
  });

  const studentUser = await prisma.user.create({
    data: {
      email: `e2e_student_${Date.now()}@educonnect.test`,
      passwordHash: "mock_hash_student",
      role: "STUDENT",
      status: "ACTIVE",
      emailVerified: true,
      profile: {
        create: {
          firstName: "E2E",
          lastName: "Student",
        },
      },
    },
  });

  const course = await prisma.course.create({
    data: {
      title: "Mastering TypeScript in INR",
      slug: `mastering-ts-inr-${Date.now()}`,
      description: "A course priced in Indian Rupees",
      subject: "Computer Science",
      price: 599.0, // ₹599
      status: "PUBLISHED",
      teacherId: teacherUser.teacherProfile!.id,
      level: "INTERMEDIATE",
    },
  });

  try {
    // Step 2: Course Price Display
    console.log("2️⃣  Verifying Course Price in INR:");
    console.log(`   Course Title: ${course.title}`);
    console.log(`   Course Stored Price: ${course.price}`);
    const displayPrice = formatCurrency(course.price);
    console.log(`   Frontend Display: ${displayPrice}`);
    if (displayPrice !== "₹599") throw new Error(`Expected '₹599' but got '${displayPrice}'`);
    console.log("   ✅ Course price display properly verified as ₹599.\n");

    // Step 3: Checkout - Backend Order Creation
    console.log("3️⃣  Verifying Checkout & Razorpay Order Creation (in Paise):");
    const orderResult = await PaymentService.createPaymentOrder({
      userId: studentUser.id,
      type: "COURSE_ENROLLMENT",
      courseId: course.id,
    });

    console.log(`   Is Free: ${orderResult.isFree}`);
    console.log(`   Amount in Paise: ${orderResult.amountPaise} (Expected: 59900)`);
    console.log(`   Currency passed: ${orderResult.currency} (Expected: INR)`);
    console.log(`   Razorpay Order ID: ${orderResult.razorpayOrderId}`);
    console.log(`   Internal Reference: ${orderResult.internalReference}`);

    if (orderResult.amountPaise !== 59900) {
      throw new Error(`Expected 59900 paise, got ${orderResult.amountPaise}`);
    }
    if (orderResult.currency !== "INR") {
      throw new Error(`Expected currency 'INR', got '${orderResult.currency}'`);
    }

    // Check database order record
    const dbOrder = await prisma.paymentOrder.findUnique({
      where: { id: orderResult.orderId },
    });
    if (!dbOrder || dbOrder.currency !== "INR" || dbOrder.amountPaise !== 59900) {
      throw new Error("PaymentOrder in database did not store INR or 59900 paise properly!");
    }
    console.log("   ✅ Database PaymentOrder correctly saved with currency: INR and amountPaise: 59900.\n");

    // Step 4: Razorpay Payment Verification & Capture
    const fakePaymentId = `pay_mock_e2e_${Date.now()}`;
    const mockSignature = `mock_signature_e2e_${Date.now()}`;

    const captureResult = await PaymentService.verifyAndCompletePayment({
      userId: studentUser.id,
      razorpayOrderId: orderResult.razorpayOrderId!,
      razorpayPaymentId: fakePaymentId,
      razorpaySignature: mockSignature,
    });

    console.log(`   Capture Success: ${captureResult.success}`);
    console.log(`   Captured Transaction ID: ${captureResult.transactionId}`);
    if (!captureResult.success) throw new Error("Payment capture failed!");

    const dbTx = await prisma.paymentTransaction.findUnique({
      where: { id: captureResult.transactionId },
    });
    if (!dbTx || dbTx.status !== "CAPTURED" || dbTx.currency !== "INR" || dbTx.amountPaise !== 59900) {
      throw new Error("Captured transaction record does not have INR or 59900 paise!");
    }
    console.log("   ✅ PaymentTransaction verified as CAPTURED with amountPaise: 59900 and currency: INR.\n");

    // Step 5: Ledger Accounting Verification
    console.log("5️⃣  Verifying Double-Entry Ledger Entries:");
    const ledgerEntries = await prisma.financialLedgerEntry.findMany({
      where: { transactionId: captureResult.transactionId },
    });
    console.log(`   Total ledger records created: ${ledgerEntries.length}`);
    ledgerEntries.forEach((entry) => {
      console.log(`   - [${entry.type}] ${entry.direction}: ${formatPaise(entry.amountPaise)} (${entry.currency}) - ${entry.description}`);
      if (entry.currency !== "INR") throw new Error(`Ledger entry currency was not INR: ${entry.currency}`);
    });
    console.log("   ✅ Financial ledger recorded all double-entry allocations in INR.\n");

    // Step 6: Receipt & Student Payment History Display
    console.log("6️⃣  Verifying Receipt and Payment History Formats:");
    const receiptAmount = fromPaise(dbTx.amountPaise);
    const formattedReceiptAmount = formatCurrency(receiptAmount);
    console.log(`   Receipt Numerical Amount: ${receiptAmount}`);
    console.log(`   Receipt Display: ${formattedReceiptAmount}`);
    if (formattedReceiptAmount !== "₹599") {
      throw new Error(`Receipt formatting expected '₹599', got '${formattedReceiptAmount}'`);
    }
    console.log("   ✅ Receipt & payment history displays properly formatted ₹599.\n");

    console.log("==================================================");
    console.log("🎉 ALL END-TO-END INR PAYMENT FLOW CHECKS PASSED!");
    console.log("==================================================");
  } finally {
    // Cleanup
    await prisma.financialLedgerEntry.deleteMany({
      where: { teacherId: teacherUser.teacherProfile!.id },
    });
    await prisma.enrollment.deleteMany({
      where: { courseId: course.id },
    });
    await prisma.paymentTransaction.deleteMany({
      where: { userId: studentUser.id },
    });
    await prisma.paymentOrder.deleteMany({
      where: { userId: studentUser.id },
    });
    await prisma.course.delete({ where: { id: course.id } });
    await prisma.notification.deleteMany({
      where: { userId: { in: [studentUser.id, teacherUser.id] } },
    });
    await prisma.teacherProfile.deleteMany({
      where: { userId: teacherUser.id },
    });
    await prisma.profile.deleteMany({
      where: { userId: { in: [studentUser.id, teacherUser.id] } },
    });
    await prisma.user.delete({ where: { id: studentUser.id } });
    await prisma.user.delete({ where: { id: teacherUser.id } });
    console.log("🧹 Test cleanup completed cleanly.");
  }
}

runEndToEndINRTest()
  .catch((err) => {
    console.error("❌ Test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
