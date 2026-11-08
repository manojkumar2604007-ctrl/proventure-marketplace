import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";
import { productService } from "@/services/product.service";

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
        { success: false, error: "Forbidden: Only authorized sellers can view inventory." },
        { status: 403 }
      );
    }

    const sellerId = (session.user as any).sellerProfileId || (session.user as any).storeId || (session.user as any).id;
    const products = await productService.getProductsBySeller(sellerId);
    const inventory = products.map((p) => ({
      id: p.id,
      title: p.title,
      sku: p.sku,
      stock: p.stock,
      status: p.status,
      variants: p.variants || [],
    }));

    return NextResponse.json({ success: true, data: inventory });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
        { success: false, error: "Forbidden: Only authorized sellers can update inventory." },
        { status: 403 }
      );
    }

    const sellerId = (session.user as any).sellerProfileId || (session.user as any).storeId || (session.user as any).id;
    const body = await request.json();
    const { productId, stock, sku } = body;

    if (!productId) {
      return NextResponse.json({ success: false, error: "Product ID is required" }, { status: 400 });
    }

    const existing = await productService.getProductById(productId);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    if (role !== "ADMIN" && existing.sellerId !== sellerId) {
      return NextResponse.json(
        { success: false, error: "Forbidden: You cannot modify stock for another seller's item." },
        { status: 403 }
      );
    }

    const updates: any = {};
    if (typeof stock === "number") {
      updates.stock = stock;
      updates.status = stock === 0 ? "OUT_OF_STOCK" : "ACTIVE";
    }
    if (sku) updates.sku = sku;

    const updated = await productService.updateProduct(productId, updates);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update inventory" },
      { status: 500 }
    );
  }
}
