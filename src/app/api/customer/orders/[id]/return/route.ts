import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";
import { orderService } from "@/services/order.service";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const orderId = params.id;

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Please sign in to request a return." },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    const existingOrder = await orderService.getOrderById(orderId);
    if (!existingOrder) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Ownership check: customer must own the order or be an ADMIN
    if (userRole === "CUSTOMER" && existingOrder.customerId !== userId) {
      return NextResponse.json(
        { success: false, message: "Forbidden: You cannot return an order belonging to another customer." },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const reason = body.reason || "Customer requested return";
    const result = await orderService.requestReturn(orderId, reason);

    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to process return request." },
      { status: 500 }
    );
  }
}
