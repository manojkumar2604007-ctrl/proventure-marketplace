"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  Layers,
  ShoppingBag,
  BarChart3,
  ShieldCheck,
  Percent,
  Settings,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Globe,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const ADMIN_NAV_ITEMS = [
  { name: "Executive Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { name: "User Management", href: "/admin/users", icon: Users, badge: "RBAC" },
  { name: "Seller Management", href: "/admin/vendors", icon: Store, alertBadge: true },
  { name: "Product Moderation", href: "/admin/products", icon: Package },
  { name: "Category Taxonomy", href: "/admin/categories", icon: Layers },
  { name: "Orders & Disputes", href: "/admin/orders", icon: ShoppingBag, badge: "Live" },
  { name: "Platform Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Audit Trail", href: "/admin/audit-logs", icon: FileText },
  { name: "Commissions & Fees", href: "/admin/commissions", icon: Percent },
  { name: "Platform Settings", href: "/admin/settings", icon: Settings },
];

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AdminSidebar({
  isOpen = true,
  onClose,
  collapsed = false,
  onToggleCollapse,
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "border-r border-slate-800 bg-[#0A192F] text-slate-100 h-screen sticky top-0 flex flex-col justify-between shrink-0 z-40 transition-all duration-300 ease-in-out select-none",
        collapsed ? "w-20 p-3" : "w-64 p-4",
        !isOpen && "hidden md:flex"
      )}
    >
      <div className="space-y-4 flex-1 overflow-y-auto pr-0.5 scrollbar-thin">
        {/* Brand header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-3 transition-opacity hover:opacity-90",
              collapsed && "justify-center w-full"
            )}
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-800 flex items-center justify-center text-white font-black text-lg shadow-lg shrink-0">
              P
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-black text-sm tracking-tight text-white leading-tight truncate">
                  PROVENTURE
                </span>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="h-3 w-3 text-emerald-400" />
                  Admin Console
                </span>
              </div>
            )}
          </Link>

          {/* Desktop collapse toggle */}
          {onToggleCollapse && !collapsed && (
            <button
              onClick={onToggleCollapse}
              className="hidden md:flex h-7 w-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 items-center justify-center transition-colors"
              title="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {collapsed && onToggleCollapse && (
          <div className="hidden md:flex justify-center pb-2">
            <button
              onClick={onToggleCollapse}
              className="h-7 w-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors"
              title="Expand sidebar"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Navigation links */}
        <nav className="space-y-1">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                title={collapsed ? item.name : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl text-xs font-medium transition-all duration-150 group relative",
                  collapsed ? "justify-center px-2 py-3" : "px-3 py-2.5",
                  isActive
                    ? "bg-blue-600 text-white font-bold shadow-md"
                    : "text-slate-400 hover:bg-slate-800/80 hover:text-white"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform group-hover:scale-105",
                    isActive ? "text-white" : "text-slate-400"
                  )}
                />

                {!collapsed && (
                  <span className="truncate flex-1">{item.name}</span>
                )}

                {!collapsed && item.badge && !isActive && (
                  <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400">
                    {item.badge}
                  </span>
                )}

                {item.alertBadge && !collapsed && (
                  <span className="h-2 w-2 rounded-full bg-amber-400" title="Pending seller approvals" />
                )}

                {/* Tooltip on collapse */}
                {collapsed && (
                  <span className="absolute left-full ml-3 px-2 py-1 bg-white text-slate-900 text-[11px] font-bold rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap shadow-xl z-50 transition-opacity">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Switcher */}
      <div className={cn("pt-4 border-t border-slate-800 space-y-2 shrink-0", collapsed && "flex flex-col items-center")}>
        <Link href="/" target="_blank" className="w-full block">
          <Button
            variant="outline"
            size="sm"
            className={cn("w-full text-xs gap-2 bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-700", collapsed ? "px-0 justify-center" : "justify-start")}
            title="View Live Storefront"
          >
            <Globe className="h-3.5 w-3.5 shrink-0" />
            {!collapsed && <span className="truncate">Live Storefront</span>}
          </Button>
        </Link>
        <Link href="/seller" className="w-full block">
          <Button
            variant="ghost"
            size="sm"
            className={cn("w-full text-xs gap-2 text-slate-400 hover:text-white hover:bg-slate-800/60", collapsed ? "px-0 justify-center" : "justify-start")}
            title="Switch to Seller Portal"
          >
            <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
            {!collapsed && <span className="truncate">Seller Portal</span>}
          </Button>
        </Link>
      </div>
    </aside>
  );
}
