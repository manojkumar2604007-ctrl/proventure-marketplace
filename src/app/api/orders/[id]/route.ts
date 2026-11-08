import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";
import { orderService } from "@/services/order.service";
import { OrderStatus } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Please sign in to view order details." },
        { status: 401 }
      );
    }
    const orderId = params.id;

    const order = await orderService.getOrderById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Server-side ownership validation
    const userId = (session.user as any).id;
    const role = (session.user as any).role;
    const sellerProfileId = (session.user as any).sellerProfileId;

    const check = await orderService.verifyOrderOwnership(
      orderId,
      userId,
      role,
      sellerProfileId
    );

    if (!check.authorized) {
      return NextResponse.json(
        { success: false, error: check.error || "Access denied" },
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Please sign in to update order status." },
        { status: 401 }
      );
    }
    const orderId = params.id;

    const existingOrder = await orderService.getOrderById(orderId);
    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { status, description, carrier, trackingNumber } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: "Target status is required" },
        { status: 400 }
      );
    }

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;
    const userName = (session.user as any).name || "Operator";

    // Strict Security & Role Guard
    const transitionCheck = orderService.validateStatusTransition(
      existingOrder.status,
      status as OrderStatus,
      userRole
    );

    if (!transitionCheck.valid) {
      return NextResponse.json(
        { success: false, error: transitionCheck.error },
        { status: 403 }
      );
    }

    const updated = await orderService.updateOrderStatus(
      orderId,
      status as OrderStatus,
      { id: userId, name: userName, role: userRole },
      description
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update order status" },
      { status: 400 }
    );
  }
}
