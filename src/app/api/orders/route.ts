import { NextRequest, NextResponse } from "next/server";
import { orderService } from "@/services/order.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    const sellerId = searchParams.get("sellerId");

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const order = await orderService.createOrder(body);
    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create order" },
      { status: 400 }
    );
  }
}
