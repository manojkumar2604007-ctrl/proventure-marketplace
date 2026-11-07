"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Layers,
  CircleDollarSign,
  Store,
  ArrowLeft,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const SELLER_NAV_ITEMS = [
  { name: "Overview", href: "/seller", icon: LayoutDashboard },
  { name: "Products", href: "/seller/products", icon: Package },
  { name: "Add Product", href: "/seller/products/new", icon: PlusCircle },
  { name: "Orders", href: "/seller/orders", icon: ShoppingBag },
  { name: "Inventory", href: "/seller/inventory", icon: Layers },
  { name: "Earnings & Payouts", href: "/seller/earnings", icon: CircleDollarSign },
  { name: "Shop Profile", href: "/seller/settings", icon: Store },
];

export function SellerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-card h-screen sticky top-0 flex flex-col justify-between p-4 shrink-0">
      <div className="space-y-6">
        {/* Brand / Store header */}
        <div className="flex items-center gap-2 px-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            S
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-foreground leading-none">
              TechNexus Store
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mt-0.5">
              Verified Merchant
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="space-y-1">
          {SELLER_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/seller"
                ? pathname === "/seller"
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Switcher */}
      <div className="pt-4 border-t space-y-2">
        <Link href="/" className="w-full block">
          <Button variant="outline" size="sm" className="w-full text-xs justify-start gap-2">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Storefront</span>
          </Button>
        </Link>
        <Link href="/admin" className="w-full block">
          <Button variant="ghost" size="sm" className="w-full text-xs justify-start text-muted-foreground">
            Switch to Admin Console
          </Button>
        </Link>
      </div>
    </aside>
  );
}
