import { NextRequest } from "next/server";
import { requireStaffOrAdmin } from "@/lib/auth/guards";
import { CertificateService } from "@/services/certificate-service";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    await requireStaffOrAdmin();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "ALL";
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;

    const data = await CertificateService.getAdminCertificates({
      search,
      status,
      page,
      limit,
    });

    return apiSuccess(data);
  } catch (err: any) {
    return handleApiError(err, "Failed to load certificates");
  }
}
