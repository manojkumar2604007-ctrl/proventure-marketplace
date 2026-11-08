import { describe, it, expect } from "./test-utils";
import { paymentService } from "@/services/payment.service";

describe("5. Payment Security & Webhook Replay Tests", () => {
  const testOrderId = `order_rzp_sec_${Date.now()}`;
  const testPaymentId = `pay_rzp_sec_${Math.random().toString(36).substring(2, 10)}`;

  it("should create a Razorpay order in paise with INR currency", async () => {
    const amountInRupees = 3499;
    const receipt = `rcpt_${Date.now()}`;
    const order = await paymentService.createRazorpayOrder(amountInRupees, receipt);

    expect(order).toBeDefined();
    expect(order.id).toBeDefined();
    expect(order.amount).toBe(349900); // 3499 * 100 paise
    expect(order.currency).toBe("INR");
    expect(order.receipt).toBe(receipt);
  });

  it("should reject invalid non-positive payment order creation", async () => {
    await expect(paymentService.createRazorpayOrder(-50, "rcpt_neg")).rejects.toThrow("amount");
    await expect(paymentService.createRazorpayOrder(0, "rcpt_zero")).rejects.toThrow("amount");
  });

  it("should verify valid HMAC-SHA256 payment signature using timing-safe comparison", () => {
    const validSignature = paymentService.generateTestSignature(testOrderId, testPaymentId);

    const isValid = paymentService.verifyPaymentSignature({
      razorpayOrderId: testOrderId,
      razorpayPaymentId: testPaymentId,
      razorpaySignature: validSignature,
    });

    expect(isValid).toBe(true);
  });

  it("should reject tampered or forged payment signatures", () => {
    const forgedSignature = "0000000000000000000000000000000000000000000000000000000000000000";

    const isValid = paymentService.verifyPaymentSignature({
      razorpayOrderId: testOrderId,
      razorpayPaymentId: testPaymentId,
      razorpaySignature: forgedSignature,
    });

    expect(isValid).toBe(false);
  });

  it("should reject missing or empty signature parameters", () => {
    expect(
      paymentService.verifyPaymentSignature({
        razorpayOrderId: "",
        razorpayPaymentId: testPaymentId,
        razorpaySignature: "sig",
      })
    ).toBe(false);

    expect(
      paymentService.verifyPaymentSignature({
        razorpayOrderId: testOrderId,
        razorpayPaymentId: "",
        razorpaySignature: "sig",
      })
    ).toBe(false);
  });

  it("should detect duplicate payment processing (Replay Attack Prevention)", async () => {
    const replayPaymentId = `pay_replay_${Date.now()}`;
    const replayOrderId = `order_replay_${Date.now()}`;
    const replaySig = paymentService.generateTestSignature(replayOrderId, replayPaymentId);

    // First attempt: should succeed
    const firstResult = await paymentService.verifyAndConfirmPayment({
      orderId: "order_123",
      razorpayOrderId: replayOrderId,
      razorpayPaymentId: replayPaymentId,
      razorpaySignature: replaySig,
    });

    expect(firstResult.verified).toBe(true);
    expect(firstResult.paymentStatus).toBe("PAID");

    // Second attempt with exact same payment ID (Replay Attack): MUST be rejected
    const secondResult = await paymentService.verifyAndConfirmPayment({
      orderId: "order_123",
      razorpayOrderId: replayOrderId,
      razorpayPaymentId: replayPaymentId,
      razorpaySignature: replaySig,
    });

    expect(secondResult.verified).toBe(false);
    expect(secondResult.error).toContain("Duplicate payment");
  });

  it("should verify webhook signature and handle events idempotently", async () => {
    const webhookPayload = JSON.stringify({
      entity: "event",
      event_id: `evt_test_${Date.now()}`,
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: `pay_hook_${Date.now()}`,
            order_id: "order_hook_123",
            amount: 50000,
            currency: "INR",
            status: "captured",
            method: "upi",
          },
        },
      },
    });

    const validWebhookSig = paymentService.generateTestWebhookSignature(webhookPayload);

    // Verify webhook signature
    const isWebhookValid = paymentService.verifyWebhookSignature(webhookPayload, validWebhookSig);
    expect(isWebhookValid).toBe(true);

    // Process event 1st time
    const result1 = await paymentService.processWebhookEvent(webhookPayload, validWebhookSig);
    expect(result1.success).toBe(true);
    expect(result1.duplicate).toBeFalsy();

    // Process event 2nd time (duplicate replay) -> idempotent duplicate flag returned
    const result2 = await paymentService.processWebhookEvent(webhookPayload, validWebhookSig);
    expect(result2.success).toBe(true);
    expect(result2.duplicate).toBe(true);
  });
});
