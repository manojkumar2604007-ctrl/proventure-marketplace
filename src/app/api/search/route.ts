import { NextRequest, NextResponse } from "next/server";
import { productService } from "@/services/product.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("q") || searchParams.get("query") || searchParams.get("search") || undefined;
    const category = searchParams.get("category") || undefined;
    const seller = searchParams.get("seller") || undefined;
    const brand = searchParams.get("brand") || undefined;
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
    const rating = searchParams.get("rating") ? Number(searchParams.get("rating")) : undefined;
    const discount = searchParams.get("discount") ? Number(searchParams.get("discount")) : undefined;
    const inStock = searchParams.get("inStock") === "true";
    const sort = (searchParams.get("sort") as any) || "newest";
    const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 24;

    const result = await productService.getProducts({
      search,
      category,
      seller,
      brand,
      minPrice,
      maxPrice,
      rating,
      discount,
      inStock: inStock || undefined,
      sort,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: result.products,
      total: result.total,
      page,
      limit,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Search query execution failed",
      },
      { status: 500 }
    );
  }
}
