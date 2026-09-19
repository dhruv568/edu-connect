-- CreateTable
CREATE TABLE "promotional_banners" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "bannerType" TEXT NOT NULL DEFAULT 'OFFER',
    "imageUrl" TEXT NOT NULL,
    "imageClickUrl" TEXT,
    "imageClickTarget" TEXT NOT NULL DEFAULT '_self',
    "ctaText" TEXT,
    "ctaUrl" TEXT,
    "placement" TEXT NOT NULL DEFAULT 'ALL',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promotional_banners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "promotional_banners_isActive_idx" ON "promotional_banners"("isActive");

-- CreateIndex
CREATE INDEX "promotional_banners_placement_idx" ON "promotional_banners"("placement");

-- CreateIndex
CREATE INDEX "promotional_banners_startAt_idx" ON "promotional_banners"("startAt");

-- CreateIndex
CREATE INDEX "promotional_banners_endAt_idx" ON "promotional_banners"("endAt");

-- CreateIndex
CREATE INDEX "promotional_banners_displayOrder_idx" ON "promotional_banners"("displayOrder");
