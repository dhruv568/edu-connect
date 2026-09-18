import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import { LiveClassService } from "../services/live-class-service";
import { LmsService } from "../services/lms-service";
import { PaymentService } from "../services/payment-service";
import { EDUCATOR_VERIFICATION_PENDING_MESSAGE, isEducatorVerified } from "../lib/auth/guards";
import { verifyRoomAccess } from "../lib/classroom/classroom-token";

async function runVerificationLockTests() {
  console.log("🧪 Starting Comprehensive Educator Verification Lock Test Suite...\n");

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

  const defaultPasswordHash = await bcrypt.hash("Password123!", 10);
  const testId = Date.now();

  let unverifiedTeacherUser: any = null;
  let verifiedTeacherUser: any = null;
  let studentUser: any = null;
  let adminUser: any = null;
  let testCourse: any = null;
  let testSlot: any = null;

  try {
    // -------------------------------------------------------------
    // Setup Test Users
    // -------------------------------------------------------------
    console.log("📋 1. Setting up Test Users...");

    // Unverified Teacher (PENDING)
    unverifiedTeacherUser = await prisma.user.create({
      data: {
        email: `unverified.teacher.${testId}@test.com`,
        passwordHash: defaultPasswordHash,
        role: "TEACHER",
        emailVerified: true,
        profile: {
          create: { firstName: "Unverified", lastName: "Educator" },
        },
        teacherProfile: {
          create: {
            headline: "Math & Physics Tutor (Pending)",
            subjects: "Mathematics, Physics",
            experienceYears: 3,
            hourlyRate: 35.0,
            teachingMode: "ONLINE",
            verificationStatus: "PENDING",
          },
        },
      },
      include: { teacherProfile: true },
    });

    // Verified Teacher (VERIFIED)
    verifiedTeacherUser = await prisma.user.create({
      data: {
        email: `verified.teacher.${testId}@test.com`,
        passwordHash: defaultPasswordHash,
        role: "TEACHER",
        emailVerified: true,
        profile: {
          create: { firstName: "Verified", lastName: "Educator" },
        },
        teacherProfile: {
          create: {
            headline: "Senior Chemistry Educator (Verified)",
            subjects: "Chemistry",
            experienceYears: 7,
            hourlyRate: 60.0,
            teachingMode: "ONLINE",
            verificationStatus: "VERIFIED",
          },
        },
      },
      include: { teacherProfile: true },
    });

    // Student User
    studentUser = await prisma.user.create({
      data: {
        email: `student.${testId}@test.com`,
        passwordHash: defaultPasswordHash,
        role: "STUDENT",
        emailVerified: true,
        profile: {
          create: { firstName: "Alex", lastName: "Learner" },
        },
      },
    });

    // Admin User
    adminUser = await prisma.user.create({
      data: {
        email: `admin.${testId}@test.com`,
        passwordHash: defaultPasswordHash,
        role: "ADMIN",
        emailVerified: true,
        profile: {
          create: { firstName: "Admin", lastName: "Supervisor" },
        },
      },
    });

    assert(!!unverifiedTeacherUser?.teacherProfile, "Unverified teacher created with PENDING status");
    assert(!!verifiedTeacherUser?.teacherProfile, "Verified teacher created with VERIFIED status");
    assert(isEducatorVerified(unverifiedTeacherUser.teacherProfile.verificationStatus) === false, "isEducatorVerified returns false for PENDING");
    assert(isEducatorVerified(verifiedTeacherUser.teacherProfile.verificationStatus) === true, "isEducatorVerified returns true for VERIFIED");

    // -------------------------------------------------------------
    // Setup Courses and Live Slots
    // -------------------------------------------------------------
    console.log("\n📦 2. Creating Draft Course & Live Class Slot for Unverified Educator...");

    testCourse = await prisma.course.create({
      data: {
        teacherId: unverifiedTeacherUser.teacherProfile.id,
        title: `Pending Verification Calculus - ${testId}`,
        slug: `pending-verification-calculus-${testId}`,
        description: "Comprehensive Calculus Course drafted by an unverified educator.",
        subject: "Mathematics",
        category: "General",
        level: "INTERMEDIATE",
        price: 49.99,
        thumbnailUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb",
        status: "DRAFT",
        sections: {
          create: [
            {
              title: "Module 1: Differential Equations",
              order: 1,
              lessons: {
                create: [
                  {
                    title: "Lesson 1.1: First Order Equations",
                    order: 1,
                    type: "VIDEO",
                    status: "READY",
                    isPreview: true,
                    content: "Calculus lesson video lecture notes and practice exercises",
                    videoAssets: {
                      create: [
                        {
                          uploadId: `upload-test-${testId}`,
                          providerAssetId: `mux-test-${testId}`,
                          playbackId: `mux-playback-${testId}`,
                          status: "READY",
                          duration: 360,
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      include: {
        sections: {
          include: { lessons: { include: { videoAssets: true } } },
        },
      },
    });

    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const tomorrowPlus1h = new Date(tomorrow.getTime() + 60 * 60 * 1000);

    testSlot = await prisma.liveClassSlot.create({
      data: {
        teacherId: unverifiedTeacherUser.teacherProfile.id,
        title: `Calculus Live Session - ${testId}`,
        subject: "Mathematics",
        description: "Live interactive class slot for Calculus.",
        startTime: tomorrow,
        endTime: tomorrowPlus1h,
        durationMinutes: 60,
        classType: "ONE_TO_ONE",
        price: 25.0,
        status: "DRAFT",
      },
    });

    assert(!!testCourse.id, "Draft course created for unverified teacher");
    assert(!!testSlot.id, "Live class slot created for unverified teacher");

    // -------------------------------------------------------------
    // Test Live Class Locks for Unverified Educator
    // -------------------------------------------------------------
    console.log("\n🔒 3. Testing Live Class Locks for Unverified Educator...");

    // 3a. Publish Live Class Slot Lock
    let publishSlotError = "";
    try {
      await LiveClassService.publishLiveClass(unverifiedTeacherUser.id, testSlot.id);
    } catch (err: any) {
      publishSlotError = err.message;
    }
    assert(
      publishSlotError.includes(EDUCATOR_VERIFICATION_PENDING_MESSAGE),
      "LiveClassService.publishLiveClass throws exact verification pending message"
    );

    // 3b. Start / Conduct Live Class Lock
    let startClassError = "";
    try {
      await LiveClassService.startOrGetClassroomSession(unverifiedTeacherUser.id, testSlot.id);
    } catch (err: any) {
      startClassError = err.message;
    }
    assert(
      startClassError.includes(EDUCATOR_VERIFICATION_PENDING_MESSAGE),
      "LiveClassService.startOrGetClassroomSession throws exact verification pending message"
    );

    // 3c. Direct Room Access Lock
    const roomAccessResult = await verifyRoomAccess(
      testSlot.id,
      { id: unverifiedTeacherUser.id, email: unverifiedTeacherUser.email, role: "TEACHER" } as any
    );
    assert(
      roomAccessResult.authorized === false && roomAccessResult.reason === EDUCATOR_VERIFICATION_PENDING_MESSAGE,
      "verifyRoomAccess blocks unverified teacher with exact pending message"
    );

    // 3d. Student cannot access classroom of unverified educator
    const studentRoomAccess = await verifyRoomAccess(
      testSlot.id,
      { id: studentUser.id, email: studentUser.email, role: "STUDENT" } as any
    );
    assert(
      studentRoomAccess.authorized === false,
      "verifyRoomAccess blocks students from joining sessions of unverified educators"
    );

    // 3e. Public Availability Lock
    const publicSlots = await LiveClassService.getPublicEducatorAvailability(
      unverifiedTeacherUser.teacherProfile.id
    );
    assert(
      publicSlots.dates.length === 0 && publicSlots.educator.isLocked === true,
      "getPublicEducatorAvailability returns empty slots and locked notice for unverified educator"
    );

    // -------------------------------------------------------------
    // Test LMS Course & Content Locks for Unverified Educator
    // -------------------------------------------------------------
    console.log("\n🔒 4. Testing LMS Course & Content Locks for Unverified Educator...");

    // 4a. Course Publish Lock
    let publishCourseError = "";
    try {
      await LmsService.publishCourse(unverifiedTeacherUser.id, testCourse.id);
    } catch (err: any) {
      publishCourseError = err.message;
    }
    assert(
      publishCourseError.includes(EDUCATOR_VERIFICATION_PENDING_MESSAGE),
      "LmsService.publishCourse throws exact verification pending message"
    );

    // 4b. Course Discovery Lock (Public Catalog)
    const publicCatalog = await LmsService.getPublicCourses({ search: `Calculus - ${testId}` });
    const foundInCatalog = publicCatalog.courses.some((c: any) => c.id === testCourse.id);
    assert(
      foundInCatalog === false,
      "getPublicCourses excludes courses from unverified educators"
    );

    // 4c. Course Slug Lookup for Students
    const studentSlugLookup = await LmsService.getCourseBySlug(
      testCourse.slug,
      studentUser.id,
      "STUDENT"
    );
    assert(
      studentSlugLookup === null,
      "getCourseBySlug returns null to students for courses belonging to unverified educators"
    );

    // 4d. Course Slug Lookup allows Educator Owner to view and work on their draft
    const ownerSlugLookup = await LmsService.getCourseBySlug(
      testCourse.slug,
      unverifiedTeacherUser.id,
      "TEACHER"
    );
    assert(
      !!ownerSlugLookup && ownerSlugLookup.id === testCourse.id,
      "Educator owner can still access course details to author curriculum and review draft"
    );

    // 4e. Course Preview Lock for Public / Student
    let previewError = "";
    try {
      await LmsService.getCoursePreview(testCourse.id, { userId: studentUser.id, role: "STUDENT" });
    } catch (err: any) {
      previewError = err.message;
    }
    assert(
      previewError.includes(EDUCATOR_VERIFICATION_PENDING_MESSAGE),
      "getCoursePreview rejects learner preview with exact verification pending message"
    );

    // 4f. Lesson Video Playback Lock
    const testLesson = testCourse.sections[0].lessons[0];
    const videoAccess = await LmsService.verifyVideoAccess(
      studentUser.id,
      testLesson.id
    );
    assert(
      videoAccess.allowed === false && videoAccess.error === EDUCATOR_VERIFICATION_PENDING_MESSAGE,
      "verifyVideoAccess rejects video playback for unverified educator content"
    );

    // -------------------------------------------------------------
    // Test Booking & Payment Order Locks
    // -------------------------------------------------------------
    console.log("\n🔒 5. Testing Payment & Booking Locks for Unverified Educator...");

    // 5a. Course Enrollment Purchase Lock
    let courseOrderError = "";
    try {
      await PaymentService.createPaymentOrder({
        userId: studentUser.id,
        type: "COURSE_ENROLLMENT",
        courseId: testCourse.id,
      });
    } catch (err: any) {
      courseOrderError = err.message;
    }
    assert(
      courseOrderError.includes(EDUCATOR_VERIFICATION_PENDING_MESSAGE),
      "PaymentService blocks COURSE_ENROLLMENT payment order for unverified educator"
    );

    // 5b. Live Class Slot Booking Lock
    let slotOrderError = "";
    try {
      await PaymentService.createPaymentOrder({
        userId: studentUser.id,
        type: "LIVE_CLASS_BOOKING",
        liveClassSlotId: testSlot.id,
      });
    } catch (err: any) {
      slotOrderError = err.message;
    }
    assert(
      slotOrderError.includes(EDUCATOR_VERIFICATION_PENDING_MESSAGE),
      "PaymentService blocks LIVE_CLASS_BOOKING payment order for unverified educator"
    );

    // -------------------------------------------------------------
    // Test Verified Educator Permitted Actions (Non-Regression)
    // -------------------------------------------------------------
    console.log("\n🔓 6. Testing Verified Educator Permitted Operations...");

    const verifiedSlot = await LiveClassService.createLiveClass(verifiedTeacherUser.id, {
      title: `Chemistry Session - ${testId}`,
      subject: "Chemistry",
      description: "Verified live session",
      level: "INTERMEDIATE",
      language: "English",
      startTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 49 * 60 * 60 * 1000),
      classType: "GROUP",
      maxCapacity: 10,
    });

    const publishedVerifiedSlot = await LiveClassService.publishLiveClass(
      verifiedTeacherUser.id,
      verifiedSlot.id
    );
    assert(
      publishedVerifiedSlot.status === "SCHEDULED",
      "Verified educator can publish live classes without restriction"
    );

    const verifiedLiveSession = await LiveClassService.startOrGetClassroomSession(
      verifiedTeacherUser.id,
      verifiedSlot.id
    );
    assert(
      !!verifiedLiveSession.id,
      "Verified educator can start and conduct classroom session"
    );

    // -------------------------------------------------------------
    // Test Automatic Unlock When Admin Verifies Educator
    // -------------------------------------------------------------
    console.log("\n⚡ 7. Testing Automatic Unlock Upon Admin Status Update to VERIFIED...");

    // Admin approves educator
    await prisma.teacherProfile.update({
      where: { id: unverifiedTeacherUser.teacherProfile.id },
      data: {
        verificationStatus: "VERIFIED",
        verifiedAt: new Date(),
      },
    });

    // 7a. Live Class Publish Unlocked
    const unlockedPublishedSlot = await LiveClassService.publishLiveClass(
      unverifiedTeacherUser.id,
      testSlot.id
    );
    assert(
      unlockedPublishedSlot.status === "SCHEDULED",
      "Immediately after Admin verification, educator can publish Live Class slots"
    );

    // 7b. Live Class Start / Conduct Unlocked
    const unlockedLiveSession = await LiveClassService.startOrGetClassroomSession(
      unverifiedTeacherUser.id,
      testSlot.id
    );
    assert(
      !!unlockedLiveSession.id,
      "Immediately after Admin verification, educator can start/conduct Live Classes"
    );

    // 7c. Course Publish Unlocked
    const unlockedCourse = await LmsService.publishCourse(
      unverifiedTeacherUser.id,
      testCourse.id
    );
    assert(
      unlockedCourse.status === "PUBLISHED",
      "Immediately after Admin verification, educator can publish Courses"
    );

    // 7d. Public Catalog Discovery Unlocked
    const unlockedCatalog = await LmsService.getPublicCourses({ search: `Calculus - ${testId}` });
    const foundInUnlockedCatalog = unlockedCatalog.courses.some((c: any) => c.id === testCourse.id);
    assert(
      foundInUnlockedCatalog === true,
      "Published course is immediately discoverable in public catalog"
    );

    // 7e. Course Slug Lookup for Students Unlocked
    const unlockedSlugLookup = await LmsService.getCourseBySlug(
      testCourse.slug,
      studentUser.id,
      "STUDENT"
    );
    assert(
      !!unlockedSlugLookup && unlockedSlugLookup.id === testCourse.id,
      "Learners can immediately view course landing page by slug"
    );

    // 7f. Public Live Availability Unlocked
    const unlockedAvailability = await LiveClassService.getPublicEducatorAvailability(
      unverifiedTeacherUser.teacherProfile.id
    );
    assert(
      unlockedAvailability.educator.isLocked === false,
      "Learners can immediately view public live class schedule slots after educator verification"
    );

  } catch (error: any) {
    console.error("❌ Unexpected test runner error:", error);
    failed++;
  } finally {
    console.log("\n🧹 8. Cleaning up test data...");
    try {
      if (testCourse?.id) {
        await prisma.videoAsset.deleteMany({ where: { lesson: { section: { courseId: testCourse.id } } } }).catch(() => {});
        await prisma.courseLesson.deleteMany({ where: { section: { courseId: testCourse.id } } }).catch(() => {});
        await prisma.courseSection.deleteMany({ where: { courseId: testCourse.id } }).catch(() => {});
        await prisma.course.delete({ where: { id: testCourse.id } }).catch(() => {});
      }
      if (testSlot?.id) {
        await prisma.liveClassSession.deleteMany({ where: { liveClassSlotId: testSlot.id } }).catch(() => {});
        await prisma.liveClassSlot.delete({ where: { id: testSlot.id } }).catch(() => {});
      }
      if (unverifiedTeacherUser?.id) {
        await prisma.liveClassSession.deleteMany({ where: { teacherId: unverifiedTeacherUser.teacherProfile?.id } }).catch(() => {});
        await prisma.liveClassSlot.deleteMany({ where: { teacherId: unverifiedTeacherUser.teacherProfile?.id } }).catch(() => {});
        await prisma.teacherProfile.deleteMany({ where: { userId: unverifiedTeacherUser.id } }).catch(() => {});
        await prisma.profile.deleteMany({ where: { userId: unverifiedTeacherUser.id } }).catch(() => {});
        await prisma.user.delete({ where: { id: unverifiedTeacherUser.id } }).catch(() => {});
      }
      if (verifiedTeacherUser?.id) {
        await prisma.liveClassSession.deleteMany({ where: { teacherId: verifiedTeacherUser.teacherProfile?.id } }).catch(() => {});
        await prisma.liveClassSlot.deleteMany({ where: { teacherId: verifiedTeacherUser.teacherProfile?.id } }).catch(() => {});
        await prisma.teacherProfile.deleteMany({ where: { userId: verifiedTeacherUser.id } }).catch(() => {});
        await prisma.profile.deleteMany({ where: { userId: verifiedTeacherUser.id } }).catch(() => {});
        await prisma.user.delete({ where: { id: verifiedTeacherUser.id } }).catch(() => {});
      }
      if (studentUser?.id) {
        await prisma.profile.deleteMany({ where: { userId: studentUser.id } }).catch(() => {});
        await prisma.user.delete({ where: { id: studentUser.id } }).catch(() => {});
      }
      if (adminUser?.id) {
        await prisma.profile.deleteMany({ where: { userId: adminUser.id } }).catch(() => {});
        await prisma.user.delete({ where: { id: adminUser.id } }).catch(() => {});
      }
    } catch (cleanupErr) {
      console.warn("Cleanup warning:", cleanupErr);
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

runVerificationLockTests();
