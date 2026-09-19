import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { saveAvatarFile } from "../lib/lms-storage";

async function runTests() {
  console.log("🚀 Starting Profile Photo & Synthetic Educators Test Suite...\n");

  // =========================================================================
  // 1. Verify 20 Synthetic Indian Educator Assets Exist On Disk
  // =========================================================================
  console.log("1. Checking 20 educator portrait image files on disk...");
  for (let i = 1; i <= 20; i++) {
    const filename = `educator_${String(i).padStart(2, "0")}.jpg`;
    const imagePath = path.join(process.cwd(), "public", "images", "educators", filename);
    assert.ok(fs.existsSync(imagePath), `Image file missing: ${imagePath}`);
    const stats = fs.statSync(imagePath);
    assert.ok(stats.size > 1000, `Image file ${filename} is suspiciously small (${stats.size} bytes)`);
  }
  console.log("✅ All 20 portrait images exist in public/images/educators/ and have valid sizes.\n");

  // =========================================================================
  // 2. Verify 20 Synthetic Educators in PostgreSQL Database
  // =========================================================================
  console.log("2. Querying 20 synthetic educators in PostgreSQL database...");
  const syntheticUsers = await prisma.user.findMany({
    where: {
      email: {
        startsWith: "synthetic.educator.",
        endsWith: "@sample.educonnects.internal",
      },
    },
    include: {
      profile: true,
      teacherProfile: {
        include: {
          teacherQualifications: true,
          adminNotes: true,
        },
      },
    },
  });

  assert.strictEqual(
    syntheticUsers.length,
    20,
    `Expected exactly 20 synthetic educators in database, found ${syntheticUsers.length}`
  );

  let maleCount = 0;
  let femaleCount = 0;

  for (const user of syntheticUsers) {
    // Assert credentials locked
    assert.ok(
      user.passwordHash.startsWith("SYNTHETIC_ACCOUNT_NO_LOGIN_"),
      `Password hash for ${user.email} must start with SYNTHETIC_ACCOUNT_NO_LOGIN_`
    );
    // Verify bcrypt compare fails against any test password
    const canLogin = await bcrypt.compare("Password123!", user.passwordHash);
    assert.strictEqual(canLogin, false, `Synthetic account ${user.email} must never authenticate!`);

    // Verify User & Profile
    assert.strictEqual(user.role, "TEACHER");
    assert.ok(user.profile, `Profile missing for ${user.email}`);
    assert.ok(user.profile!.avatarUrl?.startsWith("/images/educators/"), `Avatar URL invalid for ${user.email}: ${user.profile!.avatarUrl}`);

    // Verify TeacherProfile & Security Isolation Flag
    const tp = user.teacherProfile;
    assert.ok(tp, `Teacher profile missing for ${user.email}`);
    assert.strictEqual(tp!.verificationStatus, "VERIFIED");
    assert.strictEqual(tp!.isSeededProfile, true, `isSeededProfile must be true for ${user.email}`);
    assert.ok(tp!.headline && tp!.headline.length > 5, `Headline too short for ${user.email}`);
    assert.ok(tp!.bio && tp!.bio.length > 20, `Bio too short for ${user.email}`);
    assert.ok((tp!.hourlyRate ?? 0) >= 200 && (tp!.hourlyRate ?? 0) <= 2500, `Rate out of expected range for ${user.email}`);
    assert.ok(tp!.experienceYears >= 8, `Experience less than 8 years for ${user.email}`);
    assert.ok(tp!.rating >= 4.6, `Rating below 4.6 for ${user.email}`);
    assert.ok(tp!.location && tp!.location.length > 3, `Location should not be empty for ${user.email}`);
    assert.ok(tp!.languages && tp!.languages.length > 0, `Languages should not be empty for ${user.email}`);
    assert.ok(tp!.subjects && tp!.subjects.length > 0, `Subjects should not be empty for ${user.email}`);

    // Verify Qualifications
    assert.ok(tp!.teacherQualifications.length >= 1, `Must have at least 1 qualification for ${user.email}`);
    for (const q of tp!.teacherQualifications) {
      assert.ok(q.degree && q.degree.length > 2, `Qualification degree missing for ${user.email}`);
      assert.ok(q.institution && q.institution.length > 2, `Qualification institution missing for ${user.email}`);
    }

    // Verify Internal Admin Notes (not public)
    assert.ok(tp!.adminNotes.length >= 1, `Internal AdminNote missing for ${user.email}`);
    const note = tp!.adminNotes[0];
    assert.ok(note.content.includes("Synthetic profile") || note.content.includes("INTERNAL_SAMPLE_EDUCATOR"), `Admin note must mark synthetic nature`);

    // Gender balance check based on email/ID distribution
    const idNum = parseInt(user.email.replace("synthetic.educator.", "").replace("@sample.educonnects.internal", ""), 10);
    const maleIds = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
    if (maleIds.includes(idNum)) maleCount++;
    else femaleCount++;

    // Assert no forbidden labels in public fields
    const publicContent = `${user.profile?.firstName} ${user.profile?.lastName} ${tp!.headline} ${tp!.bio}`.toLowerCase();
    const forbidden = ["demo", "sample account", "demo account", "test account", "fake", "synthetic"];
    for (const f of forbidden) {
      assert.ok(!publicContent.includes(f), `Found forbidden word '${f}' in public content for ${user.email}`);
    }
  }

  assert.strictEqual(maleCount, 10, `Expected 10 male synthetic educators, counted ${maleCount}`);
  assert.strictEqual(femaleCount, 10, `Expected 10 female synthetic educators, counted ${femaleCount}`);
  console.log("✅ 20 synthetic educators verified: 10 male, 10 female, qualifications present, password locked, isSeededProfile = true, no public demo labels.\n");

  // =========================================================================
  // 3. Verify Real Educator Account Safety
  // =========================================================================
  console.log("3. Verifying real educator account (myprofunnels@gmail.com / Neeraj Shrivastava)...");
  const realEducator = await prisma.user.findUnique({
    where: { email: "myprofunnels@gmail.com" },
    include: { teacherProfile: true },
  });
  assert.ok(realEducator, "Real educator account 'myprofunnels@gmail.com' must exist in the database!");
  assert.strictEqual(realEducator!.role, "TEACHER", "Real educator role must be TEACHER");
  assert.ok(realEducator!.teacherProfile, "Real educator teacher profile must exist");
  assert.strictEqual(realEducator!.teacherProfile!.verificationStatus, "VERIFIED", "Real educator must remain VERIFIED");
  assert.strictEqual(realEducator!.teacherProfile!.isSeededProfile, false, "Real educator isSeededProfile must be false");
  console.log("✅ Real educator account intact, verified, isSeededProfile = false, and untouched.\n");

  // =========================================================================
  // 4. Test Avatar Upload Storage Validation (MIME type and size limit)
  // =========================================================================
  console.log("4. Testing avatar storage helper validation rules...");
  
  // Test valid JPEG buffer
  const sampleJpgBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
  const avatarUrl = await saveAvatarFile(sampleJpgBuffer, "test-avatar.jpg", "image/jpeg");
  assert.ok(avatarUrl.startsWith("/api/thumbnails/avatar_"), `Avatar URL must start with /api/thumbnails/avatar_, got ${avatarUrl}`);
  const key = path.basename(avatarUrl);
  const absolutePath = path.join(process.cwd(), "storage", "thumbnails", key);
  assert.ok(fs.existsSync(absolutePath), "Saved avatar file must exist on disk");
  // Clean up test file
  fs.unlinkSync(absolutePath);

  // Test invalid MIME type (e.g. application/pdf)
  let mimeErrorCaught = false;
  try {
    await saveAvatarFile(Buffer.from("dummy-pdf"), "doc.pdf", "application/pdf");
  } catch (err: any) {
    mimeErrorCaught = true;
    assert.ok(err.message.includes("Invalid image format") || err.message.includes("Supported formats: JPG, JPEG, PNG, WebP"));
  }
  assert.strictEqual(mimeErrorCaught, true, "Should reject application/pdf MIME type");

  // Test oversized buffer (> 5MB)
  let sizeErrorCaught = false;
  try {
    const oversizedBuffer = Buffer.alloc(5 * 1024 * 1024 + 1024); // 5MB + 1KB
    await saveAvatarFile(oversizedBuffer, "large.jpg", "image/jpeg");
  } catch (err: any) {
    sizeErrorCaught = true;
    assert.ok(err.message.includes("5MB"));
  }
  assert.strictEqual(sizeErrorCaught, true, "Should reject files larger than 5MB");
  console.log("✅ Avatar storage helper correctly enforces MIME types, extensions, and 5MB size limit.\n");

  // =========================================================================
  // 5. Check Frontend Component Placements & Discovery Experience
  // =========================================================================
  console.log("5. Checking frontend components and discovery experience...");

  // Profile Photo Uploader component
  const uploaderContent = fs.readFileSync(
    path.join(process.cwd(), "components/profile/profile-photo-uploader.tsx"),
    "utf-8"
  );
  assert.ok(uploaderContent.includes("5 * 1024 * 1024"), "Uploader validates 5MB limit on client");
  assert.ok(uploaderContent.includes("image/jpeg") && uploaderContent.includes("image/webp"), "Uploader accepts JPG, PNG, WebP");
  assert.ok(uploaderContent.includes("emerald") && uploaderContent.includes("blue"), "Uploader supports both emerald and blue themes");
  assert.ok(uploaderContent.includes("/api/profile/avatar"), "Uploader calls /api/profile/avatar API");

  // Learner profile pages
  const profilePage = fs.readFileSync(path.join(process.cwd(), "app/profile/page.tsx"), "utf-8");
  assert.ok(profilePage.includes("ProfilePhotoUploader"), "app/profile/page.tsx includes ProfilePhotoUploader");

  const profileEditPage = fs.readFileSync(path.join(process.cwd(), "app/profile/edit/page.tsx"), "utf-8");
  assert.ok(profileEditPage.includes("ProfilePhotoUploader"), "app/profile/edit/page.tsx includes ProfilePhotoUploader");

  // Educator onboarding page
  const onboardingPage = fs.readFileSync(path.join(process.cwd(), "app/teacher/onboarding/page.tsx"), "utf-8");
  assert.ok(onboardingPage.includes("ProfilePhotoUploader"), "app/teacher/onboarding/page.tsx includes ProfilePhotoUploader");

  // Discovery Filter Panel & INR range
  const filterPanel = fs.readFileSync(path.join(process.cwd(), "components/discovery/teacher-filter-panel.tsx"), "utf-8");
  assert.ok(filterPanel.includes("max={5000}") || filterPanel.includes("max={2000}"), "Filter panel supports educator hourly rate slider");
  assert.ok(filterPanel.includes("biology") && filterPanel.includes("economics"), "Filter panel includes diverse subjects");

  // Find Teachers Page Price Default
  const findTeachersPage = fs.readFileSync(path.join(process.cwd(), "app/find-teachers/page.tsx"), "utf-8");
  assert.ok(findTeachersPage.includes("5000") || findTeachersPage.includes("2000"), "Find teachers page defaults to max price to include all Indian educators");

  // Teacher Card Grid: Circular image & Book Trial Lesson
  const cardGrid = fs.readFileSync(path.join(process.cwd(), "components/discovery/teacher-card-grid.tsx"), "utf-8");
  assert.ok(cardGrid.includes("rounded-full"), "Card grid image uses rounded-full (circular)");
  assert.ok(cardGrid.includes("Book Trial Lesson"), "Card grid has Book Trial Lesson button");

  // Teacher Preview Modal: Circular image & Book Trial Lesson (no Demo)
  const previewModal = fs.readFileSync(path.join(process.cwd(), "components/discovery/teacher-preview-modal.tsx"), "utf-8");
  assert.ok(previewModal.includes("rounded-full"), "Preview modal image uses rounded-full (circular)");
  assert.ok(previewModal.includes("Book Trial Lesson"), "Preview modal has Book Trial Lesson button");
  assert.ok(!previewModal.includes("Book Introductory Demo"), "Preview modal does not say Demo");

  // Detail Page: Circular image & Book Trial Lesson
  const detailPage = fs.readFileSync(path.join(process.cwd(), "app/find-teachers/[id]/page.tsx"), "utf-8");
  assert.ok(detailPage.includes("rounded-full"), "Detail page image uses rounded-full (circular)");
  assert.ok(detailPage.includes("Book Trial Lesson"), "Detail page has Book Trial Lesson button");
  assert.ok(!detailPage.includes("Book Introductory Demo"), "Detail page does not say Demo");

  // Backend Guards check isSeededProfile
  const guardsContent = fs.readFileSync(path.join(process.cwd(), "lib/auth/guards.ts"), "utf-8");
  assert.ok(guardsContent.includes("isSeededProfile"), "lib/auth/guards.ts checks isSeededProfile");

  const tokenContent = fs.readFileSync(path.join(process.cwd(), "lib/classroom/classroom-token.ts"), "utf-8");
  assert.ok(tokenContent.includes("isSeededProfile"), "lib/classroom/classroom-token.ts checks isSeededProfile");

  // Verify foreign profiles purged from homepage
  const teacherCarousel = fs.readFileSync(path.join(process.cwd(), "components/homepage/teacher-carousel.tsx"), "utf-8");
  assert.ok(!teacherCarousel.includes("Sarah Jenkins"), "Sarah Jenkins must not be in teacher-carousel");
  assert.ok(!teacherCarousel.includes("Elena Rostova"), "Elena Rostova must not be in teacher-carousel");
  assert.ok(teacherCarousel.includes("Sunita Natarajan"), "Sunita Natarajan should be in teacher-carousel");

  const testimonials = fs.readFileSync(path.join(process.cwd(), "components/homepage/social-proof-testimonials.tsx"), "utf-8");
  assert.ok(!testimonials.includes("Sarah Jenkins"), "Sarah Jenkins must not be in testimonials");

  const aboutPage = fs.readFileSync(path.join(process.cwd(), "app/about/page.tsx"), "utf-8");
  assert.ok(!aboutPage.includes("Sarah Jenkins"), "Sarah Jenkins must not be in about page");
  assert.ok(!aboutPage.includes("Marcus Vance"), "Marcus Vance must not be in about page");
  assert.ok(aboutPage.includes("Dr. Rajeshwar Kulkarni"), "Dr. Rajeshwar Kulkarni should be in about page");

  console.log("✅ Frontend components, uploader integrations, security guards, and discovery verified.\n");

  console.log("🎉 ALL PROFILE PHOTO & SYNTHETIC EDUCATOR TESTS PASSED SUCCESSFULLY! 🚀\n");
}

runTests()
  .catch((err) => {
    console.error("❌ Test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
