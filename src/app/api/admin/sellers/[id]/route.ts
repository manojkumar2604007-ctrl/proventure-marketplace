import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/server-guard";
import { vendorService } from "@/services/vendor.service";
import { adminService } from "@/services/admin.service";
import { sendSellerApprovalEmail, sendSellerRejectionEmail } from "@/services/email.service";
import { NotificationService } from "@/services/notification.service";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    try {
      await requireAdmin();
    } catch (e: any) {
      return NextResponse.json({ success: false, error: e.message || "Forbidden: Admin access required" }, { status: e.status || 403 });
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

      // Background email and in-app notification to seller
      if (updated && updated.email) {
        const storeDisplayName = updated.storeName || "Your Store";
        const sellerDisplayName = updated.storeName || "Merchant Partner";

        if (status === "APPROVED") {
          sendSellerApprovalEmail(
            updated.email,
            { storeName: storeDisplayName, sellerName: sellerDisplayName },
            true
          );
          NotificationService.createNotification({
            userId: updated.userId,
            title: "Merchant Account Verified & Approved! 🎉",
            message: `Congratulations! Your store "${storeDisplayName}" is now active on ProVenture.`,
            type: "SYSTEM",
          });
        } else if (status === "REJECTED") {
          sendSellerRejectionEmail(
            updated.email,
            {
              storeName: storeDisplayName,
              sellerName: sellerDisplayName,
              reason: body.rejectionReason || "Business documentation did not meet marketplace compliance standards.",
            },
            true
          );
          NotificationService.createNotification({
            userId: updated.userId,
            title: "Seller Application Status Update",
            message: `Your application for "${storeDisplayName}" could not be approved at this time.`,
            type: "SYSTEM",
          });
        }
      }
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
