import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";
import { vendorService } from "@/services/vendor.service";

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
        { success: false, error: "Forbidden: Only authorized merchants can access store profile." },
        { status: 403 }
      );
    }

    const sellerId = (session.user as any).sellerProfileId || (session.user as any).storeId || (session.user as any).id;
    const vendor = await vendorService.getVendorById(sellerId);
    if (!vendor) {
      return NextResponse.json({ success: false, error: "Seller profile not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: vendor });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch vendor profile" },
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
        { success: false, error: "Forbidden: Only authorized merchants can update store profile." },
        { status: 403 }
      );
    }

    const sellerId = (session.user as any).sellerProfileId || (session.user as any).storeId || (session.user as any).id;
    const updates = await request.json();
    const vendor = await vendorService.getVendorById(sellerId);
    if (!vendor) {
      return NextResponse.json({ success: false, error: "Seller profile not found" }, { status: 404 });
    }

    Object.assign(vendor, updates);
    return NextResponse.json({ success: true, data: vendor });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update vendor profile" },
      { status: 500 }
    );
  }
}
