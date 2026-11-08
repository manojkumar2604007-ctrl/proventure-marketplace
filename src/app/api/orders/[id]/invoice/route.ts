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
    const orderId = params.id;

    // Ownership check
    if (session?.user) {
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
    }

    const invoice = await orderService.generateInvoiceData(orderId);
    if (!invoice) {
      return NextResponse.json(
        { success: false, error: "Order not found for invoice generation" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: invoice,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate invoice" },
      { status: 500 }
    );
  }
}
