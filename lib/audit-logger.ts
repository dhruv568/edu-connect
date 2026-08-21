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
  | "TEACHER_PROFILE_UPDATED";

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
