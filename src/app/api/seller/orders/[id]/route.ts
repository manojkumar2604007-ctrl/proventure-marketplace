import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";
import { orderService } from "@/services/order.service";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Please sign in." },
        { status: 401 }
      );
    }

    const role = (session.user as any).role;
    if (role !== "SELLER" && role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Only authorized merchants can query orders." },
        { status: 403 }
      );
    }

    const sellerId = (session.user as any).sellerProfileId || (session.user as any).storeId || (session.user as any).id;
    const orderId = params.id;

    const order = await orderService.getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    // Verify order contains items from this seller
    const hasSellerItems = order.items.some((i) => i.sellerId === sellerId);
    if (role !== "ADMIN" && !hasSellerItems) {
      return NextResponse.json(
        { success: false, error: "Forbidden: You cannot access orders without your store's merchandise." },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch order details" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Please sign in." },
        { status: 401 }
      );
    }

    const role = (session.user as any).role;
    if (role !== "SELLER" && role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Only authorized merchants can update orders." },
        { status: 403 }
      );
    }

    const sellerId = (session.user as any).sellerProfileId || (session.user as any).storeId || (session.user as any).id;
    const orderId = params.id;

    const order = await orderService.getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    const body = await request.json();
    const { itemId, fulfillmentStatus, trackingNumber, carrier, action, approved, reason } = body;

    // Support resolution of return requests
    if (action === "RESOLVE_RETURN") {
      const res = await orderService.resolveReturn(
        orderId,
        approved ?? true,
        {
          id: sellerId,
          name: (session.user as any)?.name || "Merchant",
          role: "SELLER",
        },
        reason
      );
      return NextResponse.json(res);
    }

    // Support acceptance of cancellation
    if (action === "CANCEL_ORDER") {
      const res = await orderService.requestCancellation(orderId, reason, {
        id: sellerId,
        name: (session.user as any)?.name || "Merchant",
        role: "SELLER",
      });
      return NextResponse.json(res);
    }

    if (!itemId || !fulfillmentStatus) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: itemId and fulfillmentStatus" },
        { status: 400 }
      );
    }

    // Verify item belongs to this seller
    const targetItem = order.items.find((i) => i.id === itemId);
    if (!targetItem) {
      return NextResponse.json({ success: false, error: "Item not found in order" }, { status: 404 });
    }

    if (role !== "ADMIN" && targetItem.sellerId !== sellerId) {
      return NextResponse.json(
        { success: false, error: "Forbidden: You cannot modify merchandise from another seller." },
        { status: 403 }
      );
    }

    const updated = await orderService.updateItemFulfillmentStatus(
      orderId,
      itemId,
      fulfillmentStatus,
      trackingNumber,
      carrier,
      {
        id: sellerId,
        name: (session?.user as any)?.name || "Merchant Dispatcher",
        role: "SELLER",
        sellerProfileId: sellerId,
      }
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update item fulfillment" },
      { status: 500 }
    );
  }
}
