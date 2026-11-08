import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/server-guard";
import { adminService } from "@/services/admin.service";

export async function GET(request: NextRequest) {
  try {
    // 1. Strict Server-Side Admin Authorization Guard
    try {
      await requireAdmin();
    } catch (e: any) {
      return NextResponse.json({ success: false, error: e.message || "Forbidden: Admin access required" }, { status: e.status || 403 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role") || undefined;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const users = await adminService.getUsers({ role, status, search });
    return NextResponse.json({ success: true, data: users });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}
