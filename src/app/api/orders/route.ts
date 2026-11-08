import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";
import { orderService } from "@/services/order.service";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    const sellerId = searchParams.get("sellerId");

    // Server-side ownership validation for Customer role
    if (session?.user) {
      const userRole = (session.user as any).role;
      const userId = (session.user as any).id;

      if (userRole === "CUSTOMER") {
        // Customer can only view their own orders
        const targetId = customerId || userId;
        if (customerId && customerId !== userId) {
          return NextResponse.json(
            { success: false, error: "Access denied. You can only view your own orders." },
            { status: 403 }
          );
        }
        const orders = await orderService.getCustomerOrders(targetId);
        return NextResponse.json({ success: true, data: orders });
      }

      if (userRole === "SELLER") {
        const targetSeller = sellerId || (session.user as any).sellerProfileId || userId;
        const orders = await orderService.getSellerOrders(targetSeller);
        return NextResponse.json({ success: true, data: orders });
      }
    }

    // Default: for demo/admin queries
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
    const session = await getServerSession(authOptions);
    const body = await request.json();

    // Server-side customer binding
    if (session?.user) {
      const userId = (session.user as any).id;
      if (body.customerId && body.customerId !== userId && (session.user as any).role !== "ADMIN") {
        return NextResponse.json(
          { success: false, error: "Forbidden: Cannot place orders on behalf of another user" },
          { status: 403 }
        );
      }
    }

    const order = await orderService.createOrder(body);
    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create order" },
      { status: 400 }
    );
  }
}
