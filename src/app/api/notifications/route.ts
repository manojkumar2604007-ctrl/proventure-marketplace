import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NotificationService } from "@/services/notification.service";

export const dynamic = "force-dynamic";

/**
 * GET /api/notifications
 * Returns paginated notifications and unread count for authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized: Please sign in." },
        { status: 401 }
      );
    }
    const userId = session.user.id || (session.user as any).email;

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const type = searchParams.get("type") || undefined;

    const result = await NotificationService.getUserNotifications(userId, {
      limit,
      offset,
      unreadOnly,
      type,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[GET /api/notifications] Error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve notifications", details: error?.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications
 * Create a new notification (system, internal, or admin initiated)
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
    const callerId = session.user.id;
    const callerRole = (session.user as any).role;

    const body = await req.json();
    const { userId, title, message, type, data } = body;

    const targetUserId = (callerRole === "ADMIN" ? (userId || callerId) : callerId);

    if (!title || !message) {
      return NextResponse.json(
        { error: "Title and message are required" },
        { status: 400 }
      );
    }

    const notification = await NotificationService.createNotification({
      userId: targetUserId,
      title,
      message,
      type,
      data,
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/notifications] Error:", error);
    return NextResponse.json(
      { error: "Failed to create notification", details: error?.message },
      { status: 500 }
    );
  }
}
