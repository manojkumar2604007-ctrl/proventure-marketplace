"use client";

import React, { useState } from "react";
import {
  Bell,
  Package,
  CreditCard,
  Sparkles,
  CheckCheck,
  Clock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useUIStore } from "@/store/ui-store";

interface NotificationItem {
  id: string;
  type: "ORDER" | "PAYMENT" | "PROMOTION" | "SYSTEM";
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  link?: string;
}

export default function CustomerNotificationsPage() {
  const { addToast } = useUIStore();
  const [activeTab, setActiveTab] = useState<"ALL" | "ORDER" | "PAYMENT" | "PROMOTION">("ALL");
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "notif-1",
      type: "ORDER",
      title: "Shipment Dispatched — Express Cargo TRK-EXP-48219",
      description: "Your order PV-8921-A has been handed over to Express Cargo for delivery.",
      timestamp: "2 hours ago",
      isRead: false,
      link: "/customer/orders/ord-1",
    },
    {
      id: "notif-2",
      type: "PAYMENT",
      title: "Payment Receipt Confirmed — ₹24,999",
      description: "Razorpay transaction pay_RZP9812 verified. Official GST invoice generated.",
      timestamp: "Yesterday",
      isRead: false,
      link: "/customer/orders/ord-1",
    },
    {
      id: "notif-3",
      type: "PROMOTION",
      title: "Weekend Creator Flash Sale",
      description: "Up to 30% off artisanal mechanical keyboards and accessories this Saturday.",
      timestamp: "2 days ago",
      isRead: true,
      link: "/products",
    },
    {
      id: "notif-4",
      type: "SYSTEM",
      title: "Security Alert: New Sign-In",
      description: "Successful login detected from Chrome on Windows in Bengaluru.",
      timestamp: "3 days ago",
      isRead: true,
    },
  ]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    addToast({
      title: "Notifications Cleared",
      description: "All notifications marked as read.",
      type: "success",
    });
  };

  const markItemAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const filtered =
    activeTab === "ALL"
      ? notifications
      : notifications.filter((n) => n.type === activeTab);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="heading-1">Notifications &amp; Alerts</h1>
            {unreadCount > 0 && (
              <Badge variant="accent" size="sm">
                {unreadCount} Unread
              </Badge>
            )}
          </div>
          <p className="subheading mt-1">
            Real-time delivery milestones, invoice receipts, and creator drops.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            leftIcon={<CheckCheck className="h-4 w-4" />}
            className="text-xs"
          >
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-border/60 pb-2">
        {(["ALL", "ORDER", "PAYMENT", "PROMOTION"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === tab
                ? "bg-primary text-primary-foreground shadow-subtle"
                : "text-muted-foreground hover:bg-surface hover:text-foreground"
            }`}
          >
            {tab === "ALL"
              ? "All Alerts"
              : tab === "ORDER"
              ? "Orders"
              : tab === "PAYMENT"
              ? "Payments"
              : "Promotions"}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-7 w-7 text-secondary" />}
          title="No Notifications in this Category"
          description="You're all caught up! Milestones will appear here when your orders progress."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => markItemAsRead(item.id)}
              className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                !item.isRead
                  ? "bg-secondary/5 border-secondary/30 shadow-subtle"
                  : "bg-card border-border/80"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    item.type === "ORDER"
                      ? "bg-blue-500/10 text-secondary"
                      : item.type === "PAYMENT"
                      ? "bg-emerald-500/10 text-accent"
                      : item.type === "PROMOTION"
                      ? "bg-amber-500/10 text-amber-500"
                      : "bg-slate-500/10 text-slate-500"
                  }`}
                >
                  {item.type === "ORDER" && <Package className="h-5 w-5" />}
                  {item.type === "PAYMENT" && <CreditCard className="h-5 w-5" />}
                  {item.type === "PROMOTION" && <Sparkles className="h-5 w-5" />}
                  {item.type === "SYSTEM" && <ShieldCheck className="h-5 w-5" />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-primary">{item.title}</h4>
                    {!item.isRead && (
                      <span className="h-2 w-2 rounded-full bg-secondary" />
                    )}
                  </div>
                  <p className="text-xs text-foreground/80 leading-relaxed">
                    {item.description}
                  </p>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {item.timestamp}
                  </span>
                </div>
              </div>

              {item.link && (
                <div className="self-end sm:self-center shrink-0">
                  <Button asChild variant="outline" size="sm" className="text-xs">
                    <a href={item.link}>
                      <span>View</span>
                      <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
