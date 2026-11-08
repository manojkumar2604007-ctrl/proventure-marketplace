"use client";

import React, { useState } from "react";
import { SellerSidebar } from "@/components/layout/seller-sidebar";
import Link from "next/link";
import { Bell, ExternalLink, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface/50">
      {/* Desktop & Mobile Sidebar */}
      <div className="hidden md:block">
        <SellerSidebar />
      </div>

      {/* Mobile Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-primary-950/60 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-64 bg-background h-full shadow-modal">
            <SellerSidebar isOpen={true} onClose={() => setIsMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Seller Portal Top Bar */}
        <header className="sticky top-0 z-30 h-16 border-b border-border/80 bg-background/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-lg text-foreground hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
              aria-label="Open navigation sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            <h2 className="text-sm font-bold text-primary">
              Seller Merchant Center
            </h2>
            <span className="hidden sm:inline text-xs text-muted-foreground">
              • Storefront: <span className="font-semibold text-foreground">TechNexus Innovations</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/products?seller=technexus" target="_blank">
              <Button variant="ghost" size="sm" className="text-xs gap-1.5 text-muted-foreground hover:text-foreground">
                <span className="hidden sm:inline">View Live Shop</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </Link>

            <button
              className="p-2 rounded-lg text-muted-foreground hover:bg-surface transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 md:p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}
