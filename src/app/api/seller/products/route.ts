import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";
import { productService } from "@/services/product.service";
import { prisma } from "@/lib/db/prisma";

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
        { success: false, error: "Forbidden: Only authorized sellers can access merchant catalog." },
        { status: 403 }
      );
    }

    const sellerId = (session.user as any).sellerProfileId || (session.user as any).storeId || (session.user as any).id;
    const products = await productService.getProductsBySeller(sellerId);
    return NextResponse.json({ success: true, data: products });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch seller products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
        { success: false, error: "Forbidden: Only authorized sellers can create listings." },
        { status: 403 }
      );
    }

    const sellerId = (session.user as any).sellerProfileId || (session.user as any).storeId || (session.user as any).id;
    const body = await request.json();
    const { title, slug, description, shortDescription, price, comparePrice, sku, stock, categoryId, imageUrl, tags, status } = body;

    if (!title || !price || !description) {
      return NextResponse.json(
        { success: false, error: "Missing mandatory fields: title, price, description" },
        { status: 400 }
      );
    }

    const product = await productService.createProduct({
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description,
      shortDescription,
      price: parseFloat(price),
      comparePrice: comparePrice ? parseFloat(comparePrice) : undefined,
      sku: sku || `TN-${Date.now().toString().slice(-6)}`,
      stock: parseInt(stock, 10) || 10,
      sellerId,
      categoryId: categoryId || "cat_electronics",
      imageUrl,
      tags,
      status: status || "ACTIVE",
    });

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}
