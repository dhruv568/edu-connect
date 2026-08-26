import { prisma } from "../lib/prisma";
import { NotificationService } from "../services/notification-service";
import { EventService } from "../services/event-service";
import { AnalyticsService } from "../services/analytics-service";
import crypto from "crypto";

async function runModule9Tests() {
  process.env.EMAIL_PROVIDER = "console";
  console.log("🧪 Starting EduConnect Module 09 — Notifications, Dashboards & Analytics Test Suite...\n");

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

    // -------------------------------------------------------------
    // Setup Test Entities: Teacher, Student, Admin, Course, LiveClass
    // -------------------------------------------------------------
    console.log("🔹 1. Setting up test entities in database...");

    const teacherUser = await prisma.user.create({
      data: {
        email: `teacher.mod9.${randomSuffix}@educonnect.com`,
        passwordHash: "$2a$10$xyz",
        role: "TEACHER",
        emailVerified: true,
        profile: {
          create: { firstName: "Sarah", lastName: "Patel" },
        },
        teacherProfile: {
          create: {
            headline: "Mathematics Educator",
            verificationStatus: "VERIFIED",
          },
        },
      },
      include: { teacherProfile: true },
    });

    const studentUser = await prisma.user.create({
      data: {
        email: `student.mod9.${randomSuffix}@educonnect.com`,
        passwordHash: "$2a$10$xyz",
        role: "STUDENT",
        emailVerified: true,
        profile: {
          create: { firstName: "Dhruv", lastName: "Sharma" },
        },
        studentProfile: {
          create: { gradeLevel: "Grade 10" },
        },
      },
    });

    const adminUser = await prisma.user.create({
      data: {
        email: `admin.mod9.${randomSuffix}@educonnect.com`,
        passwordHash: "$2a$10$xyz",
        role: "ADMIN",
        emailVerified: true,
        profile: {
          create: { firstName: "Platform", lastName: "Admin" },
        },
      },
    });

    const course = await prisma.course.create({
      data: {
        title: `Mathematics Mastery ${randomSuffix}`,
        slug: `math-mastery-${randomSuffix}`,
        description: "Comprehensive high school algebra.",
        subject: "Mathematics",
        price: 799.0,
        status: "PUBLISHED",
        teacherId: teacherUser.teacherProfile!.id,
        sections: {
          create: [
            {
              title: "Algebra Fundamentals",
              order: 1,
              lessons: {
                create: [
                  { title: "Lesson 1: Variables", durationSeconds: 600, order: 1 },
                  { title: "Lesson 2: Equations", durationSeconds: 900, order: 2 },
                ],
              },
            },
          ],
        },
      },
      include: { sections: { include: { lessons: true } } },
    });

    const liveSlot = await prisma.liveClassSlot.create({
      data: {
        teacherId: teacherUser.teacherProfile!.id,
        title: `React Live Class ${randomSuffix}`,
        subject: "Computer Science",
        startTime: new Date(Date.now() + 30 * 60 * 1000), // 30 mins from now
        endTime: new Date(Date.now() + 90 * 60 * 1000),
        price: 499.0,
        maxCapacity: 10,
        status: "SCHEDULED",
      },
    });

    assert(!!teacherUser && !!studentUser && !!adminUser, "Test users successfully created");

    // -------------------------------------------------------------
    // Test 2: Notification Service Operations
    // -------------------------------------------------------------
    console.log("\n🔹 2. Testing Notification Service Engine...");

    const notif1 = await NotificationService.create({
      userId: studentUser.id,
      type: "COURSE_ENROLLED",
      title: "Enrolled in Mathematics Mastery",
      message: "You have enrolled in Mathematics Mastery.",
      actionUrl: `/learn/${course.slug}`,
      idempotencyKey: `test-idemp-${randomSuffix}`,
    });

    assert(notif1.title.includes("Mathematics Mastery"), "Notification created successfully");

    // Idempotency test (duplicate call returns same record)
    const notif1Dup = await NotificationService.create({
      userId: studentUser.id,
      type: "COURSE_ENROLLED",
      title: "Enrolled in Mathematics Mastery",
      message: "You have enrolled in Mathematics Mastery.",
      actionUrl: `/learn/${course.slug}`,
      idempotencyKey: `test-idemp-${randomSuffix}`,
    });

    assert(notif1Dup.id === notif1.id, "Duplicate notification prevented via idempotency key");

    const unread1 = await NotificationService.getUnreadCount(studentUser.id);
    assert(unread1 >= 1, "Unread count accurately returned");

    await NotificationService.markAsRead(notif1.id, studentUser.id);
    const unread2 = await NotificationService.getUnreadCount(studentUser.id);
    assert(unread2 === unread1 - 1, "Notification marked as read updates unread count");

    // Test notification preference default & update
    const pref = await NotificationService.getPreferences(studentUser.id);
    assert(pref.emailCourseUpdates === true, "Default notification preference initialized");

    const updatedPref = await NotificationService.updatePreferences(studentUser.id, {
      emailMarketing: true,
    });
    assert(updatedPref.emailMarketing === true, "Notification preference updated");

    // -------------------------------------------------------------
    // Test 3: Event Service Dispatcher
    // -------------------------------------------------------------
    console.log("\n🔹 3. Testing Event-Driven Notification Engine...");

    await EventService.emit("payment.captured", {
      userId: studentUser.id,
      data: {
        amountPaise: 79900,
        title: course.title,
        teacherUserId: teacherUser.id,
        orderId: `ORDER_${randomSuffix}`,
        entityType: "PaymentTransaction",
        entityId: `tx_${randomSuffix}`,
      },
      idempotencyKey: `evt-pay-${randomSuffix}`,
    });

    const userNotifs = await NotificationService.getUserNotifications(studentUser.id, { filter: "PAYMENTS" });
    assert(userNotifs.notifications.length > 0, "Payment captured event generated in-app notification for student");

    const teacherNotifs = await NotificationService.getUserNotifications(teacherUser.id, { filter: "PAYMENTS" });
    assert(teacherNotifs.notifications.length > 0, "Payment captured event generated earning notification for teacher");

    // -------------------------------------------------------------
    // Test 4: Student Dashboard & Analytics
    // -------------------------------------------------------------
    console.log("\n🔹 4. Testing Student Dashboard & Real DB Analytics...");

    // Create active enrollment & lesson progress for student
    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: studentUser.id,
        courseId: course.id,
        status: "ACTIVE",
      },
    });

    const firstLesson = course.sections[0].lessons[0];
    await prisma.lessonProgress.create({
      data: {
        enrollmentId: enrollment.id,
        lessonId: firstLesson.id,
        progressSeconds: 300,
        completed: true,
        completedAt: new Date(),
        lastWatchedAt: new Date(),
      },
    });

    // Create booking for live class
    await prisma.booking.create({
      data: {
        studentId: studentUser.id,
        liveClassSlotId: liveSlot.id,
        status: "CONFIRMED",
      },
    });

    const studentDash = await AnalyticsService.getStudentDashboardData(studentUser.id);

    assert(studentDash.userName === "Dhruv Sharma", "Student dashboard returns authenticated user profile name");
    assert(studentDash.continueLearning !== null, "Student continue learning section populated from DB");
    assert(studentDash.continueLearning?.progressPercent === 50, "Course progress calculated accurately (1 of 2 lessons = 50%)");
    assert(studentDash.upcomingClasses.length === 1, "Upcoming live class slot retrieved from DB");
    assert(studentDash.stats.enrolledCount === 1, "Enrolled courses count reflects DB enrollments");
    assert(studentDash.stats.courseHours > 0, "Course learning time calculated from video progress");

    // -------------------------------------------------------------
    // Test 5: Teacher Dashboard & Analytics
    // -------------------------------------------------------------
    console.log("\n🔹 5. Testing Teacher Dashboard & Analytics...");

    // Record ledger entry for teacher
    await prisma.financialLedgerEntry.create({
      data: {
        teacherId: teacherUser.teacherProfile!.id,
        type: "TEACHER_EARNING",
        amountPaise: 63920, // ₹639.20
        direction: "CREDIT",
        status: "COMPLETED",
        description: "Teacher share for algebra course purchase",
      },
    });

    const teacherDash = await AnalyticsService.getTeacherDashboardData(teacherUser.id);
    assert(teacherDash.userName === "Sarah Patel", "Teacher dashboard returns authenticated teacher profile");
    assert(teacherDash.metrics.activeCoursesCount === 1, "Teacher published active courses count accurate");
    assert(teacherDash.metrics.monthlyEarningsRupees === 639.2, "Teacher monthly earnings strictly consumed from financial ledger");

    const teacherAnalytics = await AnalyticsService.getTeacherAnalyticsData(teacherUser.id, { range: "30d" });
    assert(teacherAnalytics.courseMetrics.publishedCoursesCount === 1, "Teacher analytics computes course performance");
    assert(teacherAnalytics.financialMetrics.periodEarningsRupees === 639.2, "Teacher analytics computes period financial metrics");

    // -------------------------------------------------------------
    // Test 6: Admin Dashboard, Analytics & System Health
    // -------------------------------------------------------------
    console.log("\n🔹 6. Testing Admin Governance Dashboard, Analytics & Health...");

    const adminDash = await AnalyticsService.getAdminDashboardData();
    assert(adminDash.metrics.totalStudents >= 1, "Admin dashboard returns actual total students count");
    assert(adminDash.metrics.totalTeachers >= 1, "Admin dashboard returns actual total teachers count");
    assert(adminDash.metrics.publishedCourses >= 1, "Admin dashboard returns actual total published courses");

    const adminAnalytics = await AnalyticsService.getAdminAnalyticsData({ range: "30d" });
    assert(adminAnalytics.topCourses.length >= 1, "Admin analytics returns top courses leaderboard from DB");

    const health = await AnalyticsService.getAdminSystemHealth();
    assert(health.status === "OPERATIONAL", "Admin system health monitor returns operational status");
    assert(health.services.database.status === "HEALTHY", "Database service health check passes");

    // -------------------------------------------------------------
    // Test 7: PARENT Role Removal & Security Enforcement
    // -------------------------------------------------------------
    console.log("\n🔹 7. Verifying Security & Obsolete Role Prevention...");

    const parentUsers = await prisma.user.findMany({
      where: { role: "PARENT" },
    });
    assert(parentUsers.length === 0, "Zero PARENT records exist in database");

  } catch (error) {
    console.error("❌ Test execution exception:", error);
    failedTests++;
  } finally {
    await prisma.$disconnect();
  }

  console.log("\n==================================================");
  console.log(`📊 Module 09 Test Results: ${passedTests} Passed, ${failedTests} Failed`);
  console.log("==================================================\n");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runModule9Tests();
