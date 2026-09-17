import { NextRequest } from "next/server";
import { requireStaffOrAdmin } from "@/lib/auth/guards";
import { CertificateService } from "@/services/certificate-service";
import { apiSuccess, apiNotFound, apiBadRequest, handleApiError } from "@/lib/api-response";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireStaffOrAdmin();
    const certificate = await CertificateService.getCertificateDetails(params.id);

    if (!certificate) return apiNotFound("Certificate not found");

    return apiSuccess(certificate);
  } catch (err: any) {
    return handleApiError(err, "Failed to load certificate details");
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireStaffOrAdmin();
    const body = await req.json().catch(() => ({}));
    const reason = body.reason?.trim() || "Revoked by platform administrator";

    const revoked = await CertificateService.revokeCertificate(
      params.id,
      session.userId,
      reason
    );

    return apiSuccess(revoked, "Certificate revoked successfully");
  } catch (err: any) {
    return handleApiError(err, "Failed to revoke certificate");
  }
}
