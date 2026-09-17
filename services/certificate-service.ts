import { prisma } from "@/lib/prisma";
import crypto from "node:crypto";
import { generateCertificatePdf } from "@/lib/certificate/certificate-generator";
import { EmailService } from "@/lib/email/email-service";
import { getPublicAppUrl } from "@/lib/app-url";

export interface IssueCertificateParams {
  userId: string;
  confirmedName: string;
  confirmedEmail: string;
  ipAddress?: string;
}

export interface VerifyCertificateResult {
  valid: boolean;
  certificateNumber: string;
  educatorName: string;
  programTitle: string;
  completionDate: string;
  issueDate: string;
  status: "ISSUED" | "REVOKED";
  issuerOrganization: string;
  revokedAt?: string | null;
  revocationReason?: string | null;
}

export class CertificateService {
  /**
   * Generates a unique, high-entropy Certificate Number
   * Format: EDU-CERT-2026-XXXXXX
   */
  static generateCertificateNumber(): string {
    const year = new Date().getFullYear();
    const randomPart = crypto.randomBytes(4).toString("hex").toUpperCase();
    return `EDU-CERT-${year}-${randomPart}`;
  }

  /**
   * Fetch active Certificate Template or fallback to default
   */
  static async getActiveTemplate() {
    let template = await prisma.certificateTemplate.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: "desc" },
    });

    if (!template) {
      template = await prisma.certificateTemplate.create({
        data: {
          title: "15-Day Educator Certification Template",
          badgeText: "VERIFIED EDUCATOR",
          headline: "Certificate of Completion",
          subtext: "This is proudly presented to",
          bodyText: "For successfully completing the intensive 15-Day Educator Training Program, demonstrating mastery of live interactive classroom delivery, digital curriculum design, and online pedagogical excellence.",
          issuerName: "EduConnects Academy",
          issuerTitle: "Director of Academic Excellence",
          primaryColor: "#16805B",
          accentColor: "#0D5C41",
          orientation: "LANDSCAPE",
          isActive: true,
        },
      });
    }

    return template;
  }

  /**
   * Get Educator profile data for the identity confirmation screen
   */
  static async getIdentityForVerification(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        trainingEnrollments: {
          where: { program: { slug: "15-day-educator-training" } },
          include: { certificate: true },
        },
      },
    });

    if (!user) {
      throw new Error("User not found.");
    }

    const enrollment = user.trainingEnrollments[0];
    if (!enrollment) {
      throw new Error("Educator is not enrolled in the 15-Day Training Program.");
    }

    const isEligible =
      enrollment.status === "CERTIFICATE_ELIGIBLE" ||
      enrollment.status === "CERTIFIED" ||
      enrollment.completedDaysCount === 15;

    const defaultName = [user.profile?.firstName, user.profile?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() || user.email.split("@")[0];

    return {
      userId: user.id,
      email: user.email,
      fullName: defaultName,
      isEligible,
      enrollmentStatus: enrollment.status,
      completedDaysCount: enrollment.completedDaysCount,
      existingCertificate: enrollment.certificate
        ? {
            id: enrollment.certificate.id,
            certificateNumber: enrollment.certificate.certificateNumber,
            issueDate: enrollment.certificate.issueDate,
            status: enrollment.certificate.status,
          }
        : null,
    };
  }

  /**
   * Issues a Certificate after educator confirms identity
   * Validates eligibility, enforces email match/verification, prevents duplicates
   */
  static async issueCertificate(params: IssueCertificateParams) {
    const { userId, confirmedName, confirmedEmail, ipAddress } = params;

    // 1. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(confirmedEmail.trim())) {
      throw new Error("Please provide a valid email address.");
    }

    if (!confirmedName || confirmedName.trim().length < 2) {
      throw new Error("Please provide a valid full name for your certificate.");
    }

    // 2. Fetch User & Enrollment
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        trainingEnrollments: {
          where: { program: { slug: "15-day-educator-training" } },
          include: {
            program: true,
            certificate: true,
            dayProgress: true,
          },
        },
      },
    });

    if (!user) throw new Error("Educator account not found.");
    const enrollment = user.trainingEnrollments[0];
    if (!enrollment) throw new Error("Training enrollment not found.");

    // 3. Prevent duplicate certificate generation
    if (enrollment.certificate) {
      // Certificate already issued
      return {
        alreadyIssued: true,
        certificate: enrollment.certificate,
        certificateNumber: enrollment.certificate.certificateNumber,
        certificateId: enrollment.certificate.id,
        message: "Your certificate has already been issued.",
      };
    }

    // 4. Validate completion eligibility
    const completedDaysCount = enrollment.dayProgress.filter((p) => p.isCompleted).length;
    if (completedDaysCount < 15 && enrollment.status !== "CERTIFICATE_ELIGIBLE") {
      throw new Error(
        `Cannot issue certificate: Only ${completedDaysCount} of 15 days are completed. Please complete all 15 days and pass their quizzes.`
      );
    }

    // 5. Identity mismatch check: Email must match authenticated user's account
    if (user.email.toLowerCase().trim() !== confirmedEmail.toLowerCase().trim()) {
      throw new Error(
        "Submitted email does not match your registered Educator account. Certificates must be issued to the authenticated educator's verified email address."
      );
    }

    // 6. Generate Certificate Number & Fetch Active Template
    const certificateNumber = this.generateCertificateNumber();
    const template = await this.getActiveTemplate();
    const completionDate = enrollment.completedAt || new Date();
    const programTitle = enrollment.program.title || "15-Day Educator Training Program";

    // 7. Generate High-Resolution Vector PDF
    const pdfBuffer = await generateCertificatePdf({
      certificateNumber,
      educatorName: confirmedName.trim(),
      programTitle,
      completionDate,
      issueDate: new Date(),
      template: {
        headline: template.headline,
        subtext: template.subtext,
        bodyText: template.bodyText,
        badgeText: template.badgeText,
        issuerName: template.issuerName,
        issuerTitle: template.issuerTitle,
        primaryColor: template.primaryColor,
        accentColor: template.accentColor,
      },
      verificationBaseUrl: getPublicAppUrl(),
    });

    // 8. Atomic Database Creation: Certificate + AuditLog + Enrollment status update
    const certificate = await prisma.$transaction(async (tx) => {
      const cert = await tx.certificate.create({
        data: {
          certificateNumber,
          enrollmentId: enrollment.id,
          templateId: template.id,
          userId: user.id,
          educatorName: confirmedName.trim(),
          educatorEmail: confirmedEmail.trim().toLowerCase(),
          programTitle,
          completionDate,
          issueDate: new Date(),
          status: "ISSUED",
        },
      });

      await tx.certificateAuditLog.create({
        data: {
          certificateId: cert.id,
          action: "GENERATED",
          performedById: user.id,
          details: `Certificate generated for ${confirmedName.trim()} (${confirmedEmail.trim()})`,
          ipAddress: ipAddress || null,
        },
      });

      await tx.trainingEnrollment.update({
        where: { id: enrollment.id },
        data: {
          status: "CERTIFIED",
          completedAt: completionDate,
        },
      });

      return cert;
    });

    // 9. Dispatch Email with attached PDF asynchronously (non-blocking)
    void (async () => {
      try {
        const formattedDate = completionDate.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });

        const emailSent = await EmailService.sendCertificateEmail({
          email: confirmedEmail.trim(),
          educatorName: confirmedName.trim(),
          certificateNumber,
          programTitle,
          completionDate: formattedDate,
          pdfBuffer,
        });

        if (emailSent) {
          await prisma.certificate.update({
            where: { id: certificate.id },
            data: { emailSentAt: new Date() },
          });

          await prisma.certificateAuditLog.create({
            data: {
              certificateId: certificate.id,
              action: "EMAILED",
              performedById: "SYSTEM",
              details: `Certificate PDF dispatched to ${confirmedEmail.trim()}`,
            },
          });
        }
      } catch (err) {
        console.error("Async certificate email error:", err);
      }
    })();

    return {
      alreadyIssued: false,
      certificate,
      certificateNumber: certificate.certificateNumber,
      certificateId: certificate.id,
      message: "Certificate generated and emailed successfully.",
    };
  }

  /**
   * Public Certificate Verification Lookup (sanitized, safe)
   */
  static async verifyCertificatePublic(certificateNumber: string): Promise<VerifyCertificateResult | null> {
    const cleanNumber = certificateNumber.trim().toUpperCase();

    const cert = await prisma.certificate.findFirst({
      where: {
        OR: [
          { certificateNumber: cleanNumber },
          { id: cleanNumber },
        ],
      },
    });

    if (!cert) return null;

    // Record audit entry for public view
    void (async () => {
      try {
        await prisma.certificateAuditLog.create({
          data: {
            certificateId: cert.id,
            action: "VERIFIED_VIEWED",
            performedById: "PUBLIC_VISITOR",
            details: `Public verification requested for ${cert.certificateNumber}`,
          },
        });
      } catch {}
    })();

    return {
      valid: cert.status === "ISSUED",
      certificateNumber: cert.certificateNumber,
      educatorName: cert.educatorName,
      programTitle: cert.programTitle,
      completionDate: cert.completionDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      issueDate: cert.issueDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      status: cert.status as "ISSUED" | "REVOKED",
      issuerOrganization: "EduConnects Academy (Shrivastava ProFunnels Ventures Pvt Ltd)",
      revokedAt: cert.revokedAt?.toISOString() || null,
      revocationReason: cert.revocationReason || null,
    };
  }

  /**
   * Admin: List issued certificates with search & status filters
   */
  static async getAdminCertificates(options: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const { search = "", status = "ALL", page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }

    if (search.trim()) {
      const q = search.trim();
      where.OR = [
        { certificateNumber: { contains: q, mode: "insensitive" } },
        { educatorName: { contains: q, mode: "insensitive" } },
        { educatorEmail: { contains: q, mode: "insensitive" } },
      ];
    }

    const [certificates, total] = await Promise.all([
      prisma.certificate.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          auditLogs: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
        },
      }),
      prisma.certificate.count({ where }),
    ]);

    return {
      certificates,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Admin: Get single Certificate with full audit logs
   */
  static async getCertificateDetails(id: string) {
    return prisma.certificate.findFirst({
      where: {
        OR: [{ id }, { certificateNumber: id }],
      },
      include: {
        template: true,
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            profile: true,
          },
        },
        auditLogs: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  /**
   * Admin: Revoke Certificate
   */
  static async revokeCertificate(certificateId: string, adminUserId: string, reason: string) {
    const cert = await prisma.certificate.findUnique({
      where: { id: certificateId },
    });

    if (!cert) throw new Error("Certificate not found.");

    const updated = await prisma.$transaction(async (tx) => {
      const c = await tx.certificate.update({
        where: { id: certificateId },
        data: {
          status: "REVOKED",
          revokedAt: new Date(),
          revocationReason: reason,
        },
      });

      await tx.certificateAuditLog.create({
        data: {
          certificateId: c.id,
          action: "REVOKED",
          performedById: adminUserId,
          details: `Certificate revoked by admin: ${reason}`,
        },
      });

      return c;
    });

    return updated;
  }

  /**
   * Admin: Regenerate Certificate PDF
   */
  static async regenerateCertificate(certificateId: string, adminUserId: string) {
    const cert = await prisma.certificate.findUnique({
      where: { id: certificateId },
      include: { template: true },
    });

    if (!cert) throw new Error("Certificate not found.");

    const template = cert.template || (await this.getActiveTemplate());

    const pdfBuffer = await generateCertificatePdf({
      certificateNumber: cert.certificateNumber,
      educatorName: cert.educatorName,
      programTitle: cert.programTitle,
      completionDate: cert.completionDate,
      issueDate: cert.issueDate,
      template: {
        headline: template.headline,
        subtext: template.subtext,
        bodyText: template.bodyText,
        badgeText: template.badgeText,
        issuerName: template.issuerName,
        issuerTitle: template.issuerTitle,
        primaryColor: template.primaryColor,
        accentColor: template.accentColor,
      },
      verificationBaseUrl: getPublicAppUrl(),
    });

    await prisma.$transaction(async (tx) => {
      await tx.certificate.update({
        where: { id: certificateId },
        data: {
          regeneratedAt: new Date(),
          regenerationCount: { increment: 1 },
          status: "ISSUED", // Reactivate if was revoked
        },
      });

      await tx.certificateAuditLog.create({
        data: {
          certificateId: cert.id,
          action: "REGENERATED",
          performedById: adminUserId,
          details: `Certificate regenerated by administrator`,
        },
      });
    });

    return { pdfBuffer, certificate: cert };
  }

  /**
   * Admin: Resend Certificate Email
   */
  static async resendCertificateEmail(certificateId: string, adminUserId: string) {
    const cert = await prisma.certificate.findUnique({
      where: { id: certificateId },
      include: { template: true },
    });

    if (!cert) throw new Error("Certificate not found.");
    if (cert.status === "REVOKED") {
      throw new Error("Cannot resend a revoked certificate. Regenerate/restore it first.");
    }

    const template = cert.template || (await this.getActiveTemplate());

    const pdfBuffer = await generateCertificatePdf({
      certificateNumber: cert.certificateNumber,
      educatorName: cert.educatorName,
      programTitle: cert.programTitle,
      completionDate: cert.completionDate,
      issueDate: cert.issueDate,
      template: {
        headline: template.headline,
        subtext: template.subtext,
        bodyText: template.bodyText,
        badgeText: template.badgeText,
        issuerName: template.issuerName,
        issuerTitle: template.issuerTitle,
        primaryColor: template.primaryColor,
        accentColor: template.accentColor,
      },
      verificationBaseUrl: getPublicAppUrl(),
    });

    const formattedDate = cert.completionDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const sent = await EmailService.sendCertificateEmail({
      email: cert.educatorEmail,
      educatorName: cert.educatorName,
      certificateNumber: cert.certificateNumber,
      programTitle: cert.programTitle,
      completionDate: formattedDate,
      pdfBuffer,
    });

    if (sent) {
      await prisma.$transaction(async (tx) => {
        await tx.certificate.update({
          where: { id: certificateId },
          data: { emailSentAt: new Date() },
        });

        await tx.certificateAuditLog.create({
          data: {
            certificateId: cert.id,
            action: "RESENT",
            performedById: adminUserId,
            details: `Certificate email resent to ${cert.educatorEmail}`,
          },
        });
      });
    }

    return { sent };
  }

  /**
   * Download Certificate PDF Buffer
   */
  static async getCertificatePdfBuffer(certificateId: string): Promise<Buffer> {
    const cert = await prisma.certificate.findFirst({
      where: {
        OR: [{ id: certificateId }, { certificateNumber: certificateId }],
      },
      include: { template: true },
    });

    if (!cert) throw new Error("Certificate not found.");

    const template = cert.template || (await this.getActiveTemplate());

    return generateCertificatePdf({
      certificateNumber: cert.certificateNumber,
      educatorName: cert.educatorName,
      programTitle: cert.programTitle,
      completionDate: cert.completionDate,
      issueDate: cert.issueDate,
      template: {
        headline: template.headline,
        subtext: template.subtext,
        bodyText: template.bodyText,
        badgeText: template.badgeText,
        issuerName: template.issuerName,
        issuerTitle: template.issuerTitle,
        primaryColor: template.primaryColor,
        accentColor: template.accentColor,
      },
      verificationBaseUrl: getPublicAppUrl(),
    });
  }
}
