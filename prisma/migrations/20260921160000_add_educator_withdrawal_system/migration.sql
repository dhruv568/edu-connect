-- AlterTable
ALTER TABLE "teacher_profiles" ADD COLUMN "upiId" TEXT;

-- AlterTable
ALTER TABLE "teacher_payout_accounts" ADD COLUMN "upiId" TEXT;

-- CreateTable
CREATE TABLE "withdrawal_requests" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "amountPaise" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "payoutMethod" TEXT NOT NULL DEFAULT 'BANK_TRANSFER',
    "accountHolderName" TEXT,
    "accountNumber" TEXT,
    "bankName" TEXT,
    "ifscCode" TEXT,
    "upiId" TEXT,
    "providerTransferId" TEXT,
    "providerReferenceId" TEXT,
    "adminNotes" TEXT,
    "rejectionReason" TEXT,
    "failureReason" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "rejectedBy" TEXT,
    "processedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ledgerEntryId" TEXT,

    CONSTRAINT "withdrawal_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "withdrawal_requests_providerTransferId_key" ON "withdrawal_requests"("providerTransferId");

-- CreateIndex
CREATE UNIQUE INDEX "withdrawal_requests_idempotencyKey_key" ON "withdrawal_requests"("idempotencyKey");

-- CreateIndex
CREATE INDEX "withdrawal_requests_teacherId_status_idx" ON "withdrawal_requests"("teacherId", "status");

-- CreateIndex
CREATE INDEX "withdrawal_requests_status_idx" ON "withdrawal_requests"("status");

-- AddForeignKey
ALTER TABLE "withdrawal_requests" ADD CONSTRAINT "withdrawal_requests_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teacher_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawal_requests" ADD CONSTRAINT "withdrawal_requests_ledgerEntryId_fkey" FOREIGN KEY ("ledgerEntryId") REFERENCES "financial_ledger_entries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
