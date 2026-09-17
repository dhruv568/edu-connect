import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { CertificateService } from "@/services/certificate-service";
import { apiSuccess, apiBadRequest, handleApiError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const data = await CertificateService.getIdentityForVerification(session.userId);

    return apiSuccess(data);
  } catch (err: any) {
    return handleApiError(err, "Failed to load verification identity");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json().catch(() => ({}));
    const { confirmedName, confirmedEmail } = body;

    if (!confirmedName || typeof confirmedName !== "string" || confirmedName.trim().length < 2) {
      return apiBadRequest("Please provide your full legal name as it should appear on your certificate.");
    }

    if (!confirmedEmail || typeof confirmedEmail !== "string") {
      return apiBadRequest("Please provide a valid email address.");
    }

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

    const result = await CertificateService.issueCertificate({
      userId: session.userId,
      confirmedName: confirmedName.trim(),
      confirmedEmail: confirmedEmail.trim(),
      ipAddress: ip,
    });

    return apiSuccess({
      ...result,
      downloadUrl: "/api/teacher/training/certificate/download",
      verificationUrl: `/certificate/verify/${result.certificateNumber}`,
    }, result.message);
  } catch (err: any) {
    return handleApiError(err, "Failed to issue certificate");
  }
}
