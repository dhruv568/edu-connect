import { prisma } from "@/lib/prisma";

export class LedgerService {
  /**
   * Get default system platform commission percentage (defaults to 10%)
   */
  static async getDefaultCommissionPercent(): Promise<number> {
    try {
      const config = await prisma.platformConfig.findUnique({
        where: { key: "DEFAULT_COMMISSION_PERCENT" },
      });
      if (config && config.value) {
        const val = parseFloat(config.value);
        if (!isNaN(val) && val >= 0 && val <= 100) return val;
      }
    } catch {
      // Fallback if table not ready
    }
    return 10.0; // 10% default
  }

  /**
   * Update default system platform commission percentage
   */
  static async updateDefaultCommissionPercent(percent: number): Promise<number> {
    if (isNaN(percent) || percent < 0 || percent > 100) {
      throw new Error("INVALID_INPUT: Commission percent must be between 0 and 100.");
    }
    await prisma.platformConfig.upsert({
      where: { key: "DEFAULT_COMMISSION_PERCENT" },
      update: { value: percent.toString() },
      create: { key: "DEFAULT_COMMISSION_PERCENT", value: percent.toString() },
    });
    return percent;
  }

  /**
   * Record double-entry financial ledger movements upon payment capture
   */
  static async recordCapturedPaymentLedger(params: {
    transactionId: string;
    teacherId: string;
    grossAmountPaise: number;
    currency?: string;
    description?: string;
  }) {
    const currency = params.currency || "INR";
    const commissionPercent = await this.getDefaultCommissionPercent();

    const commissionPaise = Math.round((params.grossAmountPaise * commissionPercent) / 100);
    const teacherSharePaise = params.grossAmountPaise - commissionPaise;

    // Create 3 ledger entries inside a Prisma transaction for auditability
    const [grossEntry, commissionEntry, teacherEntry] = await prisma.$transaction([
      prisma.financialLedgerEntry.create({
        data: {
          transactionId: params.transactionId,
          teacherId: params.teacherId,
          type: "PAYMENT",
          amountPaise: params.grossAmountPaise,
          currency,
          direction: "CREDIT",
          status: "COMPLETED",
          description: params.description || `Customer payment captured`,
        },
      }),
      prisma.financialLedgerEntry.create({
        data: {
          transactionId: params.transactionId,
          teacherId: params.teacherId,
          type: "PLATFORM_COMMISSION",
          amountPaise: commissionPaise,
          currency,
          direction: "CREDIT",
          status: "COMPLETED",
          description: `Platform commission (${commissionPercent}%)`,
        },
      }),
      prisma.financialLedgerEntry.create({
        data: {
          transactionId: params.transactionId,
          teacherId: params.teacherId,
          type: "TEACHER_EARNING",
          amountPaise: teacherSharePaise,
          currency,
          direction: "CREDIT",
          status: "COMPLETED",
          description: `Teacher net earning share (${100 - commissionPercent}%)`,
        },
      }),
    ]);

    return {
      commissionPercent,
      commissionPaise,
      teacherSharePaise,
      grossEntry,
      commissionEntry,
      teacherEntry,
    };
  }

  /**
   * Record refund ledger reversal
   */
  static async recordRefundLedger(params: {
    transactionId: string;
    teacherId: string;
    refundAmountPaise: number;
    currency?: string;
  }) {
    const currency = params.currency || "INR";
    const commissionPercent = await this.getDefaultCommissionPercent();
    const teacherRefundDeduction = Math.round(
      (params.refundAmountPaise * (100 - commissionPercent)) / 100
    );

    const [refundEntry, reversalEntry] = await prisma.$transaction([
      prisma.financialLedgerEntry.create({
        data: {
          transactionId: params.transactionId,
          teacherId: params.teacherId,
          type: "REFUND",
          amountPaise: params.refundAmountPaise,
          currency,
          direction: "DEBIT",
          status: "COMPLETED",
          description: `Customer refund processed`,
        },
      }),
      prisma.financialLedgerEntry.create({
        data: {
          transactionId: params.transactionId,
          teacherId: params.teacherId,
          type: "REFUND_REVERSAL",
          amountPaise: teacherRefundDeduction,
          currency,
          direction: "DEBIT",
          status: "COMPLETED",
          description: `Teacher earning adjustment for refund`,
        },
      }),
    ]);

    return { refundEntry, reversalEntry, teacherRefundDeduction };
  }

