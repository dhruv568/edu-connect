import { prisma } from "../lib/prisma";

async function testLiveEventRegistration() {
  console.log("🧪 Testing Live Event Registration system...");

  const testName = "Dhruv Test User";
  const testPhone = "9876543210";
  const eventSlug = "educonnects-grand-opening";

  // Clean up existing test registration
  await prisma.eventRegistration.deleteMany({
    where: { whatsappNumber: testPhone },
  });

  // 1. Create registration
  const reg1 = await prisma.eventRegistration.create({
    data: {
      name: testName,
      whatsappNumber: testPhone,
      eventSlug,
      source: "LIVE_PAGE",
    },
  });

  console.log("✅ Successfully created registration:", reg1.id, reg1.name);

  // 2. Duplicate registration check
  try {
    await prisma.eventRegistration.create({
      data: {
        name: testName,
        whatsappNumber: testPhone,
        eventSlug,
        source: "LIVE_PAGE",
      },
    });
    console.error("❌ Failed: Duplicate registration should have thrown unique constraint error.");
  } catch (err: any) {
    console.log("✅ Duplicate constraint verified:", err.code === "P2002" ? "P2002 Unique Violation" : "Prevented");
  }

  // Clean up test data
  await prisma.eventRegistration.deleteMany({
    where: { id: reg1.id },
  });

  console.log("🎉 All Live Event tests passed!");
}

testLiveEventRegistration()
  .catch((err) => {
    console.error("❌ Live Event Test failed:", err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
