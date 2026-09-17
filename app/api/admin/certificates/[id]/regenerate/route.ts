import { NextRequest } from "next/server";
import { requireStaffOrAdmin } from "@/lib/auth/guards";
import { CertificateService } from "@/services/certificate-service";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireStaffOrAdmin();
    const result = await CertificateService.regenerateCertificate(params.id, session.userId);

    return apiSuccess({ regenerated: true, certificateNumber: result.certificate.certificateNumber }, "Certificate regenerated successfully");
  } catch (err: any) {
    return handleApiError(err, "Failed to regenerate certificate");
  }
}
