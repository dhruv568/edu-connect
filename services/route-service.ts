import { prisma } from "@/lib/prisma";
import { razorpayClient } from "@/lib/razorpay";

export class RouteService {
  /**
   * Check if Razorpay Route feature flag is enabled
   */
  static isRouteEnabled(): boolean {
    return process.env.RAZORPAY_ROUTE_ENABLED === "true";
  }

  /**
   * Get or create teacher payout account record
   */
  static async getOrCreatePayoutAccount(teacherId: string) {
    let account = await prisma.teacherPayoutAccount.findUnique({
      where: { teacherId },
    });

    if (!account) {
      account = await prisma.teacherPayoutAccount.create({
        data: {
          teacherId,
          provider: "RAZORPAY_ROUTE",
          status: "NOT_STARTED",
        },
      });
    }

    return account;
  }

  /**
   * Initiate onboarding for teacher Linked Account
   */
  static async initiateTeacherOnboarding(params: {
    teacherId: string;
    accountName?: string;
  }) {
    const account = await this.getOrCreatePayoutAccount(params.teacherId);

    // Simulated / Razorpay Route onboarding link generation
    const mockAccountId = `acc_${params.teacherId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 14)}`;
    const mockOnboardingUrl = `https://dashboard.razorpay.com/app/route/onboarding/${mockAccountId}`;

    const updated = await prisma.teacherPayoutAccount.update({
      where: { id: account.id },
      data: {
        providerAccountId: mockAccountId,
        accountName: params.accountName || "Teacher Account",
        status: "ACTIVE", // Set to active for seamless test/demo flow
        kycStatus: "VERIFIED",
        onboardingUrl: mockOnboardingUrl,
      },
    });

    return updated;
  }

  /**
   * Execute Route Transfer for captured payment if enabled & teacher account is ACTIVE
   */
  static async executeTransferIfEligible(params: {
    transactionId: string;
    teacherId: string;
    providerPaymentId: string;
    teacherSharePaise: number;
    ledgerEntryId?: string;
  }) {
    const routeEnabled = this.isRouteEnabled();

    // Fetch teacher payout account
    const payoutAccount = await prisma.teacherPayoutAccount.findUnique({
      where: { teacherId: params.teacherId },
    });

    const isAccountActive = payoutAccount?.status === "ACTIVE" && Boolean(payoutAccount.providerAccountId);

    if (!routeEnabled || !isAccountActive) {
      // Record internal pending payout record without live transfer
      const payout = await prisma.teacherPayout.create({
        data: {
          teacherId: params.teacherId,
          transactionId: params.transactionId,
          ledgerEntryId: params.ledgerEntryId,
          amountPaise: params.teacherSharePaise,
          status: "PENDING", // PENDING_PAYOUT
        },
      });
      return { transferred: false, payout, reason: !routeEnabled ? "ROUTE_DISABLED" : "ACCOUNT_NOT_ACTIVE" };
    }

    try {
      // Call Razorpay Route Transfer API
      const transfer = await razorpayClient.createRouteTransfer({
        paymentId: params.providerPaymentId,
        accountId: payoutAccount.providerAccountId!,
        amountPaise: params.teacherSharePaise,
      });

      const payout = await prisma.teacherPayout.create({
        data: {
          teacherId: params.teacherId,
          transactionId: params.transactionId,
          ledgerEntryId: params.ledgerEntryId,
          providerTransferId: transfer.id,
          amountPaise: params.teacherSharePaise,
          status: "PAID",
          processedAt: new Date(),
        },
      });

      return { transferred: true, payout, transferId: transfer.id };
    } catch (error: any) {
      const payout = await prisma.teacherPayout.create({
        data: {
          teacherId: params.teacherId,
          transactionId: params.transactionId,
          ledgerEntryId: params.ledgerEntryId,
          amountPaise: params.teacherSharePaise,
          status: "FAILED",
          failureReason: error.message || "Route Transfer Error",
        },
      });
      return { transferred: false, payout, error: error.message };
    }
  }
}
