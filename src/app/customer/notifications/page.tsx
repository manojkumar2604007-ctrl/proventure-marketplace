"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  Package,
  CreditCard,
  Sparkles,
  CheckCheck,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useUIStore } from "@/store/ui-store";

interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "INFO" | "ORDER_UPDATE" | "PAYMENT" | "INVENTORY_ALERT" | "SYSTEM" | "PROMOTION";
  read: boolean;
  data?: any;
  createdAt: string;
}

export default function CustomerNotificationsPage() {
  const { addToast } = useUIStore();
  const [activeTab, setActiveTab] = useState<
    "ALL" | "ORDER_UPDATE" | "PAYMENT" | "PROMOTION" | "SYSTEM"
  >("ALL");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadNotifications = async (showLoadingState = true) => {
    if (showLoadingState) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const res = await fetch("/api/notifications?limit=50");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    try {
      const res = await fetch("/api/notifications/mark-all-read", { method: "POST" });
      if (res.ok) {
        addToast({
          title: "Notifications Cleared",
          description: "All notifications marked as read.",
          type: "success",
        });
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const markItemAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    } catch (err) {
      console.error("Failed to mark item as read:", err);
    }
  };

  const deleteNotification = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));

    try {
      const res = await fetch(`/api/notifications/${id}`, { method: "DELETE" });
      if (res.ok) {
        addToast({
          title: "Notification Removed",
          description: "Notification deleted successfully.",
          type: "default",
        });
      }
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const filtered =
    activeTab === "ALL"
      ? notifications
      : notifications.filter((n) => n.type === activeTab);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "ORDER_UPDATE":
        return <Package className="h-5 w-5 text-primary" />;
      case "PAYMENT":
        return <CreditCard className="h-5 w-5 text-emerald-600" />;
      case "PROMOTION":
        return <Sparkles className="h-5 w-5 text-purple-600" />;
      case "SYSTEM":
        return <ShieldCheck className="h-5 w-5 text-blue-600" />;
      case "INVENTORY_ALERT":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default:
        return <Bell className="h-5 w-5 text-slate-500" />;
    }
  };

  const formatTimestamp = (dateInput: string) => {
    const date = new Date(dateInput);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (60 * 1000));
    const diffHours = Math.floor(diffMs / (3600 * 1000));
    const diffDays = Math.floor(diffMs / (24 * 3600 * 1000));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  };

  const getActionLink = (n: NotificationItem) => {
    if (n.data?.link) return n.data.link;
    if (n.data?.orderId) return `/customer/orders/${n.data.orderId}`;
    if (n.type === "ORDER_UPDATE") return "/customer/orders";
    if (n.type === "PAYMENT") return "/customer/orders";
    if (n.type === "PROMOTION") return "/products";
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="heading-1">Notifications &amp; Alerts</h1>
            {unreadCount > 0 && (
              <Badge variant="accent" size="sm" className="font-extrabold">
                {unreadCount} unread
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time delivery milestones, payment confirmations, and account security notices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadNotifications(false)}
            disabled={isRefreshing}
            className="rounded-xl border-border/80"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="rounded-xl border-border/80 text-foreground"
            >
              <CheckCheck className="h-4 w-4 mr-1.5 text-primary" />
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {(
          [
            { id: "ALL", label: "All Alerts", count: notifications.length },
            {
              id: "ORDER_UPDATE",
              label: "Order Updates",
              count: notifications.filter((n) => n.type === "ORDER_UPDATE").length,
            },
            {
              id: "PAYMENT",
              label: "Payments",
              count: notifications.filter((n) => n.type === "PAYMENT").length,
            },
            {
              id: "PROMOTION",
              label: "Promotions",
              count: notifications.filter((n) => n.type === "PROMOTION").length,
            },
            {
              id: "SYSTEM",
              label: "Security & System",
              count: notifications.filter((n) => n.type === "SYSTEM").length,
            },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? "bg-primary text-white shadow-subtle"
                : "bg-surface text-muted-foreground hover:text-foreground hover:bg-surface/80"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === tab.id ? "bg-white/20 text-white" : "bg-border text-muted-foreground"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-5 rounded-2xl border border-border/60 bg-card space-y-3 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-surface" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-surface rounded w-1/3" />
                  <div className="h-3 bg-surface rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No notifications in this category"
          description="You are completely up to date. Future updates on shipments and orders will appear here."
          actionLabel="Explore Marketplace"
          actionHref="/products"
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((notification) => {
            const actionLink = getActionLink(notification);

            return (
              <div
                key={notification.id}
                className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                  !notification.read
                    ? "bg-card border-primary/30 shadow-subtle ring-1 ring-primary/10"
                    : "bg-card/70 border-border/60 hover:border-border hover:bg-card"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-surface border border-border/80 shrink-0 mt-0.5">
                    {getIcon(notification.type)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className={`text-sm ${
                          !notification.read ? "font-bold text-foreground" : "font-medium text-foreground/80"
                        }`}
                      >
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <span className="h-2 w-2 rounded-full bg-primary ring-2 ring-primary/20 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-3 pt-2 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="h-3 w-3" />
                        {formatTimestamp(notification.createdAt)}
                      </span>

                      {actionLink && (
                        <>
                          <span>•</span>
                          <Link
                            href={actionLink}
                            onClick={() => {
                              if (!notification.read) markItemAsRead(notification.id);
                            }}
                            className="text-primary hover:underline font-semibold flex items-center gap-1"
                          >
                            <span>Open details</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-2 self-end sm:self-start shrink-0 pt-2 sm:pt-0">
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markItemAsRead(notification.id)}
                      className="text-xs text-muted-foreground hover:text-foreground h-8 px-2.5 rounded-lg"
                      title="Mark as read"
                    >
                      <CheckCheck className="h-3.5 w-3.5 mr-1 text-primary" />
                      <span>Mark Read</span>
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteNotification(notification.id)}
                    className="text-xs text-muted-foreground hover:text-destructive h-8 px-2 rounded-lg"
                    title="Delete notification"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
