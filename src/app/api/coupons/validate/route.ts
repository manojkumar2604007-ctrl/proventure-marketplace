import { NextRequest, NextResponse } from "next/server";
import { couponService } from "@/services/coupon.service";

export async function POST(request: NextRequest) {
  try {
    const { code, subtotal } = await request.json();

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Coupon code is required" },
        { status: 400 }
      );
    }

    const orderSubtotal = typeof subtotal === "number" ? subtotal : 0;
    const result = await couponService.validateCoupon(code, orderSubtotal);

    if (!result.valid) {
      return NextResponse.json(
        { success: false, error: result.error || "Invalid coupon" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.coupon,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to validate coupon" },
      { status: 500 }
    );
  }
}
