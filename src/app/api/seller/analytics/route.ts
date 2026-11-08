import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";
import { analyticsService, AnalyticsTimeframe } from "@/services/analytics.service";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // SECURITY GUARD: Never expose seller analytics to customers
    if (session?.user) {
      const role = (session.user as any).role;
      if (role === "CUSTOMER") {
        return NextResponse.json(
          {
            success: false,
            error: "Forbidden: Customer accounts are not permitted to access merchant analytics.",
          },
          { status: 403 }
        );
      }
    }

    const sellerId = (session?.user as any)?.sellerProfileId || "seller_technexus";
    const { searchParams } = new URL(request.url);
    const timeframe = (searchParams.get("timeframe") as AnalyticsTimeframe) || "LAST_30_DAYS";
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    // Strict multi-tenant isolation: strictly query data for this seller only
    const data = await analyticsService.getSellerAnalytics(
      sellerId,
      timeframe,
      startDate,
      endDate
    );

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to load seller analytics",
      },
      { status: 500 }
    );
  }
}