  /**
   * Get teacher earnings metrics breakdown
   */
  static async getTeacherEarningsSummary(teacherId: string) {
    const ledgerEntries = await prisma.financialLedgerEntry.findMany({
      where: { teacherId },
    });

    let totalEarningsPaise = 0;
    let thisMonthEarningsPaise = 0;
    let refundedPaise = 0;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    for (const entry of ledgerEntries) {
      if (entry.type === "TEACHER_EARNING") {
        totalEarningsPaise += entry.amountPaise;
        if (entry.createdAt >= startOfMonth) {
          thisMonthEarningsPaise += entry.amountPaise;
        }
      } else if (entry.type === "REFUND_REVERSAL") {
        totalEarningsPaise -= entry.amountPaise;
        if (entry.createdAt >= startOfMonth) {
          thisMonthEarningsPaise -= entry.amountPaise;
        }
        refundedPaise += entry.amountPaise;
      }
    }

    // Payout status counts
    const payouts = await prisma.teacherPayout.findMany({
      where: { teacherId },
    });

    let paidPaise = 0;
    let pendingPaise = 0;

    for (const payout of payouts) {
      if (payout.status === "PAID") {
        paidPaise += payout.amountPaise;
      } else if (payout.status === "PENDING" || payout.status === "PROCESSING") {
        pendingPaise += payout.amountPaise;
      }
    }

    const availablePaise = Math.max(0, totalEarningsPaise - paidPaise - pendingPaise);

    return {
      totalEarningsPaise: Math.max(0, totalEarningsPaise),
      thisMonthEarningsPaise: Math.max(0, thisMonthEarningsPaise),
      pendingPaise,
      availablePaise,
      refundedPaise,
      totalEarnings: Math.max(0, totalEarningsPaise / 100),
      thisMonthEarnings: Math.max(0, thisMonthEarningsPaise / 100),
      pendingAmount: pendingPaise / 100,
      availableAmount: availablePaise / 100,
      refundedAmount: refundedPaise / 100,
    };
  }

  /**
   * Get teacher transaction ledger details
   */
  static async getTeacherLedgerTransactions(teacherId: string) {
    const transactions = await prisma.paymentTransaction.findMany({
      where: {
        status: { in: ["CAPTURED", "REFUNDED", "PARTIALLY_REFUNDED"] },
        OR: [
          { course: { teacherId } },
          { liveClassSlot: { teacherId } },
        ],
      },
      include: {
        user: { include: { profile: true } },
        course: true,
        liveClassSlot: true,
        ledgerEntries: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const commissionPercent = await this.getDefaultCommissionPercent();

    return transactions.map((t) => {
      const grossPaise = t.amountPaise;
      const commissionPaise = Math.round((grossPaise * commissionPercent) / 100);
      const teacherEarningPaise = grossPaise - commissionPaise;
      const productName = t.course?.title || t.liveClassSlot?.title || "EduConnect Product";
      const studentName = t.user?.profile
        ? `${t.user.profile.firstName} ${t.user.profile.lastName}`
        : t.user.email;

      return {
        id: t.id,
        internalReference: t.internalReference,
        providerPaymentId: t.providerPaymentId,
        productName,
        productType: t.type,
        studentName,
        studentEmail: t.user.email,
        grossPaise,
        grossAmount: grossPaise / 100,
        commissionPaise,
        commissionAmount: commissionPaise / 100,
        teacherEarningPaise,
        teacherEarningAmount: teacherEarningPaise / 100,
        status: t.status,
        createdAt: t.createdAt,
      };
    });
  }

  /**
   * Get Admin System Financial Dashboard Analytics
   */
  static async getAdminFinancialSummary() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const allCaptured = await prisma.paymentTransaction.findMany({
      where: { status: { in: ["CAPTURED", "REFUNDED", "PARTIALLY_REFUNDED"] } },
      include: { ledgerEntries: true, user: { include: { profile: true } }, course: true, liveClassSlot: true },
    });

    let totalRevenuePaise = 0;
    let todayRevenuePaise = 0;
    let totalCommissionPaise = 0;
    let totalTeacherEarningsPaise = 0;
    let totalRefundedPaise = 0;

    for (const t of allCaptured) {
      totalRevenuePaise += t.amountPaise;
      if (t.createdAt >= startOfToday) {
        todayRevenuePaise += t.amountPaise;
      }
      if (t.status === "REFUNDED" || t.status === "PARTIALLY_REFUNDED") {
        totalRefundedPaise += t.amountPaise;
      }

      for (const entry of t.ledgerEntries) {
        if (entry.type === "PLATFORM_COMMISSION") {
          totalCommissionPaise += entry.amountPaise;
        } else if (entry.type === "TEACHER_EARNING") {
          totalTeacherEarningsPaise += entry.amountPaise;
        }
      }
    }

    const pendingCount = await prisma.paymentTransaction.count({
      where: { status: "PENDING" },
    });

    return {
      totalRevenuePaise,
      todayRevenuePaise,
      totalCommissionPaise,
      totalTeacherEarningsPaise,
      totalRefundedPaise,
      totalRevenue: totalRevenuePaise / 100,
      todayRevenue: todayRevenuePaise / 100,
      totalCommission: totalCommissionPaise / 100,
      totalTeacherEarnings: totalTeacherEarningsPaise / 100,
      totalRefunded: totalRefundedPaise / 100,
      pendingCount,
      totalTransactionsCount: allCaptured.length,
    };
  }
}
