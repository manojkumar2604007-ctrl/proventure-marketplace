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
  Palette,
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
  { name: "Design System", href: "/design-system", icon: Palette },
  { name: "Shop Profile", href: "/seller/settings", icon: Store },
];

export function SellerSidebar({
  isOpen = true,
  onClose,
}: {
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "w-64 border-r border-border/80 bg-background h-screen sticky top-0 flex flex-col justify-between p-4 shrink-0 z-40 transition-all",
        !isOpen && "hidden md:flex"
      )}
    >
      <div className="space-y-6">
        {/* Brand / Store header */}
        <div className="flex items-center gap-2.5 px-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-extrabold text-lg shadow-subtle">
            S
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-primary leading-none">
              TechNexus Store
            </span>
            <span className="text-[10px] font-semibold text-accent uppercase tracking-wider mt-0.5">
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
                onClick={onClose}
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
      </div>

      {/* Footer Switcher */}
      <div className="pt-4 border-t border-border/60 space-y-2">
        <Link href="/" className="w-full block">
          <Button variant="outline" size="sm" className="w-full text-xs justify-start gap-2">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Storefront</span>
          </Button>
        </Link>
        <Link href="/admin" className="w-full block">
          <Button variant="ghost" size="sm" className="w-full text-xs justify-start text-muted-foreground hover:text-foreground">
            Switch to Admin Console
          </Button>
        </Link>
      </div>
    </aside>
  );
}
