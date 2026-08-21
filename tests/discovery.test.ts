import assert from "node:assert";
import { ContactSchema } from "../schemas/auth-schemas";
import { trackEvent } from "../lib/analytics";

async function runDiscoveryTests() {
  console.log("🧪 Running EduConnect Module 02 Discovery & Public API Tests...\n");

  // Test 1: Contact Form Zod Schema Validation
  console.log("Test 1: Validating Contact Form Zod Schema...");
  const validContact = ContactSchema.parse({
    name: "Alex Morgan",
    email: "alex@educonnect.com",
    subject: "Inquiry about demo classes",
    message: "I would like to know if trial calculus sessions are available on weekends.",
    roleType: "STUDENT",
  });
  assert.strictEqual(validContact.roleType, "STUDENT");
  assert.strictEqual(validContact.email, "alex@educonnect.com");
  console.log("✅ Passed: Contact form validation.");

  // Test 2: Contact Form Invalid Email Rejection
  console.log("\nTest 2: Verifying Contact Form Invalid Email Rejection...");
  try {
    ContactSchema.parse({
      name: "Invalid User",
      email: "not-an-email",
      subject: "Test",
      message: "Short",
    });
    assert.fail("Should have failed on invalid email");
  } catch (e: any) {
    assert.ok(e.name === "ZodError");
    console.log("✅ Passed: Invalid email rejected correctly.");
  }

  // Test 3: Analytics Event Tracker Abstraction
  console.log("\nTest 3: Testing Analytics Abstraction Layer...");
  trackEvent("teacher_search_performed", { query: "Mathematics", filters: { priceMax: 50 } });
  console.log("✅ Passed: Analytics abstraction tracked event without errors.");

  console.log("\n🎉 ALL MODULE 02 DISCOVERY TESTS PASSED SUCCESSFULLY! 🚀\n");
}

runDiscoveryTests().catch((err) => {
  console.error("❌ Test Failure:", err);
  process.exit(1);
});
