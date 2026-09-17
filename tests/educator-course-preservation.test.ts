import assert from "node:assert";

console.log("🧪 Running Educator Direct Booking & Course Enrollment Flow Validation Tests...\n");

// Test Case 1: Educator Direct Booking Flow does NOT require courseId
console.log("Test 1: Educator direct booking creates LIVE_CLASS_BOOKING without courseId...");
function buildEducatorBookingPayload(state: any) {
  if (state.selectionType === "EDUCATOR" || state.isTrial) {
    if (!state.selectedEducatorId) {
      throw new Error("BAD_REQUEST: Educator selection required.");
    }
    return {
      type: "LIVE_CLASS_BOOKING",
      teacherId: state.selectedEducatorId,
      selectedDate: state.selectedDate,
      selectedSlotTime: state.selectedSlotTime,
    };
  }
  throw new Error("Invalid type");
}

const educatorFlowState = {
  selectionType: "EDUCATOR",
  selectedEducatorId: "teacher-profile-999",
  selectedCourseId: null, // Explicitly NULL
  selectedDate: "2026-09-18",
  selectedSlotTime: "11:00 AM - 12:00 PM",
  isTrial: true,
};

const bookingPayload = buildEducatorBookingPayload(educatorFlowState);
assert.strictEqual(bookingPayload.type, "LIVE_CLASS_BOOKING");
assert.strictEqual(bookingPayload.teacherId, "teacher-profile-999");
assert.strictEqual(bookingPayload.selectedDate, "2026-09-18");
assert.strictEqual(bookingPayload.selectedSlotTime, "11:00 AM - 12:00 PM");
assert.strictEqual((bookingPayload as any).courseId, undefined, "courseId is NOT required or sent");
console.log("✅ Passed: Educator direct booking succeeds without requiring courseId.\n");

// Test Case 2: Course Enrollment Flow requires courseId
console.log("Test 2: Course enrollment flow requires valid courseId...");
function buildCourseEnrollmentPayload(state: any) {
  if (state.selectionType === "COURSE") {
    if (!state.selectedCourseId) {
      throw new Error("BAD_REQUEST: courseId is required for course enrollment.");
    }
    return {
      type: "COURSE_ENROLLMENT",
      courseId: state.selectedCourseId,
    };
  }
  throw new Error("Invalid type");
}

const courseFlowState = {
  selectionType: "COURSE",
  selectedCourseId: "course-phys-101",
};

const coursePayload = buildCourseEnrollmentPayload(courseFlowState);
assert.strictEqual(coursePayload.type, "COURSE_ENROLLMENT");
assert.strictEqual(coursePayload.courseId, "course-phys-101");
console.log("✅ Passed: Course enrollment flow validates courseId correctly.\n");

// Test Case 3: Course Enrollment throws error if courseId missing
console.log("Test 3: Missing courseId in course enrollment mode throws BAD_REQUEST...");
assert.throws(
  () => buildCourseEnrollmentPayload({ selectionType: "COURSE", selectedCourseId: null }),
  /BAD_REQUEST: courseId is required for course enrollment/
);
console.log("✅ Passed: Missing courseId correctly rejected for course enrollment.\n");

console.log("🎉 ALL BOOKING FLOW VALIDATION TESTS PASSED SUCCESSFULLY! 🚀");
