import { NextRequest, NextResponse } from "next/server";
import { paymentService } from "@/services/payment.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      expectedAmount,
    } = body;

    // 1. Validate payload
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required verification fields: razorpayOrderId, razorpayPaymentId, and razorpaySignature are required.",
        },
        { status: 400 }
      );
    }

    // 2. Perform cryptographic verification & amount checks
    const result = await paymentService.verifyAndConfirmPayment({
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      expectedAmount,
    });

    if (!result.verified) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Payment verification failed",
          paymentStatus: result.paymentStatus,
          orderStatus: result.orderStatus,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      verified: true,
      message: "Payment signature cryptographically verified and recorded.",
      data: {
        orderId,
        razorpayPaymentId,
        paymentStatus: result.paymentStatus,
        orderStatus: result.orderStatus,
      },
    });
  } catch (error: any) {
    console.error("Payment verification route error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Payment verification failed" },
      { status: 500 }
    );
  }
}
