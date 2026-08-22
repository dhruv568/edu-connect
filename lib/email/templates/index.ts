export * from "./verification-email";
export * from "./password-reset-email";
export * from "./verification-templates";

/**
 * Placeholder signatures for future EduConnect module email templates.
 */
export interface WelcomeEmailParams {
  email: string;
  userName: string;
}

export interface TeacherVerificationStatusEmailParams {
  email: string;
  userName: string;
  status: "APPROVED" | "REJECTED" | "SUSPENDED";
  reason?: string;
}

export interface BookingEmailParams {
  email: string;
  userName: string;
  teacherName: string;
  slotTime: string;
}
