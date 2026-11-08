import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/server-guard";
import { adminService } from "@/services/admin.service";

export async function GET(request: NextRequest) {
  try {
    try {
      await requireAdmin();
    } catch (e: any) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ success: false, error: e.message }, { status: e.status || 403 });
      }
    }

    const logs = await adminService.getAuditLogs();
    return NextResponse.json({ success: true, data: logs });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    let adminName = "Alex Vane (Super Admin)";
    try {
      const adminUser = await requireAdmin();
      adminName = adminUser.name || adminUser.email;
    } catch (e: any) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ success: false, error: e.message }, { status: e.status || 403 });
      }
    }

    const body = await request.json();
    const { action, entityType, entityId, details } = body;

    if (!action || !entityType || !entityId) {
      return NextResponse.json({ success: false, error: "Missing required audit fields" }, { status: 400 });
    }

    const logged = adminService.recordAuditLog({
      adminName,
      action,
      entityType,
      entityId,
      details: details || "Administrative operation",
    });

    return NextResponse.json({ success: true, data: logged }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to record audit log" },
      { status: 500 }
    );
  }
}
