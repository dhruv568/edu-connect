import assert from "node:assert";
import { extractOtpDigits } from "../lib/auth/otp-utils";
import { prisma } from "../lib/prisma";
import { AuthService } from "../services/auth-service";
import bcrypt from "bcryptjs";

// Simulation of the exact fillOtp, handleOtpChange, and handlePaste logic implemented in verify-email/page.tsx
function createOtpComponentSimulator() {
  let otp = Array(6).fill("");
  let domValues = Array(6).fill("");
  let focusedIndex = 0;

  function fillOtp(text: string, startIndex = 0) {
    const extracted = extractOtpDigits(text);

    // If 6 digits (complete OTP), distribute across all 6 slots starting at index 0
    if (extracted.length === 6) {
      const full = extracted.split("");
      otp = full;
      domValues = [...full];
      focusedIndex = 5;
      return full;
    }

    // Distribute partial digits starting from startIndex
    const digits = text.replace(/\D/g, "");
    if (!digits) return;

    const newOtp = [...otp];
    let lastFilled = startIndex;
    for (let i = 0; i < digits.length && startIndex + i < 6; i++) {
      newOtp[startIndex + i] = digits[i];
      domValues[startIndex + i] = digits[i];
      lastFilled = startIndex + i;
    }
    otp = newOtp;
    focusedIndex = Math.min(lastFilled + 1, 5);
    return newOtp;
  }

  function handleOtpChange(index: number, value: string) {
    // If input already had a digit and user pasted text (e.g. mobile paste or typing into filled box),
    // check if the old digit was prepended or appended to a 6-digit code.
    let cleanVal = value;
    if (otp[index] && value.length > 1) {
      if (value.startsWith(otp[index]) && value.length >= 7) {
        cleanVal = value.slice(otp[index].length);
      } else if (value.endsWith(otp[index]) && value.length >= 7) {
        cleanVal = value.slice(0, -otp[index].length);
      }
    }

    // Check if cleanVal contains a 6-digit OTP (autofill, mobile paste, virtual keyboard)
    const extracted = extractOtpDigits(cleanVal);
    if (extracted.length === 6) {
      fillOtp(cleanVal, index);
      return;
    }

    const digits = cleanVal.replace(/\D/g, "");

    // Cleared
    if (!digits) {
      const newOtp = [...otp];
      newOtp[index] = "";
      domValues[index] = "";
      otp = newOtp;
      return;
    }

    // Normal single-digit typing
    if (digits.length === 1) {
      const newOtp = [...otp];
      newOtp[index] = digits;
      domValues[index] = digits;
      otp = newOtp;
      if (index < 5) {
        focusedIndex = index + 1;
      }
      return;
    }

    // If user typed into an already filled box (e.g. existing '4' with new key '7' -> '47')
    if (digits.length === 2 && otp[index]) {
      const typedChar = digits[0] === otp[index] ? digits[1] : digits[0];
      const newOtp = [...otp];
      newOtp[index] = typedChar;
      domValues[index] = typedChar;
      otp = newOtp;
      if (index < 5) {
        focusedIndex = index + 1;
      }
      return;
    }

    // Multi-digit entry from partial paste or autofill
    fillOtp(cleanVal, index);
  }

  function handlePaste(pastedText: string, index: number) {
    return fillOtp(pastedText, index);
  }

  function handleBackspace(index: number) {
    if (otp[index]) {
      const newOtp = [...otp];
      newOtp[index] = "";
      domValues[index] = "";
      otp = newOtp;
    } else if (index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      domValues[index - 1] = "";
      otp = newOtp;
      focusedIndex = index - 1;
    }
  }

  function getCompleteOtp(): string {
    const stateCode = otp.join("");
    if (stateCode.length === 6) return stateCode;
    const domCode = domValues.join("");
    if (domCode.length === 6) return domCode;
    return stateCode;
  }

  return {
    getOtp: () => [...otp],
    getCode: () => otp.join(""),
    getCompleteOtp,
    getFocusedIndex: () => focusedIndex,
    fillOtp,
    handleOtpChange,
    handlePaste,
    handleBackspace,
    setFocus: (i: number) => { focusedIndex = i; },
  };
}

