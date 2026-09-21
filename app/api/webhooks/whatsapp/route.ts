import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET: Meta Webhook Verification Handshake
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const expectedToken =
    process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "educonnects_whatsapp_verify_token_secure";

  if (mode === "subscribe" && token === expectedToken) {
    console.log("✅ [WhatsApp Webhook]: Verification handshake verified successfully.");
    return new NextResponse(challenge, { status: 200 });
  }

  console.warn("⚠️ [WhatsApp Webhook]: Verification handshake failed with token mismatch.");
  return new NextResponse("Forbidden", { status: 403 });
}

/**
 * POST: Incoming Delivery Status & Read Receipts from Meta
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.object !== "whatsapp_business_account") {
      return NextResponse.json({ status: "IGNORED" }, { status: 200 });
    }

    const entries = body.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        if (change.field !== "messages") continue;

        const value = change.value || {};
        const statuses = value.statuses || [];

        for (const statusItem of statuses) {
          const wamid = statusItem.id;
          const status = statusItem.status; // "sent" | "delivered" | "read" | "failed"
          const timestamp = statusItem.timestamp
            ? new Date(parseInt(statusItem.timestamp, 10) * 1000)
            : new Date();

          if (!wamid) continue;

          // Find logged message by Meta Message ID
          const existing = await prisma.whatsAppMessage.findFirst({
            where: { metaMessageId: wamid },
          });

          if (!existing) continue;

          if (status === "delivered") {
            await prisma.whatsAppMessage.update({
              where: { id: existing.id },
              data: {
                status: "DELIVERED",
                deliveredAt: timestamp,
              },
            });
          } else if (status === "read") {
            await prisma.whatsAppMessage.update({
              where: { id: existing.id },
              data: {
                status: "READ",
                readAt: timestamp,
              },
            });
          } else if (status === "failed") {
            const errorDetails = statusItem.errors?.[0];
            const errorMsg = errorDetails
              ? `${errorDetails.title || "Delivery error"}: ${errorDetails.message || ""}`
              : "WhatsApp delivery failed";

            await prisma.whatsAppMessage.update({
              where: { id: existing.id },
              data: {
                status: "FAILED",
                errorMessage: errorMsg,
                failedAt: timestamp,
              },
            });
          }
        }
      }
    }

    return NextResponse.json({ status: "EVENT_RECEIVED" }, { status: 200 });
  } catch (err: any) {
    console.error("❌ [WhatsApp Webhook Error]:", err);
    return NextResponse.json({ status: "ERROR", error: err.message }, { status: 500 });
  }
}
