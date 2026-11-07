import React from "react";
import { SellerSidebar } from "@/components/layout/seller-sidebar";
import Link from "next/link";
import { Bell, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-muted/20">
      <SellerSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Seller Portal Top Bar */}
        <header className="sticky top-0 z-30 h-16 border-b bg-card px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-foreground">
              Seller Merchant Center
            </h2>
            <span className="hidden sm:inline text-xs text-muted-foreground">
              • Storefront: <span className="font-semibold text-foreground">TechNexus Innovations</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/products?seller=technexus" target="_blank">
              <Button variant="ghost" size="sm" className="text-xs gap-1.5 text-muted-foreground hover:text-foreground">
                <span>View Live Shop</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </Link>

            <button
              className="p-2 rounded-lg text-muted-foreground hover:bg-muted"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 md:p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}