async function runComprehensiveOtpTests() {
  console.log("🧪 Running Comprehensive OTP Copy-Paste & Manual Typing Test Suite...\n");

  let passed = 0;
  let failed = 0;

  function assertTest(condition: boolean, name: string) {
    if (condition) {
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${name}`);
      failed++;
    }
  }

  // -----------------------------------------------------------------
  // 1. UNIT TESTS FOR extractOtpDigits UTILITY
  // -----------------------------------------------------------------
  console.log("📋 1. Testing extractOtpDigits extraction and sanitization...");

  assertTest(extractOtpDigits("482913") === "482913", "Plain 6-digit code extracted correctly");
  assertTest(extractOtpDigits("482 913") === "482913", "Spaced 3-3 code ('482 913') normalized to 6 digits");
  assertTest(extractOtpDigits(" 482913 ") === "482913", "Leading and trailing whitespace stripped");
  assertTest(extractOtpDigits("4  8  2  9  1  3") === "482913", "Inter-digit spaced code normalized to 6 digits");
  assertTest(extractOtpDigits("482-913") === "482913", "Hyphenated code ('482-913') normalized to 6 digits");
  assertTest(extractOtpDigits("482.913") === "482913", "Dotted code ('482.913') normalized to 6 digits");
  assertTest(extractOtpDigits("Your OTP is 482913") === "482913", "Prefix text with space stripped cleanly");
  assertTest(extractOtpDigits("OTP: 482913") === "482913", "Colon prefix ('OTP: 482913') stripped cleanly");
  assertTest(extractOtpDigits("Code: 482913.") === "482913", "Trailing period from sentence stripped cleanly");
  assertTest(
    extractOtpDigits("Your EduConnect verification code is 482913. Valid for 10 minutes.") === "482913",
    "SMS body with additional numbers (e.g. '10 minutes') correctly extracts the 6-digit OTP"
  );
  assertTest(
    extractOtpDigits("Valid for 10 minutes: 482913") === "482913",
    "SMS with leading time ('10 minutes: 482913') correctly isolates 6-digit OTP"
  );
  assertTest(extractOtpDigits("[482913]") === "482913", "Bracketed code ('[482913]') stripped cleanly");

  // -----------------------------------------------------------------
  // 2. COMPONENT INPUT SIMULATION (MANUAL TYPING VS COPY-PASTE)
  // -----------------------------------------------------------------
  console.log("\n📋 2. Testing Component State: Manual Typing vs Copy-Paste...");

  // Path 1: Manual typing sequence
  const manualComp = createOtpComponentSimulator();
  manualComp.handleOtpChange(0, "4");
  assertTest(manualComp.getFocusedIndex() === 1, "Typing box 0 advances focus to box 1");
  manualComp.handleOtpChange(1, "8");
  assertTest(manualComp.getFocusedIndex() === 2, "Typing box 1 advances focus to box 2");
  manualComp.handleOtpChange(2, "2");
  assertTest(manualComp.getFocusedIndex() === 3, "Typing box 2 advances focus to box 3");
  manualComp.handleOtpChange(3, "9");
  assertTest(manualComp.getFocusedIndex() === 4, "Typing box 3 advances focus to box 4");
  manualComp.handleOtpChange(4, "1");
  assertTest(manualComp.getFocusedIndex() === 5, "Typing box 4 advances focus to box 5");
  manualComp.handleOtpChange(5, "3");
  const manualCode = manualComp.getCompleteOtp();
  assertTest(manualCode === "482913", "Manual typing produces complete 6-digit OTP '482913'");
  assertTest(
    JSON.stringify(manualComp.getOtp()) === JSON.stringify(["4", "8", "2", "9", "1", "3"]),
    "Manual typing distributes each digit into respective boxes [4, 8, 2, 9, 1, 3]"
  );

  // Path 2: Desktop Copy-Paste (with spaces/dashes)
  const pasteComp = createOtpComponentSimulator();
  pasteComp.handlePaste("482-913", 0);
  const pasteCode = pasteComp.getCompleteOtp();
  assertTest(pasteCode === "482913", "Copy-paste produces complete 6-digit OTP '482913'");
  assertTest(
    JSON.stringify(pasteComp.getOtp()) === JSON.stringify(["4", "8", "2", "9", "1", "3"]),
    "Copy-paste automatically distributes each digit into 6 OTP fields identically"
  );
  assertTest(
    manualCode === pasteCode,
    "Manually typed OTP and copy-pasted OTP produce the EXACT same OTP value"
  );
  assertTest(
    JSON.stringify(manualComp.getOtp()) === JSON.stringify(pasteComp.getOtp()),
    "Manually typed and copy-pasted OTP produce identical internal field arrays"
  );

  // Path 3: Mid-box Paste (User clicked box 2 then pasted)
  const midBoxPasteComp = createOtpComponentSimulator();
  midBoxPasteComp.setFocus(2);
  midBoxPasteComp.handlePaste("482 913", 2);
  assertTest(
    midBoxPasteComp.getCompleteOtp() === "482913",
    "Pasting complete OTP into mid-box (index 2) populates all 6 boxes starting from index 0"
  );

  // Path 4: Mobile Browser SMS Autofill via onChange
  const autofillComp = createOtpComponentSimulator();
  autofillComp.handleOtpChange(0, "482913");
  assertTest(
    autofillComp.getCompleteOtp() === "482913",
    "Mobile SMS autofill triggering onChange distributes all 6 digits into boxes"
  );

  // Path 5: Mobile Paste into an already filled box (e.g. box 0 had '1', user pastes '482913')
  const filledBoxPasteComp = createOtpComponentSimulator();
  filledBoxPasteComp.handleOtpChange(0, "1"); // box 0 has '1'
  filledBoxPasteComp.handleOtpChange(0, "1482913"); // mobile paste without select appends to '1'
  assertTest(
    filledBoxPasteComp.getCompleteOtp() === "482913",
    "Mobile paste into already filled box cleanly extracts pasted 6 digits and discards stale digit"
  );

  // Path 6: Backspace retreats and editing
  const editingComp = createOtpComponentSimulator();
  editingComp.handlePaste("482913", 0);
  editingComp.handleBackspace(5); // Clear box 5 ('3')
  assertTest(editingComp.getCode() === "48291", "Backspace clears current digit");
  editingComp.handleBackspace(5); // Clear box 4 ('1') and retreat
  assertTest(editingComp.getCode() === "4829", "Second backspace retreats to previous box and clears it");
  editingComp.handleOtpChange(3, "95"); // Type '5' into box 3 (had '9')
  assertTest(editingComp.getCode() === "4825", "Typing into already filled box replaces character");

  // -----------------------------------------------------------------
  // 3. END-TO-END VERIFICATION: MANUAL TYPING VS COPY-PASTE VERIFICATION
  // -----------------------------------------------------------------
  console.log("\n📋 3. Testing End-to-End Verification via AuthService.verifyOTP...");

  const testId = Date.now();
  const passwordHash = await bcrypt.hash("Password123!", 10);

  let userManual: any = null;
  let userPasted: any = null;

  try {
    const otpValue = "739264";

    // Create User 1 (For Manual Typing test)
    userManual = await prisma.user.create({
      data: {
        email: `manual.otp.${testId}@test.com`,
        passwordHash,
        role: "STUDENT",
        emailVerified: false,
        profile: {
          create: { firstName: "Manual", lastName: "Tester" },
        },
      },
    });

    // Create User 2 (For Copy-Paste test)
    userPasted = await prisma.user.create({
      data: {
        email: `pasted.otp.${testId}@test.com`,
        passwordHash,
        role: "STUDENT",
        emailVerified: false,
        profile: {
          create: { firstName: "Paste", lastName: "Tester" },
        },
      },
    });

    // Generate Verification OTP records for both users
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    const { hashToken } = await import("../lib/auth/tokens");
    const hashedCode = hashToken(otpValue);

    await prisma.emailVerification.create({
      data: {
        userId: userManual.id,
        codeHash: hashedCode,
        tokenHash: hashToken(`token-manual-${testId}`),
        expiresAt: expiry,
        attempts: 0,
      },
    });

    await prisma.emailVerification.create({
      data: {
        userId: userPasted.id,
        codeHash: hashedCode,
        tokenHash: hashToken(`token-pasted-${testId}`),
        expiresAt: expiry,
        attempts: 0,
      },
    });

    // --- Path A: Manual Typing Verification ---
    // Simulate user typing each digit: '7', '3', '9', '2', '6', '4'
    const manualTester = createOtpComponentSimulator();
    for (let i = 0; i < otpValue.length; i++) {
      manualTester.handleOtpChange(i, otpValue[i]);
    }
    const submittedManualCode = manualTester.getCompleteOtp();
    assertTest(submittedManualCode === otpValue, `Manual typing resolved submitted code: ${submittedManualCode}`);

    const manualResult = await AuthService.verifyOTP(userManual.email, submittedManualCode);
    assertTest(manualResult.success === true, "Manual typing verification succeeds");
    assertTest(manualResult.user?.emailVerified === true, "Manual verification marks emailVerified = true");

    // --- Path B: Copy-Paste Verification ---
    // Simulate user pasting formatted code with spaces and dashes: "739 - 264"
    const pasteTester = createOtpComponentSimulator();
    pasteTester.handlePaste("739 - 264", 0);
    const submittedPasteCode = pasteTester.getCompleteOtp();
    assertTest(submittedPasteCode === otpValue, `Copy-paste resolved submitted code: ${submittedPasteCode}`);

    // Verify through the exact same AuthService / API verification path
    const pasteResult = await AuthService.verifyOTP(userPasted.email, submittedPasteCode);
    assertTest(pasteResult.success === true, "Copy-paste verification succeeds");
    assertTest(pasteResult.user?.emailVerified === true, "Copy-paste verification marks emailVerified = true");

    // --- Path C: Strict Equality Comparison ---
    assertTest(
      submittedManualCode === submittedPasteCode,
      "Both manual typing and copy/paste submitted the EXACT same OTP value ('739264')"
    );
    assertTest(
      manualResult.user?.role === pasteResult.user?.role,
      "Both produce identical role authentication results"
    );
    assertTest(
      manualResult.redirectPath === pasteResult.redirectPath,
      "Both produce identical redirect paths"
    );

  } catch (err: any) {
    console.error("❌ Unexpected test runner error:", err);
    failed++;
  } finally {
    console.log("\n🧹 Cleaning up test users and tokens...");
    try {
      if (userManual?.id) {
        await prisma.emailVerification.deleteMany({ where: { userId: userManual.id } }).catch(() => {});
        await prisma.profile.deleteMany({ where: { userId: userManual.id } }).catch(() => {});
        await prisma.user.delete({ where: { id: userManual.id } }).catch(() => {});
      }
      if (userPasted?.id) {
        await prisma.emailVerification.deleteMany({ where: { userId: userPasted.id } }).catch(() => {});
        await prisma.profile.deleteMany({ where: { userId: userPasted.id } }).catch(() => {});
        await prisma.user.delete({ where: { id: userPasted.id } }).catch(() => {});
      }
    } catch (cleanErr) {
      console.warn("Cleanup warning:", cleanErr);
    }
  }

  console.log("\n========================================================");
  console.log(`📊 Final Results: ${passed} Passed, ${failed} Failed`);
  console.log("========================================================\n");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runComprehensiveOtpTests();
