import { NextRequest, NextResponse } from "next/server";
import { vendorService } from "@/services/vendor.service";

export async function GET() {
  try {
    const vendors = await vendorService.getAllVendors();
    return NextResponse.json({ success: true, data: vendors });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch vendors" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const vendor = await vendorService.createVendor(body);
    return NextResponse.json({ success: true, data: vendor }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create vendor" },
      { status: 400 }
    );
  }
}
