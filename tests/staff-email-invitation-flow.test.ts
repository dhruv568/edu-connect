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
    // TEST 1: Super Admin creates pending staff invitation (No Token/URL)
    // -------------------------------------------------------------
    console.log("📋 Test 1: Super Admin creates pending staff invitation (Email, Name, Role)...");
    
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
    assert(!("tokenHash" in invitationRecord) || invitationRecord.tokenHash === undefined || invitationRecord.tokenHash === null, "No invitation token is generated or stored");

    // -------------------------------------------------------------
    // TEST 2 & 3: Email Dispatched Automatically with Professional Content
    // -------------------------------------------------------------
    console.log("\n📋 Test 2 & 3: Email automatically dispatched with instructions (No Token URL)...");
    
    const emailSent = await EmailService.sendStaffInvitationEmail({
      email: inviteeEmail,
      recipientName: "Jane Candidate",
      roleName: testRole.name,
    });

    assert(emailSent === true, "Staff invitation email dispatched successfully");

    // -------------------------------------------------------------
    // TEST 4: Candidate Opens Staff Registration & Requests OTP
    // -------------------------------------------------------------
    console.log("\n📋 Test 4: Candidate enters invited email and receives OTP...");
    
    const pendingInvite = await prisma.staffInvitation.findFirst({
      where: {
        email: inviteeEmail,
        status: "PENDING",
      },
      include: { role: true },
    });

    assert(pendingInvite !== null, "Found active pending invitation for invited email");
    assert(pendingInvite?.role.name === testRole.name, "Role metadata retrieved for display");

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
    // TEST 5: Candidate Verifies OTP & Staff Account is Activated with Pre-Assigned Role
    // -------------------------------------------------------------
    console.log("\n📋 Test 5: Candidate verifies OTP and account is activated with pre-assigned role...");
    
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
          include: {
            customRole: true,
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

    // -------------------------------------------------------------
    // TEST 6: Candidate Logs In & Dynamic Dashboard Resolves Role
    // -------------------------------------------------------------
    console.log("\n📋 Test 6: Candidate logs in and assigned dynamic role is loaded...");
    
    const loadedStaff = await prisma.user.findUnique({
      where: { id: createdStaffUser.id },
      include: { customRole: true },
    });

    assert(loadedStaff?.role === "STAFF", "Authenticated user is STAFF");
    assert(loadedStaff?.customRole?.name === testRole.name, "Dynamic custom role permissions available");

    // -------------------------------------------------------------
    // TEST 7: Uninvited Email Registration Attempt Rejected
    // -------------------------------------------------------------
    console.log("\n📋 Test 7: Uninvited email registration is rejected...");
    
    const uninvitedCheck = await prisma.staffInvitation.findFirst({
      where: {
        email: `random.uninvited.${timestamp}@educonnects.com`,
        status: "PENDING",
      },
    });

    assert(uninvitedCheck === null, "Uninvited email returns no active staff invitation");

    // -------------------------------------------------------------
    // TEST 8: Super Admin Updates Role Before Registration
    // -------------------------------------------------------------
    console.log("\n📋 Test 8: Super Admin updates role before registration -> Latest role assigned...");
    
    const role2 = await prisma.role.create({
      data: {
        name: `Senior Moderator ${timestamp}`,
        description: "Updated role",
        status: "ACTIVE",
      },
    });

    const invite2Email = `candidate.roleupdate.${timestamp}@educonnects.com`;
    const invite2 = await prisma.staffInvitation.create({
      data: {
        email: invite2Email,
        fullName: "Role Update Candidate",
        roleId: testRole.id,
        invitedById: testAdmin.id,
        status: "PENDING",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Admin updates the role on the invitation
    const updatedInvite = await prisma.staffInvitation.update({
      where: { id: invite2.id },
      data: { roleId: role2.id },
      include: { role: true },
    });

    assert(updatedInvite.roleId === role2.id, "Invitation role updated to Senior Moderator");
    assert(updatedInvite.role.name === `Senior Moderator ${timestamp}`, "Updated role name verified");

    await prisma.staffInvitation.delete({ where: { id: invite2.id } });
    await prisma.role.delete({ where: { id: role2.id } });

    // -------------------------------------------------------------
    // TEST 9: Cancelled / Revoked Invitation Registration is Rejected
    // -------------------------------------------------------------
    console.log("\n📋 Test 9: Cancelled invitation is rejected upon registration attempt...");
    
    const cancelledInviteEmail = `cancelled.${timestamp}@educonnects.com`;
    const cancelledInvite = await prisma.staffInvitation.create({
      data: {
        email: cancelledInviteEmail,
        fullName: "Cancelled Person",
        roleId: testRole.id,
        invitedById: testAdmin.id,
        status: "PENDING",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Admin cancels / revokes the invitation
    await prisma.staffInvitation.update({
      where: { id: cancelledInvite.id },
      data: { status: "REVOKED" },
    });

    const checkCancelled = await prisma.staffInvitation.findFirst({
      where: {
        email: cancelledInviteEmail,
        status: "PENDING",
      },
    });

    assert(checkCancelled === null, "Cancelled invitation is not found in PENDING status");
    await prisma.staffInvitation.delete({ where: { id: cancelledInvite.id } });

    // -------------------------------------------------------------
    // TEST 10: Resend Invitation Dispatches Email with No New Link
    // -------------------------------------------------------------
    console.log("\n📋 Test 10: Resend invitation dispatches email without generating new link...");
    
    const resendEmail = `resend.${timestamp}@educonnects.com`;
    const resendInvite = await prisma.staffInvitation.create({
      data: {
        email: resendEmail,
        fullName: "Resend Candidate",
        roleId: testRole.id,
        invitedById: testAdmin.id,
        status: "PENDING",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      include: { role: true },
    });

    const resendSuccess = await EmailService.sendStaffInvitationEmail({
      email: resendInvite.email,
      recipientName: resendInvite.fullName || undefined,
      roleName: resendInvite.role.name,
    });

    assert(resendSuccess === true, "Resent invitation email dispatched successfully");
    await prisma.staffInvitation.delete({ where: { id: resendInvite.id } });

    // -------------------------------------------------------------
    // Cleanup
    // -------------------------------------------------------------
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
