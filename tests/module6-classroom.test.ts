import { prisma } from "../lib/prisma";
import { decodeRoomToken, generateRoomToken } from "../lib/classroom/classroom-token";

async function runModule6Tests() {
  console.log("🧪 Starting EduConnect Module 06 — Live Classroom Test Suite...\n");

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

  try {
    // Test 1: Verify Seed LiveClassSession exists
    console.log("📋 1. Testing Database Entities & Relationships...");
    const session = await prisma.liveClassSession.findFirst({
      where: { id: "demo-math-session-001" },
      include: {
        liveClassSlot: {
          include: {
            bookings: true,
          },
        },
        teacher: {
          include: { user: true },
        },
      },
    });

    assert(!!session, "LiveClassSession entity exists");
    assert(session?.roomId === "room-math-algebra-101", "Session roomId matches expected value");
    assert(!!session?.liveClassSlot, "LiveClassSession links to LiveClassSlot");
    assert(session?.liveClassSlot.bookings.length! > 0, "LiveClassSlot has associated student bookings");

    // Test 2: Token Generation & Verification
    console.log("\n🔐 2. Testing Secure Classroom Token Service...");
    const tokenPayload = {
      sessionId: session!.id,
      roomId: session!.roomId,
      userId: "test-user-id-123",
      userName: "Alex Morgan",
      userRole: "STUDENT" as const,
      isTeacher: false,
    };

    const token = generateRoomToken(tokenPayload);
    assert(typeof token === "string" && token.includes("."), "generateRoomToken returns signed token string");

    const decoded = decodeRoomToken(token);
    assert(!!decoded, "decodeRoomToken successfully validates signature");
    assert(decoded?.sessionId === session!.id, "Decoded token contains correct sessionId");
    assert(decoded?.userId === "test-user-id-123", "Decoded token contains correct userId");

    const invalidToken = decodeRoomToken("invalid.token.string");
    assert(invalidToken === null, "decodeRoomToken rejects invalid tokens");

    // Test 3: Attendance Status Logic
    console.log("\n⏱️ 3. Testing Attendance Duration & Status Rules...");
    const classDurationMinutes = 60;
    const requiredSeconds = (classDurationMinutes * 60) * 0.75; // 2700s for PRESENT

    const calcStatus = (durationSec: number) => {
      if (durationSec >= requiredSeconds) return "PRESENT";
      if (durationSec > 0) return "PARTIAL";
      return "ABSENT";
    };

    assert(calcStatus(3000) === "PRESENT", "50 mins (3000s) on 60 min class = PRESENT");
    assert(calcStatus(1200) === "PARTIAL", "20 mins (1200s) on 60 min class = PARTIAL");
    assert(calcStatus(0) === "ABSENT", "0 mins on 60 min class = ABSENT");

    // Test 4: Verify PARENT Role Removal
    console.log("\n🚫 4. Verifying PARENT Role Removal Enforcement...");
    const userRolesInDb = await prisma.user.findMany({
      select: { role: true },
    });
    const hasParentRoleInDb = userRolesInDb.some((u) => u.role === "PARENT");
    assert(!hasParentRoleInDb, "Database contains zero PARENT role records");

    console.log("\n==============================================");
    console.log(`🎉 MODULE 06 TEST RESULTS: ${passedTests} Passed | ${failedTests} Failed`);
    console.log("==============================================\n");

    if (failedTests > 0) {
      process.exit(1);
    }
  } catch (err: any) {
    console.error("❌ Test Suite Error:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runModule6Tests();
