import { prisma } from "../lib/prisma";
import { middleware } from "../middleware";
import { NextRequest } from "next/server";
import { GET as getConfig } from "../app/api/teacher/training/config/route";
import { POST as registerPost } from "../app/api/teacher/training/register/route";

async function runTests() {
  console.log("=== Testing Teachers Training Program Suite ===");

  // Test 1: Config API
  console.log("\n1. Testing Training Program Config API...");
  const configResponse = await getConfig();
  const configJson = await configResponse.json();

  if (!configJson.success) {
    throw new Error(`FAIL: Config API returned failure: ${JSON.stringify(configJson)}`);
  }
  if (configJson.data.durationDays !== 15) {
    throw new Error(`FAIL: Duration days expected 15, got ${configJson.data.durationDays}`);
  }
  if (configJson.data.batchDate !== "Next Batch Starting Soon") {
    throw new Error(`FAIL: Unexpected default batch date: ${configJson.data.batchDate}`);
  }
  if (configJson.data.seatsNotice !== "Seats for the upcoming batch are limited.") {
    throw new Error(`FAIL: Unexpected default seats notice: ${configJson.data.seatsNotice}`);
  }
  console.log("   ✓ Config API returned correct defaults:", configJson.data);

  // Test 2: Input Validation
  console.log("\n2. Testing Registration Input Validation...");
  const badReq1 = new NextRequest("http://localhost:3000/api/teacher/training/register", {
    method: "POST",
    body: JSON.stringify({
      name: "T",
      email: "notanemail",
      phone: "123",
    }),
  });
  const badRes1 = await registerPost(badReq1);
  const badJson1 = await badRes1.json();
  if (badRes1.status === 200 || badJson1.success) {
    throw new Error("FAIL: Invalid registration should have been rejected.");
  }
  console.log("   ✓ Invalid registration correctly rejected:", badJson1.error);

  // Test 3: Valid Registration Flow
  console.log("\n3. Testing Valid Seat Reservation Flow...");
  const testPhone = "9876543210";
  const testEmail = "test.educator.training@example.com";

  // Clean up any pre-existing test record
  await prisma.eventRegistration.deleteMany({
    where: {
      eventSlug: "teachers-training-15-days",
      whatsappNumber: testPhone,
    },
  });

  const validReq = new NextRequest("http://localhost:3000/api/teacher/training/register", {
    method: "POST",
    body: JSON.stringify({
      name: "Prof. Vikram Aditya",
      email: testEmail,
      phone: testPhone,
      role: "School Teacher",
      subject: "Mathematics",
      experienceYears: "5-10",
      notes: "Looking to transition to online classes",
    }),
  });

  const validRes = await registerPost(validReq);
  const validJson = await validRes.json();

  if (!validRes.ok || !validJson.success) {
    throw new Error(`FAIL: Registration failed: ${validJson.error || validJson.message}`);
  }
  if (!validJson.data.reservationId || !validJson.data.reservationId.startsWith("EDU-TRN-")) {
    throw new Error(`FAIL: Expected reservationId starting with EDU-TRN-, got: ${validJson.data.reservationId}`);
  }
  if (validJson.data.status !== "CONFIRMED") {
    throw new Error(`FAIL: Expected status CONFIRMED, got: ${validJson.data.status}`);
  }
  console.log("   ✓ Seat reserved successfully:", validJson.data.reservationId);

  // Verify in database
  const dbRecord = await prisma.eventRegistration.findUnique({
    where: {
      eventSlug_whatsappNumber: {
        eventSlug: "teachers-training-15-days",
        whatsappNumber: testPhone,
      },
    },
  });
  if (!dbRecord) {
    throw new Error("FAIL: EventRegistration record not found in DB!");
  }
  console.log("   ✓ Database record verified with status:", dbRecord.status);

  // Test 4: Duplicate Registration Handling
  console.log("\n4. Testing Duplicate Seat Reservation...");
  const dupReq = new NextRequest("http://localhost:3000/api/teacher/training/register", {
    method: "POST",
    body: JSON.stringify({
      name: "Prof. Vikram Aditya",
      email: testEmail,
      phone: testPhone,
      role: "School Teacher",
    }),
  });
  const dupRes = await registerPost(dupReq);
  const dupJson = await dupRes.json();
  if (!dupRes.ok || !dupJson.success || !dupJson.data.alreadyRegistered) {
    throw new Error(`FAIL: Duplicate registration handling failed: ${JSON.stringify(dupJson)}`);
  }
  console.log("   ✓ Duplicate registration handled gracefully (alreadyRegistered=true)");

  // Test 5: Middleware Routing & Subdomain Rewrites
  console.log("\n5. Testing Middleware Subdomain & Public Path Handling...");
  
  // Public access to /teacher/training without cookies should NOT redirect to /teacher/login
  const publicTeacherTrainingReq = new NextRequest("http://localhost:3000/teacher/training", {
    headers: { host: "localhost:3000" },
  });
  const publicRes = middleware(publicTeacherTrainingReq);
  // It should allow pass-through (status not 307/308 redirect to login)
  if (publicRes && (publicRes.status === 307 || publicRes.status === 308) && publicRes.headers.get("location")?.includes("/teacher/login")) {
    throw new Error(`FAIL: /teacher/training was redirected to login!`);
  }
  console.log("   ✓ /teacher/training is publicly accessible without login redirect");

  // Educator subdomain /training rewrite test
  const educatorSubdomainReq = new NextRequest("http://educators.educonnects.co.in/training", {
    headers: { host: "educators.educonnects.co.in" },
  });
  const educatorRewriteRes = middleware(educatorSubdomainReq);
  const rewriteHeader = educatorRewriteRes?.headers.get("x-middleware-rewrite");
  if (!rewriteHeader || !rewriteHeader.includes("/teacher/training")) {
    throw new Error(`FAIL: Expected /training on educators subdomain to rewrite to /teacher/training, got: ${rewriteHeader}`);
  }
  console.log("   ✓ educators.educonnects.co.in/training correctly rewrites to /teacher/training");

  // Clean up test data
  await prisma.eventRegistration.deleteMany({
    where: {
      eventSlug: "teachers-training-15-days",
      whatsappNumber: testPhone,
    },
  });

  console.log("\n✅ ALL TEACHERS TRAINING PROGRAM TESTS PASSED!");
}

runTests()
  .catch((err) => {
    console.error("❌ Test Failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
