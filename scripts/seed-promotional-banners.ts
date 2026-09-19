import { prisma } from "../lib/prisma";

async function seedPromotionalBanners() {
  console.log("Seeding sample promotional banners...");

  const existingCount = await prisma.promotionalBanner.count();
  if (existingCount > 0) {
    console.log(`Found ${existingCount} existing promotional banners. Skipping initial seed.`);
    return;
  }

  await prisma.promotionalBanner.createMany({
    data: [
      {
        title: "Special Learning Offer: Unlock Your Academic Potential",
        subtitle: "FLAT 25% OFF SELECTED COURSES",
        description: "Supercharge your academic excellence with live WebRTC classrooms, personal mentors, and comprehensive self-paced LMS courses.",
        bannerType: "OFFER",
        imageUrl: "/images/educonnects-owner-banner.jpeg",
        imageClickUrl: "/courses",
        imageClickTarget: "_self",
        ctaText: "Explore Courses",
        ctaUrl: "/courses",
        placement: "ALL",
        displayOrder: 0,
        isActive: true,
      },
      {
        title: "Master Board & Competitive Exams with Top Verified Faculty",
        subtitle: "CBSE • ICSE • JEE • NEET",
        description: "Connect with verified educators, join interactive digital whiteboard sessions, and track your learning progress in real-time.",
        bannerType: "COURSE_PROMOTION",
        imageUrl: "/images/learner-hero.jpeg",
        imageClickUrl: "/find-teachers",
        imageClickTarget: "_self",
        ctaText: "Find a Mentor",
        ctaUrl: "/find-teachers",
        placement: "LEARNERS",
        displayOrder: 1,
        isActive: true,
      },
      {
        title: "Teach on EduConnects: Keep 85%+ Revenue Share",
        subtitle: "DIRECT CASHFREE BANK PAYOUTS",
        description: "Set your own schedule and hourly rates. Conduct live classes in the browser and publish recorded courses with zero setup cost.",
        bannerType: "PROMOTION",
        imageUrl: "/images/director.jpeg",
        imageClickUrl: "/teacher/register",
        imageClickTarget: "_self",
        ctaText: "Become an Educator",
        ctaUrl: "/teacher/register",
        placement: "EDUCATORS",
        displayOrder: 2,
        isActive: true,
      },
    ],
  });

  console.log("✅ Successfully seeded initial promotional banners!");
}

seedPromotionalBanners()
  .catch((err) => {
    console.error("Failed to seed promotional banners:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
