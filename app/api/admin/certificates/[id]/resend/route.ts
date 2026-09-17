import { NextRequest } from "next/server";
import { requireStaffOrAdmin } from "@/lib/auth/guards";
import { CertificateService } from "@/services/certificate-service";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireStaffOrAdmin();
    const result = await CertificateService.resendCertificateEmail(params.id, session.userId);

    return apiSuccess(result, "Certificate email resent successfully");
  } catch (err: any) {
    return handleApiError(err, "Failed to resend certificate email");
  }
}
