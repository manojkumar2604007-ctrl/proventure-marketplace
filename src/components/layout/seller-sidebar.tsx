"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Package,
  PlusCircle,
  Layers,
  ShoppingBag,
  Users,
  BarChart3,
  Tag,
  Star,
  CircleDollarSign,
  Settings,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const SELLER_NAV_ITEMS = [
  { name: "Dashboard", href: "/seller", icon: LayoutDashboard, exact: true },
  { name: "Store Profile", href: "/seller/profile", icon: Store },
  { name: "Products", href: "/seller/products", icon: Package, badge: "Catalog" },
  { name: "Add Product", href: "/seller/products/new", icon: PlusCircle },
  { name: "Inventory", href: "/seller/inventory", icon: Layers, alertBadge: true },
  { name: "Orders", href: "/seller/orders", icon: ShoppingBag, badge: "Active" },
  { name: "Customers", href: "/seller/customers", icon: Users },
  { name: "Analytics", href: "/seller/analytics", icon: BarChart3 },
  { name: "Promotions", href: "/seller/promotions", icon: Tag },
  { name: "Reviews", href: "/seller/reviews", icon: Star },
  { name: "Payouts", href: "/seller/payouts", icon: CircleDollarSign },
  { name: "Settings", href: "/seller/settings", icon: Settings },
];

interface SellerSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function SellerSidebar({
  isOpen = true,
  onClose,
  collapsed = false,
  onToggleCollapse,
}: SellerSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "border-r border-border/80 bg-background h-screen sticky top-0 flex flex-col justify-between shrink-0 z-40 transition-all duration-300 ease-in-out select-none",
        collapsed ? "w-20 p-3" : "w-64 p-4",
        !isOpen && "hidden md:flex"
      )}
    >
      <div className="space-y-4 flex-1 overflow-y-auto pr-0.5 scrollbar-thin">
        {/* Brand / Store header */}
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <Link
            href="/seller"
            className={cn(
              "flex items-center gap-3 transition-opacity hover:opacity-90",
              collapsed && "justify-center w-full"
            )}
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary via-primary-900 to-secondary flex items-center justify-center text-white font-black text-lg shadow-subtle shrink-0">
              P
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm tracking-tight text-primary leading-tight truncate">
                  TechNexus Store
                </span>
                <span className="text-[10px] font-semibold text-accent uppercase tracking-wider flex items-center gap-1 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                  Verified Seller
                </span>
              </div>
            )}
          </Link>

          {/* Desktop collapse toggle */}
          {onToggleCollapse && !collapsed && (
            <button
              onClick={onToggleCollapse}
              className="hidden md:flex h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface items-center justify-center transition-colors"
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
              className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface flex items-center justify-center transition-colors"
              title="Expand sidebar"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Navigation links (12 items) */}
        <nav className="space-y-1">
          {SELLER_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || (item.href !== "/seller" && pathname?.startsWith(item.href));

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
                    ? "bg-primary text-primary-foreground font-bold shadow-subtle"
                    : "text-muted-foreground hover:bg-surface hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform group-hover:scale-105",
                    isActive ? "text-primary-foreground" : "text-muted-foreground"
                  )}
                />

                {!collapsed && (
                  <span className="truncate flex-1">{item.name}</span>
                )}

                {!collapsed && item.badge && !isActive && (
                  <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">
                    {item.badge}
                  </span>
                )}

                {item.alertBadge && !collapsed && (
                  <span className="h-2 w-2 rounded-full bg-amber-500" title="Low stock alerts pending" />
                )}

                {/* Floating tooltip when collapsed */}
                {collapsed && (
                  <span className="absolute left-full ml-3 px-2 py-1 bg-foreground text-background text-[11px] font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap shadow-md z-50 transition-opacity">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Switcher */}
      <div className={cn("pt-4 border-t border-border/60 space-y-2 shrink-0", collapsed && "flex flex-col items-center")}>
        <Link href="/" target="_blank" className="w-full block">
          <Button
            variant="outline"
            size="sm"
            className={cn("w-full text-xs gap-2 border-border/80", collapsed ? "px-0 justify-center" : "justify-start")}
            title="View Live Storefront"
          >
            <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
            {!collapsed && <span className="truncate">Storefront</span>}
          </Button>
        </Link>
        <Link href="/stores/technexus" target="_blank" className="w-full block">
          <Button
            variant="ghost"
            size="sm"
            className={cn("w-full text-xs gap-2 text-muted-foreground hover:text-foreground", collapsed ? "px-0 justify-center" : "justify-start")}
            title="View Public Store Page"
          >
            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            {!collapsed && <span className="truncate">Public Store</span>}
          </Button>
        </Link>
      </div>
    </aside>
  );
}
