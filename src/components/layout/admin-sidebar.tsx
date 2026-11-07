"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  Layers,
  ShoppingBag,
  Settings,
  ArrowLeft,
  Percent,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const ADMIN_NAV_ITEMS = [
  { name: "Executive Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Vendor Management", href: "/admin/vendors", icon: Users },
  { name: "Product Moderation", href: "/admin/products", icon: Package },
  { name: "Categories", href: "/admin/categories", icon: Layers },
  { name: "Marketplace Orders", href: "/admin/orders", icon: ShoppingBag },
  { name: "Commissions & Fees", href: "/admin/commissions", icon: Percent },
  { name: "Platform Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-slate-950 text-slate-100 h-screen sticky top-0 flex flex-col justify-between p-4 shrink-0">
      <div className="space-y-6">
        {/* Brand header */}
        <div className="flex items-center gap-2 px-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-rose-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            A
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm tracking-tight text-white leading-none">
              PROVENTURE
            </span>
            <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider mt-0.5">
              Admin Console
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="space-y-1">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors",
                  isActive
                    ? "bg-indigo-600 text-white font-semibold shadow-sm"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
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
      <div className="pt-4 border-t border-slate-800 space-y-2">
        <Link href="/" className="w-full block">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs justify-start gap-2 bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Storefront</span>
          </Button>
        </Link>
        <Link href="/seller" className="w-full block">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs justify-start text-slate-400 hover:text-white hover:bg-slate-900"
          >
            Switch to Seller Portal
          </Button>
        </Link>
      </div>
    </aside>
  );
}
