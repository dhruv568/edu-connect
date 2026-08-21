export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { ContactSchema } from "@/schemas/auth-schemas";
import { apiSuccess, apiBadRequest, apiError } from "@/lib/api-response";
import { trackEvent } from "@/lib/analytics";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = ContactSchema.parse(body);

    trackEvent("contact_form_submitted", {
      email: validated.email,
      roleType: validated.roleType,
    });

    console.log("\n==================================================");
    console.log("📩 [CONTACT FORM INQUIRY RECEIVED]");
    console.log(`From: ${validated.name} <${validated.email}> (${validated.roleType})`);
    console.log(`Subject: ${validated.subject}`);
    console.log(`Message: ${validated.message}`);
    console.log("==================================================\n");

    return apiSuccess(
      { referenceId: `TICKET-${Math.floor(100000 + Math.random() * 900000)}` },
      "Thank you for contacting EduConnect! Our support team will respond within 24 hours.",
      201
    );
  } catch (error: any) {
    if (error.name === "ZodError") {
      return apiBadRequest(error.errors[0]?.message || "Invalid contact form submission.");
    }
    return apiError(error.message || "Failed to process inquiry.", 400);
  }
}
