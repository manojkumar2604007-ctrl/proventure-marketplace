import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { productService } from "@/services/product.service";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id || "usr_customer_1";

    if (process.env.DATABASE_URL && process.env.NEXT_PUBLIC_USE_MOCK_FALLBACK !== "true") {
      const wishlist = await prisma.wishlist.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: { orderBy: { displayOrder: "asc" } },
                  store: true,
                  category: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (wishlist) {
        const products = wishlist.items.map((item) => ({
          id: item.product.id,
          title: item.product.title,
          slug: item.product.slug,
          price: Number(item.product.price),
          comparePrice: item.product.comparePrice ? Number(item.product.comparePrice) : null,
          image: item.product.images[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
          sellerId: item.product.storeId,
          sellerName: item.product.store.name,
          stock: 25,
          rating: Number(item.product.rating || 5.0),
          reviewCount: item.product.reviewCount || 0,
        }));

        return NextResponse.json({ success: true, data: products });
      }
    }

    return NextResponse.json({ success: true, data: [] });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id || "usr_customer_1";

    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    if (process.env.DATABASE_URL && process.env.NEXT_PUBLIC_USE_MOCK_FALLBACK !== "true") {
      const userWishlist = await prisma.wishlist.upsert({
        where: { userId },
        create: { userId },
        update: {},
      });

      await prisma.wishlistItem.upsert({
        where: {
          wishlistId_productId: {
            wishlistId: userWishlist.id,
            productId,
          },
        },
        create: {
          wishlistId: userWishlist.id,
          productId,
        },
        update: {},
      });
    }

    return NextResponse.json({
      success: true,
      message: "Product added to wishlist successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to add to wishlist" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id || "usr_customer_1";

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    if (process.env.DATABASE_URL && process.env.NEXT_PUBLIC_USE_MOCK_FALLBACK !== "true") {
      const wishlist = await prisma.wishlist.findUnique({
        where: { userId },
      });

      if (wishlist) {
        await prisma.wishlistItem.deleteMany({
          where: {
            wishlistId: wishlist.id,
            productId,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to remove from wishlist" },
      { status: 500 }
    );
  }
}
