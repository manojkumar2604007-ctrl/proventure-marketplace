import React from "react";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import Link from "next/link";
import { ShieldAlert, Bell, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 border-b border-slate-800 bg-slate-950 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-white">
              Marketplace Operations Console
            </h2>
            <span className="text-xs text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800">
              ● All Systems Operational
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/" target="_blank">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-slate-400 hover:text-white hover:bg-slate-800 gap-1.5"
              >
                <Globe className="h-3.5 w-3.5" />
                <span>Live Marketplace</span>
              </Button>
            </Link>

            <button
              className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              aria-label="Alerts"
            >
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="p-6 md:p-8 flex-1 bg-slate-950/50">{children}</main>
      </div>
    </div>
  );
}
