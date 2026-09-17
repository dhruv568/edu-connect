import { NextRequest } from "next/server";
import { CertificateService } from "@/services/certificate-service";
import { apiSuccess, apiNotFound, handleApiError } from "@/lib/api-response";

export async function GET(req: NextRequest, { params }: { params: { certificateId: string } }) {
  try {
    const certNumber = params.certificateId;
    if (!certNumber || certNumber.trim().length < 3) {
      return apiNotFound("Please provide a valid certificate ID");
    }

    const verification = await CertificateService.verifyCertificatePublic(certNumber);

    if (!verification) {
      return apiNotFound("Certificate not found. Please verify that the Certificate ID was entered correctly.");
    }

    return apiSuccess(verification);
  } catch (err: any) {
    return handleApiError(err, "Failed to verify certificate");
  }
}
