import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";
import { analyticsService, AnalyticsTimeframe } from "@/services/analytics.service";

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
        {
          success: false,
          error: "Forbidden: Customer accounts are not permitted to access merchant analytics.",
        },
        { status: 403 }
      );
    }

    const sellerId = (session.user as any).sellerProfileId || (session.user as any).storeId || (session.user as any).id;
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
