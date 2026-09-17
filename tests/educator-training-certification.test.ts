import { prisma } from "../lib/prisma";
import { TrainingService, DEFAULT_15_DAYS } from "../services/training-service";
import { CertificateService } from "../services/certificate-service";
import { hashPassword } from "../lib/auth/password";

async function runEducatorTrainingCertificationSuite() {
  console.log("\n=======================================================");
  console.log("🎓 RUNNING 15-DAY EDUCATOR TRAINING & CERTIFICATION SUITE");
  console.log("=======================================================\n");

  let testAdminUser: any;
  let testTeacherUser: any;
  let testIneligibleTeacher: any;

  try {
    const passwordHash = await hashPassword("SecureEducator2026!");

    // 1. Setup Test Users
    console.log("1. Setting up test Admin & Educator accounts...");
    testAdminUser = await prisma.user.create({
      data: {
        email: `admin.training.cert.${Date.now()}@educonnects.com`,
        passwordHash,
        role: "ADMIN",
        status: "ACTIVE",
        emailVerified: true,
        emailVerifiedAt: new Date(),
        profile: {
          create: { firstName: "Academy", lastName: "Director" },
        },
      },
    });

    testTeacherUser = await prisma.user.create({
      data: {
        email: `dr.sharma.educator.${Date.now()}@educonnects.com`,
        passwordHash,
        role: "TEACHER",
        status: "ACTIVE",
        emailVerified: true,
        emailVerifiedAt: new Date(),
        profile: {
          create: { firstName: "Rajesh", lastName: "Sharma" },
        },
      },
    });

    testIneligibleTeacher = await prisma.user.create({
      data: {
        email: `newbie.teacher.${Date.now()}@educonnects.com`,
        passwordHash,
        role: "TEACHER",
        status: "ACTIVE",
        emailVerified: true,
        emailVerifiedAt: new Date(),
        profile: {
          create: { firstName: "Priya", lastName: "Verma" },
        },
      },
    });
    console.log("   ✓ Test users created successfully.");

    // 2. Program Seeding & Curriculum Architecture
    console.log("\n2. Initializing & Verifying 15-Day Curriculum Program...");
    const program = await TrainingService.ensureDefaultProgram();
    if (!program || program.days.length !== 15) {
      throw new Error(`Expected exactly 15 curriculum days, found ${program?.days?.length}`);
    }
    console.log(`   ✓ Program '${program.title}' seeded with ${program.days.length} days.`);

    // Verify Day 1 details
    const day1 = program.days.find((d) => d.dayNumber === 1);
    if (!day1 || !day1.title || !day1.learningObjectives || !day1.quiz) {
      throw new Error("Day 1 is missing required objectives or quiz structure.");
    }
    console.log(`   ✓ Day 1: "${day1.title}" contains quiz with ID ${day1.quiz.id}.`);

    // Verify Day 15 details
    const day15 = program.days.find((d) => d.dayNumber === 15);
    if (!day15 || !day15.quiz) {
      throw new Error("Day 15 is missing or has no capstone quiz.");
    }
    console.log(`   ✓ Day 15: "${day15.title}" verified.`);

    // 3. Admin Day & Quiz Management
    console.log("\n3. Testing Admin Curriculum & Quiz Updates...");
    const updatedDay1 = await TrainingService.updateDay(day1.id, {
      title: "Day 1: Platform Onboarding & Classroom Studio (Updated)",
      description: "Comprehensive introduction to digital teaching excellence and pedagogical tools.",
    });
    if (!updatedDay1.title.includes("(Updated)")) {
      throw new Error("Failed to update Day 1 title via Admin service.");
    }
    console.log("   ✓ Admin successfully modified training day content.");

    // 4. Educator Enrollment & Sequential Progression Guarding
    console.log("\n4. Testing Sequential Day Progression & Locking...");
    const enrollment = await TrainingService.getOrCreateEnrollment(testTeacherUser.id);
    if (enrollment.completedDaysCount !== 0 || enrollment.status !== "ENROLLED") {
      throw new Error("Initial enrollment state must be ENROLLED with 0 completed days.");
    }

    const initialRoadmap = await TrainingService.getEducatorRoadmap(testTeacherUser.id);
    const day1Roadmap = initialRoadmap.days.find((d) => d.dayNumber === 1);
    const day2Roadmap = initialRoadmap.days.find((d) => d.dayNumber === 2);

    if (day1Roadmap?.isLocked) {
      throw new Error("Day 1 should never be locked for an active enrollment.");
    }
    if (!day2Roadmap?.isLocked) {
      throw new Error("Day 2 MUST be locked before completing Day 1.");
    }
    console.log("   ✓ Day 1 is unlocked; Day 2 is locked as expected.");

    // Attempting to skip Day 1 and complete Day 2 directly
    let skipErrorCaught = false;
    try {
      await TrainingService.completeDayContent(testTeacherUser.id, 2);
    } catch (err: any) {
      skipErrorCaught = true;
      console.log(`   ✓ Sequential locking prevented skipping to Day 2: "${err.message}"`);
    }
    if (!skipErrorCaught) {
      throw new Error("Security Violation: Educator was able to skip Day 1 and complete Day 2!");
    }

    // 5. Day 1 Content Completion & Quiz Evaluation
    console.log("\n5. Testing Day 1 Completion & Quiz Evaluation...");
    await TrainingService.completeDayContent(testTeacherUser.id, 1);

    // Get Day 1 questions
    const day1Data = await TrainingService.getEducatorDay(testTeacherUser.id, 1);
    const day1Questions = day1Data.quiz.questions;
    const day1FullQuestions = JSON.parse(day1.quiz.questions);

    // Failing quiz submission (< 70%)
    const failingAnswers: Record<string, "A" | "B" | "C" | "D"> = {};
    day1FullQuestions.forEach((q: any) => {
      const wrong = (["A", "B", "C", "D"].find((opt) => opt !== q.correctAnswer) || "D") as "A" | "B" | "C" | "D";
      failingAnswers[q.id] = wrong;
    });

    const failResult = await TrainingService.submitQuizAttempt(testTeacherUser.id, 1, failingAnswers);
    if (failResult.passed || failResult.scorePercentage > 50) {
      throw new Error(`Quiz grading error: failing submission scored ${failResult.scorePercentage}%`);
    }
    console.log(`   ✓ Failing quiz correctly rejected with score ${failResult.scorePercentage}% (Passing: ${failResult.passingScore}%)`);

    // Passing quiz submission (100%)
    const perfectAnswers: Record<string, "A" | "B" | "C" | "D"> = {};
    day1FullQuestions.forEach((q: any) => {
      perfectAnswers[q.id] = q.correctAnswer;
    });

    const passResult = await TrainingService.submitQuizAttempt(testTeacherUser.id, 1, perfectAnswers);
    if (!passResult.passed || passResult.scorePercentage !== 100) {
      throw new Error(`Quiz grading error: expected 100% pass, got ${passResult.scorePercentage}%`);
    }
    console.log(`   ✓ Passing quiz successfully accepted with score ${passResult.scorePercentage}%`);

    // Verify Day 1 is completed and Day 2 unlocked
    const progressAfterDay1 = await TrainingService.getEducatorRoadmap(testTeacherUser.id);
    const updatedDay2 = progressAfterDay1.days.find((d) => d.dayNumber === 2);
    if (updatedDay2?.isLocked) {
      throw new Error("Day 2 should now be unlocked after completing Day 1!");
    }
    console.log("   ✓ Day 1 marked COMPLETED; Day 2 is now unlocked.");

    // 6. Fast-forward Days 2 to 15 to test Certification Eligibility
    console.log("\n6. Completing Days 2 through 15 sequentially...");
    for (let day = 2; day <= 15; day++) {
      await TrainingService.completeDayContent(testTeacherUser.id, day);
      const dayRecord = program.days.find((d) => d.dayNumber === day);
      const rawQuestions = JSON.parse(dayRecord!.quiz!.questions);
      const correctAnswers: Record<string, "A" | "B" | "C" | "D"> = {};
      rawQuestions.forEach((q: any) => {
        correctAnswers[q.id] = q.correctAnswer;
      });
      await TrainingService.submitQuizAttempt(testTeacherUser.id, day, correctAnswers);
    }

    const finalRoadmap = await TrainingService.getEducatorRoadmap(testTeacherUser.id);
    if (finalRoadmap.enrollment.completedDaysCount !== 15) {
      throw new Error(`Expected 15 completed days, got ${finalRoadmap.enrollment.completedDaysCount}`);
    }
    if (!finalRoadmap.enrollment.isCertificateEligible) {
      throw new Error("Educator should be marked isCertificateEligible: true after 15 days.");
    }
    console.log("   ✓ All 15 days completed! Educator is CERTIFICATE_ELIGIBLE.");

    // 7. Identity Confirmation & Pre-issuance Security
    console.log("\n7. Testing Identity Confirmation & Fraud Prevention...");
    // Test ineligible educator cannot claim certificate
    let ineligibleErrorCaught = false;
    try {
      await CertificateService.getIdentityForVerification(testIneligibleTeacher.id);
    } catch (err: any) {
      ineligibleErrorCaught = true;
      console.log(`   ✓ Ineligible educator correctly rejected: "${err.message}"`);
    }
    if (!ineligibleErrorCaught) {
      throw new Error("Security Violation: Ineligible educator accessed verification!");
    }

    // Eligible educator verification profile
    const identityProfile = await CertificateService.getIdentityForVerification(testTeacherUser.id);
    if (!identityProfile.isEligible || identityProfile.completedDaysCount !== 15) {
      throw new Error("Eligible educator verification profile returned incorrect eligibility.");
    }
    console.log(`   ✓ Eligible identity loaded for "${identityProfile.fullName}" (${identityProfile.email}).`);

    // 8. Certificate Generation, Vector PDF & Audit Logging
    console.log("\n8. Minting Official Certificate & Generating Vector PDF...");
    const legalName = "Dr. Rajesh K. Sharma, Ph.D.";
    const deliveryEmail = testTeacherUser.email;

    // Test Anti-Spoofing: different email should be rejected
    let spoofErrorCaught = false;
    try {
      await CertificateService.issueCertificate({
        userId: testTeacherUser.id,
        confirmedName: legalName,
        confirmedEmail: "spoofed.hacker@example.com",
      });
    } catch (err: any) {
      spoofErrorCaught = true;
      console.log(`   ✓ Anti-spoofing guard rejected mismatched email: "${err.message}"`);
    }
    if (!spoofErrorCaught) {
      throw new Error("Security Violation: Certificate issued to spoofed email!");
    }

    const issuance = await CertificateService.issueCertificate({
      userId: testTeacherUser.id,
      confirmedName: legalName,
      confirmedEmail: deliveryEmail,
      ipAddress: "127.0.0.1",
    });

    if (!issuance.certificateNumber.startsWith("EDU-CERT-2026-")) {
      throw new Error(`Invalid certificate number generated: ${issuance.certificateNumber}`);
    }
    console.log(`   ✓ Certificate generated: ${issuance.certificateNumber}`);

    // Verify PDF Buffer Integrity
    const certRecord = await prisma.certificate.findUnique({
      where: { certificateNumber: issuance.certificateNumber },
    });
    if (!certRecord) {
      throw new Error("Certificate record not found in database.");
    }

    const pdfBuffer = await CertificateService.getCertificatePdfBuffer(certRecord.id);
    const pdfHeader = pdfBuffer.subarray(0, 5).toString("utf-8");
    if (pdfHeader !== "%PDF-") {
      throw new Error(`Invalid PDF header generated: ${pdfHeader}`);
    }
    console.log(`   ✓ Vector PDF generated successfully (${pdfBuffer.length} bytes, validated %PDF- header).`);

    // 9. Duplicate Protection Guard
    console.log("\n9. Testing Duplicate Certificate Prevention...");
    const duplicateAttempt = await CertificateService.issueCertificate({
      userId: testTeacherUser.id,
      confirmedName: legalName,
      confirmedEmail: deliveryEmail,
    });
    if (duplicateAttempt.certificateNumber !== issuance.certificateNumber) {
      throw new Error("Duplicate prevention failed: a new certificate number was issued!");
    }
    console.log("   ✓ Duplicate prevention verified: existing certificate safely returned.");

    // 10. Public Verification Ledger & Data Privacy
    console.log("\n10. Testing Public Verification Ledger API & Data Privacy...");
    const publicVerification = await CertificateService.verifyCertificatePublic(issuance.certificateNumber);
    if (!publicVerification || !publicVerification.valid) {
      throw new Error("Public verification returned invalid for newly issued certificate.");
    }
    if (publicVerification.educatorName !== legalName) {
      throw new Error(`Public verification returned incorrect name: ${publicVerification.educatorName}`);
    }
    if ((publicVerification as any).educatorEmail || (publicVerification as any).phone) {
      throw new Error("Privacy Violation: Sensitive contact details exposed on public ledger!");
    }
    if (!publicVerification.issuerOrganization.includes("Shrivastava ProFunnels")) {
      throw new Error("Legal issuer entity missing from public verification.");
    }
    console.log("   ✓ Public verification ledger validated with complete privacy compliance.");

    // Non-existent certificate lookup
    const fakeLookup = await CertificateService.verifyCertificatePublic("EDU-CERT-NONEXISTENT");
    if (fakeLookup !== null) {
      throw new Error("Fake certificate ID lookup should return null.");
    }
    console.log("   ✓ Non-existent certificate correctly returns null.");

    // 11. Admin Revocation & Audit Trail
    console.log("\n11. Testing Admin Revocation & Audit Logging...");
    const revokeReason = "Academic integrity review - simulated test revocation";
    await CertificateService.revokeCertificate(
      certRecord.id,
      testAdminUser.id,
      revokeReason
    );

    const revokedVerification = await CertificateService.verifyCertificatePublic(issuance.certificateNumber);
    if (revokedVerification?.valid !== false || revokedVerification.status !== "REVOKED") {
      throw new Error("Certificate should be marked invalid and REVOKED on public ledger.");
    }
    if (revokedVerification.revocationReason !== revokeReason) {
      throw new Error("Revocation reason not published to public ledger.");
    }
    console.log(`   ✓ Revocation successfully registered on public ledger: "${revokedVerification.revocationReason}"`);

    // Check Audit Logs
    const auditLogs = await prisma.certificateAuditLog.findMany({
      where: { certificateId: certRecord.id },
      orderBy: { createdAt: "asc" },
    });
    if (auditLogs.length < 2) {
      throw new Error(`Expected at least 2 audit log entries (GENERATED, REVOKED), found ${auditLogs.length}`);
    }
    console.log(`   ✓ Audit log trail verified: ${auditLogs.map((l) => l.action).join(" -> ")}`);

    // 12. Admin Re-instatement / Regeneration
    console.log("\n12. Testing Admin Re-instatement...");
    await CertificateService.regenerateCertificate(certRecord.id, testAdminUser.id);
    const restoredVerification = await CertificateService.verifyCertificatePublic(issuance.certificateNumber);
    if (!restoredVerification?.valid || restoredVerification.status !== "ISSUED") {
      throw new Error("Certificate regeneration failed to restore VALID status.");
    }
    console.log("   ✓ Certificate successfully reinstated to active status.");

    console.log("\n=======================================================");
    console.log("🎉 ALL 12 INTEGRATION TESTS PASSED SUCCESSFULLY!");
    console.log("=======================================================\n");
  } finally {
    // Clean up created test data
    console.log("Cleaning up test artifacts...");
    try {
      if (testTeacherUser?.id) {
        await prisma.certificateAuditLog.deleteMany({
          where: { certificate: { userId: testTeacherUser.id } },
        });
        await prisma.certificate.deleteMany({
          where: { userId: testTeacherUser.id },
        });
        await prisma.trainingQuizAttempt.deleteMany({
          where: { enrollment: { userId: testTeacherUser.id } },
        });
        await prisma.trainingDayProgress.deleteMany({
          where: { enrollment: { userId: testTeacherUser.id } },
        });
        await prisma.trainingEnrollment.deleteMany({
          where: { userId: testTeacherUser.id },
        });
        await prisma.user.delete({ where: { id: testTeacherUser.id } });
      }
      if (testIneligibleTeacher?.id) {
        await prisma.user.delete({ where: { id: testIneligibleTeacher.id } });
      }
      if (testAdminUser?.id) {
        await prisma.certificateAuditLog.deleteMany({
          where: { performedById: testAdminUser.id },
        });
        await prisma.user.delete({ where: { id: testAdminUser.id } });
      }
      console.log("Clean up completed.");
    } catch (e: any) {
      console.warn("Cleanup warning:", e.message);
    }
  }
}

runEducatorTrainingCertificationSuite().catch((err) => {
  console.error("\n❌ TEST SUITE FAILED WITH ERROR:", err);
  process.exit(1);
});
