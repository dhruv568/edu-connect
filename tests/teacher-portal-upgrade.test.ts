import { PrismaClient } from "@prisma/client";
import { LiveClassService } from "../services/live-class-service";
import { LmsService } from "../services/lms-service";

const prisma = new PrismaClient();

async function runTeacherPortalUpgradeTests() {
  console.log("🧪 Starting Teacher Portal Upgrade (Live Class Slots + Courses & Content) Test Suite...\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, name: string) {
    if (condition) {
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${name}`);
      failed++;
    }
  }

  try {
    // Test 1: Resolve Teacher Profile
    console.log("📋 1. Testing Teacher Profile & Setup Resolution...");
    const teacherUser = await prisma.user.findFirst({
      where: { role: "TEACHER" },
      include: { teacherProfile: true },
    });

    assert(!!teacherUser, "At least one TEACHER user exists in database");
    assert(!!teacherUser?.teacherProfile, "Teacher profile exists for test user");

    const teacherId = teacherUser!.teacherProfile!.id;
    const userId = teacherUser!.id;

    // Test 2: Live Class Slot Creation & Conflict Checking
    console.log("\n📅 2. Testing Live Class Slot Operations & Schedule Overlap Rules...");

    const startTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // +1 hour

    const slot = await LiveClassService.createLiveClass(userId, {
      title: "Automated Integration Test - Linear Algebra",
      subject: "Mathematics",
      description: "Test slot for schedule conflict and Module 06 classroom launch",
      level: "INTERMEDIATE",
      language: "English",
      startTime,
      endTime,
      classType: "GROUP",
      maxCapacity: 15,
      bufferMinutes: 15,
    });

    assert(!!slot.id, "Live class slot created successfully");
    assert(slot.title === "Automated Integration Test - Linear Algebra", "Slot title matches expected input");
    assert(slot.status === "SCHEDULED", "Default created status is SCHEDULED");
    assert(slot.bufferMinutes === 15, "Buffer minutes configured to 15");

    // Test 3: Overlap & Buffer Conflict Detection
    console.log("\n⚠️ 3. Testing Overlap & Buffer Conflict Detection...");
    // Try to create overlapping slot within buffer time (e.g. 30 mins after start)
    const overlappingStart = new Date(startTime.getTime() + 30 * 60 * 1000);
    const overlappingEnd = new Date(overlappingStart.getTime() + 60 * 60 * 1000);

    const conflictCheck = await LiveClassService.checkScheduleConflict(
      teacherId,
      overlappingStart,
      overlappingEnd,
      15
    );

    assert(conflictCheck.hasConflict === true, "Schedule conflict detected for overlapping time slot");

    // Test 4: Launching Module 06 Classroom Session from Live Class Slot
    console.log("\n🎥 4. Testing Module 06 Classroom Session Integration...");
    const liveSession = await LiveClassService.startOrGetClassroomSession(userId, slot.id);

    assert(!!liveSession.id, "Module 06 LiveClassSession successfully initialized");
    assert(liveSession.liveClassSlotId === slot.id, "Session links back to target LiveClassSlot");
    assert(liveSession.status === "OPEN", "Classroom session status is OPEN");

    const updatedSlot = await prisma.liveClassSlot.findUnique({ where: { id: slot.id } });
    assert(updatedSlot?.status === "LIVE", "LiveClassSlot status updated to LIVE upon entering classroom");

    // Test 5: Teacher Availability Settings
    console.log("\n⚙️ 5. Testing Teacher Availability Schedule API...");
    const availabilityResult = await LiveClassService.updateTeacherAvailability(userId, {
      timezone: "Asia/Kolkata",
      availabilities: [
        { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", isActive: true },
        { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", isActive: true },
      ],
      breaks: [
        { dayOfWeek: 1, startTime: "13:00", endTime: "14:00" },
      ],
    });

    assert(availabilityResult.availabilities.length === 2, "Teacher availability schedule saved");
    assert(availabilityResult.breaks.length === 1, "Teacher break schedule saved");

    // Test 6: LMS Course Duplication & Publish Lifecycle
    console.log("\n📚 6. Testing Course Duplication & Publishing Checklist...");
    const teacherCourses = await LmsService.getTeacherCourses(userId);
    assert(teacherCourses.courses !== undefined, "LmsService.getTeacherCourses returns course list");

    if (teacherCourses.courses.length > 0) {
      const sourceCourseId = teacherCourses.courses[0].id;
      const duplicated = await LmsService.duplicateCourse(userId, sourceCourseId);

      assert(!!duplicated.id, "Course structure duplicated successfully");
      assert(duplicated.status === "DRAFT", "Duplicated course status set to DRAFT");
      assert(duplicated.title.includes("(Copy)"), "Duplicated course title appended with (Copy)");

      // Test student list retrieval
      const courseStudents = await LmsService.getCourseStudents(userId, sourceCourseId);
      assert(Array.isArray(courseStudents), "getCourseStudents returns array of student progress records");

      // Clean up duplicated test course
      await prisma.course.delete({ where: { id: duplicated.id } });
    }

    // Clean up created test slot and session
    await prisma.liveClassSession.deleteMany({ where: { liveClassSlotId: slot.id } });
    await prisma.liveClassSlot.delete({ where: { id: slot.id } });

    console.log("\n==============================================");
    console.log(`🎉 TEST SUITE COMPLETED: ${passed} Passed | ${failed} Failed`);
    console.log("==============================================\n");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err: any) {
    console.error("❌ Test Suite execution error:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTeacherPortalUpgradeTests();
