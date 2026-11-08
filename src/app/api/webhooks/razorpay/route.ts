import { NextRequest, NextResponse } from "next/server";
import { paymentService } from "@/services/payment.service";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { success: false, error: "Missing x-razorpay-signature header" },
        { status: 400 }
      );
    }

    // Process event with cryptographic verification and idempotency
    const result = await paymentService.processWebhookEvent(rawBody, signature);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Webhook processing failed" },
        { status: 400 }
      );
    }

    if (result.duplicate) {
      return NextResponse.json(
        {
          success: true,
          received: true,
          message: "Idempotent: Event already processed previously.",
          event: result.event,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        received: true,
        event: result.event,
        orderId: result.orderId,
        paymentStatus: result.paymentStatus,
        orderStatus: result.orderStatus,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Webhook handling error" },
      { status: 500 }
    );
  }
}
