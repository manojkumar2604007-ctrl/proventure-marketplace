import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";
import { productService } from "@/services/product.service";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const sellerId = (session?.user as any)?.sellerProfileId || "seller_technexus";
    const productId = params.id;

    const product = await productService.getProductById(productId);
    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    if (session?.user) {
      const role = (session.user as any).role;
      if (role !== "ADMIN" && product.sellerId !== sellerId) {
        return NextResponse.json(
          { success: false, error: "Forbidden: You cannot access another merchant's product." },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const sellerId = (session?.user as any)?.sellerProfileId || "seller_technexus";
    const productId = params.id;

    const existing = await productService.getProductById(productId);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    if (session?.user) {
      const role = (session.user as any).role;
      if (role !== "ADMIN" && existing.sellerId !== sellerId) {
        return NextResponse.json(
          { success: false, error: "Forbidden: You cannot modify another merchant's product." },
          { status: 403 }
        );
      }
    }

    const updates = await request.json();
    const updated = await productService.updateProduct(productId, updates);

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const sellerId = (session?.user as any)?.sellerProfileId || "seller_technexus";
    const productId = params.id;

    const existing = await productService.getProductById(productId);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    if (session?.user) {
      const role = (session.user as any).role;
      if (role !== "ADMIN" && existing.sellerId !== sellerId) {
        return NextResponse.json(
          { success: false, error: "Forbidden: You cannot delete another merchant's product." },
          { status: 403 }
        );
      }
    }

    const deleted = await productService.deleteProduct(productId);
    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}
