/**
 * EduConnects Central Academic Configuration & Constants
 * Single source of truth for learner education levels, grades, streams,
 * competitive exams, and diploma branches.
 */

export type EducationType = "SCHOOL" | "DIPLOMA";

export interface GradeOption {
  value: string;
  label: string;
  isSeniorSecondary: boolean; // True for Grades 11 and 12
}

// 1. School Grades (1 to 10: Foundation/Secondary, 11 to 12: Senior Secondary)
export const SCHOOL_GRADES: GradeOption[] = [
  { value: "Grade 1", label: "Grade 1", isSeniorSecondary: false },
  { value: "Grade 2", label: "Grade 2", isSeniorSecondary: false },
  { value: "Grade 3", label: "Grade 3", isSeniorSecondary: false },
  { value: "Grade 4", label: "Grade 4", isSeniorSecondary: false },
  { value: "Grade 5", label: "Grade 5", isSeniorSecondary: false },
  { value: "Grade 6", label: "Grade 6", isSeniorSecondary: false },
  { value: "Grade 7", label: "Grade 7", isSeniorSecondary: false },
  { value: "Grade 8", label: "Grade 8", isSeniorSecondary: false },
  { value: "Grade 9", label: "Grade 9", isSeniorSecondary: false },
  { value: "Grade 10", label: "Grade 10", isSeniorSecondary: false },
  { value: "Grade 11", label: "Grade 11", isSeniorSecondary: true },
  { value: "Grade 12", label: "Grade 12", isSeniorSecondary: true },
];

// Helper to determine if a grade is senior secondary (Grades 11 or 12)
export function isSeniorSecondaryGrade(grade?: string | null): boolean {
  if (!grade) return false;
  const normalized = grade.trim().toLowerCase();
  return (
    normalized === "grade 11" ||
    normalized === "grade 12" ||
    normalized === "class 11" ||
    normalized === "class 12" ||
    normalized === "11" ||
    normalized === "12"
  );
}

// 2. Stream selection for Grades 11 & 12
export const SENIOR_SECONDARY_STREAMS = [
  "Science",
  "Commerce",
  "Arts/Humanities",
  "Other",
] as const;

export type SeniorSecondaryStream = (typeof SENIOR_SECONDARY_STREAMS)[number];

// 3. Optional Competitive Exam preferences for Grades 11 & 12
export const COMPETITIVE_EXAMS = [
  "JEE",
  "NEET",
  "CUET",
  "CLAT",
  "NDA",
  "CA Foundation",
  "Other",
] as const;

export type CompetitiveExam = (typeof COMPETITIVE_EXAMS)[number];

// 4. Diploma Branches / Fields
export const DIPLOMA_BRANCHES = [
  "Computer Engineering",
  "Mechanical Engineering",
  "Electrical Engineering",
  "Civil Engineering",
  "Electronics & Communication",
  "Information Technology",
  "Other",
] as const;

export type DiplomaBranch = (typeof DIPLOMA_BRANCHES)[number];

// Helper to construct a human-readable summary badge for a learner's profile
export function formatAcademicProfileSummary(profile?: {
  educationType?: string | null;
  gradeLevel?: string | null;
  stream?: string | null;
  competitiveExam?: string | null;
  diplomaBranch?: string | null;
}): string {
  if (!profile) return "Academic Profile Not Set";

  if (profile.educationType === "DIPLOMA") {
    return profile.diplomaBranch ? `Diploma • ${profile.diplomaBranch}` : "Diploma Learner";
  }

  // School
  if (!profile.gradeLevel) return "School Learner";

  if (isSeniorSecondaryGrade(profile.gradeLevel)) {
    const parts = [profile.gradeLevel];
    if (profile.stream) parts.push(profile.stream);
    if (profile.competitiveExam && profile.competitiveExam !== "None") {
      parts.push(`Target: ${profile.competitiveExam}`);
    }
    return parts.join(" • ");
  }

  return profile.gradeLevel;
}

// Helper to extract search & recommendation keywords from an academic profile
export function getAcademicSearchKeywords(profile?: {
  educationType?: string | null;
  gradeLevel?: string | null;
  stream?: string | null;
  competitiveExam?: string | null;
  diplomaBranch?: string | null;
}): string[] {
  if (!profile) return [];
  const keywords: string[] = [];

  if (profile.educationType === "DIPLOMA") {
    keywords.push("diploma", "engineering", "polytechnic");
    if (profile.diplomaBranch) {
      keywords.push(profile.diplomaBranch.toLowerCase());
      if (profile.diplomaBranch === "Computer Engineering") {
        keywords.push("computer", "programming", "coding", "software", "cs", "it");
      } else if (profile.diplomaBranch === "Mechanical Engineering") {
        keywords.push("mechanical", "mechanics", "thermodynamics", "drawing");
      } else if (profile.diplomaBranch === "Electrical Engineering") {
        keywords.push("electrical", "circuits", "power");
      } else if (profile.diplomaBranch === "Civil Engineering") {
        keywords.push("civil", "structures", "surveying");
      } else if (profile.diplomaBranch === "Electronics & Communication") {
        keywords.push("electronics", "communication", "ece");
      } else if (profile.diplomaBranch === "Information Technology") {
        keywords.push("information technology", "it", "web", "databases");
      }
    }
    return keywords;
  }

  // School
  if (profile.gradeLevel) {
    keywords.push(profile.gradeLevel.toLowerCase());
  }

  if (isSeniorSecondaryGrade(profile.gradeLevel)) {
    if (profile.stream) {
      keywords.push(profile.stream.toLowerCase());
      if (profile.stream === "Science") {
        keywords.push("physics", "chemistry", "mathematics", "biology");
      } else if (profile.stream === "Commerce") {
        keywords.push("accountancy", "business studies", "economics", "commerce");
      } else if (profile.stream === "Arts/Humanities") {
        keywords.push("history", "political science", "psychology", "sociology", "humanities");
      }
    }

    if (profile.competitiveExam && profile.competitiveExam !== "None") {
      keywords.push(profile.competitiveExam.toLowerCase());
      if (profile.competitiveExam === "JEE") {
        keywords.push("iit", "jee main", "jee advanced", "engineering entrance");
      } else if (profile.competitiveExam === "NEET") {
        keywords.push("medical entrance", "neet-ug", "biology", "pmt");
      } else if (profile.competitiveExam === "CUET") {
        keywords.push("cuet-ug", "central university");
      } else if (profile.competitiveExam === "NDA") {
        keywords.push("defence", "national defence academy");
      } else if (profile.competitiveExam === "CA Foundation") {
        keywords.push("chartered accountant", "accounting");
      }
    }
  }

  return keywords;
}
