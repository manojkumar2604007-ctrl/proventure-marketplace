import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/server-guard";
import { productService } from "@/services/product.service";
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

    const productId = params.id;
    const body = await request.json();

    const updated = await productService.updateProduct(productId, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    adminService.recordAuditLog({
      adminName: "Alex Vane (Super Admin)",
      action: "ADMIN_PRODUCT_UPDATED",
      entityType: "Product",
      entityId: productId,
      details: `Product "${updated.title}" updated by administrator.`,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const productId = params.id;
    const existing = await productService.getProductById(productId);

    const deleted = await productService.deleteProduct(productId);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    adminService.recordAuditLog({
      adminName: "Alex Vane (Super Admin)",
      action: "PROHIBITED_PRODUCT_PURGED",
      entityType: "Product",
      entityId: productId,
      details: `Purged prohibited listing "${existing?.title || productId}".`,
    });

    return NextResponse.json({ success: true, message: "Product permanently removed" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}
