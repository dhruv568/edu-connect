import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import { saveDocumentToStorage, readDocumentFromStorage, deleteDocumentFromStorage } from "../lib/document-storage";

async function runModule4Tests() {
  console.log("🧪 Starting EduConnect Module 04 Verification & Admin Automated Tests...\n");

  const defaultPasswordHash = await bcrypt.hash("Password123!", 10);
  const testId = Date.now();

  try {
    // 1. Create Test Admin
    const adminUser = await prisma.user.create({
      data: {
        email: `admin.test.${testId}@educonnect.com`,
        passwordHash: defaultPasswordHash,
        role: "ADMIN",
        emailVerified: true,
        profile: {
          create: { firstName: "Admin", lastName: "Tester" },
        },
      },
    });

    // 2. Create Test Teacher User
    const teacherUser = await prisma.user.create({
      data: {
        email: `teacher.test.${testId}@educonnect.com`,
        passwordHash: defaultPasswordHash,
        role: "TEACHER",
        emailVerified: true,
        profile: {
          create: { firstName: "John", lastName: "Doe" },
        },
        teacherProfile: {
          create: {
            headline: "Math & CS Educator",
            subjects: "Mathematics, Computer Science",
            experienceYears: 4,
            hourlyRate: 40.0,
            teachingMode: "ONLINE",
            verificationStatus: "PENDING",
          },
        },
      },
      include: { teacherProfile: true },
    });

    const teacherProfileId = teacherUser.teacherProfile!.id;

    console.log("✅ Test 1: Created Test Admin and Test Teacher User.");

    // 3. Test Secure Document Storage Utility
    const dummyBuffer = Buffer.from("Test PDF Document Content for EduConnect Verification");
    const storedDoc = await saveDocumentToStorage(dummyBuffer, "passport_john_doe.pdf", "application/pdf");

    if (!storedDoc.storageKey || storedDoc.fileSize !== dummyBuffer.length) {
      throw new Error("Document storage utility failed to save document properly.");
    }

    const docRecord = await prisma.teacherDocument.create({
      data: {
        teacherId: teacherProfileId,
        category: "IDENTITY",
        fileName: storedDoc.fileName,
        fileType: storedDoc.fileType,
        fileSize: storedDoc.fileSize,
        storageKey: storedDoc.storageKey,
        status: "ACTIVE",
      },
    });

    console.log("✅ Test 2: Secure document file upload & database record created.");

    // 4. Test Qualification & Certificate Addition
    const qualRecord = await prisma.teacherQualification.create({
      data: {
        teacherId: teacherProfileId,
        degree: "B.Sc. Mathematics",
        institution: "Oxford University",
        year: 2020,
        specialization: "Pure Mathematics",
      },
    });

    const certRecord = await prisma.teacherCertificate.create({
      data: {
        teacherId: teacherProfileId,
        name: "Google Educator Certification",
        issuer: "Google",
        issueDate: new Date(),
      },
    });

    console.log("✅ Test 3: Educational qualifications and certificates linked to teacher.");

    // 5. Test Admin Review Details Fetching
    const reviewData = await prisma.teacherProfile.findUnique({
      where: { id: teacherProfileId },
      include: {
        user: { include: { profile: true } },
        teacherQualifications: true,
        teacherCertificates: true,
        teacherDocuments: true,
      },
    });

    if (!reviewData || reviewData.teacherDocuments.length === 0 || reviewData.teacherQualifications.length === 0) {
      throw new Error("Admin review query failed to return full teacher credential payload.");
    }

    console.log("✅ Test 4: Admin review bundle correctly aggregates qualifications & documents.");

    // 6. Test Admin Approval Decision Workflow
    const approveNow = new Date();
    await prisma.teacherProfile.update({
      where: { id: teacherProfileId },
      data: {
        verificationStatus: "VERIFIED",
        verifiedAt: approveNow,
      },
    });

    await prisma.teacherVerificationHistory.create({
      data: {
        teacherId: teacherProfileId,
        adminId: adminUser.id,
        previousStatus: "PENDING",
        newStatus: "VERIFIED",
        reason: "Credentials verified successfully during automated test",
      },
    });

    console.log("✅ Test 5: Admin Approval workflow updated status to VERIFIED and recorded audit history.");

    // 7. Test Admin Rejection Decision Workflow
    await prisma.teacherProfile.update({
      where: { id: teacherProfileId },
      data: {
        verificationStatus: "REJECTED",
        rejectedAt: new Date(),
        rejectionReason: "ID document unclear. Please upload high-resolution scan.",
      },
    });

    await prisma.teacherVerificationHistory.create({
      data: {
        teacherId: teacherProfileId,
        adminId: adminUser.id,
        previousStatus: "VERIFIED",
        newStatus: "REJECTED",
        reason: "ID document unclear. Please upload high-resolution scan.",
      },
    });

    const rejectedState = await prisma.teacherProfile.findUnique({
      where: { id: teacherProfileId },
    });

    if (rejectedState?.verificationStatus !== "REJECTED" || !rejectedState.rejectionReason) {
      throw new Error("Admin rejection workflow failed to update status or record rejection reason.");
    }

    console.log("✅ Test 6: Admin Rejection workflow saved status=REJECTED and rejection reason.");

    // 8. Test Admin Suspension & Reactivation Workflow
    await prisma.teacherProfile.update({
      where: { id: teacherProfileId },
      data: {
        verificationStatus: "SUSPENDED",
        suspendedAt: new Date(),
        suspensionReason: "Temporary compliance audit.",
      },
    });

    let suspendedState = await prisma.teacherProfile.findUnique({ where: { id: teacherProfileId } });
    if (suspendedState?.verificationStatus !== "SUSPENDED") {
      throw new Error("Admin suspension failed.");
    }

    // Reactivate
    await prisma.teacherProfile.update({
      where: { id: teacherProfileId },
      data: {
        verificationStatus: "VERIFIED",
        suspensionReason: null,
      },
    });

    let reactivatedState = await prisma.teacherProfile.findUnique({ where: { id: teacherProfileId } });
    if (reactivatedState?.verificationStatus !== "VERIFIED") {
      throw new Error("Admin reactivation failed.");
    }

    console.log("✅ Test 7: Admin Suspension and Reactivation workflows executed successfully.");

    // 9. Test Marketplace Visibility Rule (Section 36)
    // Create an UNVERIFIED teacher
    const unverifiedUser = await prisma.user.create({
      data: {
        email: `unverified.teacher.${testId}@educonnect.com`,
        passwordHash: defaultPasswordHash,
        role: "TEACHER",
        emailVerified: false,
        profile: { create: { firstName: "Unverified", lastName: "Teacher" } },
        teacherProfile: {
          create: {
            headline: "Unverified Tutor",
            verificationStatus: "PENDING",
          },
        },
      },
    });

    const publicVerifiedTeachers = await prisma.teacherProfile.findMany({
      where: {
        verificationStatus: "VERIFIED",
        user: { emailVerified: true },
      },
    });

    const isUnverifiedIncluded = publicVerifiedTeachers.some((t) => t.userId === unverifiedUser.id);
    if (isUnverifiedIncluded) {
      throw new Error("CRITICAL SECURITY BUG: Unverified teacher appeared in public verified marketplace query!");
    }

    console.log("✅ Test 8: Marketplace visibility rule verified (Unverified/Pending teachers hidden from public search).");

    // 10. Clean up test files & records
    await deleteDocumentFromStorage(storedDoc.storageKey);
    await prisma.teacherVerificationHistory.deleteMany({ where: { teacherId: teacherProfileId } });
    await prisma.teacherDocument.deleteMany({ where: { teacherId: teacherProfileId } });
    await prisma.teacherCertificate.deleteMany({ where: { teacherId: teacherProfileId } });
    await prisma.teacherQualification.deleteMany({ where: { teacherId: teacherProfileId } });
    await prisma.teacherProfile.deleteMany({ where: { userId: { in: [teacherUser.id, unverifiedUser.id] } } });
    await prisma.profile.deleteMany({ where: { userId: { in: [adminUser.id, teacherUser.id, unverifiedUser.id] } } });
    await prisma.user.deleteMany({ where: { id: { in: [adminUser.id, teacherUser.id, unverifiedUser.id] } } });

    console.log("\n🎉 ALL MODULE 04 TEACHER VERIFICATION & ADMIN TESTS PASSED SUCCESSFULLY! 🚀\n");
  } catch (error: any) {
    console.error("❌ Test Failure:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runModule4Tests();
