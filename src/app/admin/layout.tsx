"use client";

import React, { useState } from "react";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import Link from "next/link";
import {
  ShieldAlert,
  Bell,
  Globe,
  Menu,
  Search,
  CheckCircle2,
  AlertTriangle,
  User,
  LogOut,
  Settings,
  ChevronDown,
  ShieldCheck,
  Store,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NotificationDropdown } from "@/components/ui/notification-dropdown";

const MOCK_ADMIN_NOTIFICATIONS = [
  {
    id: "an_1",
    title: "New Merchant KYC Application",
    message: "Artisan Woodworks submitted registration documents for review.",
    time: "25 mins ago",
    unread: true,
    type: "seller",
  },
  {
    id: "an_2",
    title: "High Value Order Placed",
    message: "Order #ORD-9912 placed for ₹1,24,000 (Payment settled via Razorpay).",
    time: "2 hours ago",
    unread: true,
    type: "order",
  },
  {
    id: "an_3",
    title: "Automated Backup Completed",
    message: "Neon PostgreSQL database snapshots generated successfully.",
    time: "6 hours ago",
    unread: false,
    type: "system",
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_ADMIN_NOTIFICATIONS);
  const [searchQuery, setSearchQuery] = useState("");

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AdminSidebar
          collapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Mobile Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-72 bg-[#0A192F] h-full shadow-2xl">
            <AdminSidebar
              isOpen={true}
              onClose={() => setIsMobileSidebarOpen(false)}
              collapsed={false}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 border-b border-slate-800 bg-[#0A192F]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-lg text-slate-300 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Open navigation sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-white tracking-tight">
                Marketplace Operations Console
              </h2>
              <span className="hidden lg:inline-flex text-[11px] text-emerald-400 font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/80 items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                All Systems Operational
              </span>
            </div>
          </div>

          {/* Quick Search */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Global search users, merchants, orders, SKUs..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/90 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Right Controls: Storefront, Notifications, Admin Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/" target="_blank" className="hidden sm:inline-flex">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-slate-400 hover:text-white hover:bg-slate-800 gap-1.5 h-8"
              >
                <Globe className="h-3.5 w-3.5" />
                <span>Storefront</span>
              </Button>
            </Link>

            {/* Real-Time Database Backed Operations Alerts */}
            <NotificationDropdown variant="admin" />

            {/* Admin Profile Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsProfileMenuOpen(!isProfileMenuOpen);
                  setIsNotificationOpen(false);
                }}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all text-left"
              >
                <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-md">
                  AV
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-white leading-none">
                    Alex Vane
                  </span>
                  <span className="text-[10px] text-blue-400 font-semibold mt-0.5">
                    Super Admin
                  </span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
              </button>

              {isProfileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProfileMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-800 bg-[#0A192F] shadow-2xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 border-b border-slate-800 mb-1">
                      <p className="text-xs font-bold text-white">Alex Vane</p>
                      <p className="text-[11px] text-slate-400 truncate">admin@proventure.com</p>
                      <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/80">
                        Root Authority
                      </span>
                    </div>

                    <Link
                      href="/admin/users"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      <span>User Management</span>
                    </Link>

                    <Link
                      href="/admin/settings"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <Settings className="h-3.5 w-3.5 text-slate-400" />
                      <span>Platform Settings</span>
                    </Link>

                    <Link
                      href="/"
                      target="_blank"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <Globe className="h-3.5 w-3.5 text-slate-400" />
                      <span>Storefront View</span>
                    </Link>

                    <div className="pt-1 border-t border-slate-800 mt-1">
                      <Link
                        href="/login"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-950/40 transition-colors"
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

        {/* Content Viewport */}
        <main className="p-4 sm:p-6 md:p-8 flex-1 bg-slate-950 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
