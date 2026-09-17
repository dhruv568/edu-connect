import { NextRequest } from "next/server";
import { requireStaffOrAdmin } from "@/lib/auth/guards";
import { CertificateService } from "@/services/certificate-service";
import { prisma } from "@/lib/prisma";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    await requireStaffOrAdmin();
    const template = await CertificateService.getActiveTemplate();

    return apiSuccess({
      template,
      samplePreview: {
        certificateNumber: "EDU-CERT-2026-SAMPLE",
        educatorName: "Prof. Priya Sharma",
        programTitle: "15-Day Educator Training Program",
        completionDate: new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      },
    });
  } catch (err: any) {
    return handleApiError(err, "Failed to load certificate template");
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireStaffOrAdmin();
    const body = await req.json().catch(() => ({}));

    const activeTemplate = await CertificateService.getActiveTemplate();

    const updated = await prisma.certificateTemplate.update({
      where: { id: activeTemplate.id },
      data: {
        title: body.title !== undefined ? body.title : activeTemplate.title,
        badgeText: body.badgeText !== undefined ? body.badgeText : activeTemplate.badgeText,
        headline: body.headline !== undefined ? body.headline : activeTemplate.headline,
        subtext: body.subtext !== undefined ? body.subtext : activeTemplate.subtext,
        bodyText: body.bodyText !== undefined ? body.bodyText : activeTemplate.bodyText,
        issuerName: body.issuerName !== undefined ? body.issuerName : activeTemplate.issuerName,
        issuerTitle: body.issuerTitle !== undefined ? body.issuerTitle : activeTemplate.issuerTitle,
        primaryColor: body.primaryColor !== undefined ? body.primaryColor : activeTemplate.primaryColor,
        accentColor: body.accentColor !== undefined ? body.accentColor : activeTemplate.accentColor,
        orientation: body.orientation !== undefined ? body.orientation : activeTemplate.orientation,
        isActive: body.isActive !== undefined ? body.isActive : activeTemplate.isActive,
      },
    });

    return apiSuccess(updated, "Certificate template updated successfully");
  } catch (err: any) {
    return handleApiError(err, "Failed to update certificate template");
  }
}
