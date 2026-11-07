import React from "react";
import Link from "next/link";
import { vendorService } from "@/services/vendor.service";
import { orderService } from "@/services/order.service";
import { formatPrice, formatDate } from "@/lib/utils";
import {
  DollarSign,
  Package,
  ShoppingBag,
  Star,
  ArrowUpRight,
  TrendingUp,
  PlusCircle,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function SellerDashboardPage() {
  const sellerId = "seller_technexus";
  const [metrics, orders] = await Promise.all([
    vendorService.getVendorMetrics(sellerId),
    orderService.getSellerOrders(sellerId),
  ]);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            TechNexus Merchant Dashboard
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time business performance, fulfillment status, and payout metrics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/seller/products/new">
            <Button size="sm" className="rounded-xl text-xs font-semibold gap-1.5 shadow-sm">
              <PlusCircle className="h-4 w-4" />
              <span>Add New Product</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border bg-card shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Gross Revenue</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-foreground block">
            {formatPrice(metrics.totalRevenue)}
          </span>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
            <TrendingUp className="h-3 w-3" />
            <span>+18.4% from last month</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border bg-card shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Net Seller Payout</span>
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-foreground block">
            {formatPrice(metrics.netEarnings)}
          </span>
          <span className="text-[11px] text-muted-foreground block">
            After 10% platform fee
          </span>
        </div>

        <div className="p-5 rounded-2xl border bg-card shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Total Orders</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-foreground block">
            {orders.length}
          </span>
          <span className="text-[11px] text-amber-600 font-semibold">
            {metrics.pendingOrders} pending fulfillment
          </span>
        </div>

        <div className="p-5 rounded-2xl border bg-card shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Merchant Rating</span>
            <div className="h-8 w-8 rounded-lg bg-yellow-500/10 text-yellow-500 flex items-center justify-center">
              <Star className="h-4 w-4 fill-current" />
            </div>
          </div>
          <span className="text-2xl font-black text-foreground block">
            {metrics.rating.toFixed(1)} / 5.0
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold">
            Top 1% marketplace score
          </span>
        </div>
      </div>

      {/* Orders Table */}
      <div className="border rounded-2xl bg-card overflow-hidden shadow-sm space-y-4 p-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h3 className="font-bold text-base text-foreground">Recent Seller Orders</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Orders requiring dispatch and tracking updates
            </p>
          </div>
          <Link href="/seller/orders">
            <Button variant="outline" size="sm" className="text-xs gap-1">
              View All Orders <ArrowUpRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                <th className="pb-3">Order #</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Items</th>
                <th className="pb-3">Total</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Date</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3.5 font-bold font-mono text-primary">
                    {ord.orderNumber}
                  </td>
                  <td className="py-3.5 font-medium text-foreground">
                    {ord.customer?.name || ord.shippingAddress.fullName}
                  </td>
                  <td className="py-3.5 text-muted-foreground">
                    {ord.items.filter((i) => i.sellerId === sellerId).length} line items
                  </td>
                  <td className="py-3.5 font-bold text-foreground">
                    {formatPrice(
                      ord.items
                        .filter((i) => i.sellerId === sellerId)
                        .reduce((sum, it) => sum + it.total, 0)
                    )}
                  </td>
                  <td className="py-3.5">
                    <Badge
                      variant={
                        ord.status === "DELIVERED"
                          ? "success"
                          : ord.status === "SHIPPED"
                          ? "info"
                          : "warning"
                      }
                      className="text-[10px]"
                    >
                      {ord.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 text-muted-foreground">
                    {formatDate(ord.createdAt)}
                  </td>
                  <td className="py-3.5 text-right">
                    <Link href="/seller/orders">
                      <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
                        Manage
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
