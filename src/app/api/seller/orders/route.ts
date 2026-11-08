import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";
import { orderService } from "@/services/order.service";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const sellerId = (session?.user as any)?.sellerProfileId || "seller_technexus";

    if (session?.user) {
      const role = (session.user as any).role;
      if (role !== "SELLER" && role !== "ADMIN") {
        return NextResponse.json(
          { success: false, error: "Forbidden: Only authorized merchants can query seller orders." },
          { status: 403 }
        );
      }
    }

    const orders = await orderService.getSellerOrders(sellerId);
    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch seller orders" },
      { status: 500 }
    );
  }
}
