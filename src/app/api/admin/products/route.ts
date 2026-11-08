import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/server-guard";
import { productService } from "@/services/product.service";

export async function GET(request: NextRequest) {
  try {
    try {
      await requireAdmin();
    } catch (e: any) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ success: false, error: e.message }, { status: e.status || 403 });
      }
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const seller = searchParams.get("seller") || undefined;
    const search = searchParams.get("search") || undefined;

    const res = await productService.getProducts({
      category,
      seller,
      search,
      limit: 100,
    });

    return NextResponse.json({ success: true, data: res.products, total: res.total });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}
