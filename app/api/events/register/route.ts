import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, apiBadRequest } from "@/lib/api-response";
import { liveEventConfig } from "@/lib/live-event-config";

// Validation schema for event registration
const registrationSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name."),
  whatsappNumber: z
    .string()
    .trim()
    .transform((val) => val.replace(/[\s\-\+\(\)]/g, ""))
    .refine((val) => {
      // Validate 10-digit Indian mobile number (or 12-digit with 91 country code)
      const cleanNum = val.startsWith("91") && val.length === 12 ? val.slice(2) : val;
      return /^[6-9]\d{9}$/.test(cleanNum);
    }, "Please enter a valid 10-digit WhatsApp number."),
  eventSlug: z.string().default(liveEventConfig.slug),
  source: z.string().default("LIVE_PAGE"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registrationSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid registration details.";
      return apiBadRequest(firstError);
    }

    const { name, whatsappNumber, eventSlug, source } = parsed.data;

    // Standardize 10-digit number format
    const cleanWhatsApp =
      whatsappNumber.startsWith("91") && whatsappNumber.length === 12
        ? whatsappNumber.slice(2)
        : whatsappNumber;

    // Check for duplicate registration
    const existing = await prisma.eventRegistration.findUnique({
      where: {
        eventSlug_whatsappNumber: {
          eventSlug,
          whatsappNumber: cleanWhatsApp,
        },
      },
    });

    if (existing) {
      return apiSuccess(
        {
          id: existing.id,
          name: existing.name,
          whatsappNumber: existing.whatsappNumber,
          alreadyRegistered: true,
        },
        "You are already registered for this Live Event! 🎉"
      );
    }

    // Save registration to database
    const newRegistration = await prisma.eventRegistration.create({
      data: {
        name,
        whatsappNumber: cleanWhatsApp,
        eventSlug,
        source,
        status: "CONFIRMED",
      },
    });

    // Record system activity log silently
    try {
      await (prisma as any).activityLog.create({
        data: {
          action: "EVENT_REGISTERED",
          entityType: "EventRegistration",
          entityId: newRegistration.id,
          metadata: JSON.stringify({
            name,
            whatsappNumber: cleanWhatsApp,
            eventSlug,
          }),
        },
      });
    } catch {
      // Ignore non-critical audit log failures
    }

    return apiSuccess(
      {
        id: newRegistration.id,
        name: newRegistration.name,
        whatsappNumber: newRegistration.whatsappNumber,
        createdAt: newRegistration.createdAt,
        alreadyRegistered: false,
      },
      "🎉 Registration successful! Welcome to the EduConnects family."
    );
  } catch (err: any) {
    console.error("❌ [Event Registration Error]:", err);
    return apiError(err?.message || "Failed to process event registration. Please try again.", 500);
  }
}
