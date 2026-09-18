import { prisma } from "../lib/prisma";
import { LiveClassService } from "../services/live-class-service";
import { PaymentService } from "../services/payment-service";

async function runTests() {
  console.log("=================================================");
  console.log("  STARTING AVAILABILITY & BOOKING REDESIGN TEST  ");
  console.log("=================================================\n");

  let testTeacherUser: any = null;
  let testTeacherProfile: any = null;
  let testStudentUser: any = null;

  try {
    // 1. Setup Test Educator User & Teacher Profile
    console.log("1. Setting up Test Educator Profile...");
    const teacherEmail = `test_educator_${Date.now()}@example.com`;
    testTeacherUser = await prisma.user.create({
      data: {
        email: teacherEmail,
        passwordHash: "hashed_password_123",
        role: "TEACHER",
        status: "ACTIVE",
        profile: {
          create: {
            firstName: "Dr. Ananya",
            lastName: "Venkatesh",
            phone: "9876543210",
          },
        },
        teacherProfile: {
          create: {
            headline: "Senior Mathematics & Calculus Specialist",
            subjects: "Mathematics, Calculus, Algebra",
            hourlyRate: 750,
            experienceYears: 8,
            verificationStatus: "VERIFIED",
          },
        },
      },
      include: { teacherProfile: true },
    });
    testTeacherProfile = testTeacherUser.teacherProfile;
    console.log(`   ✓ Educator Created: ${testTeacherUser.email} (ID: ${testTeacherProfile.id})`);

    // 2. Setup Test Student User
    console.log("\n2. Setting up Test Student Profile...");
    const studentEmail = `test_student_${Date.now()}@example.com`;
    testStudentUser = await prisma.user.create({
      data: {
        email: studentEmail,
        passwordHash: "hashed_password_123",
        role: "STUDENT",
        status: "ACTIVE",
        profile: {
          create: {
            firstName: "Rohan",
            lastName: "Mehta",
            phone: "9123456789",
          },
        },
      },
    });
    console.log(`   ✓ Student Created: ${testStudentUser.email} (ID: ${testStudentUser.id})`);

    // 3. Update Weekly Availability
    console.log("\n3. Testing Weekly Availability Configuration...");
    const updatedAvail = await LiveClassService.updateTeacherAvailability(testTeacherUser.id, {
      timezone: "Asia/Kolkata",
      availabilities: [
        { dayOfWeek: 0, startTime: "09:00", endTime: "17:00", isActive: true },
        { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", isActive: true },
        { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", isActive: true },
        { dayOfWeek: 3, startTime: "09:00", endTime: "17:00", isActive: true },
        { dayOfWeek: 4, startTime: "09:00", endTime: "17:00", isActive: true },
        { dayOfWeek: 5, startTime: "09:00", endTime: "17:00", isActive: true },
        { dayOfWeek: 6, startTime: "09:00", endTime: "17:00", isActive: true },
      ],
      breaks: [
        { dayOfWeek: 1, startTime: "13:00", endTime: "14:00" },
      ],
    });
    console.log(`   ✓ Saved ${updatedAvail.availabilities.length} active weekly days.`);

    // 4. Add Date-Specific Override (Add Extra Saturday slot & Block a specific Date slot)
    console.log("\n4. Testing Date-Specific Overrides & Slot Blocking...");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

    // Add extra custom date availability
    const availOverride = await LiveClassService.addDateOverride(testTeacherUser.id, {
      date: tomorrowStr,
      startTime: "18:00",
      endTime: "20:00",
      type: "AVAILABLE",
      reason: "Evening Special Doubts Session",
    });
    console.log(`   ✓ Added custom available date override: ${availOverride.date} (${availOverride.startTime}-${availOverride.endTime})`);

    // Block a specific time slot on tomorrow
    const blockOverride = await LiveClassService.addDateOverride(testTeacherUser.id, {
      date: tomorrowStr,
      startTime: "10:00",
      endTime: "11:00",
      type: "BLOCKED",
      reason: "Personal Leave",
    });
    console.log(`   ✓ Blocked time slot override: ${blockOverride.date} (${blockOverride.startTime}-${blockOverride.endTime})`);

    // 5. Query Learner Dynamic Educator Availability
    console.log("\n5. Testing Learner Dynamic Educator Availability API...");
    const publicAvail = await LiveClassService.getPublicEducatorAvailability(testTeacherProfile.id, 7);
    console.log(`   ✓ Educator Name: ${publicAvail.educator.name}`);
    console.log(`   ✓ Hourly Rate: ₹${publicAvail.educator.hourlyRate}`);
    console.log(`   ✓ Days returned: ${publicAvail.dates.length}`);

    const targetDateObj = publicAvail.dates.find((d: any) => d.dateStr === tomorrowStr);
    if (!targetDateObj) throw new Error("Tomorrow date not found in public availability output.");

    const blockedSlot = targetDateObj.slots.find((s: any) => s.startTime === "10:00");
    const availSlot = targetDateObj.slots.find((s: any) => s.startTime === "09:00" && s.isAvailable);

    if (blockedSlot && blockedSlot.isAvailable) {
      throw new Error("FAIL: Blocked slot 10:00-11:00 was returned as available!");
    }
    console.log(`   ✓ Blocked slot (10:00-11:00) verified as unavailable (${blockedSlot?.status || 'BLOCKED'}).`);
    if (!availSlot) {
      throw new Error("FAIL: Slot 09:00-10:00 was expected to be available!");
    }
    console.log(`   ✓ Available slot verified: ${availSlot.time} (${availSlot.status}).`);

    // 6. Test Direct Educator Booking Order Creation (Without courseId!)
    console.log("\n6. Testing Direct Educator Booking Order Creation (No courseId)...");
    const orderResult = await PaymentService.createPaymentOrder({
      userId: testStudentUser.id,
      type: "LIVE_CLASS_BOOKING",
      teacherId: testTeacherProfile.id,
      selectedDate: tomorrowStr,
      selectedSlotTime: availSlot.time,
    });

    console.log(`   ✓ Payment Order Created: ID ${orderResult.orderId}`);
    console.log(`   ✓ Internal Reference: ${orderResult.internalReference}`);
    console.log(`   ✓ Amount: ₹${orderResult.amount}`);

    const paymentOrder = await prisma.paymentOrder.findUnique({
      where: { id: orderResult.orderId },
    });
    if (!paymentOrder?.liveClassSlotId) {
      throw new Error("FAIL: Payment order did not have liveClassSlotId assigned.");
    }
    const slotIdToTest = paymentOrder.liveClassSlotId;

    // Verify slot status transitioned to PENDING with lockedUntil timer
    const lockedSlot = await prisma.liveClassSlot.findUnique({
      where: { id: slotIdToTest },
    });
    if (lockedSlot?.status !== "PENDING") {
      throw new Error(`FAIL: Slot status expected PENDING but found ${lockedSlot?.status}`);
    }
    if (!lockedSlot.lockedUntil || new Date(lockedSlot.lockedUntil) <= new Date()) {
      throw new Error("FAIL: Slot lockedUntil timestamp was not set properly!");
    }
    console.log(`   ✓ Slot status successfully locked to PENDING until ${lockedSlot.lockedUntil.toISOString()}`);

    // 7. Verify Payment Capture
    console.log("\n7. Testing Payment Capture & Booking Confirmation...");
    const verifyResult = await PaymentService.verifyAndCompletePayment({
      userId: testStudentUser.id,
      orderId: (orderResult.cfOrderId || orderResult.internalReference || "") as string,
      cfPaymentId: `cf_pay_test_${Date.now()}`,
      paymentStatus: "SUCCESS",
    });

    console.log(`   ✓ Payment Verification Successful: Transaction ID ${verifyResult.transactionId}`);

    // Verify Booking record created
    const booking = await prisma.booking.findFirst({
      where: { liveClassSlotId: lockedSlot.id, studentId: testStudentUser.id },
    });
    if (!booking || booking.status !== "CONFIRMED") {
      throw new Error("FAIL: Booking record was not confirmed upon payment completion!");
    }
    console.log(`   ✓ Booking record confirmed: ID ${booking.id} (${booking.status})`);

    // Verify Slot status transitioned from PENDING to SCHEDULED/FULL
    const confirmedSlot = await prisma.liveClassSlot.findUnique({
      where: { id: lockedSlot.id },
    });
    if (confirmedSlot?.status !== "FULL" && confirmedSlot?.status !== "SCHEDULED") {
      throw new Error(`FAIL: Slot status expected SCHEDULED/FULL but got ${confirmedSlot?.status}`);
    }
    if (confirmedSlot.lockedUntil !== null) {
      throw new Error("FAIL: Slot lock was not released after payment capture!");
    }
    console.log(`   ✓ Slot status updated to ${confirmedSlot.status} and lockedUntil cleared.`);

    console.log("\n=================================================");
    console.log("  ALL TESTS PASSED SUCCESSFULLY!                ");
    console.log("=================================================");
  } catch (err: any) {
    console.error("\n❌ TEST FAILED WITH ERROR:", err.message || err);
    process.exit(1);
  } finally {
    // Cleanup created test records
    if (testTeacherUser) {
      await prisma.user.deleteMany({ where: { id: testTeacherUser.id } });
    }
    if (testStudentUser) {
      await prisma.user.deleteMany({ where: { id: testStudentUser.id } });
    }
    await prisma.$disconnect();
  }
}

runTests();
