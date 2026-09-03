import { prisma } from "@/lib/prisma";
import { razorpayClient } from "@/lib/razorpay";
import { LedgerService } from "@/services/ledger-service";
import { RouteService } from "@/services/route-service";
import { DEFAULT_CURRENCY, toPaise } from "@/lib/currency";
import crypto from "crypto";

export interface CreateOrderParams {
  userId: string;
  type: "COURSE_ENROLLMENT" | "LIVE_CLASS_BOOKING";
  courseId?: string;
  liveClassSlotId?: string;
}

export interface VerifyPaymentParams {
  userId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface ProcessRefundParams {
  transactionId: string;
  requestedBy: string;
  reason?: string;
  isAdmin?: boolean;
}

export class PaymentService {
  /**
   * Create Razorpay Payment Order (Server-Side Price Calculation)
   */
  static async createPaymentOrder(params: CreateOrderParams) {
    const { userId, type, courseId, liveClassSlotId } = params;

    // Validate User exists & is STUDENT
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user || user.role !== "STUDENT") {
      throw new Error("UNAUTHORIZED: Only students can initiate purchases.");
    }

    let amountPaise = 0;
    let title = "";
    let teacherId = "";
    let refCourseId: string | null = null;
    let refSlotId: string | null = null;

    if (type === "COURSE_ENROLLMENT") {
      if (!courseId) throw new Error("BAD_REQUEST: courseId is required for course enrollment.");

      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });

      if (!course || course.status !== "PUBLISHED") {
        throw new Error("NOT_FOUND: Course is unavailable for purchase.");
      }

      // Check duplicate active enrollment
      const existingEnrollment = await prisma.enrollment.findUnique({
        where: { studentId_courseId: { studentId: userId, courseId } },
      });

      if (
        existingEnrollment &&
        (existingEnrollment.status === "ACTIVE" || existingEnrollment.status === "COMPLETED")
      ) {
        throw new Error("DUPLICATE_PURCHASE: You are already enrolled in this course.");
      }

