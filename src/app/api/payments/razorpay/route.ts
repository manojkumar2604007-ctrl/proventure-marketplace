import { NextRequest, NextResponse } from "next/server";
import { paymentService } from "@/services/payment.service";

export async function GET() {
  try {
    const keyId = paymentService.getPublicKey();
    return NextResponse.json({
      success: true,
      data: { keyId },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve public key" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { amount, receipt, notes, currency } = await request.json();

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "A valid positive numeric amount in INR is required" },
        { status: 400 }
      );
    }

    if (currency && currency !== "INR") {
      return NextResponse.json(
        { success: false, error: "Only INR currency is accepted by ProVenture Marketplace" },
        { status: 400 }
      );
    }

    const orderReceipt = receipt || `rcpt_${Date.now()}`;
    const razorpayOrder = await paymentService.createRazorpayOrder(
      amount,
      orderReceipt,
      notes
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          orderId: razorpayOrder.id,
          amount: razorpayOrder.amount, // In paise
          currency: razorpayOrder.currency,
          receipt: razorpayOrder.receipt,
          keyId: razorpayOrder.keyId,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Razorpay order creation failed" },
      { status: 500 }
    );
  }
}
