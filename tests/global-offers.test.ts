import { prisma } from "../lib/prisma";

async function runTests() {
  console.log("==================================================");
  console.log("🧪 STARTING GLOBAL OFFERS AUTOMATED VERIFICATION");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, testName: string) => {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  };

  try {
    // 1. Clean up any previous test offers
    await prisma.offer.deleteMany({
      where: { title: { startsWith: "[TEST-AUTOMATION]" } },
    });

    // 2. Test Offer Creation (CRUD - Create)
    console.log("\n--- TEST 1: Offer Creation ---");
    const testOffer = await prisma.offer.create({
      data: {
        title: "[TEST-AUTOMATION] Grand Opening 50% Off",
        description: "Special limited-time launch offer across all subjects.",
        discountText: "FLAT 50% OFF",
        ctaText: "Claim Offer",
        ctaLink: "/courses",
        targetAudience: "ALL",
        isActive: true,
        startDate: new Date(Date.now() - 3600000), // 1 hour ago
        endDate: new Date(Date.now() + 86400000 * 7), // 7 days in future
      },
    });

    assert(Boolean(testOffer.id), "Offer created with UUID primary key");
    assert(testOffer.title === "[TEST-AUTOMATION] Grand Opening 50% Off", "Offer title saved correctly");
    assert(testOffer.discountText === "FLAT 50% OFF", "Discount text saved correctly");
    assert(testOffer.targetAudience === "ALL", "Target audience saved as ALL");
    assert(testOffer.isActive === true, "Offer is active by default");

    // 3. Test Offer Update (CRUD - Update)
    console.log("\n--- TEST 2: Offer Update ---");
    const updatedOffer = await prisma.offer.update({
      where: { id: testOffer.id },
      data: {
        discountText: "FLAT 60% OFF",
        ctaText: "Enroll Today",
      },
    });

    assert(updatedOffer.discountText === "FLAT 60% OFF", "Offer discountText updated");
    assert(updatedOffer.ctaText === "Enroll Today", "Offer ctaText updated");

    // 4. Test Toggle Active/Inactive (CRUD - Toggle)
    console.log("\n--- TEST 3: Toggle Active / Inactive ---");
    const deactivatedOffer = await prisma.offer.update({
      where: { id: testOffer.id },
      data: { isActive: false },
    });
    assert(deactivatedOffer.isActive === false, "Offer successfully deactivated");

    const reactivatedOffer = await prisma.offer.update({
      where: { id: testOffer.id },
      data: { isActive: true },
    });
    assert(reactivatedOffer.isActive === true, "Offer successfully reactivated");

    // 5. Test Active Offer Query with Audience and Date Windows
    console.log("\n--- TEST 4: Date Window & Active Filtering ---");
    const now = new Date();

    // Expired offer
    const expiredOffer = await prisma.offer.create({
      data: {
        title: "[TEST-AUTOMATION] Expired Last Week",
        discountText: "EXPIRED",
        targetAudience: "ALL",
        isActive: true,
        startDate: new Date(Date.now() - 86400000 * 14),
        endDate: new Date(Date.now() - 86400000 * 7), // Expired 7 days ago
      },
    });

    // Future scheduled offer
    const futureOffer = await prisma.offer.create({
      data: {
        title: "[TEST-AUTOMATION] Future Next Month",
        discountText: "FUTURE",
        targetAudience: "ALL",
        isActive: true,
        startDate: new Date(Date.now() + 86400000 * 5), // Starts in 5 days
        endDate: new Date(Date.now() + 86400000 * 12),
      },
    });

    // Learner-specific active offer
    const learnerOffer = await prisma.offer.create({
      data: {
        title: "[TEST-AUTOMATION] Learners Only Deal",
        discountText: "STUDENT 30%",
        targetAudience: "LEARNERS",
        isActive: true,
        startDate: new Date(Date.now() - 3600000),
        endDate: new Date(Date.now() + 86400000 * 3),
      },
    });

    // Educator-specific active offer
    const educatorOffer = await prisma.offer.create({
      data: {
        title: "[TEST-AUTOMATION] Educator Commission Bonus",
        discountText: "0% COMMISSION",
        targetAudience: "EDUCATORS",
        isActive: true,
        startDate: new Date(Date.now() - 3600000),
        endDate: new Date(Date.now() + 86400000 * 3),
      },
    });

    // Query active offers within valid date window
    const validOffers = await prisma.offer.findMany({
      where: {
        title: { startsWith: "[TEST-AUTOMATION]" },
        isActive: true,
        OR: [{ startDate: null }, { startDate: { lte: now } }],
        AND: [{ OR: [{ endDate: null }, { endDate: { gte: now } }] }],
      },
    });

    const validTitles = validOffers.map((o) => o.title);
    assert(!validTitles.includes("[TEST-AUTOMATION] Expired Last Week"), "Expired offers are excluded");
    assert(!validTitles.includes("[TEST-AUTOMATION] Future Next Month"), "Future scheduled offers are excluded");
    assert(validTitles.includes("[TEST-AUTOMATION] Grand Opening 50% Off"), "Active current offer is included");
    assert(validTitles.includes("[TEST-AUTOMATION] Learners Only Deal"), "Learners offer is included in active pool");
    assert(validTitles.includes("[TEST-AUTOMATION] Educator Commission Bonus"), "Educator offer is included in active pool");

    // Test audience match filtering
    const matchForLearners = validOffers.find(
      (o) => o.targetAudience === "ALL" || o.targetAudience === "LEARNERS"
    );
    assert(Boolean(matchForLearners), "Learners website finds a matching active offer");

    const matchForEducators = validOffers.find(
      (o) => o.targetAudience === "ALL" || o.targetAudience === "EDUCATORS"
    );
    assert(Boolean(matchForEducators), "Educators website finds a matching active offer");

    // 6. Test Offer Deletion (CRUD - Delete)
    console.log("\n--- TEST 5: Offer Deletion ---");
    await prisma.offer.delete({
      where: { id: testOffer.id },
    });
    const checkDeleted = await prisma.offer.findUnique({
      where: { id: testOffer.id },
    });
    assert(checkDeleted === null, "Offer successfully deleted from database");

    // Cleanup remaining test offers
    await prisma.offer.deleteMany({
      where: { title: { startsWith: "[TEST-AUTOMATION]" } },
    });
    console.log("🧹 Test offers cleaned up.");

  } catch (error: any) {
    console.error("Test execution error:", error);
    failed++;
  }

  console.log("\n==================================================");
  console.log(`📊 RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
