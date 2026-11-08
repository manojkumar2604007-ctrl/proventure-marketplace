"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Bell,
  Package,
  CreditCard,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  CheckCheck,
  ArrowRight,
  Clock,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUIStore } from "@/store/ui-store";

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "INFO" | "ORDER_UPDATE" | "PAYMENT" | "INVENTORY_ALERT" | "SYSTEM" | "PROMOTION";
  read: boolean;
  data?: any;
  createdAt: string | Date;
}

interface NotificationDropdownProps {
  variant?: "storefront" | "seller" | "admin";
  className?: string;
}

export function NotificationDropdown({
  variant = "storefront",
  className = "",
}: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { addToast } = useUIStore();

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/notifications?limit=8");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.warn("Failed to fetch notifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll unread count every 45 seconds
    const interval = setInterval(fetchNotifications, 45000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const markAsRead = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      const res = await fetch("/api/notifications/mark-all-read", { method: "POST" });
      if (res.ok) {
        addToast({
          title: "All Caught Up",
          description: "All notifications marked as read.",
          type: "success",
        });
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "ORDER_UPDATE":
        return <Package className="h-4 w-4 text-primary" />;
      case "PAYMENT":
        return <CreditCard className="h-4 w-4 text-emerald-600" />;
      case "INVENTORY_ALERT":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "SYSTEM":
        return <ShieldCheck className="h-4 w-4 text-blue-600" />;
      case "PROMOTION":
        return <Sparkles className="h-4 w-4 text-purple-600" />;
      default:
        return <Bell className="h-4 w-4 text-slate-500" />;
    }
  };

  const formatTimestamp = (dateInput: string | Date) => {
    const date = new Date(dateInput);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (60 * 1000));
    const diffHours = Math.floor(diffMs / (3600 * 1000));
    const diffDays = Math.floor(diffMs / (24 * 3600 * 1000));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays}d ago`;
  };

  const getFullViewLink = () => {
    if (variant === "seller") return "/seller/orders";
    if (variant === "admin") return "/admin/audit-logs";
    return "/customer/notifications";
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className={`relative p-2 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
          variant === "admin"
            ? "text-slate-300 hover:text-white hover:bg-slate-800"
            : "text-muted-foreground hover:text-foreground hover:bg-surface"
        }`}
        aria-label="View notifications"
        aria-expanded={isOpen}
      >
        <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center shadow-subtle animate-in zoom-in">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border shadow-modal z-50 p-4 space-y-3 animate-in fade-in-0 zoom-in-95 duration-150 ${
            variant === "admin"
              ? "bg-[#0A192F] border-slate-800 text-white"
              : "bg-card border-border/80 text-foreground"
          }`}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between pb-3 border-b ${
              variant === "admin" ? "border-slate-800" : "border-border/60"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">Notifications</span>
              {unreadCount > 0 && (
                <Badge
                  variant="accent"
                  size="sm"
                  className="h-5 px-1.5 text-[10px] font-extrabold"
                >
                  {unreadCount} unread
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1 divide-y divide-border/30">
            {notifications.length === 0 ? (
              <div className="py-8 text-center">
                <Bell className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-xs font-semibold text-muted-foreground">
                  No notifications yet
                </p>
                <p className="text-[11px] text-muted-foreground/80 mt-0.5">
                  We will alert you when orders or updates occur.
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    if (!n.read) markAsRead(n.id);
                  }}
                  className={`pt-2.5 first:pt-0 pb-2 px-2.5 rounded-xl transition-colors cursor-pointer text-xs space-y-1 ${
                    !n.read
                      ? variant === "admin"
                        ? "bg-slate-800/60 hover:bg-slate-800"
                        : "bg-primary/5 hover:bg-primary/10"
                      : "hover:bg-surface/80 opacity-80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 p-1 rounded-lg bg-surface border border-border/50 shrink-0">
                        {getNotificationIcon(n.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-semibold text-xs leading-snug line-clamp-1 ${
                              !n.read
                                ? variant === "admin"
                                  ? "text-white"
                                  : "text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {n.title}
                          </span>
                          {!n.read && (
                            <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                          {n.message}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
                      {formatTimestamp(n.createdAt)}
                    </span>
                  </div>

                  {/* Actions / Link */}
                  {n.data?.link && (
                    <div className="pl-7 pt-0.5 flex items-center justify-between">
                      <Link
                        href={n.data.link}
                        onClick={() => setIsOpen(false)}
                        className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1"
                      >
                        <span>View details</span>
                        <ArrowRight className="h-2.5 w-2.5" />
                      </Link>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div
            className={`pt-2 border-t text-center ${
              variant === "admin" ? "border-slate-800" : "border-border/60"
            }`}
          >
            <Link
              href={getFullViewLink()}
              onClick={() => setIsOpen(false)}
              className="text-xs text-primary hover:underline font-semibold inline-flex items-center gap-1 py-1"
            >
              <span>View All Notification Center</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
