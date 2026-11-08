"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  ShoppingBag,
  Heart,
  MapPin,
  Star,
  Bell,
  Settings,
  LogOut,
  Palette,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CUSTOMER_NAV_ITEMS = [
  { name: "Overview Dashboard", href: "/customer", icon: LayoutDashboard },
  { name: "My Profile", href: "/customer/profile", icon: User },
  { name: "Orders & Tracking", href: "/customer/orders", icon: ShoppingBag },
  { name: "Address Book", href: "/customer/addresses", icon: MapPin },
  { name: "Saved Wishlist", href: "/customer/wishlist", icon: Heart },
  { name: "My Reviews", href: "/customer/reviews", icon: Star },
  { name: "Notifications", href: "/customer/notifications", icon: Bell },
  { name: "Account Settings", href: "/customer/settings", icon: Settings },
];

export function CustomerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-64 border border-border/80 rounded-2xl bg-card p-4 shrink-0 shadow-subtle self-start sticky top-24">
      {/* Customer User Pill */}
      <div className="flex items-center gap-3 pb-4 border-b border-border/60">
        <div className="h-11 w-11 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-extrabold text-sm shadow-subtle">
          PS
        </div>
        <div className="overflow-hidden">
          <h4 className="text-sm font-bold text-primary truncate leading-tight">
            Priya Sharma
          </h4>
          <span className="text-xs text-muted-foreground truncate block">
            customer@example.com
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="mt-4 space-y-1">
        {CUSTOMER_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/customer"
              ? pathname === "/customer" || pathname === "/customer/dashboard"
              : pathname === item.href || pathname?.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150",
                isActive
                  ? "bg-primary text-primary-foreground font-bold shadow-subtle"
                  : "text-muted-foreground hover:bg-surface hover:text-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sign Out */}
      <div className="mt-6 pt-4 border-t border-border/60">
        <Link
          href="/api/auth/signout"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </Link>
      </div>
    </aside>
  );
}
