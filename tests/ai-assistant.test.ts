import assert from "node:assert";
import {
  checkRateLimit,
  validateAiMessage,
  MAX_MESSAGE_LENGTH,
} from "../lib/ai/rate-limiter";
import {
  isAiAssistantExcluded,
  getSectionTheme,
  QUICK_QUESTIONS,
  THEMES,
} from "../lib/ai/assistant-config";
import { processAiChat, AssistantRole } from "../services/ai-service";

async function runTests() {
  console.log("🚀 Starting EduConnects AI Assistant Test Suite...\n");

  // --- TEST 1: Message Validation ---
  console.log("TEST 1: Message Validation");
  {
    const emptyResult = validateAiMessage("");
    assert.strictEqual(emptyResult.valid, false, "Empty string should be invalid");

    const whitespaceResult = validateAiMessage("   \n  \t  ");
    assert.strictEqual(whitespaceResult.valid, false, "Whitespace-only should be invalid");

    const nonStringResult = validateAiMessage(12345 as any);
    assert.strictEqual(nonStringResult.valid, false, "Non-string should be invalid");

    const tooLongString = "a".repeat(MAX_MESSAGE_LENGTH + 1);
    const tooLongResult = validateAiMessage(tooLongString);
    assert.strictEqual(tooLongResult.valid, false, "Message > 1000 chars should be invalid");

    const validResult = validateAiMessage("How do live classes work?");
    assert.strictEqual(validResult.valid, true, "Normal message should be valid");
    assert.strictEqual(validResult.message, "How do live classes work?");
    console.log("  ✔ Message validation passed");
  }

  // --- TEST 2: Rate Limiting ---
  console.log("\nTEST 2: Rate Limiting");
  {
    const testKey = `test-ip-${Date.now()}`;
    // Limit is 15 requests per minute
    for (let i = 0; i < 15; i++) {
      const res = checkRateLimit(testKey, 15, 60000);
      assert.strictEqual(res.allowed, true, `Request ${i + 1} should be allowed`);
    }

    const exceededRes = checkRateLimit(testKey, 15, 60000);
    assert.strictEqual(exceededRes.allowed, false, "16th request must be rate-limited");
    assert.strictEqual(exceededRes.remaining, 0, "Remaining requests should be 0");
    assert.ok(exceededRes.resetInSeconds > 0, "Reset seconds should be positive");
    console.log("  ✔ Rate limiting enforcement passed");
  }

  // --- TEST 3: Route Exclusion Logic ---
  console.log("\nTEST 3: Route Exclusion Logic");
  {
    // Must be EXCLUDED
    const excludedRoutes = [
      "/classroom/session-abc-123",
      "/classroom",
      "/payment/checkout",
      "/payment/checkout/process",
      "/login",
      "/register",
      "/register/student",
      "/register/teacher",
      "/student/login",
      "/student/register",
      "/teacher/login",
      "/teacher/register",
      "/admin/login",
      "/staff/login",
      "/staff/register",
      "/verify-otp",
      "/verify-email",
      "/forgot-password",
      "/reset-password",
    ];

    for (const route of excludedRoutes) {
      assert.strictEqual(
        isAiAssistantExcluded(route),
        true,
        `Route ${route} should be EXCLUDED from AI assistant`
      );
    }

    // Must be ALLOWED
    const allowedRoutes = [
      "/",
      "/courses",
      "/courses/react-mastery",
      "/find-teachers",
      "/find-teachers/prof-smith",
      "/how-it-works",
      "/about",
      "/contact",
      "/student",
      "/student/dashboard",
      "/student/courses",
      "/student/live-classes",
      "/teacher",
      "/teacher/dashboard",
      "/teacher/courses",
      "/teacher/live-classes",
      "/teacher/verification",
      "/admin",
      "/admin/dashboard",
      "/admin/verification",
      "/admin/users",
    ];

    for (const route of allowedRoutes) {
      assert.strictEqual(
        isAiAssistantExcluded(route),
        false,
        `Route ${route} should be ALLOWED for AI assistant`
      );
    }
    console.log("  ✔ Route exclusion checks passed");
  }

  // --- TEST 4: Section Themes Mapping ---
  console.log("\nTEST 4: Section Themes Mapping");
  {
    assert.strictEqual(getSectionTheme("/", "guest"), "home");
    assert.strictEqual(getSectionTheme("/courses", "guest"), "home");
    assert.strictEqual(getSectionTheme("/student/dashboard", "LEARNER"), "learner");
    assert.strictEqual(getSectionTheme("/teacher/dashboard", "EDUCATOR"), "educator");
    assert.strictEqual(getSectionTheme("/admin/dashboard", "ADMIN"), "admin");

    assert.ok(THEMES.home.headerBg.includes("#0F5C5A"), "Home theme must use deep teal");
    assert.ok(THEMES.learner.headerBg.includes("#3157D5"), "Learner theme must use blue/indigo");
    assert.ok(THEMES.educator.headerBg.includes("#16805B"), "Educator theme must use emerald/green");
    assert.ok(THEMES.admin.headerBg.includes("#073F3C"), "Admin theme must use admin dark teal");
    console.log("  ✔ Section theme mapping passed");
  }

  // --- TEST 5: Contextual Quick Questions ---
  console.log("\nTEST 5: Contextual Quick Questions Content");
  {
    // Learner questions
    assert.ok(QUICK_QUESTIONS.LEARNER.includes("Find an Educator"));
    assert.ok(QUICK_QUESTIONS.LEARNER.includes("Find a Course"));
    assert.ok(QUICK_QUESTIONS.LEARNER.includes("How do live classes work?"));
    assert.ok(QUICK_QUESTIONS.LEARNER.includes("How do I book a trial?"));
    assert.ok(QUICK_QUESTIONS.LEARNER.includes("How do I update my profile?"));
    assert.ok(QUICK_QUESTIONS.LEARNER.includes("How do I contact support?"));

    // Educator questions
    assert.ok(QUICK_QUESTIONS.EDUCATOR.includes("How do I create a course?"));
    assert.ok(QUICK_QUESTIONS.EDUCATOR.includes("How do I become verified?"));
    assert.ok(QUICK_QUESTIONS.EDUCATOR.includes("How do I create a live class?"));
    assert.ok(QUICK_QUESTIONS.EDUCATOR.includes("How do payouts work?"));
    assert.ok(QUICK_QUESTIONS.EDUCATOR.includes("How do I update my profile?"));
    assert.ok(QUICK_QUESTIONS.EDUCATOR.includes("How do I upload documents?"));

    // Admin questions
    assert.ok(QUICK_QUESTIONS.ADMIN.includes("Explain Admin Dashboard"));
    assert.ok(QUICK_QUESTIONS.ADMIN.includes("Educator verification"));
    assert.ok(QUICK_QUESTIONS.ADMIN.includes("User management"));
    assert.ok(QUICK_QUESTIONS.ADMIN.includes("Live classes"));
    assert.ok(QUICK_QUESTIONS.ADMIN.includes("Platform overview"));

    // Guest questions
    assert.ok(QUICK_QUESTIONS.guest.includes("What is EduConnects?"));
    assert.ok(QUICK_QUESTIONS.guest.includes("Find an Educator"));
    assert.ok(QUICK_QUESTIONS.guest.includes("Find Courses"));
    assert.ok(QUICK_QUESTIONS.guest.includes("How does EduConnects work?"));
    assert.ok(QUICK_QUESTIONS.guest.includes("Become an Educator"));
    assert.ok(QUICK_QUESTIONS.guest.includes("Contact Support"));
    console.log("  ✔ Contextual quick questions verified for all roles");
  }

  // --- TEST 6: AI Chat Service & Role Guidance ---
  console.log("\nTEST 6: AI Chat Processing & Safe Responses");
  {
    // Guest query
    const guestResult = await processAiChat({
      message: "What is EduConnects?",
      role: "guest",
    });
    assert.ok(guestResult.response.length > 20, "Guest response should not be empty");
    assert.ok(
      guestResult.response.toLowerCase().includes("educonnects"),
      "Response should mention EduConnects"
    );

    // Learner query
    const learnerResult = await processAiChat({
      message: "Where can I see my courses?",
      role: "LEARNER",
    });
    assert.ok(
      learnerResult.response.includes("/student/courses"),
      "Learner response should direct to /student/courses"
    );

    // Educator query
    const educatorResult = await processAiChat({
      message: "How do I create a course?",
      role: "EDUCATOR",
    });
    assert.ok(
      educatorResult.response.includes("/teacher/courses"),
      "Educator response should direct to /teacher/courses"
    );

    // Admin query
    const adminResult = await processAiChat({
      message: "Where do I verify educators?",
      role: "ADMIN",
    });
    assert.ok(
      adminResult.response.includes("/admin/verification"),
      "Admin response should direct to /admin/verification"
    );

    console.log("  ✔ AI Chat Processing passed for all roles");
  }

  console.log("\n✨ All EduConnects AI Assistant Tests Passed Successfully!\n");
  process.exit(0);
}

runTests().catch((err) => {
  console.error("❌ AI Assistant Test Suite Failed:", err);
  process.exit(1);
});
