import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/server-guard";
import { orderService } from "@/services/order.service";
import { adminService } from "@/services/admin.service";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    try {
      await requireAdmin();
    } catch (e: any) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ success: false, error: e.message }, { status: e.status || 403 });
      }
    }

    const orderId = params.id;
    const order = await orderService.getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    try {
      await requireAdmin();
    } catch (e: any) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ success: false, error: e.message }, { status: e.status || 403 });
      }
    }

    const orderId = params.id;
    const body = await request.json();
    const { disputeAction, notes } = body;

    if (!disputeAction) {
      return NextResponse.json({ success: false, error: "disputeAction is required" }, { status: 400 });
    }

    const res = await adminService.resolveDispute(orderId, disputeAction, notes || "Admin action");
    return NextResponse.json(res);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to mediate dispute" },
      { status: 500 }
    );
  }
}
