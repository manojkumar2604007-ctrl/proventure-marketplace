"use client";

import React, { useState } from "react";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import Link from "next/link";
import { ShieldAlert, Bell, Globe, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AdminSidebar />
      </div>

      {/* Mobile Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-64 bg-[#0A192F] h-full shadow-modal">
            <AdminSidebar isOpen={true} onClose={() => setIsMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 border-b border-slate-800 bg-[#0A192F]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-lg text-slate-300 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Open navigation sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            <h2 className="text-sm font-bold text-white">
              Marketplace Operations Console
            </h2>
            <span className="hidden sm:inline-flex text-xs text-emerald-400 font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800">
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
                <span className="hidden sm:inline">Live Marketplace</span>
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
        <main className="p-4 sm:p-6 md:p-8 flex-1 bg-slate-950/50">{children}</main>
      </div>
    </div>
  );
}
