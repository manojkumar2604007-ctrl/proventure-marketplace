import React from "react";
import Link from "next/link";
import Image from "next/image";
import { vendorService } from "@/services/vendor.service";
import { orderService } from "@/services/order.service";
import { productService } from "@/services/product.service";
import { formatPrice, formatDate } from "@/lib/utils";
import {
  DollarSign,
  Package,
  ShoppingBag,
  TrendingUp,
  PlusCircle,
  Truck,
  ArrowUpRight,
  AlertTriangle,
  Star,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  BarChart3,
  Boxes,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Revenue trend mock points for the SVG/Bar visualization
const REVENUE_TREND = [
  { month: "Jan", revenue: 84000, height: "45%" },
  { month: "Feb", revenue: 98500, height: "55%" },
  { month: "Mar", revenue: 112000, height: "65%" },
  { month: "Apr", revenue: 104000, height: "60%" },
  { month: "May", revenue: 135000, height: "80%" },
  { month: "Jun", revenue: 168000, height: "95%" },
  { month: "Jul", revenue: 182000, height: "100%" },
];

export default async function SellerDashboardPage() {
  const sellerId = "seller_technexus";

  const [metrics, orders, products] = await Promise.all([
    vendorService.getVendorMetrics(sellerId),
    orderService.getSellerOrders(sellerId),
    productService.getProductsBySeller(sellerId),
  ]);

  const lowStockProducts = products.filter((p) => p.stock <= 5);
  const pendingOrders = orders.filter(
    (o) => o.status === "PENDING" || o.status === "PROCESSING" || o.status === "CONFIRMED"
  );

  // Best-selling items calculation
  const bestSellers = products.slice(0, 4).map((p, idx) => ({
    ...p,
    salesCount: 48 - idx * 9,
    totalEarned: (48 - idx * 9) * p.price,
  }));

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-primary-950 via-primary to-primary-900 text-white p-6 rounded-3xl shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
              Live Merchant Control
            </span>
            <span className="text-xs text-white/80">Store ID: {sellerId}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, TechNexus
          </h1>
          <p className="text-xs sm:text-sm text-white/80 max-w-xl leading-relaxed">
            Here is your live marketplace telemetry. You have {pendingOrders.length} pending orders ready to be processed and dispatched.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Link href="/seller/products/new">
            <Button size="sm" className="bg-white text-primary hover:bg-white/90 font-bold rounded-xl text-xs gap-1.5 shadow-sm">
              <PlusCircle className="h-4 w-4" />
              <span>Add Product</span>
            </Button>
          </Link>
          <Link href="/seller/orders">
            <Button size="sm" variant="outline" className="text-white border-white/30 hover:bg-white/10 font-bold rounded-xl text-xs gap-1.5">
              <Truck className="h-4 w-4" />
              <span>Fulfill Orders</span>
            </Button>
          </Link>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-64 h-64 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 5 Core KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Sales */}
        <div className="p-5 rounded-2xl border border-border/80 bg-card shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Total Sales</span>
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

        {/* Total Orders */}
        <div className="p-5 rounded-2xl border border-border/80 bg-card shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Total Orders</span>
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-foreground block">
            {orders.length}
          </span>
          <span className="text-[11px] text-muted-foreground block">
            Across 6 cities in India
          </span>
        </div>

        {/* Pending Orders */}
        <div className="p-5 rounded-2xl border border-border/80 bg-card shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Pending Orders</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-foreground block">
            {pendingOrders.length}
          </span>
          <span className="text-[11px] text-amber-600 font-semibold">
            Requires packaging & AWBs
          </span>
        </div>

        {/* Total Products */}
        <div className="p-5 rounded-2xl border border-border/80 bg-card shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Total Products</span>
            <div className="h-8 w-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-foreground block">
            {products.length}
          </span>
          <span className="text-[11px] text-muted-foreground block">
            {products.filter((p) => p.status === "ACTIVE").length} live on marketplace
          </span>
        </div>

        {/* Low-stock products */}
        <div className="p-5 rounded-2xl border border-border/80 bg-card shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Low Stock Items</span>
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${lowStockProducts.length > 0 ? "bg-rose-500/10 text-rose-600" : "bg-emerald-500/10 text-emerald-600"}`}>
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-foreground block">
            {lowStockProducts.length}
          </span>
          <span className={`text-[11px] font-semibold block ${lowStockProducts.length > 0 ? "text-rose-600" : "text-emerald-600"}`}>
            {lowStockProducts.length > 0 ? "Replenish immediately" : "Stock health optimal"}
          </span>
        </div>
      </div>

      {/* Mid Section: Revenue Trend Chart & Best-Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart (2 cols) */}
        <div className="lg:col-span-2 border border-border/80 rounded-2xl bg-card p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div>
              <h3 className="font-bold text-base text-foreground">Revenue Analytics (2026)</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Gross sales distribution across current financial cycle
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-mono font-bold text-emerald-600 border-emerald-500/30 bg-emerald-500/5">
                +24.6% YoY Growth
              </Badge>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-64 flex items-end gap-3 sm:gap-6 pt-6 pb-2 px-2 border-b border-border/60">
            {REVENUE_TREND.map((point) => (
              <div key={point.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="relative w-full flex items-end justify-center h-full">
                  <div
                    style={{ height: point.height }}
                    className="w-full max-w-[36px] bg-gradient-to-t from-primary to-secondary rounded-t-lg transition-all duration-300 group-hover:brightness-110 shadow-sm relative"
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-[10px] font-bold px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-20">
                      ₹{(point.revenue / 1000).toFixed(0)}k
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                  {point.month}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground gap-4">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-gradient-to-t from-primary to-secondary" />
                <span>Gross Direct Sales</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-emerald-500" />
                <span>Disbursed Payouts</span>
              </span>
            </div>
            <Link href="/seller/analytics" className="text-primary font-semibold hover:underline flex items-center gap-1">
              <span>Deep-dive Analytics</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Best-Selling Products (1 col) */}
        <div className="border border-border/80 rounded-2xl bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div>
              <h3 className="font-bold text-base text-foreground">Best Sellers</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Top performing items by units sold</p>
            </div>
            <Link href="/seller/products">
              <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
                All Products
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            {bestSellers.map((prod) => (
              <div key={prod.id} className="flex items-center gap-3 group">
                <div className="h-12 w-12 rounded-xl bg-surface border border-border/60 overflow-hidden relative shrink-0">
                  <Image
                    src={prod.images[0]?.url || "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=200"}
                    alt={prod.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/seller/products/${prod.id}/edit`} className="font-bold text-xs text-foreground hover:text-primary transition-colors line-clamp-1">
                    {prod.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                    <span>{prod.salesCount} sold</span>
                    <span>•</span>
                    <span className="font-semibold text-emerald-600">{formatPrice(prod.totalEarned)}</span>
                  </div>
                </div>
                <Badge variant={prod.stock <= 5 ? "warning" : "secondary"} className="text-[10px] shrink-0">
                  {prod.stock} in stock
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="border border-border/80 rounded-2xl bg-card overflow-hidden shadow-sm space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-4">
          <div>
            <h3 className="font-bold text-base text-foreground">Recent Seller Orders</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Customer orders requiring packaging, carrier assignment, or dispatch
            </p>
          </div>
          <Link href="/seller/orders">
            <Button variant="outline" size="sm" className="text-xs gap-1.5 rounded-xl font-bold">
              <span>View All Orders</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                <th className="pb-3">Order Number</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Purchased Items</th>
                <th className="pb-3">Order Value</th>
                <th className="pb-3">Fulfillment Status</th>
                <th className="pb-3">Placed On</th>
                <th className="pb-3 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {orders.slice(0, 6).map((ord) => {
                const sellerLineItems = ord.items.filter((i) => i.sellerId === sellerId);
                const sellerTotal = sellerLineItems.reduce((sum, it) => sum + it.total, 0);

                return (
                  <tr key={ord.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 font-bold font-mono text-primary">
                      <Link href={`/seller/orders/${ord.id}`} className="hover:underline">
                        {ord.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3.5">
                      <span className="font-medium text-foreground block">
                        {ord.shippingAddress.fullName}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {ord.shippingAddress.city}, {ord.shippingAddress.state}
                      </span>
                    </td>
                    <td className="py-3.5 text-muted-foreground">
                      {sellerLineItems.map((it) => it.title).join(", ") || `${sellerLineItems.length} items`}
                    </td>
                    <td className="py-3.5 font-bold text-foreground">
                      {formatPrice(sellerTotal || ord.total)}
                    </td>
                    <td className="py-3.5">
                      <Badge
                        variant={
                          ord.status === "DELIVERED"
                            ? "success"
                            : ord.status === "SHIPPED"
                            ? "info"
                            : ord.status === "CONFIRMED" || ord.status === "PROCESSING"
                            ? "warning"
                            : "secondary"
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
                      <Link href={`/seller/orders/${ord.id}`}>
                        <Button variant="ghost" size="sm" className="text-xs h-7 px-2 font-bold text-primary hover:text-primary/80">
                          Manage & Ship
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
