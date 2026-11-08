import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";
import { reviewService } from "@/services/review.service";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 10;

    const result = await reviewService.getProductReviews(productId, page, limit);

    return NextResponse.json({
      success: true,
      data: result.reviews,
      metrics: result.metrics,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load product reviews" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id || "usr_customer_1";
    const userName = (session?.user as any)?.name || "Verified Customer";
    const userImage = (session?.user as any)?.image;
    const productId = params.id;

    const body = await request.json();
    const { rating, title, comment, orderItemId, orderId } = body;

    if (!rating || !comment) {
      return NextResponse.json(
        { success: false, error: "Rating and review comment are required." },
        { status: 400 }
      );
    }

    const result = await reviewService.submitReview(userId, {
      productId,
      orderItemId,
      orderId,
      rating: Number(rating),
      title: title || "",
      comment,
      customerName: userName,
      customerImage: userImage,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Review verified and published successfully.",
        data: result.review,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit review" },
      { status: 500 }
    );
  }
}
