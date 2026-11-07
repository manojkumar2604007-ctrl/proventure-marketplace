"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  ShoppingBag,
  Heart,
  MapPin,
  Star,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CUSTOMER_NAV_ITEMS = [
  { name: "My Profile", href: "/customer", icon: User },
  { name: "Orders & Tracking", href: "/customer/orders", icon: ShoppingBag },
  { name: "Saved Wishlist", href: "/customer/wishlist", icon: Heart },
  { name: "Addresses", href: "/customer/addresses", icon: MapPin },
  { name: "My Reviews", href: "/customer/reviews", icon: Star },
  { name: "Account Settings", href: "/customer/settings", icon: Settings },
];

export function CustomerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-64 border rounded-2xl bg-card p-4 shrink-0 shadow-sm self-start">
      <div className="flex items-center gap-3 pb-4 border-b">
        <div className="h-11 w-11 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-base">
          PS
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground leading-tight">Priya Sharma</h4>
          <span className="text-xs text-muted-foreground">customer@example.com</span>
        </div>
      </div>

      <nav className="mt-4 space-y-1">
        {CUSTOMER_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 pt-4 border-t">
        <button
          onClick={() => alert("Sign out triggered")}
          className="flex items-center gap-3 px-3 py-2 w-full text-xs font-medium text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
