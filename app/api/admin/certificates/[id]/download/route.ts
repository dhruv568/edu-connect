import { NextRequest, NextResponse } from "next/server";
import { requireStaffOrAdmin } from "@/lib/auth/guards";
import { CertificateService } from "@/services/certificate-service";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireStaffOrAdmin();
    const pdfBuffer = await CertificateService.getCertificatePdfBuffer(params.id);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="EduConnects-Certificate-${params.id}.pdf"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (err: any) {
    return new NextResponse(JSON.stringify({ error: err?.message || "Failed to download certificate" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
}
