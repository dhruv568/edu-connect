import { prisma } from "@/lib/prisma";

export interface CreateNotificationInput {
  userId: string;
  type:
    | "WELCOME"
    | "EMAIL_VERIFIED"
    | "PASSWORD_CHANGED"
    | "LOGIN_ALERT"
    | "TEACHER_VERIFIED"
    | "TEACHER_REJECTED"
    | "PROFILE_APPROVED"
    | "CLASS_BOOKED"
    | "CLASS_CANCELLED"
    | "CLASS_RESCHEDULED"
    | "CLASS_STARTING_SOON"
    | "CLASS_STARTED"
    | "CLASS_COMPLETED"
    | "CLASS_MISSED"
    | "COURSE_ENROLLED"
    | "COURSE_PUBLISHED"
    | "COURSE_UPDATED"
    | "COURSE_COMPLETED"
    | "COURSE_REVIEW_RECEIVED"
    | "PAYMENT_SUCCESS"
    | "PAYMENT_FAILED"
    | "PAYMENT_PENDING"
    | "REFUND_REQUESTED"
    | "REFUND_PROCESSED"
    | "PAYOUT_PROCESSED"
    | "SYSTEM_ANNOUNCEMENT"
    | "SECURITY_ALERT"
    | "INFO"
    | "SUCCESS"
    | "WARNING";
  title: string;
  message: string;
  data?: Record<string, any> | string;
  actionUrl?: string;
  linkUrl?: string;
  expiresAt?: Date;
  idempotencyKey?: string;
}

export interface GetNotificationsOptions {
  filter?: "ALL" | "UNREAD" | "CLASSES" | "COURSES" | "PAYMENTS" | "SYSTEM";
  page?: number;
  limit?: number;
}

export class NotificationService {
  /**
   * Create a single notification with duplicate check
   */
  static async create(input: CreateNotificationInput) {
    const { userId, type, title, message, data, actionUrl, linkUrl, expiresAt, idempotencyKey } = input;

    // Optional duplicate/idempotency protection
    if (idempotencyKey) {
      const dataStrKey = `"idempotencyKey":"${idempotencyKey}"`;
      const existing = await (prisma as any).notification.findFirst({
        where: {
          userId,
          data: { contains: dataStrKey },
        },
      });
      if (existing) {
        return existing;
      }
    }

    let finalDataStr: string | undefined = undefined;
    if (data) {
      if (typeof data === "string") {
        finalDataStr = data;
      } else {
        const enriched = idempotencyKey ? { ...data, idempotencyKey } : data;
        finalDataStr = JSON.stringify(enriched);
      }
    } else if (idempotencyKey) {
      finalDataStr = JSON.stringify({ idempotencyKey });
    }

    const url = actionUrl || linkUrl;

    const notification = await (prisma as any).notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: finalDataStr,
        actionUrl: url,
        linkUrl: url,
        expiresAt,
      },
    });

    return notification;
  }

  /**
   * Batch create notifications
   */
  static async createMany(items: CreateNotificationInput[]) {
    const results = [];
    for (const item of items) {
      const created = await this.create(item);
      results.push(created);
    }
    return results;
  }

  /**
   * Mark specific notification as read for authenticated user
   */
  static async markAsRead(notificationId: string, userId: string) {
    const notification = await (prisma as any).notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new Error("NOT_FOUND: Notification not found or access denied.");
    }

    return await (prisma as any).notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Mark all unread notifications as read for specified user
   */
  static async markAllAsRead(userId: string) {
    return await (prisma as any).notification.updateMany({
      where: { userId, isRead: false },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Delete a notification
   */
  static async delete(notificationId: string, userId: string) {
    const notification = await (prisma as any).notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new Error("NOT_FOUND: Notification not found or access denied.");
    }

    return await (prisma as any).notification.delete({
      where: { id: notificationId },
    });
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(userId: string): Promise<number> {
    return await (prisma as any).notification.count({
      where: { userId, isRead: false },
    });
  }

  /**
   * Get user notifications with filtering & pagination
   */
  static async getUserNotifications(userId: string, options: GetNotificationsOptions = {}) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = { userId };

    const filter = options.filter || "ALL";

    if (filter === "UNREAD") {
      where.isRead = false;
    } else if (filter === "CLASSES") {
      where.type = {
        in: [
          "CLASS_BOOKED",
          "CLASS_CANCELLED",
          "CLASS_RESCHEDULED",
          "CLASS_STARTING_SOON",
          "CLASS_STARTED",
          "CLASS_COMPLETED",
          "CLASS_MISSED",
        ],
      };
    } else if (filter === "COURSES") {
      where.type = {
        in: [
          "COURSE_ENROLLED",
          "COURSE_PUBLISHED",
          "COURSE_UPDATED",
          "COURSE_COMPLETED",
          "COURSE_REVIEW_RECEIVED",
        ],
      };
    } else if (filter === "PAYMENTS") {
      where.type = {
        in: [
          "PAYMENT_SUCCESS",
          "PAYMENT_FAILED",
          "PAYMENT_PENDING",
          "REFUND_REQUESTED",
          "REFUND_PROCESSED",
          "PAYOUT_PROCESSED",
        ],
      };
    } else if (filter === "SYSTEM") {
      where.type = {
        in: ["SYSTEM_ANNOUNCEMENT", "SECURITY_ALERT", "AUTH", "LOGIN_ALERT", "INFO"],
      };
    }

    const notifications = await (prisma as any).notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const total = await (prisma as any).notification.count({ where });
    const unreadCount = await (prisma as any).notification.count({ where: { userId, isRead: false } });

    return {
      notifications,
      total,
      unreadCount,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + notifications.length < total,
    };
  }

  /**
   * Check user notification preference
   */
  static async getPreferences(userId: string) {
    let pref = await (prisma as any).notificationPreference.findUnique({
      where: { userId },
    });

    if (!pref) {
      pref = await (prisma as any).notificationPreference.create({
        data: { userId },
      });
    }

    return pref;
  }

  /**
   * Update user notification preferences
   */
  static async updatePreferences(
    userId: string,
    data: {
      emailCourseUpdates?: boolean;
      emailClassReminders?: boolean;
      emailPaymentUpdates?: boolean;
      emailMarketing?: boolean;
      inAppEnabled?: boolean;
      browserEnabled?: boolean;
    }
  ) {
    return await (prisma as any).notificationPreference.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }
}
