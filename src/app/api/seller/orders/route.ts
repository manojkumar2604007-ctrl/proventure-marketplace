import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";
import { orderService } from "@/services/order.service";

export async function GET(request: NextRequest) {
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
        { success: false, error: "Forbidden: Only authorized merchants can query seller orders." },
        { status: 403 }
      );
    }

    const sellerId = (session.user as any).sellerProfileId || (session.user as any).storeId || (session.user as any).id;
    const orders = await orderService.getSellerOrders(sellerId);
    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch seller orders" },
      { status: 500 }
    );
  }
}
