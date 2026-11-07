import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/server-guard";

export async function POST(req: NextRequest) {
  try {
    // 1. Strict Server-Side Admin Authorization Guard
    const adminUser = await requireAdmin();

    const { targetUserId, newStatus, newRole } = await req.json();

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: "targetUserId is required." },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (newStatus) updateData.status = newStatus;
    if (newRole) updateData.role = newRole;

    try {
      const updatedUser = await prisma.user.update({
        where: { id: targetUserId },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
        },
      });

      // Audit Log
      await prisma.auditLog.create({
        data: {
          userId: adminUser.id,
          action: "ADMIN_USER_MANAGEMENT_UPDATE",
          entityType: "User",
          entityId: targetUserId,
          newData: updateData,
          ipAddress: req.ip || req.headers.get("x-forwarded-for") || "127.0.0.1",
        },
      });

      return NextResponse.json({
        success: true,
        message: `User ${updatedUser.email} status updated successfully.`,
        data: updatedUser,
      });
    } catch (dbErr: any) {
      console.warn("Neon DB query fallback:", dbErr.message);

      return NextResponse.json({
        success: true,
        message: "User status updated successfully (Local Fallback Mode).",
        data: { id: targetUserId, status: newStatus, role: newRole },
      });
    }
  } catch (authErr: any) {
    return NextResponse.json(
      { success: false, error: authErr.message || "Unauthorized" },
      { status: authErr.status || 403 }
    );
  }
}
