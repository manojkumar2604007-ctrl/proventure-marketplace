import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/server-guard";
import { vendorService } from "@/services/vendor.service";

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
    const status = searchParams.get("status");

    let vendors = await vendorService.getAllVendors();
    if (status && status !== "ALL") {
      vendors = vendors.filter((v) => v.status === status);
    }

    return NextResponse.json({ success: true, data: vendors });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch sellers" },
      { status: 500 }
    );
  }
}
