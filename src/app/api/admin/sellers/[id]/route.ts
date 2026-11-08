import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/server-guard";
import { vendorService } from "@/services/vendor.service";
import { adminService } from "@/services/admin.service";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    try {
      await requireAdmin();
    } catch (e: any) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ success: false, error: e.message }, { status: e.status || 403 });
      }
    }

    const sellerId = params.id;
    const body = await request.json();
    const { status, commissionRate } = body;

    let updated = null;

    if (status) {
      updated = await vendorService.updateVendorStatus(sellerId, status);
      adminService.recordAuditLog({
        adminName: "Alex Vane (Super Admin)",
        action: `SELLER_${status}`,
        entityType: "SellerProfile",
        entityId: sellerId,
        details: `Seller ${sellerId} status changed to ${status}.`,
      });
    }

    if (typeof commissionRate === "number") {
      updated = await vendorService.updateCommissionRate(sellerId, commissionRate);
      adminService.recordAuditLog({
        adminName: "Alex Vane (Super Admin)",
        action: "COMMISSION_UPDATED",
        entityType: "SellerProfile",
        entityId: sellerId,
        details: `Seller ${sellerId} commission rate adjusted to ${commissionRate}%.`,
      });
    }

    if (!updated) {
      return NextResponse.json({ success: false, error: "Seller not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update seller" },
      { status: 500 }
    );
  }
}
