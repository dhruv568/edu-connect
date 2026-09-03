import { NotificationService } from "./notification-service";
import { EmailService } from "@/lib/email/email-service";
import { generateNotificationEmailHtml } from "@/lib/email/templates/verification-templates";
import { getEmailProvider } from "@/lib/email/email-service";
import { prisma } from "@/lib/prisma";
import { formatPaise } from "@/lib/currency";

export type EventType =
  | "auth.welcome"
  | "auth.email_verified"
  | "auth.password_changed"
  | "teacher.verified"
  | "teacher.rejected"
  | "class.booked"
  | "class.cancelled"
  | "class.starting_soon"
  | "class.started"
  | "class.completed"
  | "course.enrolled"
  | "course.published"
  | "course.completed"
  | "course.review_received"
  | "payment.captured"
  | "payment.failed"
  | "refund.requested"
  | "refund.processed"
  | "payout.processed"
  | "system.announcement";

export interface EventPayload {
  userId: string;
  actorId?: string;
  actorRole?: string;
  data?: Record<string, any>;
  idempotencyKey?: string;
}

export class EventService {
  /**
   * Emit an event and trigger notification, email, and activity logging
   */
  static async emit(event: EventType, payload: EventPayload) {
    const { userId, actorId, actorRole, data = {}, idempotencyKey } = payload;

    try {
      // 1. Fetch target user and notification preferences
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true, notificationPreference: true },
      });

      if (!user) return;

      const userName = user.profile ? `${user.profile.firstName} ${user.profile.lastName}`.trim() : user.email;
      const prefs = user.notificationPreference || {
        emailCourseUpdates: true,
        emailClassReminders: true,
        emailPaymentUpdates: true,
        emailMarketing: false,
        inAppEnabled: true,
      };

      // 2. Dispatch specific event logic
      switch (event) {
        case "auth.welcome": {
          await NotificationService.create({
            userId,
            type: "WELCOME",
            title: "Welcome to EduConnect! 🎓",
            message: "Your account is set up. Explore courses or schedule live learning sessions.",
            actionUrl: "/courses",
            idempotencyKey,
          });
          break;
        }

        case "teacher.verified": {
          await NotificationService.create({
            userId,
            type: "TEACHER_VERIFIED",
            title: "Verification Approved! 🎉",
            message: "Your teacher application has been verified. You can now host live classes and publish courses.",
            actionUrl: "/teacher/dashboard",
            idempotencyKey,
          });

          if (prefs.emailCourseUpdates) {
            const provider = getEmailProvider();
            await provider.sendNotificationEmail({
              email: user.email,
              recipientName: userName,
              subject: "Teacher Application Approved 🎉",
              headline: "Congratulations! You are now a Verified Educator",
              bodyText: "Your credentials have been audited and approved by EduConnect Administration. You are now live on our educator marketplace.",
              statusBadgeText: "APPROVED",
              statusBadgeVariant: "success",
              actionUrl: `${process.env.APP_URL || "http://localhost:3000"}/teacher/dashboard`,
              actionText: "Go to Teacher Dashboard",
            });
          }
          break;
        }

        case "teacher.rejected": {
          const reason = data.reason || "Application did not meet verification guidelines.";
          await NotificationService.create({
            userId,
            type: "TEACHER_REJECTED",
            title: "Teacher Verification Action Needed",
            message: `Your application requires revisions: ${reason}`,
            actionUrl: "/teacher/onboarding",
            idempotencyKey,
          });

          if (prefs.emailCourseUpdates) {
            const provider = getEmailProvider();
            await provider.sendNotificationEmail({
              email: user.email,
              recipientName: userName,
              subject: "EduConnect Verification Update",
              headline: "Revisions Required for Educator Profile",
              bodyText: "Our administrative team reviewed your application and requested updating your documents or profile details.",
              statusBadgeText: "REVISIONS NEEDED",
              statusBadgeVariant: "warning",
              reasonText: reason,
              actionUrl: `${process.env.APP_URL || "http://localhost:3000"}/teacher/onboarding`,
              actionText: "Update Application",
            });
          }
          break;
        }

        case "class.booked": {
          const classTitle = data.classTitle || "Live Class";
          const startTime = data.startTime || "";
          await NotificationService.create({
            userId,
            type: "CLASS_BOOKED",
            title: "Live Class Booked 📅",
            message: `You are booked for "${classTitle}" starting ${startTime}.`,
            actionUrl: "/student/dashboard",
            data,
            idempotencyKey,
          });

          // Also notify teacher if teacherId provided
          if (data.teacherUserId && data.teacherUserId !== userId) {
            await NotificationService.create({
              userId: data.teacherUserId,
              type: "CLASS_BOOKED",
              title: "New Student Booking 🎓",
              message: `${userName} booked your class "${classTitle}".`,
              actionUrl: "/teacher/live-classes",
              data,
            });
          }

          if (prefs.emailClassReminders) {
            const provider = getEmailProvider();
            await provider.sendNotificationEmail({
              email: user.email,
              recipientName: userName,
              subject: `Booking Confirmed: ${classTitle}`,
              headline: "Your Live Session is Confirmed!",
              bodyText: `You have successfully reserved your seat for "${classTitle}". Make sure to join on time!`,
              statusBadgeText: "BOOKED",
              statusBadgeVariant: "success",
              actionUrl: `${process.env.APP_URL || "http://localhost:3000"}/student/dashboard`,
              actionText: "View My Schedule",
            });
          }
          break;
        }

        case "class.cancelled": {
          const classTitle = data.classTitle || "Live Class";
          const reason = data.reason || "Slot cancelled by educator.";
          await NotificationService.create({
            userId,
            type: "CLASS_CANCELLED",
            title: "Class Cancelled ⚠️",
            message: `The session "${classTitle}" was cancelled. ${reason}`,
            actionUrl: "/student/dashboard",
            data,
            idempotencyKey,
          });

          if (prefs.emailClassReminders) {
            const provider = getEmailProvider();
            await provider.sendNotificationEmail({
              email: user.email,
              recipientName: userName,
              subject: `Class Cancelled: ${classTitle}`,
              headline: "Live Class Session Cancelled",
              bodyText: `The upcoming session "${classTitle}" has been cancelled by the educator. Any payment made will be refunded automatically.`,
              statusBadgeText: "CANCELLED",
              statusBadgeVariant: "danger",
              reasonText: reason,
            });
          }
          break;
        }

        case "class.starting_soon": {
          const classTitle = data.classTitle || "Live Class";
          const timeLabel = data.timeLabel || "soon";
          await NotificationService.create({
            userId,
            type: "CLASS_STARTING_SOON",
            title: `Class starts in ${timeLabel} 🔔`,
            message: `"${classTitle}" is starting shortly. Get ready to join!`,
            actionUrl: data.joinUrl || "/student/dashboard",
            data,
            idempotencyKey,
          });
          break;
        }

        case "course.enrolled": {
          const courseTitle = data.courseTitle || "Course";
          await NotificationService.create({
            userId,
            type: "COURSE_ENROLLED",
            title: "Course Enrolled! 🎓",
            message: `You enrolled in "${courseTitle}". Start learning now!`,
            actionUrl: `/learn/${data.courseSlug || ""}`,
            data,
            idempotencyKey,
          });

          // Notify teacher if teacherUserId provided
          if (data.teacherUserId && data.teacherUserId !== userId) {
            await NotificationService.create({
              userId: data.teacherUserId,
              type: "COURSE_ENROLLED",
              title: "New Student Enrolled 📈",
              message: `${userName} enrolled in your course "${courseTitle}".`,
              actionUrl: "/teacher/courses",
              data,
            });
          }

          if (prefs.emailCourseUpdates) {
            const provider = getEmailProvider();
            await provider.sendNotificationEmail({
              email: user.email,
              recipientName: userName,
              subject: `Successfully Enrolled: ${courseTitle}`,
              headline: "Welcome to Your New Course!",
              bodyText: `You successfully enrolled in "${courseTitle}". Access all lessons and resources inside your student dashboard.`,
              statusBadgeText: "ENROLLED",
              statusBadgeVariant: "success",
              actionUrl: `${process.env.APP_URL || "http://localhost:3000"}/learn/${data.courseSlug || ""}`,
              actionText: "Start Learning Now",
            });
          }
          break;
        }

        case "payment.captured": {
          const amountFormatted = formatPaise(data.amountPaise);
          const title = data.title || "EduConnect Order";
          await NotificationService.create({
            userId,
            type: "PAYMENT_SUCCESS",
            title: "Payment Successful 💳",
            message: `Payment of ${amountFormatted} for "${title}" completed successfully.`,
            actionUrl: "/student/payments",
            data,
            idempotencyKey,
          });

          // Notify teacher of earning if teacherUserId provided
          if (data.teacherUserId && data.teacherUserId !== userId) {
            await NotificationService.create({
              userId: data.teacherUserId,
              type: "PAYMENT_SUCCESS",
              title: "Payment Received 💰",
              message: `Earned payment for purchase of "${title}".`,
              actionUrl: "/teacher/earnings",
              data,
            });
          }

          if (prefs.emailPaymentUpdates) {
            const provider = getEmailProvider();
            await provider.sendNotificationEmail({
              email: user.email,
              recipientName: userName,
              subject: `Payment Receipt — ${amountFormatted}`,
              headline: "Payment Confirmation Receipt",
              bodyText: `Thank you for your purchase. We received your payment of ${amountFormatted} for "${title}". Order ID: ${data.orderId || "N/A"}.`,
              statusBadgeText: "SUCCESSFUL",
              statusBadgeVariant: "success",
              actionUrl: `${process.env.APP_URL || "http://localhost:3000"}/student/payments`,
              actionText: "View Payment Details",
            });
          }
          break;
        }

        case "refund.processed": {
          const amountFormatted = formatPaise(data.amountPaise);
          await NotificationService.create({
            userId,
            type: "REFUND_PROCESSED",
            title: "Refund Processed 💸",
            message: `Refund of ${amountFormatted} has been issued to your original payment method.`,
            actionUrl: "/student/payments",
            data,
            idempotencyKey,
          });

          if (prefs.emailPaymentUpdates) {
            const provider = getEmailProvider();
            await provider.sendNotificationEmail({
              email: user.email,
              recipientName: userName,
              subject: `Refund Processed — ${amountFormatted}`,
              headline: "Refund Confirmation",
              bodyText: `Your refund of ${amountFormatted} was successfully processed. Funds will reflect in your account within 5-7 business days.`,
              statusBadgeText: "REFUNDED",
              statusBadgeVariant: "success",
            });
          }
          break;
        }

        default: {
          await NotificationService.create({
            userId,
            type: "INFO",
            title: data.title || "EduConnect Update",
            message: data.message || "System event occurred.",
            actionUrl: data.actionUrl,
            data,
            idempotencyKey,
          });
          break;
        }
      }

      // 3. Record Activity Log entry for auditability
      await (prisma as any).activityLog.create({
        data: {
          actorId: actorId || userId,
          actorRole: actorRole || user.role,
          action: event.toUpperCase().replace(".", "_"),
          entityType: data.entityType || null,
          entityId: data.entityId || null,
          metadata: JSON.stringify(data),
        },
      });
    } catch (err) {
      console.error("❌ [EventService Error]:", err);
    }
  }
}
