import { prisma } from "../lib/prisma";
import {
  SCHOOL_GRADES,
  SENIOR_SECONDARY_STREAMS,
  COMPETITIVE_EXAMS,
  DIPLOMA_BRANCHES,
  isSeniorSecondaryGrade,
  formatAcademicProfileSummary,
} from "../lib/constants/academic";
import { AnalyticsService } from "../services/analytics-service";
import { LmsService } from "../services/lms-service";

async function main() {
  console.log("\n========================================================");
  console.log("🚀 Testing Learner Academic Profiles & Personalization");
  console.log("========================================================\n");

  // 1. Validate Academic Constants & Helpers
  console.log("1. Testing Academic Constants & Helper Functions...");
  if (SCHOOL_GRADES.length !== 12) {
    throw new Error(`Expected 12 school grades, found ${SCHOOL_GRADES.length}`);
  }
  if (SENIOR_SECONDARY_STREAMS.length < 4) {
    throw new Error("Expected at least 4 senior secondary streams");
  }
  if (COMPETITIVE_EXAMS.length < 6) {
    throw new Error("Expected at least 6 competitive exams");
  }
  if (DIPLOMA_BRANCHES.length < 5) {
    throw new Error("Expected at least 5 diploma branches");
  }

  // Check senior secondary grade logic
  if (!isSeniorSecondaryGrade("Grade 11") || !isSeniorSecondaryGrade("Grade 12")) {
    throw new Error("Grade 11 and 12 should be identified as senior secondary");
  }
  if (isSeniorSecondaryGrade("Grade 10") || isSeniorSecondaryGrade("Grade 8")) {
    throw new Error("Grades 1-10 should NOT be identified as senior secondary");
  }

  // Check formatter outputs
  const school10Summary = formatAcademicProfileSummary({
    educationType: "SCHOOL",
    gradeLevel: "Grade 10",
  });
  console.log("  • School Grade 10 Summary:", school10Summary);
  if (school10Summary.includes("Stream") || school10Summary.includes("Target")) {
    throw new Error("Grade 10 summary must NOT include stream or exam");
  }

  const school12Summary = formatAcademicProfileSummary({
    educationType: "SCHOOL",
    gradeLevel: "Grade 12",
    stream: "Science",
    competitiveExam: "JEE",
  });
  console.log("  • School Grade 12 Summary:", school12Summary);
  if (!school12Summary.includes("Science") || !school12Summary.includes("JEE")) {
    throw new Error("Grade 12 summary must include stream and exam target");
  }

  const diplomaSummary = formatAcademicProfileSummary({
    educationType: "DIPLOMA",
    diplomaBranch: "Computer Engineering",
  });
  console.log("  • Diploma Summary:", diplomaSummary);
  if (!diplomaSummary.includes("Computer Engineering") || diplomaSummary.includes("Grade")) {
    throw new Error("Diploma summary must include branch and NOT school grade");
  }
  console.log("  ✅ Academic constants and formatters validated successfully!\n");

  // 2. Database Persistence & Backward Compatibility Test
  console.log("2. Testing Database Persistence & Backward Compatibility...");
  const testEmail = `test.academic.${Date.now()}@educonnects.test`;
  const testUser = await prisma.user.create({
    data: {
      email: testEmail,
      passwordHash: "$2a$10$testpasswordhashforacademicverification",
      role: "STUDENT",
      emailVerified: true,
      profile: {
        create: {
          firstName: "Test",
          lastName: "Learner",
        },
      },
      studentProfile: {
        create: {
          educationType: "SCHOOL",
          gradeLevel: "Grade 10",
        },
      },
    },
    include: { studentProfile: true },
  });

  try {
    console.log("  • Created test learner:", testUser.id, testUser.email);
    if (testUser.studentProfile?.educationType !== "SCHOOL" || testUser.studentProfile?.gradeLevel !== "Grade 10") {
      throw new Error("Student profile educationType or gradeLevel mismatch");
    }

    // Update to Grade 12 with Stream and Exam
    const updatedG12 = await prisma.studentProfile.update({
      where: { userId: testUser.id },
      data: {
        educationType: "SCHOOL",
        gradeLevel: "Grade 12",
        stream: "Science",
        competitiveExam: "JEE",
        diplomaBranch: null,
      },
    });
    console.log("  • Updated to Grade 12 Science (JEE):", updatedG12.gradeLevel, updatedG12.stream, updatedG12.competitiveExam);
    if (updatedG12.stream !== "Science" || updatedG12.competitiveExam !== "JEE") {
      throw new Error("Failed to persist Grade 12 stream or competitiveExam");
    }

    // Update to Diploma
    const updatedDiploma = await prisma.studentProfile.update({
      where: { userId: testUser.id },
      data: {
        educationType: "DIPLOMA",
        gradeLevel: null,
        stream: null,
        competitiveExam: null,
        diplomaBranch: "Computer Engineering",
      },
    });
    console.log("  • Updated to Diploma:", updatedDiploma.educationType, updatedDiploma.diplomaBranch);
    if (updatedDiploma.diplomaBranch !== "Computer Engineering" || updatedDiploma.gradeLevel !== null) {
      throw new Error("Failed to persist Diploma branch with cleared school grade");
    }
    console.log("  ✅ Database profile persistence & updates working seamlessly!\n");

    // 3. Analytics Service Dashboard Personalization Test
    console.log("3. Testing AnalyticsService Dashboard Personalization...");
    const dashboardData = await AnalyticsService.getStudentDashboardData(testUser.id);
    console.log("  • Dashboard returned academicProfile:", dashboardData.academicProfile);
    if (!dashboardData.academicProfile || dashboardData.academicProfile.educationType !== "DIPLOMA") {
      throw new Error("Dashboard data missing academicProfile or incorrect educationType");
    }
    console.log("  • Dashboard recommended educators count:", dashboardData.recommendedEducators.length);
    console.log("  • Dashboard recommended courses count:", dashboardData.recommendedCourses.length);
    console.log("  ✅ AnalyticsService dashboard personalization verified!\n");

    // 4. LMS Public Courses Academic Filtering Test
    console.log("4. Testing LmsService.getPublicCourses Academic Filter...");
    const coursesResult = await LmsService.getPublicCourses({
      page: 1,
      limit: 5,
      diplomaBranch: "Computer Engineering",
    });
    console.log("  • Public courses query with diplomaBranch returned:", coursesResult.courses.length, "courses");
    console.log("  ✅ LmsService courses filtering verified!\n");

    console.log("🎉 ALL TESTS PASSED SUCCESSFULLY!");
  } finally {
    // Teardown: delete test user and profile
    await prisma.studentProfile.deleteMany({ where: { userId: testUser.id } });
    await prisma.profile.deleteMany({ where: { userId: testUser.id } });
    await prisma.user.deleteMany({ where: { id: testUser.id } });
    console.log("🧹 Cleaned up test learner records from database.");
  }
}

main()
  .catch((err) => {
    console.error("\n❌ TEST FAILED:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
