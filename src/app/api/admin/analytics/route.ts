import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";
import { analyticsService, AnalyticsTimeframe } from "@/services/analytics.service";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // SECURITY GUARD: Only administrators can access platform macro analytics
    if (session?.user) {
      const role = (session.user as any).role;
      if (role !== "ADMIN") {
        return NextResponse.json(
          {
            success: false,
            error: "Forbidden: Super administrator privileges required to access marketplace-wide analytics.",
          },
          { status: 403 }
        );
      }
    }

    const { searchParams } = new URL(request.url);
    const timeframe = (searchParams.get("timeframe") as AnalyticsTimeframe) || "LAST_30_DAYS";
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    const data = await analyticsService.getAdminAnalytics(timeframe, startDate, endDate);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to load platform analytics",
      },
      { status: 500 }
    );
  }
}
