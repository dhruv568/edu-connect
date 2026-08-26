import { prisma } from "../lib/prisma";
import { LmsService } from "../services/lms-service";
import crypto from "crypto";

async function runModule7LmsTests() {
  console.log("🧪 Starting EduConnect Module 07 — LMS / Pre-recorded Courses Test Suite...\n");

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
    const randomSuffix = crypto.randomBytes(4).toString("hex");

    // Setup Test Users: Teacher & Student
    const teacherUser = await prisma.user.create({
      data: {
        email: `teacher.lms.${randomSuffix}@educonnect.com`,
        passwordHash: "$2a$10$xyz",
        role: "TEACHER",
        emailVerified: true,
        profile: {
          create: {
            firstName: "Sarah",
            lastName: "Patel",
            avatarUrl: "/avatars/sarah.jpg",
          },
        },
        teacherProfile: {
          create: {
            headline: "Senior Mathematics Specialist",
            bio: "10+ years teaching advanced mathematics and algebra.",
            experienceYears: 10,
            verificationStatus: "VERIFIED",
            rating: 4.9,
          },
        },
      },
      include: { teacherProfile: true },
    });

    const studentUser = await prisma.user.create({
      data: {
        email: `student.lms.${randomSuffix}@educonnect.com`,
        passwordHash: "$2a$10$xyz",
        role: "STUDENT",
        emailVerified: true,
        profile: {
          create: {
            firstName: "Alex",
            lastName: "Johnson",
          },
        },
      },
    });

    const teacherProfileId = teacherUser.teacherProfile!.id;

    // Test 1: Course Creation & Unique Slug Generation
    console.log("📋 1. Testing Course Creation & Slug Generation...");
    const courseInput = {
      title: "Mathematics Mastery: Fundamentals to Advanced",
      subtitle: "Master algebra and quadratic equations step-by-step",
      description: "Comprehensive mathematics course covering fundamentals to advanced problem solving.",
      subject: "Mathematics",
      category: "Algebra",
      level: "BEGINNER",
      price: 0, // Free course
      learningOutcomes: ["Understand algebra fundamentals", "Solve quadratic equations"],
      requirements: ["Basic math knowledge"],
    };

    const draftCourse = await LmsService.createTeacherCourse(teacherUser.id, courseInput);

    assert(!!draftCourse.id, "Draft course created in database");
    assert(draftCourse.status === "DRAFT", "Initial course status is DRAFT");
    assert(draftCourse.slug.startsWith("mathematics-mastery"), "SEO-friendly slug generated");

    // Test 2: Section & Lesson Management
    console.log("\n📚 2. Testing Section, Lesson & Resource Management...");
    const section1 = await LmsService.createSection(
      teacherUser.id,
      draftCourse.id,
      "Section 01: Algebra Fundamentals",
      "Core algebra concepts"
    );
    assert(section1.title === "Section 01: Algebra Fundamentals", "CourseSection created successfully");

    const lesson1Preview = await LmsService.createLesson(teacherUser.id, section1.id, {
      title: "Lesson 01: Introduction to Variables",
      description: "Overview of algebraic variables",
      type: "VIDEO",
      videoAssetId: "sample_video_asset_001.mp4",
      durationSeconds: 300,
      isPreview: true, // Preview lesson
    });

    const lesson2Protected = await LmsService.createLesson(teacherUser.id, section1.id, {
      title: "Lesson 02: Quadratic Equations",
      description: "Solving quadratics using formulas",
      type: "VIDEO",
      videoAssetId: "sample_video_asset_002.mp4",
      durationSeconds: 600,
      isPreview: false, // Protected lesson
    });

    assert(lesson1Preview.isPreview === true, "Lesson 1 marked as free preview");
    assert(lesson2Protected.isPreview === false, "Lesson 2 marked as protected content");

    const resource = await LmsService.addResource(teacherUser.id, lesson1Preview.id, {
      name: "Algebra Worksheet.pdf",
      storageKey: `worksheet_${randomSuffix}.pdf`,
      mimeType: "application/pdf",
      size: 1024,
    });
    assert(resource.name === "Algebra Worksheet.pdf", "Resource attached to lesson");

    // Test 3: Validation & Publishing Workflow
    console.log("\n🚀 3. Testing Publish Requirements & Publishing Workflow...");
    let publishError = false;
    try {
      // Attempt to publish without thumbnail
      await LmsService.publishCourse(teacherUser.id, draftCourse.id);
    } catch {
      publishError = true;
    }
    assert(publishError, "Publishing fails if required thumbnail is missing");

    // Add thumbnail and publish
    await LmsService.updateCourse(teacherUser.id, draftCourse.id, {
      thumbnailUrl: "/thumbnails/math-mastery.jpg",
    });

    const publishedCourse = await LmsService.publishCourse(teacherUser.id, draftCourse.id);
    assert(publishedCourse.status === "PUBLISHED", "Course status transitioned to PUBLISHED");
    assert(!!publishedCourse.publishedAt, "publishedAt timestamp recorded");

    // Test 4: Public Marketplace Discovery & Search
    console.log("\n🔍 4. Testing Course Marketplace Search, Filtering & Public View...");
    const searchResult = await LmsService.getPublicCourses({
      search: "Mathematics",
      subject: "Mathematics",
      sortBy: "newest",
    });

    assert(searchResult.totalCount >= 1, "Public course search returned published course");
    assert(searchResult.courses[0].slug === draftCourse.slug, "Marketplace includes newly published course");

    const publicDetail = await LmsService.getCourseBySlug(draftCourse.slug, studentUser.id);
    assert(publicDetail?.isEnrolled === false, "Student is not enrolled initially");
    assert(publicDetail?.sections[0].lessons[0].isPreview === true, "Preview lesson indicator visible to visitor");

    // Test 5: Authorization & Video Access Security
    console.log("\n🛡️ 5. Testing Content Authorization & Video Stream Security...");
    const previewAccess = await LmsService.verifyVideoAccess(null, lesson1Preview.id);
    assert(previewAccess.allowed === true, "Unauthenticated user can stream preview lesson");

    const protectedAccessAnon = await LmsService.verifyVideoAccess(null, lesson2Protected.id);
    assert(protectedAccessAnon.allowed === false, "Unauthenticated user blocked from protected lesson video");

    const protectedAccessUnenrolled = await LmsService.verifyVideoAccess(studentUser.id, lesson2Protected.id);
    assert(protectedAccessUnenrolled.allowed === false, "Unenrolled student blocked from protected lesson video");

    // Test 6: Student Enrollment Flow
    console.log("\n🎓 6. Testing Student Course Enrollment...");
    const enrollResult = await LmsService.enrollStudent(studentUser.id, draftCourse.id);
    assert(enrollResult.enrollment.status === "ACTIVE", "Free course enrollment instantly becomes ACTIVE");

    const protectedAccessEnrolled = await LmsService.verifyVideoAccess(studentUser.id, lesson2Protected.id);
    assert(protectedAccessEnrolled.allowed === true, "Enrolled student granted video stream access");

    // Test 7: Progress Tracking, Threshold & Completion
    console.log("\n📈 7. Testing Video Progress Tracking & Course Completion...");
    // Update progress below 90%
    const prog1 = await LmsService.updateLessonProgress(studentUser.id, lesson1Preview.id, 100); // 100s / 300s = 33%
    assert(prog1.lessonCompleted === false, "Lesson not complete when watched < 90%");

    // Update progress above 90% (280s / 300s = 93%)
    const prog2 = await LmsService.updateLessonProgress(studentUser.id, lesson1Preview.id, 280);
    assert(prog2.lessonCompleted === true, "Lesson marked complete when progress exceeds 90% threshold");

    // Complete second lesson to finish 100% of course
    const prog3 = await LmsService.updateLessonProgress(studentUser.id, lesson2Protected.id, 580);
    assert(prog3.courseCompleted === true, "100% lesson completion triggers course completion");

    const studentCourses = await LmsService.getStudentEnrolledCourses(studentUser.id);
    assert(studentCourses.enrolledCourses[0].status === "COMPLETED", "Enrollment status updated to COMPLETED");

    // Test 8: Course Reviews & Rating Aggregation
    console.log("\n⭐ 8. Testing Course Reviews & Rating Calculations...");
    const review = await LmsService.createCourseReview(
      studentUser.id,
      draftCourse.id,
      5,
      "Outstanding mathematics course! Very clear explanation of quadratics."
    );

    assert(review.rating === 5, "CourseReview created with 5-star rating");

    const updatedCourseInDb = await prisma.course.findUnique({ where: { id: draftCourse.id } });
    assert(updatedCourseInDb?.rating === 5.0, "Course aggregate rating updated in database");
    assert(updatedCourseInDb?.reviewCount === 1, "Course review count incremented");

    // Test 9: Duplicate Review Prevention
    console.log("\n🚫 9. Testing Review Eligibility & Protection Against Manipulation...");
    let duplicateReviewFailed = false;
    try {
      await LmsService.createCourseReview(studentUser.id, draftCourse.id, 4, "Duplicate review attempt");
    } catch {
      duplicateReviewFailed = true;
    }
    assert(duplicateReviewFailed, "Duplicate course review by same student is rejected");

    // Test 10: Parent Role Removal Verification (Product Rule)
    console.log("\n🛑 10. Verifying Strict PARENT Role Removal...");
    const userRolesInDb = await prisma.user.findMany({ select: { role: true } });
    const hasParentRole = userRolesInDb.some((u) => u.role === "PARENT");
    assert(!hasParentRole, "Database contains ZERO PARENT role records");

    console.log("\n============================================================");
    console.log(`🎉 TEST SUMMARY: ${passedTests} Passed, ${failedTests} Failed`);
    console.log("============================================================\n");

    if (failedTests > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Fatal error in Module 07 LMS tests:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runModule7LmsTests();
