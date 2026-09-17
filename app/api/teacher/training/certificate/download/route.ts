import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { CertificateService } from "@/services/certificate-service";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();

    const cert = await prisma.certificate.findFirst({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
    });

    if (!cert) {
      return new NextResponse(JSON.stringify({ error: "Certificate not found or not yet issued." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const pdfBuffer = await CertificateService.getCertificatePdfBuffer(cert.id);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="EduConnects-Certificate-${cert.certificateNumber}.pdf"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (err: any) {
    return new NextResponse(JSON.stringify({ error: err?.message || "Failed to download certificate" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
