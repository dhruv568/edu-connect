/**
 * tests/custom-educator-hourly-rate.test.ts
 *
 * Verifies that Educators can set ANY custom hourly rate (e.g. ₹599, ₹749, ₹999, ₹1,250, ₹2,999),
 * and that the amount is:
 * 1. Sanitized and accepted by parseHourlyRate (including raw numbers, strings, commas, currency symbols)
 * 2. Only basic validation (positive number > 0) is enforced (0 and negatives rejected)
 * 3. Exact amounts are saved without rounding in the database
 * 4. Exact amounts are displayed accurately by formatCurrency
 * 5. Exact amounts are converted to exact paise by toPaise and used in PaymentService calculations
 */

import { parseHourlyRate, formatCurrency, toPaise, fromPaise } from "../lib/currency";
import { prisma } from "../lib/prisma";
import { PaymentService } from "../services/payment-service";
import bcrypt from "bcryptjs";

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${msg}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${msg}`);
    failed++;
  }
}

async function runCustomRateTests() {
  console.log("🧪 Running Comprehensive Custom Educator Hourly Rate Tests...\n");

  // -------------------------------------------------------------
  // 1. UNIT TESTS: parseHourlyRate & Input Sanitization
  // -------------------------------------------------------------
  console.log("📋 1. Testing parseHourlyRate with custom educator amounts...");

  // Plain integers
  assert(parseHourlyRate(599) === 599, "Integer 599 accepted as exact 599");
  assert(parseHourlyRate(749) === 749, "Integer 749 accepted as exact 749");
  assert(parseHourlyRate(999) === 999, "Integer 999 accepted as exact 999");
  assert(parseHourlyRate(1250) === 1250, "Integer 1250 accepted as exact 1250");
  assert(parseHourlyRate(2999) === 2999, "Integer 2999 accepted as exact 2999");

  // Numeric strings
  assert(parseHourlyRate("599") === 599, "String '599' parsed to exact 599");
  assert(parseHourlyRate("749") === 749, "String '749' parsed to exact 749");
  assert(parseHourlyRate("999") === 999, "String '999' parsed to exact 999");
  assert(parseHourlyRate("1250") === 1250, "String '1250' parsed to exact 1250");
  assert(parseHourlyRate("2999") === 2999, "String '2999' parsed to exact 2999");

  // Formatted strings with commas and spaces
  assert(parseHourlyRate("1,250") === 1250, "String with comma '1,250' parsed to exact 1250");
  assert(parseHourlyRate("2,999") === 2999, "String with comma '2,999' parsed to exact 2999");
  assert(parseHourlyRate(" 1,250 ") === 1250, "String with whitespace ' 1,250 ' parsed to exact 1250");

  // Formatted strings with currency symbols (₹, $)
  assert(parseHourlyRate("₹599") === 599, "Currency string '₹599' parsed to exact 599");
  assert(parseHourlyRate("₹749") === 749, "Currency string '₹749' parsed to exact 749");
  assert(parseHourlyRate("₹1,250") === 1250, "Currency string '₹1,250' parsed to exact 1250");
  assert(parseHourlyRate("₹2,999") === 2999, "Currency string '₹2,999' parsed to exact 2999");

  // Decimals
  assert(parseHourlyRate(599.5) === 599.5, "Decimal 599.5 accepted as exact 599.5");
  assert(parseHourlyRate("749.75") === 749.75, "Decimal string '749.75' accepted as exact 749.75");

  // Invalid, non-positive, or empty inputs must return null (strict validation)
  assert(parseHourlyRate(0) === null, "Zero (0) rejected (null)");
  assert(parseHourlyRate("0") === null, "String zero ('0') rejected (null)");
  assert(parseHourlyRate(-100) === null, "Negative amount (-100) rejected (null)");
  assert(parseHourlyRate("-500") === null, "Negative string ('-500') rejected (null)");
  assert(parseHourlyRate("") === null, "Empty string rejected (null)");
  assert(parseHourlyRate(null) === null, "Null rejected (null)");
  assert(parseHourlyRate(undefined) === null, "Undefined rejected (null)");
  assert(parseHourlyRate("invalid") === null, "Alphabetic string ('invalid') rejected (null)");

  // -------------------------------------------------------------
  // 2. DISPLAY & PAISE CONVERSION TESTS
  // -------------------------------------------------------------
  console.log("\n📋 2. Testing formatCurrency and toPaise parity with custom rates...");

  assert(formatCurrency(599) === "₹599", "formatCurrency(599) -> '₹599'");
  assert(formatCurrency(749) === "₹749", "formatCurrency(749) -> '₹749'");
  assert(formatCurrency(999) === "₹999", "formatCurrency(999) -> '₹999'");
  assert(formatCurrency(1250) === "₹1,250", "formatCurrency(1250) -> '₹1,250'");
  assert(formatCurrency("1,250") === "₹1,250", "formatCurrency('1,250') -> '₹1,250'");
  assert(formatCurrency(2999) === "₹2,999", "formatCurrency(2999) -> '₹2,999'");

  assert(toPaise(599) === 59900, "toPaise(599) -> 59900 paise");
  assert(toPaise(749) === 74900, "toPaise(749) -> 74900 paise");
  assert(toPaise(999) === 99900, "toPaise(999) -> 99900 paise");
  assert(toPaise(1250) === 125000, "toPaise(1250) -> 125000 paise");
  assert(toPaise("1,250") === 125000, "toPaise('1,250') -> 125000 paise");
  assert(toPaise("₹1,250") === 125000, "toPaise('₹1,250') -> 125000 paise");
  assert(toPaise(2999) === 299900, "toPaise(2999) -> 299900 paise");
  assert(toPaise("₹2,999") === 299900, "toPaise('₹2,999') -> 299900 paise");

  assert(fromPaise(59900) === 599, "fromPaise(59900) -> 599 rupees");
  assert(fromPaise(125000) === 1250, "fromPaise(125000) -> 1250 rupees");
  assert(fromPaise(299900) === 2999, "fromPaise(299900) -> 2999 rupees");

  // -------------------------------------------------------------
  // 3. DATABASE PERSISTENCE & PAYMENT CALCULATION
  // -------------------------------------------------------------
  console.log("\n📋 3. Testing Database Persistence & Live Class Payment Calculation...");

  const testTimestamp = Date.now();
  const educatorEmail = `custom.rate.educator.${testTimestamp}@test.com`;
  const studentEmail = `custom.rate.student.${testTimestamp}@test.com`;
  const passwordHash = await bcrypt.hash("Password123!", 10);

  let educatorUser: any = null;
  let studentUser: any = null;

  try {
    // 3A. Create Verified Educator with custom rate ₹1,250
    const customRate = 1250;
    educatorUser = await prisma.user.create({
      data: {
        email: educatorEmail,
        passwordHash,
        role: "TEACHER",
        emailVerified: true,
        status: "ACTIVE",
        profile: {
          create: { firstName: "CustomRate", lastName: "Educator" },
        },
        teacherProfile: {
          create: {
            headline: "Expert Physics Mentor",
            subjects: "Physics, Mechanics",
            experienceYears: 6,
            hourlyRate: customRate,
            verificationStatus: "VERIFIED",
            teachingMode: "ONLINE",
          },
        },
      },
      include: { profile: true, teacherProfile: true },
    });

    assert(
      educatorUser.teacherProfile.hourlyRate === 1250,
      `Database saved exact hourly rate ${educatorUser.teacherProfile.hourlyRate} without modification`
    );

    // 3B. Create Student
    studentUser = await prisma.user.create({
      data: {
        email: studentEmail,
        passwordHash,
        role: "STUDENT",
        emailVerified: true,
        status: "ACTIVE",
        profile: {
          create: { firstName: "Student", lastName: "Tester" },
        },
        studentProfile: {
          create: { gradeLevel: "Grade 12" },
        },
      },
    });

    // 3C. Student books 1-on-1 session with Educator
    const orderResult = await PaymentService.createPaymentOrder({
      userId: studentUser.id,
      type: "LIVE_CLASS_BOOKING",
      teacherId: educatorUser.teacherProfile.id,
      selectedDate: "2026-10-01",
      selectedSlotTime: "10:00 - 11:00",
    });

    assert(
      orderResult.amount === 1250 && orderResult.amountPaise === 125000,
      `PaymentService generated exact order amount ₹${orderResult.amount} (${orderResult.amountPaise} paise) matching hourlyRate ₹1,250`
    );

    // Verify created slot has exact price 1250
    const slot = await prisma.liveClassSlot.findFirst({
      where: { teacherId: educatorUser.teacherProfile.id },
    });
    assert(slot?.price === 1250, `LiveClassSlot price set to exact custom rate ₹${slot?.price}`);

    // 3D. Update Educator rate to ₹2,999 (e.g. via profile update)
    const updatedProfile = await prisma.teacherProfile.update({
      where: { id: educatorUser.teacherProfile.id },
      data: { hourlyRate: 2999 },
    });
    assert(
      updatedProfile.hourlyRate === 2999,
      `Updated hourlyRate to exact custom value ₹${updatedProfile.hourlyRate}`
    );

    // Create another slot with new rate ₹2,999
    const orderResult2 = await PaymentService.createPaymentOrder({
      userId: studentUser.id,
      type: "LIVE_CLASS_BOOKING",
      teacherId: educatorUser.teacherProfile.id,
      selectedDate: "2026-10-02",
      selectedSlotTime: "11:00 - 12:00",
    });

    assert(
      orderResult2.amount === 2999 && orderResult2.amountPaise === 299900,
      `PaymentService generated exact updated order amount ₹${orderResult2.amount} (${orderResult2.amountPaise} paise) matching ₹2,999`
    );

  } catch (err: any) {
    console.error("❌ Unexpected test execution error:", err);
    failed++;
  } finally {
    console.log("\n🧹 Cleaning up test users and slots...");
    try {
      if (studentUser?.id) {
        await prisma.paymentTransaction.deleteMany({ where: { userId: studentUser.id } }).catch(() => {});
        await prisma.paymentOrder.deleteMany({ where: { userId: studentUser.id } }).catch(() => {});
        await prisma.booking.deleteMany({ where: { studentId: studentUser.id } }).catch(() => {});
        await prisma.studentProfile.deleteMany({ where: { userId: studentUser.id } }).catch(() => {});
        await prisma.profile.deleteMany({ where: { userId: studentUser.id } }).catch(() => {});
        await prisma.user.delete({ where: { id: studentUser.id } }).catch(() => {});
      }
      if (educatorUser?.teacherProfile?.id) {
        await prisma.booking.deleteMany({ where: { liveClassSlot: { teacherId: educatorUser.teacherProfile.id } } }).catch(() => {});
        await prisma.liveClassSlot.deleteMany({ where: { teacherId: educatorUser.teacherProfile.id } }).catch(() => {});
        await prisma.teacherProfile.deleteMany({ where: { userId: educatorUser.id } }).catch(() => {});
        await prisma.profile.deleteMany({ where: { userId: educatorUser.id } }).catch(() => {});
        await prisma.user.delete({ where: { id: educatorUser.id } }).catch(() => {});
      }
    } catch (cleanErr) {
      console.warn("Cleanup warning:", cleanErr);
    }
  }

  console.log("\n========================================================");
  console.log(`📊 Final Results: ${passed} Passed, ${failed} Failed`);
  console.log("========================================================\n");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runCustomRateTests();
