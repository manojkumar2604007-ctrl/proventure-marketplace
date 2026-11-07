import { NextRequest, NextResponse } from "next/server";
import { paymentService } from "@/services/payment.service";

export async function POST(request: NextRequest) {
  try {
    const { amount, receipt } = await request.json();
    if (!amount) {
      return NextResponse.json(
        { success: false, error: "Amount is required" },
        { status: 400 }
      );
    }

    const order = await paymentService.createRazorpayOrder(
      amount,
      receipt || `rcpt_${Date.now()}`
    );

    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Razorpay initialization failed" },
      { status: 500 }
    );
  }
}
