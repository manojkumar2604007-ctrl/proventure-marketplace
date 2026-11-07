import { NextRequest, NextResponse } from "next/server";
import { productService } from "@/services/product.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const seller = searchParams.get("seller") || undefined;
    const search = searchParams.get("search") || undefined;
    const sort = searchParams.get("sort") as any;
    const featured = searchParams.get("featured") === "true" ? true : undefined;

    const data = await productService.getProducts({
      category,
      seller,
      search,
      sort,
      featured,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const product = await productService.createProduct(body);
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create product" },
      { status: 400 }
    );
  }
}
