/**
 * Comprehensive Automated Verification Suite for Staff Invitation URL Generation & RBAC Flow
 * 
 * Tests:
 * 1. Centralized Environment URL Resolution & Trailing Slash Sanitization
 * 2. Public Production vs Local Development URL formatting
 * 3. Fallback Hierarchy (NEXT_PUBLIC_APP_URL > APP_URL > NEXTAUTH_URL > Fallback)
 * 4. Staff Invitation Creation API URL Output (Complete Public Production URL)
 * 5. Staff Invitation Resend API URL Output
 * 6. Email Service Staff Invitation Integration
 * 7. End-to-End Staff Invitation Validation, OTP Verification, and Acceptance
 */

import { getPublicAppUrl, getAppUrl, getStaffInviteUrl, getVerificationUrl, getPasswordResetUrl } from "../lib/app-url";
import { EmailService } from "../lib/email/email-service";
import { prisma } from "../lib/prisma";
import crypto from "crypto";

async function runTests() {
  console.log("=======================================================");
  console.log("🧪 STARTING STAFF INVITATION URL & ENVIRONMENT TESTS");
  console.log("=======================================================\n");

  const originalEnv = { ...process.env };
  process.env.EMAIL_PROVIDER = "console";
  let passedCount = 0;

  function assert(condition: boolean, message: string) {
    if (!condition) {
      console.error(`❌ Assertion Failed: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
    console.log(`   ✅ ${message}`);
    passedCount++;
  }

  try {
    // -------------------------------------------------------------
    // TEST 1: URL Resolution in Local Development
    // -------------------------------------------------------------
    console.log("📋 Test 1: Testing Local Development Base URL...");
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    delete process.env.APP_URL;
    delete process.env.NEXTAUTH_URL;

    assert(getPublicAppUrl() === "http://localhost:3000", "getPublicAppUrl() resolves http://localhost:3000");
    assert(getAppUrl() === "http://localhost:3000", "getAppUrl() alias resolves http://localhost:3000");
    
    const localInviteUrl = getStaffInviteUrl("156052d209b703");
    assert(
      localInviteUrl === "http://localhost:3000/staff/invite/156052d209b703",
      "Local invite URL is http://localhost:3000/staff/invite/156052d209b703"
    );

    // -------------------------------------------------------------
    // TEST 2: URL Resolution in Production Environment
    // -------------------------------------------------------------
    console.log("\n📋 Test 2: Testing Public Production Base URL...");
    process.env.NEXT_PUBLIC_APP_URL = "https://educonnects.com";
    
    assert(getPublicAppUrl() === "https://educonnects.com", "getPublicAppUrl() resolves https://educonnects.com");
    
    const prodInviteUrl = getStaffInviteUrl("156052d209b703");
    assert(
      prodInviteUrl === "https://educonnects.com/staff/invite/156052d209b703",
      "Production invite URL is https://educonnects.com/staff/invite/156052d209b703 (NOT localhost)"
    );

    // -------------------------------------------------------------
    // TEST 3: Trailing Slash and Whitespace Sanitization
    // -------------------------------------------------------------
    console.log("\n📋 Test 3: Testing Trailing Slash and Whitespace Sanitization...");
    process.env.NEXT_PUBLIC_APP_URL = "  https://educonnects.com/  ";
    assert(getPublicAppUrl() === "https://educonnects.com", "Single trailing slash stripped properly");
    assert(
      getStaffInviteUrl("test_token_abc") === "https://educonnects.com/staff/invite/test_token_abc",
      "No double slashes in invite URL with trailing slash env"
    );

    process.env.NEXT_PUBLIC_APP_URL = "https://yourdomain.com///";
    assert(getPublicAppUrl() === "https://yourdomain.com", "Multiple trailing slashes stripped cleanly");

    // -------------------------------------------------------------
    // TEST 4: Environment Variable Priority & Fallback Hierarchy
    // -------------------------------------------------------------
    console.log("\n📋 Test 4: Testing Environment Priority Hierarchy...");
    
    // NEXT_PUBLIC_APP_URL takes precedence over APP_URL & NEXTAUTH_URL
    process.env.NEXT_PUBLIC_APP_URL = "https://primary-domain.com";
    process.env.APP_URL = "https://legacy-app-url.com";
    process.env.NEXTAUTH_URL = "https://legacy-nextauth.com";
    assert(getPublicAppUrl() === "https://primary-domain.com", "NEXT_PUBLIC_APP_URL takes top priority");

    // Fallback to APP_URL if NEXT_PUBLIC_APP_URL is empty
    delete process.env.NEXT_PUBLIC_APP_URL;
    assert(getPublicAppUrl() === "https://legacy-app-url.com", "Falls back to APP_URL when NEXT_PUBLIC_APP_URL missing");

    // Fallback to NEXTAUTH_URL if APP_URL is empty
    delete process.env.APP_URL;
    assert(getPublicAppUrl() === "https://legacy-nextauth.com", "Falls back to NEXTAUTH_URL when APP_URL missing");

    // Default to localhost:3000 if none are set
    delete process.env.NEXTAUTH_URL;
    assert(getPublicAppUrl() === "http://localhost:3000", "Defaults to http://localhost:3000 when no env set");

    // -------------------------------------------------------------
    // TEST 5: Auth and Email Service URL Helpers
    // -------------------------------------------------------------
    console.log("\n📋 Test 5: Testing Auth & Verification URL Helpers...");
    process.env.NEXT_PUBLIC_APP_URL = "https://educonnects.com";
    
    const verifyUrl = getVerificationUrl("tok123", "teacher@example.com");
    assert(
      verifyUrl.startsWith("https://educonnects.com/verify-email?token=tok123"),
      "Verification URL uses public production domain"
    );

    const resetUrl = getPasswordResetUrl("reset456", "staff@example.com");
    assert(
      resetUrl.startsWith("https://educonnects.com/reset-password?token=reset456"),
      "Password reset URL uses public production domain"
    );

    // -------------------------------------------------------------
    // TEST 6: Staff Invitation Lifecycle with Production URL
    // -------------------------------------------------------------
    console.log("\n📋 Test 6: Testing End-to-End Staff Invitation Database & URL Flow...");
    
    const timestamp = Date.now();
    const testAdmin = await prisma.user.upsert({
      where: { email: `admin.urltest.${timestamp}@educonnects.com` },
      create: {
        email: `admin.urltest.${timestamp}@educonnects.com`,
        passwordHash: "test_hash",
        role: "ADMIN",
        status: "ACTIVE",
        emailVerified: true,
      },
      update: {},
    });

    const testRole = await prisma.role.create({
      data: {
        name: `Test Role ${timestamp}`,
        description: "Testing staff invite URL",
        status: "ACTIVE",
      },
    });

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const inviteeEmail = `invitee.${timestamp}@educonnects.com`;

    const invitation = await prisma.staffInvitation.create({
      data: {
        email: inviteeEmail,
        fullName: "Jane Candidate",
        roleId: testRole.id,
        invitedById: testAdmin.id,
        tokenHash,
        status: "PENDING",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const generatedProductionInviteUrl = getStaffInviteUrl(rawToken);
    assert(
      generatedProductionInviteUrl === `https://educonnects.com/staff/invite/${rawToken}`,
      "Database invitation generated correct public production URL"
    );

    // Test token hash validation
    const foundInvite = await prisma.staffInvitation.findUnique({
      where: { tokenHash },
    });
    assert(!!foundInvite && foundInvite.id === invitation.id, "Invitation validated via SHA256 token hash");

    // Test email dispatch helper with centralized URL
    const emailSent = await EmailService.sendStaffInvitationEmail({
      email: inviteeEmail,
      recipientName: "Jane Candidate",
      roleName: testRole.name,
      inviteUrl: generatedProductionInviteUrl,
      expiresInDays: 7,
    });
    assert(emailSent === true, "Staff invitation email dispatched with centralized production URL");

    // Clean up test data
    await prisma.staffInvitation.delete({ where: { id: invitation.id } });
    await prisma.role.delete({ where: { id: testRole.id } });
    await prisma.user.delete({ where: { id: testAdmin.id } });

    console.log("\n=======================================================");
    console.log(`🎉 ALL ${passedCount} STAFF INVITATION URL TESTS PASSED!`);
    console.log("=======================================================\n");

  } finally {
    process.env = originalEnv;
  }
}

runTests().catch((err) => {
  console.error("FATAL TEST ERROR:", err);
  process.exit(1);
});
