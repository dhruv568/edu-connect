import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting EduConnect Database Seeding for Module 04...");

  // Clean existing data
  await prisma.classroomFile.deleteMany();
  await prisma.classroomMessage.deleteMany();
  await prisma.classAttendance.deleteMany();
  await prisma.liveClassSession.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.liveClassSlot.deleteMany();
  await prisma.adminNote.deleteMany();
  await prisma.teacherVerificationHistory.deleteMany();
  await prisma.teacherDocument.deleteMany();
  await prisma.teacherCertificate.deleteMany();
  await prisma.teacherQualification.deleteMany();
  await prisma.course.deleteMany();
  await prisma.emailVerification.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.teacherProfile.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  const defaultPasswordHash = await bcrypt.hash("Password123!", 10);
  const now = new Date();

  // 1. Seed Admin User
  const admin = await prisma.user.create({
    data: {
      email: "admin@educonnect.com",
      passwordHash: defaultPasswordHash,
      role: "ADMIN",
      emailVerified: true,
      emailVerifiedAt: now,
      profile: {
        create: {
          firstName: "System",
          lastName: "Administrator",
          bio: "EduConnect Governance & Platform Administrator",
        },
      },
    },
  });
  console.log(`✅ Admin Created: ${admin.email}`);

  // 2. Seed Verified Teacher 1: Sarah Jenkins (Mathematics)
  const teacher1 = await prisma.user.create({
    data: {
      email: "teacher@educonnect.com",
      passwordHash: defaultPasswordHash,
      role: "TEACHER",
      emailVerified: true,
      emailVerifiedAt: now,
      profile: {
        create: {
          firstName: "Sarah",
          lastName: "Jenkins",
          bio: "Experienced Mathematics & Physics Educator with 8+ years teaching experience.",
          avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
          phone: "+1 (555) 019-2834",
        },
      },
      teacherProfile: {
        create: {
          headline: "Senior STEM Educator & Olympiad Coach",
          subjects: "Mathematics, Physics, Calculus",
          experienceYears: 8,
          hourlyRate: 45.0,
          languages: "English, Spanish",
          teachingMode: "BOTH",
          verificationStatus: "VERIFIED",
          verifiedAt: now,
          rating: 4.95,
          teacherQualifications: {
            create: [
              {
                degree: "M.Sc. Mathematics",
                institution: "MIT - Massachusetts Institute of Technology",
                year: 2018,
                specialization: "Applied Calculus & Mechanics",
              },
            ],
          },
          teacherCertificates: {
            create: [
              {
                name: "Certified STEM Lead Tutor",
                issuer: "National Science Foundation",
                issueDate: new Date("2020-05-15"),
              },
            ],
          },
          teacherDocuments: {
            create: [
              {
                category: "IDENTITY",
                fileName: "sarah_jenkins_passport.pdf",
                fileType: "application/pdf",
                fileSize: 450000,
                storageKey: "seed_sarah_passport.pdf",
              },
            ],
          },
        },
      },
    },
    include: { teacherProfile: true },
  });
  console.log(`✅ Verified Teacher Created: ${teacher1.email}`);

  // 3. Seed Pending Teacher Applicant: Marcus Vance
  const pendingTeacher = await prisma.user.create({
    data: {
      email: "pending.teacher@educonnect.com",
      passwordHash: defaultPasswordHash,
      role: "TEACHER",
      emailVerified: true,
      emailVerifiedAt: now,
      profile: {
        create: {
          firstName: "Marcus",
          lastName: "Vance",
          bio: "Passionate Computer Science instructor specializing in Python, Algorithms, and Web Development.",
          avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          phone: "+1 (555) 482-9102",
        },
      },
      teacherProfile: {
        create: {
          headline: "Computer Science Lecturer & Coding Mentor",
          subjects: "Computer Science, Programming, Python",
          experienceYears: 5,
          hourlyRate: 50.0,
          languages: "English",
          teachingMode: "ONLINE",
          verificationStatus: "PENDING",
          submittedAt: now,
          teacherQualifications: {
            create: [
              {
                degree: "B.S. Computer Science",
                institution: "University of California, Berkeley",
                year: 2021,
                specialization: "Software Systems",
              },
            ],
          },
          teacherCertificates: {
            create: [
              {
                name: "AWS Certified Solutions Architect",
                issuer: "Amazon Web Services",
                issueDate: new Date("2023-01-10"),
              },
            ],
          },
          teacherDocuments: {
            create: [
              {
                category: "IDENTITY",
                fileName: "marcus_vance_driver_license.png",
                fileType: "image/png",
                fileSize: 320000,
                storageKey: "seed_marcus_identity.png",
              },
              {
                category: "QUALIFICATION",
                fileName: "berkeley_degree_certificate.pdf",
                fileType: "application/pdf",
                fileSize: 890000,
                storageKey: "seed_marcus_degree.pdf",
              },
            ],
          },
        },
      },
    },
  });
  console.log(`✅ Pending Teacher Created: ${pendingTeacher.email}`);

  // 4. Seed Rejected Teacher: Priya Patel
  const rejectedTeacher = await prisma.user.create({
    data: {
      email: "rejected.teacher@educonnect.com",
      passwordHash: defaultPasswordHash,
      role: "TEACHER",
      emailVerified: true,
      emailVerifiedAt: now,
      profile: {
        create: {
          firstName: "Priya",
          lastName: "Patel",
          bio: "Biology educator looking to mentor high school AP students.",
        },
      },
      teacherProfile: {
        create: {
          headline: "AP Biology & Life Sciences Tutor",
          subjects: "Biology, Chemistry",
          experienceYears: 4,
          hourlyRate: 35.0,
          verificationStatus: "REJECTED",
          submittedAt: new Date(Date.now() - 86400000 * 3),
          rejectedAt: new Date(Date.now() - 86400000),
          rejectionReason: "Uploaded identity document image is blurred and illegible. Please re-upload a clear copy of your National ID or Passport.",
        },
      },
    },
  });
  console.log(`✅ Rejected Teacher Created: ${rejectedTeacher.email}`);

  // 5. Seed Suspended Teacher: Alan Turing
  const suspendedTeacher = await prisma.user.create({
    data: {
      email: "suspended.teacher@educonnect.com",
      passwordHash: defaultPasswordHash,
      role: "TEACHER",
      emailVerified: true,
      emailVerifiedAt: now,
      profile: {
        create: {
          firstName: "Alan",
          lastName: "Turing",
          bio: "Discrete Mathematics Specialist.",
        },
      },
      teacherProfile: {
        create: {
          headline: "Discrete Mathematics & Cryptography Tutor",
          subjects: "Mathematics",
          experienceYears: 10,
          hourlyRate: 60.0,
          verificationStatus: "SUSPENDED",
          submittedAt: new Date(Date.now() - 86400000 * 10),
          verifiedAt: new Date(Date.now() - 86400000 * 8),
          suspendedAt: new Date(Date.now() - 86400000 * 2),
          suspensionReason: "Platform compliance review regarding repeated slot cancellations.",
        },
      },
    },
  });
  console.log(`✅ Suspended Teacher Created: ${suspendedTeacher.email}`);

  // 6. Seed Student User
  const student = await prisma.user.create({
    data: {
      email: "student@educonnect.com",
      passwordHash: defaultPasswordHash,
      role: "STUDENT",
      emailVerified: true,
      emailVerifiedAt: now,
      profile: {
        create: {
          firstName: "Alex",
          lastName: "Morgan",
          bio: "High school sophomore eager to learn Advanced Algebra & Science.",
        },
      },
      studentProfile: {
        create: {
          gradeLevel: "Grade 10",
          interests: "Mathematics, Computer Science, Chemistry",
        },
      },
    },
  });
  console.log(`✅ Student Created: ${student.email}`);

  // 7. Seed Course for Verified Teacher
  if (teacher1.teacherProfile) {
    await prisma.course.create({
      data: {
        title: "Advanced Calculus & Analytical Geometry",
        slug: "advanced-calculus-mastery",
        description: "Master differential equations, integrals, and vector analysis.",
        subject: "Mathematics",
        gradeLevel: "Grade 11 - College Prep",
        price: 89.99,
        rating: 4.95,
        reviewCount: 42,
        lessonCount: 24,
        durationHours: 18.5,
        thumbnailUrl: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&auto=format&fit=crop&q=80",
        teacherId: teacher1.teacherProfile.id,
      },
    });

    // 8. Seed Live Class Slot & Session for Module 06 Testing
    const startTime = new Date(Date.now() - 5 * 60 * 1000); // Started 5 mins ago
    const endTime = new Date(Date.now() + 55 * 60 * 1000); // Ends in 55 mins

    const liveSlot = await prisma.liveClassSlot.create({
      data: {
        teacherId: teacher1.teacherProfile.id,
        title: "Mathematics — Algebra Basics",
        description: "Interactive live session covering quadratic equations, functions, and graphical analysis.",
        subject: "Mathematics",
        startTime,
        endTime,
        maxCapacity: 15,
        price: 25.0,
        status: "SCHEDULED",
      },
    });

    // Create booking for student
    const booking = await prisma.booking.create({
      data: {
        liveClassSlotId: liveSlot.id,
        studentId: student.id,
        status: "CONFIRMED",
      },
    });
    console.log(`✅ Student Booking Created: ${booking.id} for slot ${liveSlot.title}`);

    // Create session
    const session = await prisma.liveClassSession.create({
      data: {
        id: "demo-math-session-001",
        liveClassSlotId: liveSlot.id,
        teacherId: teacher1.teacherProfile.id,
        roomId: "room-math-algebra-101",
        status: "OPEN",
        scheduledStartAt: startTime,
        scheduledEndAt: endTime,
        actualStartAt: startTime,
      },
    });
    console.log(`✅ Live Class Session Created: ${session.id} (Room: ${session.roomId})`);
  }

  console.log("\n🎉 EduConnect Module 06 Database Seeding Completed Successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
