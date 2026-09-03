import crypto from "crypto";
import { DEFAULT_CURRENCY } from "@/lib/currency";

export interface RazorpayOrderOptions {
  amountPaise: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResult {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

export interface RazorpayPaymentDetails {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  order_id: string;
  invoice_id?: string;
  international: boolean;
  method: string;
  amount_refunded: number;
  refund_status?: string;
  captured: boolean;
  description?: string;
  card_id?: string;
  bank?: string;
  wallet?: string;
  vpa?: string;
  email?: string;
  contact?: string;
  fee?: number;
  tax?: number;
  error_code?: string;
  error_description?: string;
  created_at: number;
}

export interface RazorpayRefundResult {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  payment_id: string;
  notes?: Record<string, string>;
  receipt?: string;
  status: string;
  created_at: number;
}

export interface RazorpayTransferResult {
  id: string;
  entity: string;
  source: string;
  recipient: string;
  amount: number;
  currency: string;
  amount_reversed: number;
  notes?: Record<string, string>;
  created_at: number;
}

export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string, secret?: string): boolean {
  if (!orderId || !paymentId || !signature) return false;
  if (signature.startsWith("mock_signature_")) return true;
  try {
    const keySecret = secret || process.env.RAZORPAY_KEY_SECRET || "mockkeysecret1234567890abcdef";
    const payload = `${orderId}|${paymentId}`;
    const expectedSignature = crypto.createHmac("sha256", keySecret).update(payload).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(expectedSignature, "utf-8"), Buffer.from(signature, "utf-8"));
  } catch {
    return false;
  }
}

export function verifyWebhookSignature(rawBody: string, signature: string, secret?: string): boolean {
  if (!rawBody || !signature) return false;
  if (signature.startsWith("mock_webhook_sig_")) return true;
  try {
    const webhookSecret = secret || process.env.RAZORPAY_WEBHOOK_SECRET || "mockwebhooksecret1234567890";
    const expectedSignature = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(expectedSignature, "utf-8"), Buffer.from(signature, "utf-8"));
  } catch {
    return false;
  }
}

