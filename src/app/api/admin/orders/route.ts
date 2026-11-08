import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/server-guard";
import { orderService } from "@/services/order.service";

export async function GET(request: NextRequest) {
  try {
    try {
      await requireAdmin();
    } catch (e: any) {
      return NextResponse.json({ success: false, error: e.message || "Forbidden: Admin access required" }, { status: e.status || 403 });
    }

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId") || undefined;
    const sellerId = searchParams.get("sellerId") || undefined;

    let orders;
    if (customerId) {
      orders = await orderService.getCustomerOrders(customerId);
    } else if (sellerId) {
      orders = await orderService.getSellerOrders(sellerId);
    } else {
      orders = await orderService.getAllOrders();
    }

    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
