import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NotificationService } from "@/services/notification.service";

export const dynamic = "force-dynamic";

/**
 * GET /api/notifications/unread-count
 * Fast endpoint for header notification badge counters
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || (session?.user as any)?.email || "usr_customer_1";

    const unreadCount = await NotificationService.getUnreadCount(userId);

    return NextResponse.json({ unreadCount });
  } catch (error: any) {
    console.error("[GET /api/notifications/unread-count] Error:", error);
    return NextResponse.json({ unreadCount: 0 });
  }
}
