import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NotificationService } from "@/services/notification.service";

/**
 * PATCH /api/notifications/[id]/read
 * Marks a specific notification as read, validating user ownership
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized: Please sign in." },
        { status: 401 }
      );
    }
    const userId = session.user.id || (session.user as any).email;
    const notificationId = params.id;

    if (!notificationId) {
      return NextResponse.json({ error: "Missing notification ID" }, { status: 400 });
    }

    const success = await NotificationService.markAsRead(notificationId, userId);

    if (!success) {
      return NextResponse.json(
        { error: "Notification not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, id: notificationId });
  } catch (error: any) {
    console.error("[PATCH /api/notifications/[id]/read] Error:", error);
    return NextResponse.json(
      { error: "Failed to mark notification as read", details: error?.message },
      { status: 500 }
    );
  }
}
