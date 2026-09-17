export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { cashfreeClient } from "@/lib/cashfree";
import { apiSuccess, apiError, apiBadRequest } from "@/lib/api-response";
import crypto from "crypto";

const trainingRegisterSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name."),
  email: z.string().trim().email("Please enter a valid email address."),
  phone: z
    .string()
    .trim()
    .transform((val) => val.replace(/[\s\-\+\(\)]/g, ""))
    .refine((val) => {
      const cleanNum = val.startsWith("91") && val.length === 12 ? val.slice(2) : val;
      return /^[6-9]\d{9}$/.test(cleanNum);
    }, "Please enter a valid 10-digit mobile/WhatsApp number."),
  role: z.string().trim().default("Teacher"),
  subject: z.string().trim().default("General"),
  experienceYears: z.number().or(z.string()).default(1),
  notes: z.string().trim().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = trainingRegisterSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid registration information.";
      return apiBadRequest(firstError);
    }

    const { name, email, phone, role, subject, experienceYears, notes } = parsed.data;

    const cleanPhone = phone.startsWith("91") && phone.length === 12 ? phone.slice(2) : phone;
    const normalizedEmail = email.toLowerCase().trim();
    const eventSlug = "teachers-training-15-days";

    // Check platform configs to see if a price is configured
    const priceConfig = await prisma.platformConfig.findUnique({
      where: { key: "teacher_training_price" },
    });

    const feeAmount = priceConfig?.value ? parseFloat(priceConfig.value) : 0;

    // Check if user is already registered for this training program
    const existing = await prisma.eventRegistration.findUnique({
      where: {
        eventSlug_whatsappNumber: {
          eventSlug,
          whatsappNumber: cleanPhone,
        },
      },
    });

    // If payment is required (configured by admin)
    if (feeAmount > 0) {
      const orderId = `CF_TRN_${Date.now()}_${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
      
      const cfOrder = await cashfreeClient.createOrder({
        orderId,
        orderAmount: feeAmount,
        orderCurrency: "INR",
        customerDetails: {
          customer_id: `trn_user_${cleanPhone}`,
          customer_email: normalizedEmail,
          customer_phone: cleanPhone,
          customer_name: name,
        },
        orderNote: "EduConnects 15-Day Teachers Training Program Enrollment",
        orderTags: {
          program: "15_DAY_TEACHERS_TRAINING",
          email: normalizedEmail,
          phone: cleanPhone,
          role,
        },
      });

      return apiSuccess({
        requiresPayment: true,
        orderId,
        cfOrderId: cfOrder.cf_order_id,
        paymentSessionId: cfOrder.payment_session_id,
        orderAmount: feeAmount,
        currency: "INR",
        env: cashfreeClient.getEnv(),
      });
    }

    // No payment required / Free seat reservation
    let registrationRecord = existing;

    if (!registrationRecord) {
      registrationRecord = await prisma.eventRegistration.create({
        data: {
          name,
          whatsappNumber: cleanPhone,
          eventSlug,
          source: "TEACHERS_TRAINING_LANDING_PAGE",
          status: "CONFIRMED",
        },
      });
    }

    // Generate human-friendly reservation code
    const reservationCode = `EDU-TRN-${registrationRecord.id.slice(0, 8).toUpperCase()}`;

    // Record system activity log
    try {
      await (prisma as any).activityLog.create({
        data: {
          action: "TEACHER_TRAINING_SEAT_RESERVED",
          entityType: "TeacherTrainingRegistration",
          entityId: registrationRecord.id,
          metadata: JSON.stringify({
            name,
            email: normalizedEmail,
            whatsappNumber: cleanPhone,
            role,
            subject,
            experienceYears: Number(experienceYears) || 0,
            notes: notes || "",
            reservationCode,
          }),
        },
      });
    } catch {
      // Non-critical audit log failure ignored
    }

    // Optionally dispatch confirmation notification
    try {
      const { getEmailProvider } = await import("@/lib/email/email-service");
      const provider = getEmailProvider();
      await provider.sendNotificationEmail({
        email: normalizedEmail,
        recipientName: name,
        subject: "Seat Reserved: 15-Day Teachers Training Program | EduConnects",
        headline: "Your Training Seat is Reserved! 🎓",
        statusBadgeText: "RESERVATION CONFIRMED",
        statusBadgeVariant: "success",
        bodyText: `Welcome to the EduConnects Teachers Training Program! Your seat reservation (ID: ${reservationCode}) has been confirmed.\n\nOur educator training team will contact you via WhatsApp (${cleanPhone}) and email with the batch onboarding schedule, live studio orientation, and syllabus details.`,
        actionText: "Explore Educator Portal",
        actionUrl: "https://educators.educonnects.co.in/teacher",
      });
    } catch {
      // Non-critical email dispatch failure ignored
    }

    return apiSuccess({
      requiresPayment: false,
      alreadyRegistered: Boolean(existing),
      reservationId: reservationCode,
      registrationId: registrationRecord.id,
      name,
      email: normalizedEmail,
      phone: cleanPhone,
      status: "CONFIRMED",
      message: existing
        ? `You have already reserved a seat for the Teachers Training Program (ID: ${reservationCode}). Our team will reach out with batch timings!`
        : `🎉 Seat reserved successfully! Your reservation ID is ${reservationCode}. We will reach out on WhatsApp (${cleanPhone}) with onboarding details.`,
    });
  } catch (error: any) {
    console.error("Training registration error:", error);
    return apiError(error?.message || "Failed to reserve seat. Please try again.", 500);
  }
}
