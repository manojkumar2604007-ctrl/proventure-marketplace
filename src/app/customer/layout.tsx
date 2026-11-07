import React from "react";
import { StorefrontHeader } from "@/components/layout/storefront-header";
import { StorefrontFooter } from "@/components/layout/storefront-footer";
import { CustomerSidebar } from "@/components/layout/customer-sidebar";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <StorefrontHeader />
      <div className="container py-8 flex-1">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <CustomerSidebar />
          <div className="flex-1 w-full min-w-0">{children}</div>
        </div>
      </div>
      <StorefrontFooter />
    </div>
  );
}