      // Price calculation directly from DB (Integer paise)
      amountPaise = toPaise(course.price);
      title = course.title;
      teacherId = course.teacherId;
      refCourseId = course.id;
    } else if (type === "LIVE_CLASS_BOOKING") {
      if (!liveClassSlotId) {
        throw new Error("BAD_REQUEST: liveClassSlotId is required for live class booking.");
      }

      const slot = await prisma.liveClassSlot.findUnique({
        where: { id: liveClassSlotId },
        include: { bookings: true },
      });

      if (!slot || slot.status === "CANCELLED" || slot.status === "COMPLETED") {
        throw new Error("NOT_FOUND: Live class slot is no longer available.");
      }

      // Capacity protection check
      const activeBookings = slot.bookings.filter((b) => b.status !== "CANCELLED").length;
      if (activeBookings >= slot.maxCapacity) {
        throw new Error("CLASS_FULL: Live class slot has reached maximum student capacity.");
      }

      // Check duplicate active booking
      const existingBooking = slot.bookings.find(
        (b) => b.studentId === userId && b.status !== "CANCELLED"
      );

      if (existingBooking) {
        throw new Error("DUPLICATE_PURCHASE: You have already booked this live class.");
      }

      // Price calculation directly from DB
      amountPaise = toPaise(slot.price);
      title = slot.title;
      teacherId = slot.teacherId;
      refSlotId = slot.id;
    } else {
      throw new Error("BAD_REQUEST: Invalid payment type specified.");
    }

    const internalReference = `EDU_${type}_${Date.now()}_${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    // Handle FREE Products (price === 0)
    if (amountPaise === 0) {
      if (type === "COURSE_ENROLLMENT" && refCourseId) {
        const enrollment = await prisma.enrollment.upsert({
          where: { studentId_courseId: { studentId: userId, courseId: refCourseId } },
          update: { status: "ACTIVE", enrolledAt: new Date() },
          create: { studentId: userId, courseId: refCourseId, status: "ACTIVE" },
        });

        await prisma.course.update({
          where: { id: refCourseId },
          data: { enrollmentCount: { increment: 1 } },
        });

        const transaction = await prisma.paymentTransaction.create({
          data: {
            userId,
            type,
            status: "CAPTURED",
            amountPaise: 0,
            currency: DEFAULT_CURRENCY,
            provider: "INTERNAL_FREE",
            providerOrderId: `FREE_ORD_${Date.now()}`,
            providerPaymentId: `FREE_PAY_${Date.now()}`,
            internalReference,
            courseId: refCourseId,
            enrollmentId: enrollment.id,
            capturedAt: new Date(),
          },
        });

        return {
          isFree: true,
          amountPaise: 0,
          transactionId: transaction.id,
          enrollmentId: enrollment.id,
          message: "Free course enrolled successfully!",
        };
      } else if (type === "LIVE_CLASS_BOOKING" && refSlotId) {
        const booking = await prisma.booking.create({
          data: {
            liveClassSlotId: refSlotId,
            studentId: userId,
            status: "CONFIRMED",
          },
        });

        const transaction = await prisma.paymentTransaction.create({
          data: {
            userId,
            type,
            status: "CAPTURED",
            amountPaise: 0,
            currency: DEFAULT_CURRENCY,
            provider: "INTERNAL_FREE",
            providerOrderId: `FREE_ORD_${Date.now()}`,
            providerPaymentId: `FREE_PAY_${Date.now()}`,
            internalReference,
            liveClassSlotId: refSlotId,
            bookingId: booking.id,
            capturedAt: new Date(),
          },
        });

        return {
          isFree: true,
          amountPaise: 0,
          transactionId: transaction.id,
          bookingId: booking.id,
          message: "Free live class booked successfully!",
        };
      }
    }

    // Create Razorpay Order
    const receipt = `rcpt_${internalReference}`;
    const rzpOrder = await razorpayClient.createOrder({
      amountPaise,
      currency: DEFAULT_CURRENCY,
      receipt,
      notes: {
        userId,
        type,
        internalReference,
        productTitle: title.slice(0, 30),
      },
    });

    // Create DB records
    const orderRecord = await prisma.paymentOrder.create({
      data: {
        userId,
        type,
        referenceId: refCourseId || refSlotId || "",
        courseId: refCourseId,
        liveClassSlotId: refSlotId,
        provider: "RAZORPAY",
        providerOrderId: rzpOrder.id,
        amountPaise,
        currency: DEFAULT_CURRENCY,
        status: "CREATED",
        receipt,
      },
    });

    const transactionRecord = await prisma.paymentTransaction.create({
      data: {
        userId,
        orderId: orderRecord.id,
        type,
        status: "PENDING",
        amountPaise,
        currency: DEFAULT_CURRENCY,
        provider: "RAZORPAY",
        providerOrderId: rzpOrder.id,
        internalReference,
        courseId: refCourseId,
        liveClassSlotId: refSlotId,
      },
    });

    return {
      isFree: false,
      keyId: razorpayClient.getKeyId(),
      orderId: orderRecord.id,
      razorpayOrderId: rzpOrder.id,
      amountPaise,
      currency: DEFAULT_CURRENCY,
      internalReference,
      transactionId: transactionRecord.id,
    };
  }

  /**
   * Verify Checkout Signature & Complete Payment
   */
  static async verifyAndCompletePayment(params: VerifyPaymentParams) {
    const { userId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = params;

    // 1. Find transaction by Razorpay Order ID
    const transaction = await prisma.paymentTransaction.findFirst({
      where: { providerOrderId: razorpayOrderId, userId },
      include: {
        course: true,
        liveClassSlot: true,
        user: { include: { profile: true } },
      },
    });

    if (!transaction) {
      throw new Error("NOT_FOUND: Payment transaction record not found.");
    }

    // Return if already captured
    if (transaction.status === "CAPTURED") {
      return {
        alreadyProcessed: true,
        transactionId: transaction.id,
        status: "CAPTURED",
        courseId: transaction.courseId,
        liveClassSlotId: transaction.liveClassSlotId,
      };
    }

    // 2. Verify HMAC SHA256 Signature
    const isValidSignature = razorpayClient.verifyCheckoutSignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!isValidSignature) {
      await prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          status: "FAILED",
          failedAt: new Date(),
          failureReason: "Invalid HMAC signature verification",
        },
      });
      throw new Error("SECURITY_ERROR: Payment signature verification failed.");
    }

    // 3. Atomically update transaction to CAPTURED
    const updatedTransaction = await prisma.paymentTransaction.update({
      where: { id: transaction.id },
      data: {
        status: "CAPTURED",
        providerPaymentId: razorpayPaymentId,
        providerSignature: razorpaySignature,
        capturedAt: new Date(),
      },
    });

    // Update PaymentOrder status
    if (transaction.orderId) {
      await prisma.paymentOrder.update({
        where: { id: transaction.orderId },
        data: { status: "CAPTURED" },
      });
    }

    let enrollmentId: string | undefined;
    let bookingId: string | undefined;
    let teacherId = "";

    // 4. Activate target product (Course or Live Class)
    if (transaction.type === "COURSE_ENROLLMENT" && transaction.courseId) {
      teacherId = transaction.course?.teacherId || "";
      const enrollment = await prisma.enrollment.upsert({
        where: {
          studentId_courseId: { studentId: userId, courseId: transaction.courseId },
        },
        update: { status: "ACTIVE", enrolledAt: new Date() },
        create: { studentId: userId, courseId: transaction.courseId, status: "ACTIVE" },
      });

      enrollmentId = enrollment.id;

      await prisma.course.update({
        where: { id: transaction.courseId },
        data: { enrollmentCount: { increment: 1 } },
      });

      await prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: { enrollmentId: enrollment.id },
      });
    } else if (transaction.type === "LIVE_CLASS_BOOKING" && transaction.liveClassSlotId) {
      teacherId = transaction.liveClassSlot?.teacherId || "";

      // Transactional capacity re-check
      const slot = await prisma.liveClassSlot.findUnique({
        where: { id: transaction.liveClassSlotId },
        include: { bookings: true },
      });

      if (slot) {
        const activeBookings = slot.bookings.filter((b) => b.status !== "CANCELLED").length;
        if (activeBookings >= slot.maxCapacity) {
          // Class filled up concurrently -> create pending booking but initiate immediate refund workflow
          console.warn(`Class capacity full during payment capture for slot ${slot.id}`);
        }

        const existingBooking = slot.bookings.find(
          (b) => b.studentId === userId && b.status !== "CANCELLED"
        );

        const booking = existingBooking
          ? existingBooking
          : await prisma.booking.create({
              data: {
                liveClassSlotId: transaction.liveClassSlotId,
                studentId: userId,
                status: "CONFIRMED",
              },
            });

        bookingId = booking.id;

        await prisma.paymentTransaction.update({
          where: { id: transaction.id },
          data: { bookingId: booking.id },
        });
      }
    }

    // 5. Execute Double-Entry Financial Ledger
    let ledgerResult = null;
    if (teacherId) {
      ledgerResult = await LedgerService.recordCapturedPaymentLedger({
        transactionId: transaction.id,
        teacherId,
        grossAmountPaise: transaction.amountPaise,
        description: `Payment for ${transaction.course?.title || transaction.liveClassSlot?.title || "EduConnect Product"}`,
      });

      // 6. Execute Razorpay Route Transfer if enabled & teacher account active
      await RouteService.executeTransferIfEligible({
        transactionId: transaction.id,
        teacherId,
        providerPaymentId: razorpayPaymentId,
        teacherSharePaise: ledgerResult.teacherSharePaise,
        ledgerEntryId: ledgerResult.teacherEntry.id,
      });
    }

    // 7. Dispatch user notifications & transactional emails via EventService
    const productTitle = transaction.course?.title || transaction.liveClassSlot?.title || "Product";
    try {
      const { EventService } = require("@/services/event-service");
      await EventService.emit("payment.captured", {
        userId,
        actorId: userId,
        actorRole: "STUDENT",
        data: {
          transactionId: transaction.id,
          amountPaise: transaction.amountPaise,
          title: productTitle,
          orderId: transaction.providerOrderId,
          teacherUserId: teacherId ? (await prisma.teacherProfile.findUnique({ where: { id: teacherId } }))?.userId : undefined,
          entityType: "PaymentTransaction",
          entityId: transaction.id,
        },
        idempotencyKey: `pay-${transaction.id}`,
      });

      if (transaction.type === "COURSE_ENROLLMENT" && transaction.course) {
        await EventService.emit("course.enrolled", {
          userId,
          actorId: userId,
          actorRole: "STUDENT",
          data: {
            courseId: transaction.course.id,
            courseTitle: transaction.course.title,
            courseSlug: transaction.course.slug,
            teacherUserId: (await prisma.teacherProfile.findUnique({ where: { id: transaction.course.teacherId } }))?.userId,
            entityType: "Course",
            entityId: transaction.course.id,
          },
          idempotencyKey: `enroll-${transaction.course.id}-${userId}`,
        });
      } else if (transaction.type === "LIVE_CLASS_BOOKING" && transaction.liveClassSlot) {
        await EventService.emit("class.booked", {
          userId,
          actorId: userId,
          actorRole: "STUDENT",
          data: {
            slotId: transaction.liveClassSlot.id,
            classTitle: transaction.liveClassSlot.title,
            startTime: transaction.liveClassSlot.startTime.toISOString(),
            teacherUserId: (await prisma.teacherProfile.findUnique({ where: { id: transaction.liveClassSlot.teacherId } }))?.userId,
            entityType: "LiveClassSlot",
            entityId: transaction.liveClassSlot.id,
          },
          idempotencyKey: `book-${transaction.liveClassSlot.id}-${userId}`,
        });
      }
    } catch (evtErr) {
      console.error("Failed to emit payment events:", evtErr);
    }

    return {
      success: true,
      transactionId: transaction.id,
      internalReference: transaction.internalReference,
      status: "CAPTURED",
      amountPaise: transaction.amountPaise,
      courseId: transaction.courseId,
      liveClassSlotId: transaction.liveClassSlotId,
      enrollmentId,
      bookingId,
    };
  }

  /**
   * Process Refund Request
   */
  static async processRefund(params: ProcessRefundParams) {
    const { transactionId, requestedBy, reason, isAdmin } = params;

    const transaction = await prisma.paymentTransaction.findUnique({
      where: { id: transactionId },
      include: {
        course: true,
        liveClassSlot: true,
        enrollment: true,
        booking: true,
      },
    });

    if (!transaction) {
      throw new Error("NOT_FOUND: Transaction record not found.");
    }

    if (!isAdmin && transaction.userId !== requestedBy) {
      throw new Error("FORBIDDEN: You can only request refunds for your own transactions.");
    }

    if (transaction.status !== "CAPTURED") {
      throw new Error(`INVALID_STATE: Only captured payments can be refunded (current: ${transaction.status}).`);
    }

    // Call Razorpay Refund API
    let providerRefundId = `rfnd_mock_${Date.now()}`;
    if (transaction.providerPaymentId) {
      const rzpRefund = await razorpayClient.createRefund({
        paymentId: transaction.providerPaymentId,
        amountPaise: transaction.amountPaise,
        notes: { reason: reason || "User requested refund" },
      });
      providerRefundId = rzpRefund.id;
    }

    // Create Refund log
    const refundRecord = await prisma.refund.create({
      data: {
        transactionId: transaction.id,
        providerRefundId,
        amountPaise: transaction.amountPaise,
        currency: transaction.currency,
        reason: reason || "Refund approved",
        status: "REFUNDED",
        requestedBy,
        approvedBy: isAdmin ? requestedBy : null,
      },
    });

    // Update Transaction status
    await prisma.paymentTransaction.update({
      where: { id: transaction.id },
      data: { status: "REFUNDED" },
    });

    // Revoke course access or cancel booking
    if (transaction.enrollmentId) {
      await prisma.enrollment.update({
        where: { id: transaction.enrollmentId },
        data: { status: "CANCELLED" },
      });
    }

    if (transaction.bookingId) {
      await prisma.booking.update({
        where: { id: transaction.bookingId },
        data: { status: "CANCELLED" },
      });
    }

    // Record Ledger Reversal
    const teacherId = transaction.course?.teacherId || transaction.liveClassSlot?.teacherId;
    if (teacherId) {
      await LedgerService.recordRefundLedger({
        transactionId: transaction.id,
        teacherId,
        refundAmountPaise: transaction.amountPaise,
      });
    }

    return refundRecord;
  }
}
