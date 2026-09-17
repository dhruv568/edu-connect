import assert from "node:assert";

console.log("🧪 Running Learner Educator-Course Preservation & Payment Order Validation Test...\n");

// 1. Simulate Educator Selection & Course ID Auto-Resolution
function resolveCourseForEducator(educator: any, coursesList: any[]) {
  let matchedCourse = educator.courses && educator.courses.length > 0 ? educator.courses[0] : null;
  if (!matchedCourse && coursesList.length > 0) {
    matchedCourse = coursesList.find((c: any) => c.teacherId === educator.id || c.teacherId === educator.teacherProfileId) || coursesList[0];
  }
  return matchedCourse;
}

// Test Case A: Educator with published courses
console.log("Test A: Educator with published courses resolves first course ID...");
const sampleEducatorA = {
  id: "teacher-user-123",
  teacherProfileId: "teacher-profile-123",
  courses: [{ id: "course-abc-1", title: "Physics 101" }],
};
const courseA = resolveCourseForEducator(sampleEducatorA, []);
assert.ok(courseA, "Course object resolved");
assert.strictEqual(courseA.id, "course-abc-1", "Resolved course ID matches educator's course");
console.log("✅ Passed: Educator course ID auto-resolved.\n");

// Test Case B: Educator without inline courses array, but present in catalog
console.log("Test B: Educator without inline courses resolves matching course from catalog...");
const sampleEducatorB = {
  id: "teacher-user-456",
  teacherProfileId: "teacher-profile-456",
  courses: [],
};
const catalog = [
  { id: "course-xyz-9", title: "Chemistry 201", teacherId: "teacher-user-456" },
];
const courseB = resolveCourseForEducator(sampleEducatorB, catalog);
assert.ok(courseB, "Course object resolved from catalog");
assert.strictEqual(courseB.id, "course-xyz-9", "Resolved course ID matches teacherId in catalog");
console.log("✅ Passed: Catalog matching resolved course ID.\n");

// Test Case C: Payment payload pre-validation
console.log("Test C: Pre-payment payload validation prevents missing courseId error...");
function validatePaymentPayload(state: any, coursesList: any[]) {
  let courseIdToUse = state.selectedCourseId;

  if (!courseIdToUse) {
    if (state.selectedCourse?.id) {
      courseIdToUse = state.selectedCourse.id;
    } else if (state.selectedEducator) {
      const match = resolveCourseForEducator(state.selectedEducator, coursesList);
      courseIdToUse = match ? match.id : null;
    }
  }

  if (!courseIdToUse) {
    throw new Error("BAD_REQUEST: courseId is required for course enrollment.");
  }

  return {
    type: "COURSE_ENROLLMENT",
    courseId: courseIdToUse,
  };
}

const stateWithEducatorOnly = {
  selectedEducatorId: "teacher-user-123",
  selectedEducator: sampleEducatorA,
  selectedCourseId: null,
  selectedCourse: null,
};

const validatedPayload = validatePaymentPayload(stateWithEducatorOnly, []);
assert.strictEqual(validatedPayload.type, "COURSE_ENROLLMENT");
assert.strictEqual(validatedPayload.courseId, "course-abc-1");
assert.ok(validatedPayload.courseId, "courseId is populated and valid");
console.log("✅ Passed: Payload validation populates courseId automatically.\n");

console.log("🎉 ALL EDUCATOR-COURSE PRESERVATION TESTS PASSED SUCCESSFULLY! 🚀");