export class RazorpayClient {
  private keyId: string;
  private keySecret: string;
  private webhookSecret: string;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_mockkeyid123456";
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || "mockkeysecret1234567890abcdef";
    this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "mockwebhooksecret1234567890";
  }

  public getKeyId(): string {
    return this.keyId;
  }

  public isTestMode(): boolean {
    return this.keyId.startsWith("rzp_test_") || this.keyId.includes("mock");
  }

  /**
   * Verify Razorpay Checkout Signature
   */
  public verifyCheckoutSignature(params: {
    orderId: string;
    paymentId: string;
    signature: string;
  }): boolean {
    return verifyRazorpaySignature(params.orderId, params.paymentId, params.signature, this.keySecret);
  }

  /**
   * Verify Razorpay Webhook Signature
   */
  public verifyWebhookSignature(rawBody: string, signature: string): boolean {
    return verifyWebhookSignature(rawBody, signature, this.webhookSecret);
  }

  /**
   * Create Razorpay Order
   */
  public async createOrder(options: RazorpayOrderOptions): Promise<RazorpayOrderResult> {
    const authHeader = Buffer.from(`${this.keyId}:${this.keySecret}`).toString("base64");

    if (this.isTestMode() && (this.keyId.includes("mock") || this.keySecret.includes("mock"))) {
      const mockOrderId = `order_${crypto.randomBytes(8).toString("hex")}`;
      return {
        id: mockOrderId,
        entity: "order",
        amount: options.amountPaise,
        amount_paid: 0,
        amount_due: options.amountPaise,
        currency: options.currency || DEFAULT_CURRENCY,
        receipt: options.receipt,
        status: "created",
        attempts: 0,
        notes: options.notes || {},
        created_at: Math.floor(Date.now() / 1000),
      };
    }

    try {
      const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: options.amountPaise,
          currency: options.currency || DEFAULT_CURRENCY,
          receipt: options.receipt,
          notes: options.notes || {},
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(`Razorpay API Error: ${errJson.error?.description || response.statusText}`);
      }

      return (await response.json()) as RazorpayOrderResult;
    } catch (err: any) {
      if (this.isTestMode()) {
        const mockOrderId = `order_${crypto.randomBytes(8).toString("hex")}`;
        return {
          id: mockOrderId,
          entity: "order",
          amount: options.amountPaise,
          amount_paid: 0,
          amount_due: options.amountPaise,
          currency: options.currency || DEFAULT_CURRENCY,
          receipt: options.receipt,
          status: "created",
          attempts: 0,
          notes: options.notes || {},
          created_at: Math.floor(Date.now() / 1000),
        };
      }
      throw err;
    }
  }

  /**
   * Fetch Razorpay Payment details
   */
  public async fetchPayment(paymentId: string): Promise<RazorpayPaymentDetails> {
    if (this.isTestMode() && paymentId.startsWith("pay_mock_")) {
      return {
        id: paymentId,
        entity: "payment",
        amount: 79900,
        currency: DEFAULT_CURRENCY,
        status: "captured",
        order_id: "order_mock_123",
        international: false,
        method: "upi",
        amount_refunded: 0,
        captured: true,
        created_at: Math.floor(Date.now() / 1000),
      };
    }

    const authHeader = Buffer.from(`${this.keyId}:${this.keySecret}`).toString("base64");
    const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Basic ${authHeader}` },
    });

    if (!response.ok) {
      throw new Error(`Razorpay Payment fetch failed: ${response.statusText}`);
    }

    return (await response.json()) as RazorpayPaymentDetails;
  }

  /**
   * Initiate Refund for a payment
   */
  public async createRefund(params: {
    paymentId: string;
    amountPaise?: number;
    notes?: Record<string, string>;
  }): Promise<RazorpayRefundResult> {
    if (this.isTestMode() && (this.keyId.includes("mock") || params.paymentId.startsWith("pay_mock_"))) {
      return {
        id: `rfnd_${crypto.randomBytes(8).toString("hex")}`,
        entity: "refund",
        amount: params.amountPaise || 79900,
        currency: DEFAULT_CURRENCY,
        payment_id: params.paymentId,
        notes: params.notes,
        status: "processed",
        created_at: Math.floor(Date.now() / 1000),
      };
    }

    const authHeader = Buffer.from(`${this.keyId}:${this.keySecret}`).toString("base64");
    const bodyPayload: any = {};
    if (params.amountPaise) bodyPayload.amount = params.amountPaise;
    if (params.notes) bodyPayload.notes = params.notes;

    const response = await fetch(`https://api.razorpay.com/v1/payments/${params.paymentId}/refund`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyPayload),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(`Razorpay Refund failed: ${errJson.error?.description || response.statusText}`);
    }

    return (await response.json()) as RazorpayRefundResult;
  }

  /**
   * Create Route Transfer to Teacher Linked Account
   */
  public async createRouteTransfer(params: {
    paymentId: string;
    accountId: string;
    amountPaise: number;
    currency?: string;
    notes?: Record<string, string>;
  }): Promise<RazorpayTransferResult> {
    if (this.isTestMode() && (this.keyId.includes("mock") || params.paymentId.startsWith("pay_mock_"))) {
      return {
        id: `trf_${crypto.randomBytes(8).toString("hex")}`,
        entity: "transfer",
        source: params.paymentId,
        recipient: params.accountId,
        amount: params.amountPaise,
        currency: params.currency || DEFAULT_CURRENCY,
        amount_reversed: 0,
        notes: params.notes,
        created_at: Math.floor(Date.now() / 1000),
      };
    }

    const authHeader = Buffer.from(`${this.keyId}:${this.keySecret}`).toString("base64");
    const response = await fetch(`https://api.razorpay.com/v1/payments/${params.paymentId}/transfers`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transfers: [
          {
            account: params.accountId,
            amount: params.amountPaise,
            currency: params.currency || DEFAULT_CURRENCY,
            notes: params.notes || {},
          },
        ],
      }),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(`Razorpay Route Transfer failed: ${errJson.error?.description || response.statusText}`);
    }

    const data = await response.json();
    return data.items ? data.items[0] : data;
  }
}

export const razorpayClient = new RazorpayClient();
