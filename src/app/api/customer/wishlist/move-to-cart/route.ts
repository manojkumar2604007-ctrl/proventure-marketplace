import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Please sign in." },
        { status: 401 }
      );
    }
    const userId = (session.user as any).id;

    const body = await request.json().catch(() => ({}));
    const { productId, moveAll } = body;

    if (process.env.DATABASE_URL && process.env.NEXT_PUBLIC_USE_MOCK_FALLBACK !== "true") {
      const wishlist = await prisma.wishlist.findUnique({
        where: { userId },
      });

      if (wishlist) {
        if (moveAll) {
          await prisma.wishlistItem.deleteMany({
            where: { wishlistId: wishlist.id },
          });
        } else if (productId) {
          await prisma.wishlistItem.deleteMany({
            where: {
              wishlistId: wishlist.id,
              productId,
            },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: moveAll ? "All items moved to shopping bag" : "Item moved to shopping bag",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to move wishlist items to cart" },
      { status: 500 }
    );
  }
}
