import { prisma } from '../lib/prisma';
import { LiveClassService } from '../services/live-class-service';
import { AnalyticsService } from '../services/analytics-service';
import { LmsService } from '../services/lms-service';

async function main() {
  console.log('?? Running Student Dashboard End-to-End Verification Test...');
  const userCount = await prisma.user.count();
  console.log('? Connected to database. Total users in database:', userCount);

  let student = await prisma.user.findFirst({
    where: { role: 'STUDENT' },
    include: { profile: true }
  });

  if (!student) {
    console.log('Creating sample student for testing...');
    student = await prisma.user.create({
      data: {
        email: 'test.student.dash@educonnect.com',
        passwordHash: '',
        role: 'STUDENT',
        emailVerified: true,
        profile: {
          create: {
            firstName: 'Demo',
            lastName: 'Student'
          }
        },
        studentProfile: {
          create: {
            gradeLevel: 'Grade 11'
          }
        }
      },
      include: { profile: true }
    });
  }

  console.log('? Student verified:', student.id, student.email);

  // 1. Student Hub test
  const dashboardData = await AnalyticsService.getStudentDashboardData(student.id);
  console.log('? 1. Student Hub Dashboard API working! Return payload:', {
    userName: dashboardData.userName,
    userEmail: dashboardData.userEmail,
    enrolledCount: dashboardData.stats.enrolledCount,
    upcomingClassesCount: dashboardData.stats.upcomingClassesCount,
    courseHours: dashboardData.stats.courseHours,
    liveClassHours: dashboardData.stats.liveClassHours
  });

  // 2. Find Teachers discovery test
  const verifiedTeachers = await prisma.teacherProfile.findMany({
    where: { verificationStatus: 'VERIFIED' },
    include: { user: { include: { profile: true } }, courses: true, liveClassSlots: true }
  });
  console.log('? 2. Teacher discovery working! Found verified teachers:', verifiedTeachers.length);

  // 3. My Live Classes test
  const liveClassesData = await LiveClassService.getStudentLiveClasses(student.id);
  console.log('? 3. Student Live Classes API working! Stats:', liveClassesData.stats);

  // 4. Enrolled Courses test
  const courses = await LmsService.getStudentEnrolledCourses(student.id);
  console.log('✅ 4. Enrolled Courses LMS API working! Active/Completed enrollments:', courses.enrolledCourses.length);

  console.log('\n?? ALL 4 STUDENT DASHBOARD MODULES VERIFIED END-TO-END!');
}

main().catch(err => {
  console.error('? Test failed:', err);
  process.exit(1);
}).finally(() => process.exit(0));
