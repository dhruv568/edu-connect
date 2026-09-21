process.env.EMAIL_PROVIDER = "console";

import assert from "node:assert";
import { prisma } from "../lib/prisma";
import { cashfreeClient } from "../lib/cashfree";
import { hashToken } from "../lib/auth/tokens";
import { NextRequest } from "next/server";
import { POST as educatorRegistrationPOST, GET as educatorRegistrationGET } from "../app/api/teacher/registration/route";

let reqCounter = 200;
function createReq(url: string, init?: ConstructorParameters<typeof NextRequest>[1]) {
  const headers = new Headers(init?.headers);
  if (!headers.has("x-forwarded-for")) {
    headers.set("x-forwarded-for", `192.168.2.${reqCounter++}`);
  }
  return new NextRequest(url, { ...init, headers });
}

async function runCashfreeEducatorRegistrationTests() {
  console.log("==========================================================================");
  console.log("🧪 RUNNING CASHFREE EDUCATOR PAYMENT & VERIFICATION FLOW TEST SUITE");
  console.log("==========================================================================\n");

  const ts = Date.now();
  const testPassword = "StrongPassword123!";
  const testEmail = `cf.educator.${ts}@educonnects.test`;

  // DB connection check
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      await prisma.$connect();
      break;
    } catch (err) {
      if (attempt === 5) throw err;
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  try {
    // ------------------------------------------------------------------------
    // TEST 1: Step 1 to Step 3 - Profile Preparation
    // ------------------------------------------------------------------------
    console.log("📋 Test 1: Step 1 -> 3 Setup (Initiate, OTP, Profile)...");

    // Step 1: Initiate Basic Info
    const step1Res = await educatorRegistrationPOST(
      createReq("http://localhost:3000/api/teacher/registration", {
        method: "POST",
        body: JSON.stringify({
          action: "STEP1_INITIATE",
          firstName: "Vikram",
          lastName: "Mehta",
          email: testEmail,
          phone: "9876543210",
          password: testPassword,
          confirmPassword: testPassword,
        }),
      })
    );
    const step1Data = await step1Res.json();
    assert.strictEqual(step1Res.status, 200, `Step 1 failed: ${JSON.stringify(step1Data)}`);
    assert.strictEqual(step1Data.data.step, 2);

    // Set known OTP in database
    const testOtp = "847291";
    await prisma.pendingRegistration.update({
      where: { email: testEmail },
      data: {
        codeHash: hashToken(testOtp),
        attempts: 0,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    // Step 2: Verify OTP
    const step2Res = await educatorRegistrationPOST(
      createReq("http://localhost:3000/api/teacher/registration", {
        method: "POST",
        body: JSON.stringify({
          action: "STEP2_VERIFY_OTP",
          email: testEmail,
          otp: testOtp,
        }),
      })
    );
    const step2Data = await step2Res.json();
    assert.strictEqual(step2Res.status, 200);
    assert.strictEqual(step2Data.data.verified, true);
    assert.strictEqual(step2Data.data.step, 3);

    // Step 3: Save Profile
    const step3Res = await educatorRegistrationPOST(
      createReq("http://localhost:3000/api/teacher/registration", {
        method: "POST",
        body: JSON.stringify({
          action: "STEP3_SAVE_PROFILE",
          email: testEmail,
          headline: "Expert Computer Science Educator",
          subjects: "Computer Science, Data Structures",
          qualifications: "B.Tech Computer Science, M.Tech IIT Bombay",
          experienceYears: 6,
          hourlyRate: 800,
          teachingMode: "ONLINE",
          languages: "English, Hindi",
          bio: "Specializing in algorithmic problem solving and systems design.",
        }),
      })
    );
    const step3Data = await step3Res.json();
    assert.strictEqual(step3Res.status, 200);
    assert.strictEqual(step3Data.data.step, 4);
    console.log("   ✅ Step 1 to 3 completed successfully. Profile saved in pending registration.");

    // ------------------------------------------------------------------------
    // TEST 2: Step 5 - Cashfree Order Creation (₹99) & Order ID Format
    // ------------------------------------------------------------------------
    console.log("\n📋 Test 2: Step 5 Cashfree Order Creation (₹99)...");

    const step5Res = await educatorRegistrationPOST(
      createReq("http://localhost:3000/api/teacher/registration", {
        method: "POST",
        body: JSON.stringify({
          action: "STEP5_CREATE_ORDER",
          email: testEmail,
        }),
      })
    );
    const step5Data = await step5Res.json();
    assert.strictEqual(step5Res.status, 200, `Step 5 failed: ${JSON.stringify(step5Data)}`);
    assert.strictEqual(step5Data.data.orderAmount, 99.00);

    const generatedOrderId = step5Data.data.orderId;
    const generatedCfOrderId = step5Data.data.cfOrderId;
    const generatedPaymentSessionId = step5Data.data.paymentSessionId;

    assert.ok(generatedOrderId.startsWith("EDU_TCH_REG_"), "orderId must start with EDU_TCH_REG_");
    assert.ok(Boolean(generatedCfOrderId), "cfOrderId must be present");
    assert.ok(Boolean(generatedPaymentSessionId), "paymentSessionId must be present");

    // Verify order is persisted in pendingRegistration.registrationData
    const pendingAfterOrder = await prisma.pendingRegistration.findUnique({
      where: { email: testEmail },
    });
    assert.ok(pendingAfterOrder, "Pending registration must exist");
    const regData = JSON.parse(pendingAfterOrder.registrationData || "{}");
    assert.strictEqual(regData.orderData?.orderId, generatedOrderId, "orderId must be persisted in orderData");
    assert.strictEqual(regData.orderData?.amount, 99.00, "amount must be ₹99");
    console.log(`   ✅ Cashfree order created: orderId=${generatedOrderId}, cfOrderId=${generatedCfOrderId}`);

    // ------------------------------------------------------------------------
    // TEST 3: Step 6 - Verification with exact orderId
    // ------------------------------------------------------------------------
    console.log("\n📋 Test 3: Step 6 Cashfree Order Verification with Exact orderId...");

    const step6Res = await educatorRegistrationPOST(
      createReq("http://localhost:3000/api/teacher/registration", {
        method: "POST",
        body: JSON.stringify({
          action: "STEP6_VERIFY_PAYMENT",
          email: testEmail,
          orderId: generatedOrderId,
        }),
      })
    );
    const step6Data = await step6Res.json();
    assert.strictEqual(step6Res.status, 200, `Step 6 failed: ${JSON.stringify(step6Data)}`);
    assert.strictEqual(step6Data.data.user.email, testEmail);
    assert.strictEqual(step6Data.data.user.role, "TEACHER");
    assert.strictEqual(step6Data.data.user.emailVerified, true);
    assert.strictEqual(step6Data.data.redirectUrl, "/teacher/dashboard");
    console.log("   ✅ Payment verified with exact orderId and Educator account activated.");

    // Verify Database state: User, Profile, TeacherProfile, PaymentTransaction
    const activatedUser = await prisma.user.findUnique({
      where: { email: testEmail },
      include: {
        profile: true,
        teacherProfile: true,
        paymentTransactions: true,
      },
    });

    assert.ok(activatedUser, "User record must exist in database");
    assert.strictEqual(activatedUser.status, "ACTIVE", "User status must be ACTIVE");
    assert.strictEqual(activatedUser.emailVerified, true, "emailVerified must be true");
    assert.strictEqual(activatedUser.role, "TEACHER", "role must be TEACHER");
    assert.strictEqual(activatedUser.teacherProfile?.headline, "Expert Computer Science Educator");
    assert.strictEqual(activatedUser.teacherProfile?.verificationStatus, "PENDING");

    // Verify PaymentTransaction record
    assert.strictEqual(activatedUser.paymentTransactions.length, 1, "Exactly one PaymentTransaction must exist");
    const tx = activatedUser.paymentTransactions[0];
    assert.strictEqual(tx.type, "EDUCATOR_REGISTRATION", "type must be EDUCATOR_REGISTRATION");
    assert.strictEqual(tx.amountPaise, 9900, "amountPaise must be 9900");
    assert.strictEqual(tx.status, "CAPTURED", "status must be CAPTURED");
    assert.strictEqual(tx.provider, "CASHFREE", "provider must be CASHFREE");
    assert.strictEqual(tx.providerOrderId, generatedOrderId, "providerOrderId must match exact backend orderId");
    assert.strictEqual(tx.internalReference, generatedOrderId, "internalReference must match exact backend orderId");

    // Verify pendingRegistration was cleaned up
    const pendingAfterActivation = await prisma.pendingRegistration.findUnique({
      where: { email: testEmail },
    });
    assert.strictEqual(pendingAfterActivation, null, "pendingRegistration must be removed upon activation");
    console.log("   ✅ Database verified: User ACTIVE, TeacherProfile PENDING, ₹99 CAPTURED with providerOrderId.");

    // ------------------------------------------------------------------------
    // TEST 4: Idempotent Verification Retry (Prevents Duplicate Account Creation)
    // ------------------------------------------------------------------------
    console.log("\n📋 Test 4: Idempotency Check on Step 6 Verification Retry...");

    const retryRes = await educatorRegistrationPOST(
      createReq("http://localhost:3000/api/teacher/registration", {
        method: "POST",
        body: JSON.stringify({
          action: "STEP6_VERIFY_PAYMENT",
          email: testEmail,
          orderId: generatedOrderId,
        }),
      })
    );
    const retryData = await retryRes.json();
    assert.strictEqual(retryRes.status, 200, `Retry must succeed idempotently: ${JSON.stringify(retryData)}`);
    assert.strictEqual(retryData.data.user.email, testEmail);
    assert.strictEqual(retryData.data.redirectUrl, "/teacher/dashboard");

    // Verify no duplicates were created
    const totalUsers = await prisma.user.count({ where: { email: testEmail } });
    assert.strictEqual(totalUsers, 1, "Total users with this email must be exactly 1");

    const totalTx = await prisma.paymentTransaction.count({
      where: { userId: activatedUser.id, type: "EDUCATOR_REGISTRATION" },
    });
    assert.strictEqual(totalTx, 1, "Total transactions must remain exactly 1 on retry");
    console.log("   ✅ Idempotency confirmed: 0 duplicate users, 0 duplicate transactions created.");

    // ------------------------------------------------------------------------
    // TEST 5: Fallback Order ID Resolution (cfOrderId or placeholder gracefully maps to backend order)
    // ------------------------------------------------------------------------
    console.log("\n📋 Test 5: Fallback Order ID Resolution & Resilience...");

    const user2Email = `cf.educator.resilience.${ts}@educonnects.test`;

    // Initiate + OTP + Profile
    await educatorRegistrationPOST(
      createReq("http://localhost:3000/api/teacher/registration", {
        method: "POST",
        body: JSON.stringify({
          action: "STEP1_INITIATE",
          firstName: "Resilient",
          lastName: "Educator",
          email: user2Email,
          phone: "9123456780",
          password: testPassword,
          confirmPassword: testPassword,
        }),
      })
    );

    const otp2 = "554433";
    await prisma.pendingRegistration.update({
      where: { email: user2Email },
      data: { codeHash: hashToken(otp2), attempts: 0, expiresAt: new Date(Date.now() + 15 * 60 * 1000) },
    });

    await educatorRegistrationPOST(
      createReq("http://localhost:3000/api/teacher/registration", {
        method: "POST",
        body: JSON.stringify({ action: "STEP2_VERIFY_OTP", email: user2Email, otp: otp2 }),
      })
    );

    await educatorRegistrationPOST(
      createReq("http://localhost:3000/api/teacher/registration", {
        method: "POST",
        body: JSON.stringify({
          action: "STEP3_SAVE_PROFILE",
          email: user2Email,
          headline: "Chemistry Educator",
          subjects: "Chemistry",
          qualifications: "M.Sc. Chemistry",
        }),
      })
    );

    // Create order
    const orderRes2 = await educatorRegistrationPOST(
      createReq("http://localhost:3000/api/teacher/registration", {
        method: "POST",
        body: JSON.stringify({ action: "STEP5_CREATE_ORDER", email: user2Email }),
      })
    );
    const orderData2 = await orderRes2.json();
    const orderId2 = orderData2.data.orderId;
    const cfOrderId2 = orderData2.data.cfOrderId;

    // Simulate frontend sending cfOrderId instead of orderId (the exact bug condition)
    // Backend should resolve targetOrderId = data.orderData?.orderId and succeed!
    const verifyWithCfOrderIdRes = await educatorRegistrationPOST(
      createReq("http://localhost:3000/api/teacher/registration", {
        method: "POST",
        body: JSON.stringify({
          action: "STEP6_VERIFY_PAYMENT",
          email: user2Email,
          orderId: cfOrderId2, // frontend passed cfOrderId
        }),
      })
    );
    const verifyWithCfOrderIdData = await verifyWithCfOrderIdRes.json();
    assert.strictEqual(
      verifyWithCfOrderIdRes.status,
      200,
      `Verification should resolve canonical orderId even if cfOrderId was sent: ${JSON.stringify(verifyWithCfOrderIdData)}`
    );
    assert.strictEqual(verifyWithCfOrderIdData.data.user.email, user2Email);

    const user2Check = await prisma.user.findUnique({
      where: { email: user2Email },
      include: { paymentTransactions: true },
    });
    assert.ok(user2Check);
    assert.strictEqual(user2Check.status, "ACTIVE");
    assert.strictEqual(user2Check.paymentTransactions[0].providerOrderId, orderId2, "Must store canonical merchant orderId");
    console.log("   ✅ Fallback resolution succeeded: Canonical backend orderId used even when cfOrderId passed.");

    // ------------------------------------------------------------------------
    // TEST 6: GET Status Endpoint Reflects Accurate Educator State
    // ------------------------------------------------------------------------
    console.log("\n📋 Test 6: GET Educator Status Verification...");

    const getRes = await educatorRegistrationGET(
      createReq(`http://localhost:3000/api/teacher/registration?email=${encodeURIComponent(testEmail)}`)
    );
    const getData = await getRes.json();
    assert.strictEqual(getData.data.status, "COMPLETED");
    assert.strictEqual(getData.data.registered, true);
    console.log("   ✅ GET /api/teacher/registration confirms COMPLETED and registered: true.");

    // Cleanup test users
    await prisma.paymentTransaction.deleteMany({ where: { userId: { in: [activatedUser.id, user2Check.id] } } });
    await prisma.teacherProfile.deleteMany({ where: { userId: { in: [activatedUser.id, user2Check.id] } } });
    await prisma.profile.deleteMany({ where: { userId: { in: [activatedUser.id, user2Check.id] } } });
    await prisma.user.deleteMany({ where: { id: { in: [activatedUser.id, user2Check.id] } } });

    console.log("\n==========================================================================");
    console.log("🎉 ALL CASHFREE EDUCATOR REGISTRATION & PAYMENT VERIFICATION TESTS PASSED!");
    console.log("==========================================================================\n");
  } catch (error) {
    console.error("❌ Test failed with error:", error);
    throw error;
  }
}

runCashfreeEducatorRegistrationTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
