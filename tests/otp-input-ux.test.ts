import assert from "node:assert";

// Simulation of the exact fillOtp & handleOtpChange logic implemented in verify-email/page.tsx
function simulateOtpLogic() {
  let otp = Array(6).fill("");
  let focusedIndex = 0;

  function fillOtp(text: string, startIndex = 0) {
    const digits = text.replace(/\D/g, "");
    if (!digits) return;

    if (digits.length >= 6) {
      const full = digits.slice(0, 6).split("");
      otp = full;
      focusedIndex = 5;
      return;
    }

    const newOtp = [...otp];
    let lastFilled = startIndex;
    for (let i = 0; i < digits.length && startIndex + i < 6; i++) {
      newOtp[startIndex + i] = digits[i];
      lastFilled = startIndex + i;
    }
    otp = newOtp;
    focusedIndex = Math.min(lastFilled + 1, 5);
  }

  function handleOtpChange(index: number, value: string) {
    const digits = value.replace(/\D/g, "");

    if (!digits) {
      const newOtp = [...otp];
      newOtp[index] = "";
      otp = newOtp;
      return;
    }

    if (digits.length === 1) {
      const newOtp = [...otp];
      newOtp[index] = digits;
      otp = newOtp;
      if (index < 5) {
        focusedIndex = index + 1;
      }
      return;
    }

    if (digits.length === 2 && otp[index]) {
      const typedChar = digits[0] === otp[index] ? digits[1] : digits[0];
      const newOtp = [...otp];
      newOtp[index] = typedChar;
      otp = newOtp;
      if (index < 5) {
        focusedIndex = index + 1;
      }
      return;
    }

    fillOtp(digits, index);
  }

  function handleBackspace(index: number) {
    if (otp[index]) {
      const newOtp = [...otp];
      newOtp[index] = "";
      otp = newOtp;
    } else if (index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      otp = newOtp;
      focusedIndex = index - 1;
    }
  }

  return {
    getOtp: () => [...otp],
    getCode: () => otp.join(""),
    getFocusedIndex: () => focusedIndex,
    fillOtp,
    handleOtpChange,
    handleBackspace,
    setFocus: (i: number) => { focusedIndex = i; },
  };
}

function runOtpUxTests() {
  console.log("🧪 Running OTP Input Copy-Paste & Autofill UX Tests...\n");

  // Test 1: Standard 6-digit paste into index 0
  {
    const state = simulateOtpLogic();
    state.fillOtp("482913", 0);
    assert.strictEqual(state.getCode(), "482913");
    assert.deepStrictEqual(state.getOtp(), ["4", "8", "2", "9", "1", "3"]);
    assert.strictEqual(state.getFocusedIndex(), 5);
    console.log("✅ Test 1: Standard 6-digit paste distributes correctly.");
  }

  // Test 2: Formatted paste with spaces (e.g. "4  8  2  9  1  3" or "482 913")
  {
    const state = simulateOtpLogic();
    state.fillOtp("4 8 2 9 1 3", 0);
    assert.strictEqual(state.getCode(), "482913");
    assert.deepStrictEqual(state.getOtp(), ["4", "8", "2", "9", "1", "3"]);
    console.log("✅ Test 2: Spaced OTP ('4 8 2 9 1 3') paste strips spaces and fills 6 boxes.");
  }

  // Test 3: Paste with text prefix (e.g. "OTP: 951357" or "Your code is 951357")
  {
    const state = simulateOtpLogic();
    state.fillOtp("Your code is 951357", 0);
    assert.strictEqual(state.getCode(), "951357");
    assert.deepStrictEqual(state.getOtp(), ["9", "5", "1", "3", "5", "7"]);
    console.log("✅ Test 3: Prefix/suffix text string paste strips non-digits and populates code.");
  }

  // Test 4: Paste full OTP when non-zero box is focused (e.g. user clicked box 2 then pasted)
  {
    const state = simulateOtpLogic();
    state.setFocus(2);
    // When 6 digits are pasted anywhere, full code fills boxes 0..5
    state.fillOtp("654321", 2);
    assert.strictEqual(state.getCode(), "654321");
    assert.deepStrictEqual(state.getOtp(), ["6", "5", "4", "3", "2", "1"]);
    console.log("✅ Test 4: 6-digit paste into mid-box (index 2) populates all 6 slots properly.");
  }

  // Test 5: Mobile SMS / Browser Autofill via onChange
  {
    const state = simulateOtpLogic();
    // Mobile autofill triggers onChange on input 0 with full code
    state.handleOtpChange(0, "789012");
    assert.strictEqual(state.getCode(), "789012");
    assert.strictEqual(state.getFocusedIndex(), 5);
    console.log("✅ Test 5: Mobile SMS autofill triggering onChange distributes all 6 digits.");
  }

  // Test 6: Normal single-digit typing with auto-advance
  {
    const state = simulateOtpLogic();
    state.handleOtpChange(0, "1");
    assert.strictEqual(state.getFocusedIndex(), 1);
    state.handleOtpChange(1, "2");
    assert.strictEqual(state.getFocusedIndex(), 2);
    state.handleOtpChange(2, "3");
    assert.strictEqual(state.getFocusedIndex(), 3);
    assert.strictEqual(state.getCode(), "123");
    console.log("✅ Test 6: Single-digit typing advances focus sequentially.");
  }

  // Test 7: Typing into an already filled box (replace without pre-clearing)
  {
    const state = simulateOtpLogic();
    state.fillOtp("123456", 0);
    // User selects/types '9' into box 2 (which had '3')
    state.handleOtpChange(2, "39");
    assert.strictEqual(state.getOtp()[2], "9");
    assert.strictEqual(state.getCode(), "129456");
    console.log("✅ Test 7: Replacing digit in an already filled box updates value cleanly.");
  }

  // Test 8: Backspace clearing and retreating
  {
    const state = simulateOtpLogic();
    state.fillOtp("123456", 0);
    // Focus is at index 5 with value '6'
    // First backspace clears box 5
    state.handleBackspace(5);
    assert.strictEqual(state.getCode(), "12345");
    // Second backspace on already empty box 5 retreats to box 4 and clears it
    state.handleBackspace(5);
    assert.strictEqual(state.getCode(), "1234");
    assert.strictEqual(state.getFocusedIndex(), 4);
    // Third backspace retreats to box 3 and clears it
    state.handleBackspace(4);
    assert.strictEqual(state.getCode(), "123");
    assert.strictEqual(state.getFocusedIndex(), 3);
    console.log("✅ Test 8: Backspace clears current digit and retreats smoothly.");
  }

  console.log("\n🎉 ALL 8 OTP INPUT & PASTE UX TESTS PASSED SUCCESSFULLY!\n");
}

runOtpUxTests();
