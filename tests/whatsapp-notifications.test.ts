import assert from "assert";
import { prisma } from "../lib/prisma";
import { WhatsAppClient } from "../lib/whatsapp/whatsapp-client";
import { WhatsAppService } from "../services/whatsapp-service";
import { DEFAULT_WHATSAPP_TEMPLATES, WhatsAppEventType } from "../lib/whatsapp/whatsapp-templates";
import { NextRequest } from "next/server";
import { GET as webhookGET, POST as webhookPOST } from "../app/api/webhooks/whatsapp/route";

async function runWhatsAppTests() {
  console.log("================================================================================");
  console.log("🚀 STARTING AUTOMATED META WHATSAPP CLOUD API INTEGRATION TEST SUITE");
  console.log("================================================================================\n");

  const testSuffix = Date.now();
  const testPhoneRaw = "9109019090"; // 10-digit Indian test number

  // ---------------------------------------------------------------------------
  // TEST 1: Phone Number Normalization
  // ---------------------------------------------------------------------------
  console.log("📋 Test 1: Verifying WhatsApp Phone Number Normalization...");
  {
    // 10-digit Indian number
    const norm1 = WhatsAppClient.formatWhatsAppPhoneNumber("9109019090");
    assert.strictEqual(norm1, "919109019090", "10-digit Indian number must be prefixed with 91");

    // 11-digit with leading 0
    const norm2 = WhatsAppClient.formatWhatsAppPhoneNumber("09109019090");
    assert.strictEqual(norm2, "919109019090", "11-digit number with leading 0 must replace 0 with 91");

    // +91 with spaces
    const norm3 = WhatsAppClient.formatWhatsAppPhoneNumber("+91 91090 19090");
    assert.strictEqual(norm3, "919109019090", "Formatted phone with + and spaces must normalize to E.164 digits");

    // Invalid length
    const normInvalid = WhatsAppClient.formatWhatsAppPhoneNumber("12345");
    assert.strictEqual(normInvalid, null, "Short phone numbers must return null");

    // Null/undefined input
    assert.strictEqual(WhatsAppClient.formatWhatsAppPhoneNumber(null), null, "Null input must return null");
    console.log("   ✅ Phone normalization successfully verified for all formats.\n");
  }

  // ---------------------------------------------------------------------------
  // TEST 2: Template Parameter Builders for All 16 Events
  // ---------------------------------------------------------------------------
  console.log("📋 Test 2: Verifying Template Parameter Builders for All Events...");
  {
    const eventTypes: WhatsAppEventType[] = [
      "LEARNER_REGISTRATION",
      "EDUCATOR_REGISTRATION",
      "EDUCATOR_VERIFIED",
      "EDUCATOR_VERIFICATION_PENDING",
      "EDUCATOR_REJECTED",
      "PAYMENT_SUCCESS",
      "PAYMENT_RECEIPT",
      "PAYMENT_FAILED",
      "REFUND_REQUESTED",
      "REFUND_APPROVED",
      "REFUND_COMPLETED",
      "REFUND_REJECTED",
      "COURSE_ENROLLED",
      "BOOKING_CONFIRMED",
      "CLASS_REMINDER",
      "CLASS_CANCELLED",
    ];

    for (const event of eventTypes) {
      const templateDef = DEFAULT_WHATSAPP_TEMPLATES[event];
      assert.ok(templateDef, `Template definition for ${event} must exist`);
      assert.ok(templateDef.defaultName, `Default template name for ${event} must exist`);

      const components = templateDef.buildComponents({
        name: "Aarav Sharma",
        title: "Full Stack Mastery",
        amount: "₹1,499.00",
        orderId: "ORDER_12345",
        receiptNumber: "RCPT-98765",
        receiptUrl: "https://educonnects.in/student/payments/tx_123",
        date: "21/09/2026",
        reason: "Testing rejection",
        courseTitle: "Full Stack Mastery",
        classTitle: "Live React Class",
        startTime: "10:00 AM IST",
        timeLabel: "10 minutes",
      });

      assert.ok(Array.isArray(components), `Components for ${event} must be an array`);
      assert.ok(components.length > 0, `Components for ${event} must contain at least body`);
      assert.ok(components[0].parameters.length > 0, `Body parameters for ${event} must be populated`);
    }
    console.log("   ✅ All 16 event template parameter builders verified successfully.\n");
  }

  // ---------------------------------------------------------------------------
  // TEST 3: Zero-Disruption & Message Logging
  // ---------------------------------------------------------------------------
  console.log("📋 Test 3: Verifying Zero-Disruption & Safe Database Logging...");
  {
    // Test creating an event notification. Even if credentials are not configured in test environment,
    // the system MUST NOT throw, and MUST record a FAILED log in whatsapp_messages with a clear explanation.
    const idempotencyKey1 = `test-idemp-${testSuffix}-1`;
    const res = await WhatsAppService.sendEventNotification({
      phone: testPhoneRaw,
      eventType: "PAYMENT_SUCCESS",
      data: {
        name: "Rohan Verma",
        title: "Advanced Mathematics Live",
        amount: "₹2,500.00",
        date: "21/09/2026",
        orderId: `ORDER_TEST_${testSuffix}`,
        supportInfo: "support@educonnects.com | +91 9109019090",
      },
      idempotencyKey: idempotencyKey1,
    });

    assert.ok(res, "sendEventNotification must return a result object");
    assert.ok(res.messageId, "A WhatsAppMessage database record must be created");

    // Inspect database log
    const logged = await prisma.whatsAppMessage.findUnique({
      where: { id: res.messageId },
    });
    assert.ok(logged, "Logged message must exist in database");
    assert.strictEqual(logged.eventType, "PAYMENT_SUCCESS");
    assert.strictEqual(logged.phoneNumber, "919109019090");
    assert.strictEqual(logged.templateName, "edu_payment_success");
    assert.strictEqual(logged.idempotencyKey, idempotencyKey1);
    console.log(`   ✅ Message logged safely in DB (Status: ${logged.status}, ID: ${logged.id}).\n`);
  }

  // ---------------------------------------------------------------------------
  // TEST 4: Idempotency & Deduplication
  // ---------------------------------------------------------------------------
  console.log("📋 Test 4: Verifying Idempotency & Duplicate Prevention...");
  {
    const idempotencyKey2 = `test-idemp-${testSuffix}-dedup`;

    // First send
    const firstCall = await WhatsAppService.sendEventNotification({
      phone: testPhoneRaw,
      eventType: "REFUND_REQUESTED",
      data: {
        name: "Pooja Patel",
        title: "Python Crash Course",
        amount: "₹999.00",
      },
      idempotencyKey: idempotencyKey2,
    });

    assert.ok(firstCall.messageId, "First call must persist message");

    // Manually mark as SENT to simulate successful transmission
    await prisma.whatsAppMessage.update({
      where: { id: firstCall.messageId },
      data: { status: "SENT", metaMessageId: `wamid.test.${testSuffix}` },
    });

    // Repeated call with the same idempotencyKey
    const duplicateCall = await WhatsAppService.sendEventNotification({
      phone: testPhoneRaw,
      eventType: "REFUND_REQUESTED",
      data: {
        name: "Pooja Patel",
        title: "Python Crash Course",
        amount: "₹999.00",
      },
      idempotencyKey: idempotencyKey2,
    });

    assert.strictEqual(
      duplicateCall.messageId,
      firstCall.messageId,
      "Duplicate call must return existing message ID without creating duplicate"
    );
    assert.strictEqual(duplicateCall.status, "SENT", "Status must match existing status");

    // Verify only 1 record exists with this idempotency key
    const count = await prisma.whatsAppMessage.count({
      where: { idempotencyKey: idempotencyKey2 },
    });
    assert.strictEqual(count, 1, "Exactly one database record must exist for this idempotency key");
    console.log("   ✅ Idempotency successfully prevented duplicate notification.\n");
  }

  // ---------------------------------------------------------------------------
  // TEST 5: Missing / Invalid Phone Number Safety
  // ---------------------------------------------------------------------------
  console.log("📋 Test 5: Verifying Missing/Invalid Phone Number Handling...");
  {
    const invalidRes = await WhatsAppService.sendEventNotification({
      phone: "invalid_not_a_number",
      eventType: "PAYMENT_FAILED",
      data: {
        name: "Test User",
        title: "Web Dev Course",
        orderId: "ORD_FAILED",
        reason: "Card declined",
      },
      idempotencyKey: `test-invalid-phone-${testSuffix}`,
    });

    assert.strictEqual(invalidRes.status, "FAILED");
    assert.ok(invalidRes.error?.includes("Invalid phone number"), "Error must state invalid phone number");

    const loggedInvalid = await prisma.whatsAppMessage.findUnique({
      where: { id: invalidRes.messageId },
    });
    assert.ok(loggedInvalid);
    assert.strictEqual(loggedInvalid.status, "FAILED");
    console.log("   ✅ Handled invalid recipient phone number safely without error throw.\n");
  }

  // ---------------------------------------------------------------------------
  // TEST 6: Meta WhatsApp Webhook Handshake (GET)
  // ---------------------------------------------------------------------------
  console.log("📋 Test 6: Verifying Meta Webhook Challenge Handshake (GET)...");
  {
    const challenge = "test_meta_challenge_123456";
    const req = new NextRequest(
      `http://localhost:3000/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=educonnects_whatsapp_verify_token_secure&hub.challenge=${challenge}`
    );

    const res = await webhookGET(req);
    assert.strictEqual(res.status, 200, "Webhook handshake must return 200 OK");
    const body = await res.text();
    assert.strictEqual(body, challenge, "Webhook handshake must echo the challenge");
    console.log("   ✅ Meta webhook verification handshake confirmed.\n");
  }

  // ---------------------------------------------------------------------------
  // TEST 7: Meta WhatsApp Delivery Status Updates (POST Webhook)
  // ---------------------------------------------------------------------------
  console.log("📋 Test 7: Verifying Delivery & Read Status Updates via Webhook (POST)...");
  {
    // Create a dummy SENT message with a known metaMessageId
    const testWamid = `wamid.HBg.${testSuffix}`;
    const sentMsg = await prisma.whatsAppMessage.create({
      data: {
        phoneNumber: "919109019090",
        eventType: "PAYMENT_RECEIPT",
        templateName: "edu_payment_receipt",
        metaMessageId: testWamid,
        status: "SENT",
        sentAt: new Date(),
      },
    });

    // 1. Simulate DELIVERED webhook
    const deliveredPayload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "WABA_ID",
          changes: [
            {
              field: "messages",
              value: {
                messaging_product: "whatsapp",
                statuses: [
                  {
                    id: testWamid,
                    status: "delivered",
                    timestamp: Math.floor(Date.now() / 1000).toString(),
                    recipient_id: "919109019090",
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const delivReq = new NextRequest("http://localhost:3000/api/webhooks/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(deliveredPayload),
    });

    const delivRes = await webhookPOST(delivReq);
    assert.strictEqual(delivRes.status, 200);

    const updatedAfterDeliv = await prisma.whatsAppMessage.findUnique({
      where: { id: sentMsg.id },
    });
    assert.strictEqual(updatedAfterDeliv?.status, "DELIVERED", "Status must update to DELIVERED");
    assert.ok(updatedAfterDeliv?.deliveredAt, "deliveredAt must be set");

    // 2. Simulate READ webhook
    const readPayload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "WABA_ID",
          changes: [
            {
              field: "messages",
              value: {
                messaging_product: "whatsapp",
                statuses: [
                  {
                    id: testWamid,
                    status: "read",
                    timestamp: Math.floor(Date.now() / 1000).toString(),
                    recipient_id: "919109019090",
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const readReq = new NextRequest("http://localhost:3000/api/webhooks/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(readPayload),
    });

    const readRes = await webhookPOST(readReq);
    assert.strictEqual(readRes.status, 200);

    const updatedAfterRead = await prisma.whatsAppMessage.findUnique({
      where: { id: sentMsg.id },
    });
    assert.strictEqual(updatedAfterRead?.status, "READ", "Status must update to READ");
    assert.ok(updatedAfterRead?.readAt, "readAt must be set");

    console.log("   ✅ Real-time delivery and read receipts transitioned status correctly (SENT -> DELIVERED -> READ).\n");
  }

  // ---------------------------------------------------------------------------
  // TEST 8: Admin Retry Capability for Failed Messages
  // ---------------------------------------------------------------------------
  console.log("📋 Test 8: Verifying Admin Retry Functionality...");
  {
    const failedMsg = await prisma.whatsAppMessage.create({
      data: {
        phoneNumber: "919109019090",
        eventType: "BOOKING_CONFIRMED",
        templateName: "edu_booking_confirmed",
        parameters: JSON.stringify({
          name: "Arjun Mehta",
          classTitle: "Live Science Masterclass",
          startTime: "5:00 PM IST",
        }),
        status: "FAILED",
        errorMessage: "Network timeout or simulation mode",
        failedAt: new Date(),
      },
    });

    const retryResult = await WhatsAppService.retryMessage(failedMsg.id);
    assert.ok(retryResult, "retryMessage must return result object");

    const messageAfterRetry = await prisma.whatsAppMessage.findUnique({
      where: { id: failedMsg.id },
    });
    assert.ok(messageAfterRetry, "Message must exist after retry");
    console.log(`   ✅ Retry executed cleanly (Current status: ${messageAfterRetry.status}).\n`);
  }

  // Clean up test records
  await prisma.whatsAppMessage.deleteMany({
    where: {
      phoneNumber: { in: ["919109019090", "invalid_not_a_number"] },
    },
  });

  console.log("================================================================================");
  console.log("🎉 ALL 8 AUTOMATED META WHATSAPP CLOUD API TESTS PASSED CLEANLY!");
  console.log("================================================================================\n");
}

runWhatsAppTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ [Test Suite Failed]:", err);
    process.exit(1);
  });
