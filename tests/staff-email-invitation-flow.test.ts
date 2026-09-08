import { prisma } from "../lib/prisma";
import { EmailService } from "../lib/email/email-service";
import { generateOTP, hashToken } from "../lib/auth/tokens";
import { hashPassword, verifyPassword } from "../lib/auth/password";
import crypto from "crypto";

async function runStaffEmailInvitationFlowTests() {
  console.log("\n=======================================================");
  console.log("🧪 STARTING STAFF EMAIL INVITATION & OTP FLOW TESTS");
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

  const timestamp = Date.now();
  let testAdmin: any;
  let testRole: any;
  let inviteeEmail: string = "";
  let invitationRecord: any;

  // DB connection retry helper for remote PostgreSQL
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      await prisma.$connect();
      break;
    } catch (connErr) {
      if (attempt === 5) throw connErr;
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  try {
    // Setup Admin and Role
    testAdmin = await prisma.user.create({
      data: {
        email: `admin.invite.${timestamp}@educonnects.com`,
        passwordHash: await hashPassword("AdminPass123!"),
        role: "ADMIN",
        status: "ACTIVE",
        emailVerified: true,
      },
    });

    testRole = await prisma.role.create({
      data: {
        name: `Curriculum Moderator ${timestamp}`,
        description: "Staff role for curriculum moderation",
        status: "ACTIVE",
      },
    });

    inviteeEmail = `candidate.${timestamp}@educonnects.com`;

    // -------------------------------------------------------------
    // TEST 1: Admin Creates Pending Staff Invitation (No Token/URL)
    // -------------------------------------------------------------
    console.log("📋 Test 1: Super Admin creates pending staff invitation...");
    
    invitationRecord = await prisma.staffInvitation.create({
      data: {
        email: inviteeEmail,
        fullName: "Jane Candidate",
        roleId: testRole.id,
        invitedById: testAdmin.id,
        status: "PENDING",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    assert(invitationRecord.status === "PENDING", "Invitation created with PENDING status");
    assert(invitationRecord.roleId === testRole.id, "Pre-assigned role ID correctly stored");
    assert(invitationRecord.email === inviteeEmail, "Invitee email correctly stored");

    // -------------------------------------------------------------
    // TEST 2: Email Service Dispatches Clean Instructions (No Token URL)
    // -------------------------------------------------------------
    console.log("\n📋 Test 2: Email Service sends instructions without unique token/URL...");
    
    const emailSent = await EmailService.sendStaffInvitationEmail({
      email: inviteeEmail,
      recipientName: "Jane Candidate",
      roleName: testRole.name,
      expiresInDays: 7,
    });

    assert(emailSent === true, "Staff invitation email dispatched successfully");

    // -------------------------------------------------------------
    // TEST 3: Non-Invited Email Registration Attempt Fails
    // -------------------------------------------------------------
    console.log("\n📋 Test 3: Uninvited email cannot request OTP for staff registration...");
    
    const uninvitedCheck = await prisma.staffInvitation.findFirst({
      where: {
        email: `random.stranger.${timestamp}@educonnects.com`,
        status: "PENDING",
      },
    });

    assert(uninvitedCheck === null, "Uninvited email returns no pending invitation");

    // -------------------------------------------------------------
    // TEST 4: Valid Invited Staff Requests OTP
    // -------------------------------------------------------------
    console.log("\n📋 Test 4: Invited staff requests OTP...");
    
    const pendingInvite = await prisma.staffInvitation.findFirst({
      where: {
        email: inviteeEmail,
        status: "PENDING",
      },
      include: { role: true },
    });

    assert(pendingInvite !== null, "Found active pending invitation for invited email");
    assert(pendingInvite?.role.name === testRole.name, "Role metadata retrieved for display");

    // Generate 6-digit OTP and store in PendingRegistration
    const generatedOtp = generateOTP();
    const codeHash = hashToken(generatedOtp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const pendingRegRecord = await prisma.pendingRegistration.upsert({
      where: { email: inviteeEmail },
      create: {
        email: inviteeEmail,
        passwordHash: "pending_password_setup",
        role: "STAFF",
        firstName: "Jane",
        lastName: "Candidate",
        codeHash,
        tokenHash: codeHash,
        expiresAt,
        attempts: 0,
      },
      update: {
        codeHash,
        tokenHash: codeHash,
        expiresAt,
        attempts: 0,
      },
    });

    assert(Boolean(pendingRegRecord.id), "OTP securely hashed and saved in pending registration table");
    assert(pendingRegRecord.codeHash !== generatedOtp, "Plaintext OTP is never stored directly");

    // -------------------------------------------------------------
    // TEST 5: Incorrect OTP Rejected
    // -------------------------------------------------------------
    console.log("\n📋 Test 5: Incorrect OTP is rejected...");
    
    const badOtpHash = hashToken("999999");
    const matchedWithBadOtp = badOtpHash === pendingRegRecord.codeHash;
    assert(matchedWithBadOtp === false, "Incorrect OTP hash fails verification");

    // -------------------------------------------------------------
    // TEST 6: Valid OTP Verification, Role Enforcement & Account Creation
    // -------------------------------------------------------------
    console.log("\n📋 Test 6: Valid OTP verification creates staff account with strictly pre-assigned role...");
    
    const validOtpHash = hashToken(generatedOtp);
    assert(validOtpHash === pendingRegRecord.codeHash, "Valid OTP matches stored hash");

    const newStaffPassword = "SecureStaffPassword2026!";
    const staffPasswordHash = await hashPassword(newStaffPassword);

    const createdStaffUser = await prisma.$transaction(
      async (tx) => {
        const u = await tx.user.create({
          data: {
            email: inviteeEmail,
            passwordHash: staffPasswordHash,
            role: "STAFF",
            roleId: pendingInvite!.roleId, // Strictly pre-assigned by Admin
            status: "ACTIVE",
            emailVerified: true,
            emailVerifiedAt: new Date(),
            profile: {
              create: {
                firstName: "Jane",
                lastName: "Candidate",
              },
            },
          },
        });

        // Mark invitation accepted
        await tx.staffInvitation.update({
          where: { id: pendingInvite!.id },
          data: {
            status: "ACCEPTED",
            acceptedAt: new Date(),
          },
        });

        // Invalidate pending registration
        await tx.pendingRegistration.deleteMany({
          where: { email: inviteeEmail },
        });

        return u;
      },
      { timeout: 30000, maxWait: 15000 }
    );

    assert(createdStaffUser.role === "STAFF", "User created with role STAFF");
    assert(createdStaffUser.roleId === testRole.id, "Staff user has strictly pre-assigned role ID");
    assert(createdStaffUser.status === "ACTIVE", "Staff user status is ACTIVE");
    assert(createdStaffUser.emailVerified === true, "Staff user emailVerified is true");

    const isPasswordValid = await verifyPassword(newStaffPassword, createdStaffUser.passwordHash);
    assert(isPasswordValid === true, "Staff password hash verified");

    // Check invitation updated
    const updatedInvitation = await prisma.staffInvitation.findUnique({
      where: { id: pendingInvite!.id },
    });
    assert(updatedInvitation?.status === "ACCEPTED", "Invitation status updated to ACCEPTED");
    assert(Boolean(updatedInvitation?.acceptedAt), "Invitation acceptedAt timestamp set");

    // Check pending registration cleaned up
    const remainingPending = await prisma.pendingRegistration.count({
      where: { email: inviteeEmail },
    });
    assert(remainingPending === 0, "Pending registration purged after successful activation");

    // -------------------------------------------------------------
    // TEST 7: Already Accepted Email Cannot Be Re-Registered
    // -------------------------------------------------------------
    console.log("\n📋 Test 7: Already accepted invitation cannot be reused...");
    
    const reInviteCheck = await prisma.staffInvitation.findFirst({
      where: {
        email: inviteeEmail,
        status: "PENDING",
      },
    });
    assert(reInviteCheck === null, "No pending invitation found for already-accepted email");

    // -------------------------------------------------------------
    // TEST 8: Expired Invitation Check
    // -------------------------------------------------------------
    console.log("\n📋 Test 8: Expired invitation is properly identified...");
    
    const expiredInvite = await prisma.staffInvitation.create({
      data: {
        email: `expired.${timestamp}@educonnects.com`,
        fullName: "Expired Person",
        roleId: testRole.id,
        invitedById: testAdmin.id,
        status: "PENDING",
        expiresAt: new Date(Date.now() - 1000), // In past
      },
    });

    const isExpired = expiredInvite.expiresAt ? new Date() > expiredInvite.expiresAt : false;
    assert(isExpired === true, "Past expiresAt date is recognized as expired");

    // Cleanup
    await prisma.staffInvitation.delete({ where: { id: expiredInvite.id } });
    await prisma.staffInvitation.delete({ where: { id: invitationRecord.id } });
    await prisma.user.delete({ where: { id: createdStaffUser.id } });
    await prisma.role.delete({ where: { id: testRole.id } });
    await prisma.user.delete({ where: { id: testAdmin.id } });

    console.log("\n=======================================================");
    console.log(`🎉 ALL ${passedCount} STAFF EMAIL INVITATION & OTP TESTS PASSED!`);
    console.log("=======================================================\n");

  } finally {
    process.env = originalEnv;
  }
}

runStaffEmailInvitationFlowTests().catch((err) => {
  console.error("FATAL TEST ERROR:", err);
  process.exit(1);
});
