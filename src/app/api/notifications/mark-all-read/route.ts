import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NotificationService } from "@/services/notification.service";

export const dynamic = "force-dynamic";

/**
 * POST /api/notifications/mark-all-read
 * Marks all notifications for the authenticated user as read
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized: Please sign in." },
        { status: 401 }
      );
    }
    const userId = session.user.id || (session.user as any).email;

    const updatedCount = await NotificationService.markAllAsRead(userId);

    return NextResponse.json({ success: true, count: updatedCount });
  } catch (error: any) {
    console.error("[POST /api/notifications/mark-all-read] Error:", error);
    return NextResponse.json(
      { error: "Failed to mark notifications as read", details: error?.message },
      { status: 500 }
    );
  }
}
