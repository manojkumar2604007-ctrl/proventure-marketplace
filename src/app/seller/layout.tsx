"use client";

import React, { useState } from "react";
import { SellerSidebar } from "@/components/layout/seller-sidebar";
import Link from "next/link";
import {
  Bell,
  ExternalLink,
  Menu,
  Search,
  CheckCircle2,
  AlertTriangle,
  Package,
  ShoppingBag,
  DollarSign,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { NotificationDropdown } from "@/components/ui/notification-dropdown";

const MOCK_SELLER_NOTIFICATIONS = [
  {
    id: "sn_1",
    title: "New Order Received",
    message: "Order #ORD-8821 placed by Priya Sharma requires packing.",
    time: "10 mins ago",
    unread: true,
    type: "order",
  },
  {
    id: "sn_2",
    title: "Low Stock Alert",
    message: 'Stock for "ProVent Ergonomic Aluminum Laptop Stand" is below threshold (4 units remaining).',
    time: "1 hour ago",
    unread: true,
    type: "alert",
  },
  {
    id: "sn_3",
    title: "Payout Completed",
    message: "Weekly payout of ₹48,250 has been settled to your HDFC bank account.",
    time: "Yesterday",
    unread: false,
    type: "payout",
  },
];

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_SELLER_NOTIFICATIONS);
  const [headerSearch, setHeaderSearch] = useState("");

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  };

  return (
    <div className="flex min-h-screen bg-surface/50 text-foreground">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <SellerSidebar
          collapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Mobile Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-primary-950/60 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-72 bg-background h-full shadow-modal">
            <SellerSidebar
              isOpen={true}
              onClose={() => setIsMobileSidebarOpen(false)}
              collapsed={false}
            />
          </div>
        </div>
      )}

      {/* Main Body */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Seller Portal Header */}
        <header className="sticky top-0 z-30 h-16 border-b border-border/80 bg-background/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-lg text-foreground hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
              aria-label="Open navigation sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="hidden sm:flex items-center gap-2">
              <span className="font-black text-sm text-primary tracking-tight">
                Seller Merchant Hub
              </span>
              <span className="text-xs text-muted-foreground font-normal">
                • Store: <span className="font-semibold text-foreground">TechNexus Innovations</span>
              </span>
            </div>
          </div>

          {/* Quick Search */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                placeholder="Quick search products, orders, SKUs..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-border/80 bg-surface/50 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:bg-background transition-all"
              />
            </div>
          </div>

          {/* Right Controls: Storefront Link, Notifications, Profile Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/stores/technexus" target="_blank" className="hidden lg:inline-flex">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs gap-1.5 text-muted-foreground hover:text-foreground h-8"
              >
                <span>Live Storefront</span>
                <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>

            {/* Real-Time Database Backed Notifications */}
            <NotificationDropdown variant="seller" />

            {/* Seller Profile Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsProfileMenuOpen(!isProfileMenuOpen);
                  setIsNotificationOpen(false);
                }}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-surface border border-transparent hover:border-border/60 transition-all text-left"
              >
                <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-xs shadow-sm">
                  TN
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-foreground leading-none">
                    TechNexus
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">
                    Merchant Tier 1
                  </span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
              </button>

              {isProfileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProfileMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-border bg-card shadow-xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 border-b border-border/60 mb-1">
                      <p className="text-xs font-bold text-foreground">TechNexus Innovations</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        merchant@technexus.in
                      </p>
                      <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-1.5 py-0.5 rounded">
                        Approved Merchant
                      </span>
                    </div>

                    <Link
                      href="/seller/profile"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-surface transition-colors"
                    >
                      <Store className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Store Profile</span>
                    </Link>

                    <Link
                      href="/seller/settings"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-surface transition-colors"
                    >
                      <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Account Settings</span>
                    </Link>

                    <Link
                      href="/stores/technexus"
                      target="_blank"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-surface transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>View Public Shop</span>
                    </Link>

                    <div className="pt-1 border-t border-border/60 mt-1">
                      <Link
                        href="/login"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Sign Out</span>
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 md:p-8 flex-1 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
