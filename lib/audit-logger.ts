import { prisma } from "@/lib/prisma";

export type AuditEvent =
  | "USER_REGISTERED"
  | "EMAIL_VERIFIED"
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "PASSWORD_RESET_REQUESTED"
  | "PASSWORD_RESET_COMPLETED"
  | "ROLE_ACCESS_DENIED"
  | "PROFILE_UPDATED"
  | "LOGOUT"
  | "TEACHER_VERIFICATION_SUBMITTED"
  | "TEACHER_APPROVED"
  | "TEACHER_REJECTED"
  | "TEACHER_SUSPENDED"
  | "TEACHER_REACTIVATED"
  | "ADMIN_DOCUMENT_VIEWED"
  | "DOCUMENT_UPLOADED"
  | "DOCUMENT_DELETED"
  | "TEACHER_PROFILE_UPDATED"
  | "USER_STATUS_CHANGED"
  | "TEACHER_VERIFICATION_APPROVE"
  | "TEACHER_VERIFICATION_REJECT"
  | "TEACHER_VERIFICATION_SUSPEND"
  | "TEACHER_VERIFICATION_REACTIVATE"
  | "COURSE_MODERATED_APPROVE"
  | "COURSE_MODERATED_REJECT"
  | "COURSE_MODERATED_REQUEST_CHANGES"
  | "COURSE_MODERATED_UNPUBLISH"
  | "COURSE_MODERATED_ARCHIVE"
  | "ADMIN_CANCELLED_LIVE_CLASS"
  | "ADMIN_REFUND_REJECTED"
  | "ADMIN_REFUND_APPROVED"
  | "COMMISSION_SETTINGS_UPDATED"
  | "PLATFORM_SETTINGS_UPDATED"
  | "CATEGORY_CREATED"
  | "CATEGORY_STATUS_TOGGLED"
  | "REPORT_STATUS_CHANGED"
  | string;

export async function logAuditEvent(
  userId: string | null,
  event: AuditEvent,
  metadata?: Record<string, any>,
  ipAddress?: string
) {
  try {
    const metaStr = metadata ? JSON.stringify(metadata) : undefined;
    await prisma.auditLog.create({
      data: {
        userId,
        event,
        metadata: metaStr,
        ipAddress: ipAddress || "127.0.0.1",
      },
    });
    if (process.env.NODE_ENV === "development") {
      console.log(`🛡️ [AUDIT LOG]: ${event} | User: ${userId || "ANONYMOUS"}`, metadata || "");
    }
  } catch (err) {
    console.error("❌ Audit Logger Error:", err);
  }
}

export const AuditLogger = {
  log: async (params: {
    userId: string | null;
    event: AuditEvent;
    metadata?: Record<string, any>;
    ipAddress?: string;
  }) => {
    return logAuditEvent(params.userId, params.event, params.metadata, params.ipAddress);
  },
};
