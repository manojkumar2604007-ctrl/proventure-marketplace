import React from "react";
import Link from "next/link";
import { orderService } from "@/services/order.service";
import { formatPrice, formatDate } from "@/lib/utils";
import { ShoppingBag, Heart, MapPin, ArrowRight, ShieldCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function CustomerOverviewPage() {
  const orders = await orderService.getCustomerOrders("usr_customer_1");
  const recentOrder = orders[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">
          Welcome back, Priya!
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage your multi-vendor marketplace purchases, tracking status, and saved items.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border bg-card shadow-sm flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xl font-black text-foreground">{orders.length}</span>
            <p className="text-xs text-muted-foreground">Total Orders Placed</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl border bg-card shadow-sm flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
            <Heart className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xl font-black text-foreground">6</span>
            <p className="text-xs text-muted-foreground">Saved in Wishlist</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl border bg-card shadow-sm flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xl font-black text-foreground">Verified</span>
            <p className="text-xs text-muted-foreground">Buyer Assurance Active</p>
          </div>
        </div>
      </div>

      {/* Recent Order Snapshot */}
      {recentOrder && (
        <div className="border rounded-2xl bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                Latest Order
              </span>
              <h3 className="font-bold text-sm text-foreground">
                Order #{recentOrder.orderNumber}
              </h3>
            </div>
            <Badge
              variant={
                recentOrder.status === "DELIVERED"
                  ? "success"
                  : recentOrder.status === "SHIPPED"
                  ? "info"
                  : "warning"
              }
              className="text-xs"
            >
              {recentOrder.status}
            </Badge>
          </div>

          <div className="space-y-3">
            {recentOrder.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-xs">
                <div>
                  <p className="font-semibold text-foreground">{item.title}</p>
                  <p className="text-muted-foreground text-[11px]">
                    Qty: {item.quantity} • Fulfilled by vendor
                  </p>
                </div>
                <span className="font-bold">{formatPrice(item.total)}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>Ordered on {formatDate(recentOrder.createdAt)}</span>
            </div>
            <Link href="/customer/orders">
              <Button size="sm" variant="outline" className="text-xs gap-1">
                Track Shipment <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Default Shipping Address */}
      <div className="border rounded-2xl bg-card p-6 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <h3 className="font-bold text-sm text-foreground">Default Shipping Address</h3>
          </div>
          <Link href="/customer/addresses" className="text-xs text-primary font-semibold hover:underline">
            Manage
          </Link>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p className="font-bold text-foreground">Priya Sharma</p>
          <p>Flat 402, Oakwood Greens, Indiranagar</p>
          <p>Bengaluru, Karnataka - 560038, India</p>
          <p className="pt-1">Phone: +91 91234 56789</p>
        </div>
      </div>
    </div>
  );
}
