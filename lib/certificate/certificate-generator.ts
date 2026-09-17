import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export interface GenerateCertificateOptions {
  certificateNumber: string;
  educatorName: string;
  programTitle?: string;
  completionDate: Date | string;
  issueDate?: Date | string;
  template?: {
    headline?: string;
    subtext?: string;
    bodyText?: string;
    badgeText?: string;
    issuerName?: string;
    issuerTitle?: string;
    primaryColor?: string;
    accentColor?: string;
  };
  verificationBaseUrl?: string;
}

/**
 * Converts hex color string (#16805B) to pdf-lib rgb(r, g, b) normalized 0..1
 */
function hexToRgb(hex: string, fallback = rgb(0.086, 0.502, 0.357)) {
  try {
    const clean = hex.replace("#", "").trim();
    if (clean.length === 6) {
      const r = parseInt(clean.substring(0, 2), 16) / 255;
      const g = parseInt(clean.substring(2, 4), 16) / 255;
      const b = parseInt(clean.substring(4, 6), 16) / 255;
      return rgb(r, g, b);
    }
  } catch {}
  return fallback;
}

/**
 * High-resolution vector PDF generator for official EduConnects Educator Certificates
 */
export async function generateCertificatePdf(options: GenerateCertificateOptions): Promise<Buffer> {
  const {
    certificateNumber,
    educatorName,
    programTitle = "15-Day Educator Training Program",
    completionDate,
    issueDate = new Date(),
    template,
    verificationBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://educonnects.co.in",
  } = options;

  // Create a new PDF Document in Landscape A4 (841.89 x 595.28 points)
  const pdfDoc = await PDFDocument.create();
  const width = 841.89;
  const height = 595.28;
  const page = pdfDoc.addPage([width, height]);

  // Embed standard fonts
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const timesItalicFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Palette colors
  const primaryEmerald = hexToRgb(template?.primaryColor || "#16805B");
  const darkForest = hexToRgb(template?.accentColor || "#0D5C41");
  const richGold = rgb(0.79, 0.63, 0.28); // #C9A147
  const softSlate = rgb(0.3, 0.35, 0.4);
  const darkText = rgb(0.08, 0.1, 0.12);
  const lightBgBorder = rgb(0.94, 0.97, 0.95);

  // 1. Background Fill: Clean, subtle warm white
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(0.99, 0.995, 0.99),
  });

  // 2. Outer Decorative Emerald Border
  const m = 24; // margin
  page.drawRectangle({
    x: m,
    y: m,
    width: width - m * 2,
    height: height - m * 2,
    borderColor: darkForest,
    borderWidth: 4,
    color: lightBgBorder,
  });

  // 3. Inner White Canvas Box
  const inM = 32;
  page.drawRectangle({
    x: inM,
    y: inM,
    width: width - inM * 2,
    height: height - inM * 2,
    borderColor: richGold,
    borderWidth: 1.5,
    color: rgb(1, 1, 1),
  });

  // Corner Ornaments (Small gold squares in corners)
  const cornerSize = 10;
  page.drawRectangle({ x: inM + 4, y: height - inM - 14, width: cornerSize, height: cornerSize, color: richGold });
  page.drawRectangle({ x: width - inM - 14, y: height - inM - 14, width: cornerSize, height: cornerSize, color: richGold });
  page.drawRectangle({ x: inM + 4, y: inM + 4, width: cornerSize, height: cornerSize, color: richGold });
  page.drawRectangle({ x: width - inM - 14, y: inM + 4, width: cornerSize, height: cornerSize, color: richGold });

  // 4. Header: Brand Logo & Title
  const brandTitle = "E D U C O N N E C T S   A C A D E M Y";
  const brandWidth = helveticaBoldFont.widthOfTextAtSize(brandTitle, 11);
  page.drawText(brandTitle, {
    x: (width - brandWidth) / 2,
    y: height - 76,
    size: 11,
    font: helveticaBoldFont,
    color: primaryEmerald,
  });

  // Verified Badge Ribbon
  const badgeText = template?.badgeText || "OFFICIAL CERTIFICATION OF EXCELLENCE";
  const badgeWidth = helveticaBoldFont.widthOfTextAtSize(badgeText, 8);
  const badgeBoxWidth = badgeWidth + 24;
  page.drawRectangle({
    x: (width - badgeBoxWidth) / 2,
    y: height - 102,
    width: badgeBoxWidth,
    height: 16,
    color: rgb(0.9, 0.96, 0.93),
    borderColor: primaryEmerald,
    borderWidth: 0.8,
  });
  page.drawText(badgeText, {
    x: (width - badgeWidth) / 2,
    y: height - 97,
    size: 8,
    font: helveticaBoldFont,
    color: darkForest,
  });

  // 5. Main Headline: "Certificate of Completion"
  const headline = template?.headline || "Certificate of Completion";
  const headlineWidth = timesBoldFont.widthOfTextAtSize(headline, 32);
  page.drawText(headline, {
    x: (width - headlineWidth) / 2,
    y: height - 150,
    size: 32,
    font: timesBoldFont,
    color: darkForest,
  });

  // 6. Subtext: "This is proudly presented to"
  const subtext = template?.subtext || "This is proudly presented to";
  const subtextWidth = timesItalicFont.widthOfTextAtSize(subtext, 14);
  page.drawText(subtext, {
    x: (width - subtextWidth) / 2,
    y: height - 180,
    size: 14,
    font: timesItalicFont,
    color: softSlate,
  });

  // 7. Educator Name (Dynamically sized and centered)
  let nameSize = 28;
  if (educatorName.length > 28) nameSize = 22;
  if (educatorName.length > 38) nameSize = 18;

  const nameWidth = timesBoldFont.widthOfTextAtSize(educatorName, nameSize);
  page.drawText(educatorName, {
    x: (width - nameWidth) / 2,
    y: height - 232,
    size: nameSize,
    font: timesBoldFont,
    color: darkText,
  });

  // Gold separator line below name
  const lineHalfWidth = Math.max(160, nameWidth / 2 + 30);
  page.drawLine({
    start: { x: width / 2 - lineHalfWidth, y: height - 246 },
    end: { x: width / 2 + lineHalfWidth, y: height - 246 },
    thickness: 1.5,
    color: richGold,
  });

  // 8. Body Text
  const bodyIntro = `for successfully completing the rigorous requirements of the`;
  const introWidth = helveticaFont.widthOfTextAtSize(bodyIntro, 11);
  page.drawText(bodyIntro, {
    x: (width - introWidth) / 2,
    y: height - 275,
    size: 11,
    font: helveticaFont,
    color: softSlate,
  });

  // Program Title
  const progWidth = helveticaBoldFont.widthOfTextAtSize(programTitle, 16);
  page.drawText(programTitle, {
    x: (width - progWidth) / 2,
    y: height - 302,
    size: 16,
    font: helveticaBoldFont,
    color: darkForest,
  });

  // Body Narrative
  const narrative =
    template?.bodyText ||
    "demonstrating proven mastery in live interactive classroom delivery, digital curriculum design, rubric-based evaluation, and online learner engagement on the EduConnects platform.";
  
  // Wrap narrative into 2 balanced lines
  const words = narrative.split(" ");
  const mid = Math.ceil(words.length / 2);
  const line1 = words.slice(0, mid).join(" ");
  const line2 = words.slice(mid).join(" ");

  const l1Width = helveticaFont.widthOfTextAtSize(line1, 10);
  const l2Width = helveticaFont.widthOfTextAtSize(line2, 10);

  page.drawText(line1, {
    x: (width - l1Width) / 2,
    y: height - 330,
    size: 10,
    font: helveticaFont,
    color: softSlate,
  });
  page.drawText(line2, {
    x: (width - l2Width) / 2,
    y: height - 346,
    size: 10,
    font: helveticaFont,
    color: softSlate,
  });

  // 9. Signatures & Seals
  const formattedCompletionDate =
    typeof completionDate === "string"
      ? completionDate
      : completionDate.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });

  // Left: Date Block
  const dateLabel = "DATE OF COMPLETION";
  page.drawLine({
    start: { x: 100, y: 130 },
    end: { x: 260, y: 130 },
    thickness: 1,
    color: rgb(0.7, 0.7, 0.7),
  });
  page.drawText(formattedCompletionDate, {
    x: 100 + (160 - helveticaBoldFont.widthOfTextAtSize(formattedCompletionDate, 11)) / 2,
    y: 138,
    size: 11,
    font: helveticaBoldFont,
    color: darkText,
  });
  page.drawText(dateLabel, {
    x: 100 + (160 - helveticaFont.widthOfTextAtSize(dateLabel, 8)) / 2,
    y: 115,
    size: 8,
    font: helveticaFont,
    color: softSlate,
  });

  // Center: Official Seal Medallion
  const sealRadius = 38;
  const sealCenterX = width / 2;
  const sealCenterY = 140;

  page.drawCircle({
    x: sealCenterX,
    y: sealCenterY,
    size: sealRadius,
    borderColor: richGold,
    borderWidth: 2,
    color: rgb(0.99, 0.98, 0.92),
  });
  page.drawCircle({
    x: sealCenterX,
    y: sealCenterY,
    size: sealRadius - 4,
    borderColor: primaryEmerald,
    borderWidth: 1,
  });
  const sealLine1 = "EDUCONNECTS";
  const sealLine2 = "VERIFIED";
  const sealLine3 = "OFFICIAL SEAL";
  page.drawText(sealLine1, {
    x: sealCenterX - helveticaBoldFont.widthOfTextAtSize(sealLine1, 7) / 2,
    y: sealCenterY + 12,
    size: 7,
    font: helveticaBoldFont,
    color: darkForest,
  });
  page.drawText(sealLine2, {
    x: sealCenterX - helveticaBoldFont.widthOfTextAtSize(sealLine2, 9) / 2,
    y: sealCenterY - 1,
    size: 9,
    font: helveticaBoldFont,
    color: richGold,
  });
  page.drawText(sealLine3, {
    x: sealCenterX - helveticaBoldFont.widthOfTextAtSize(sealLine3, 6) / 2,
    y: sealCenterY - 13,
    size: 6,
    font: helveticaBoldFont,
    color: darkForest,
  });

  // Right: Signature Block
  const issuerName = template?.issuerName || "EduConnects Academy";
  const issuerTitle = template?.issuerTitle || "Director of Academic Excellence";
  page.drawLine({
    start: { x: width - 260, y: 130 },
    end: { x: width - 100, y: 130 },
    thickness: 1,
    color: rgb(0.7, 0.7, 0.7),
  });
  page.drawText("Dr. Vikram Shrivastava", {
    x: width - 260 + (160 - timesItalicFont.widthOfTextAtSize("Dr. Vikram Shrivastava", 15)) / 2,
    y: 137,
    size: 15,
    font: timesItalicFont,
    color: darkForest,
  });
  page.drawText(issuerTitle, {
    x: width - 260 + (160 - helveticaBoldFont.widthOfTextAtSize(issuerTitle, 9)) / 2,
    y: 115,
    size: 9,
    font: helveticaBoldFont,
    color: darkText,
  });
  page.drawText(issuerName, {
    x: width - 260 + (160 - helveticaFont.widthOfTextAtSize(issuerName, 8)) / 2,
    y: 103,
    size: 8,
    font: helveticaFont,
    color: softSlate,
  });

  // 10. Footer Strip: Certificate ID, Public Verification URL & Official Company Entity
  const cleanBase = verificationBaseUrl.replace(/\/$/, "");
  const verificationUrl = `${cleanBase}/certificate/verify/${certificateNumber}`;

  const certIdText = `Certificate ID: ${certificateNumber}`;
  const verifyText = `Verify at: ${verificationUrl}`;
  const legalEntity = `Issued by Shrivastava ProFunnels Ventures Pvt Ltd | CIN: U85499UP2024PTC212061 | EduConnects Academy`;

  page.drawText(certIdText, {
    x: 48,
    y: 56,
    size: 8,
    font: helveticaBoldFont,
    color: darkForest,
  });

  page.drawText(verifyText, {
    x: width - 48 - helveticaFont.widthOfTextAtSize(verifyText, 8),
    y: 56,
    size: 8,
    font: helveticaFont,
    color: primaryEmerald,
  });

  const legalWidth = helveticaFont.widthOfTextAtSize(legalEntity, 7);
  page.drawText(legalEntity, {
    x: (width - legalWidth) / 2,
    y: 42,
    size: 7,
    font: helveticaFont,
    color: rgb(0.5, 0.55, 0.6),
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
