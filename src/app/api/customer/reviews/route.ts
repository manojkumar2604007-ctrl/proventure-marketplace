import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";
import { reviewService } from "@/services/review.service";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Please sign in to view your reviews." },
        { status: 401 }
      );
    }
    const userId = (session.user as any).id;

    const reviews = await reviewService.getUserReviews(userId);

    return NextResponse.json({
      success: true,
      data: reviews,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load user reviews" },
      { status: 500 }
    );
  }
}
