import { NextRequest, NextResponse } from "next/server";
import { paymentService } from "@/services/payment.service";
import { orderService } from "@/services/order.service";

export const dynamic = "force-dynamic";

export async function GET() {
  const testResults: Array<{
    name: string;
    passed: boolean;
    details: string;
  }> = [];

  try {
    // 1. Order Creation Test
    const testAmount = 2499;
    const testReceipt = `test_rcpt_${Date.now()}`;
    const orderRes = await paymentService.createRazorpayOrder(testAmount, testReceipt);
    
    testResults.push({
      name: "1. Server Creates Payment Order",
      passed: orderRes.amount === 249900 && orderRes.currency === "INR" && !!orderRes.id,
      details: `Order created: ${orderRes.id}, Amount: ${orderRes.amount} paise, Currency: ${orderRes.currency}`,
    });

    // 2. Cryptographic Signature Verification (Valid Case)
    const testOrderId = `order_test_${Date.now()}`;
    const testPaymentId = `pay_test_${Math.random().toString(36).substring(2, 10)}`;
    const validSignature = paymentService.generateTestSignature(testOrderId, testPaymentId);

    const isValidSig = paymentService.verifyPaymentSignature({
      razorpayOrderId: testOrderId,
      razorpayPaymentId: testPaymentId,
      razorpaySignature: validSignature,
    });

    testResults.push({
      name: "2. Cryptographic Signature Verification (Valid)",
      passed: isValidSig === true,
      details: `HMAC-SHA256 signature validated successfully with timing-safe check`,
    });

    // 3. Forged Signature Rejection (Security & Anti-Tampering)
    const forgedSignature = "invalid_tampered_signature_hex_00000000000000000000000000000000";
    const isForgedSigValid = paymentService.verifyPaymentSignature({
      razorpayOrderId: testOrderId,
      razorpayPaymentId: testPaymentId,
      razorpaySignature: forgedSignature,
    });

    testResults.push({
      name: "3. Forged Signature Rejection (Tampering Protection)",
      passed: isForgedSigValid === false,
      details: "Forged signature correctly rejected",
    });

    // 4. Duplicate Payment Processing / Replay Attack Prevention
    const replayPaymentId = `pay_replay_${Date.now()}`;
    const replaySig = paymentService.generateTestSignature("order_1", replayPaymentId);

    // First payment recording
    const firstAttempt = await paymentService.verifyAndConfirmPayment({
      razorpayOrderId: "order_1",
      razorpayPaymentId: replayPaymentId,
      razorpaySignature: replaySig,
    });

    // Second payment recording attempt (replay)
    const replayAttempt = await paymentService.verifyAndConfirmPayment({
      razorpayOrderId: "order_1",
      razorpayPaymentId: replayPaymentId,
      razorpaySignature: replaySig,
    });

    testResults.push({
      name: "4. Duplicate Payment Processing / Replay Attack Prevention",
      passed: firstAttempt.verified === true && replayAttempt.verified === false,
      details: `First attempt: ${firstAttempt.verified ? "Accepted" : "Rejected"}, Replay attempt: ${replayAttempt.verified ? "Accepted (FAIL)" : "Blocked (PASS)"}`,
    });

    // 5. Webhook Signature Verification (Valid & Invalid)
    const webhookPayload = JSON.stringify({
      entity: "event",
      event_id: `evt_test_${Date.now()}`,
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: `pay_wbk_${Date.now()}`,
            amount: 249900,
            currency: "INR",
            status: "captured",
          },
        },
      },
    });

    const validWebhookSig = paymentService.generateTestWebhookSignature(webhookPayload);
    const isWebhookSigValid = paymentService.verifyWebhookSignature(webhookPayload, validWebhookSig);
    const isInvalidWebhookSigRejected = !paymentService.verifyWebhookSignature(webhookPayload, "wrong_sig_123");

    testResults.push({
      name: "5. Webhook Signature Verification & Anti-Spoofing",
      passed: isWebhookSigValid && isInvalidWebhookSigRejected,
      details: `Valid signature: ${isWebhookSigValid}, Spoofed signature rejected: ${isInvalidWebhookSigRejected}`,
    });

    // 6. Idempotent Webhook Event Handling
    const idempotencyPayload = JSON.stringify({
      entity: "event",
      event_id: `evt_idempotency_test_${Date.now()}`,
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: `pay_idem_${Date.now()}`,
            amount: 150000,
            currency: "INR",
            status: "captured",
          },
        },
      },
    });

    const idemSig = paymentService.generateTestWebhookSignature(idempotencyPayload);
    const firstDelivery = await paymentService.processWebhookEvent(idempotencyPayload, idemSig);
    const secondDelivery = await paymentService.processWebhookEvent(idempotencyPayload, idemSig);

    testResults.push({
      name: "6. Idempotent Webhook Processing (Duplicate Event Handling)",
      passed: firstDelivery.success && !firstDelivery.duplicate && secondDelivery.success && secondDelivery.duplicate === true,
      details: `First delivery: processed (${!firstDelivery.duplicate}), Second delivery: duplicate flagged (${secondDelivery.duplicate})`,
    });

    // 7. Status Segregation: Payment Status vs Order Status
    const capturedPayload = JSON.stringify({
      event_id: `evt_cap_${Date.now()}`,
      event: "payment.captured",
      payload: { payment: { entity: { id: `pay_cap_${Date.now()}` } } },
    });
    const failedPayload = JSON.stringify({
      event_id: `evt_fail_${Date.now()}`,
      event: "payment.failed",
      payload: { payment: { entity: { id: `pay_fail_${Date.now()}` } } },
    });

    const capRes = await paymentService.processWebhookEvent(
      capturedPayload,
      paymentService.generateTestWebhookSignature(capturedPayload)
    );
    const failRes = await paymentService.processWebhookEvent(
      failedPayload,
      paymentService.generateTestWebhookSignature(failedPayload)
    );

    const statusesSegregated =
      capRes.paymentStatus === "PAID" &&
      capRes.orderStatus === "CONFIRMED" &&
      failRes.paymentStatus === "FAILED" &&
      failRes.orderStatus === "CANCELLED";

    testResults.push({
      name: "7. Independent Payment Status and Order Status Segregation",
      passed: statusesSegregated,
      details: `Captured: Payment=${capRes.paymentStatus}, Order=${capRes.orderStatus} | Failed: Payment=${failRes.paymentStatus}, Order=${failRes.orderStatus}`,
    });

    const allPassed = testResults.every((t) => t.passed);

    return NextResponse.json({
      success: true,
      allPassed,
      totalTests: testResults.length,
      passedTests: testResults.filter((t) => t.passed).length,
      tests: testResults,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Test suite execution error", tests: testResults },
      { status: 500 }
    );
  }
}
