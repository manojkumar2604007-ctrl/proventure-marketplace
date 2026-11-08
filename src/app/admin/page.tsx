import React from "react";
import Link from "next/link";
import Image from "next/image";
import { vendorService } from "@/services/vendor.service";
import { orderService } from "@/services/order.service";
import { productService } from "@/services/product.service";
import { adminService } from "@/services/admin.service";
import { formatPrice, formatDate } from "@/lib/utils";
import {
  TrendingUp,
  DollarSign,
  Users,
  ShoppingBag,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
  Percent,
  Package,
  Store,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Platform-wide multi-month revenue trend
const PLATFORM_REVENUE_CHART = [
  { month: "Jan", gmv: 340000, commission: 34000, height: "45%" },
  { month: "Feb", gmv: 420000, commission: 42000, height: "55%" },
  { month: "Mar", gmv: 490000, commission: 49000, height: "65%" },
  { month: "Apr", gmv: 460000, commission: 46000, height: "60%" },
  { month: "May", gmv: 580000, commission: 58000, height: "78%" },
  { month: "Jun", gmv: 710000, commission: 71000, height: "92%" },
  { month: "Jul", gmv: 820000, commission: 82000, height: "100%" },
];

export default async function AdminDashboardPage() {
  const [vendors, orders, { products }, users] = await Promise.all([
    vendorService.getAllVendors(),
    orderService.getAllOrders(),
    productService.getProducts({ limit: 100 }),
    adminService.getUsers(),
  ]);

  const totalGMV = vendors.reduce((sum, v) => sum + v.totalSales, 0);
  const platformCommissions = Math.round(totalGMV * 0.1);
  const activeVendors = vendors.filter((v) => v.status === "APPROVED");
  const pendingVendors = vendors.filter((v) => v.status === "PENDING");
  const customers = users.filter((u) => u.role === "CUSTOMER");
  const pendingOrders = orders.filter(
    (o) => o.status === "PENDING" || o.status === "PROCESSING" || o.status === "CONFIRMED"
  );

  // Top-selling products
  const topProducts = products.slice(0, 4).map((p, idx) => ({
    ...p,
    salesCount: 84 - idx * 16,
    grossEarned: (84 - idx * 16) * p.price,
  }));

  // Top-performing sellers
  const topSellers = [...vendors]
    .sort((a, b) => b.totalSales - a.totalSales)
    .slice(0, 4);

  return (
    <div className="space-y-8 pb-12">
      {/* Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0A192F] via-slate-900 to-indigo-950 p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">
              Global Platform Command
            </span>
            <span className="text-xs text-slate-400">Environment: Production (Neon DB)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Marketplace Executive Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Macro oversight of GMV liquidity, merchant compliance, catalog taxonomy, and order settlement pipelines.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Link href="/admin/vendors">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold gap-1.5 shadow-md">
              <Store className="h-3.5 w-3.5" />
              <span>Review Merchants ({pendingVendors.length})</span>
            </Button>
          </Link>
          <Link href="/admin/orders">
            <Button size="sm" variant="outline" className="border-slate-700 bg-slate-900 text-slate-200 hover:text-white hover:bg-slate-800 rounded-xl text-xs font-bold gap-1.5">
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Inspect Orders</span>
            </Button>
          </Link>
        </div>

        {/* Decorative backdrop glow */}
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 6 Top-Level KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total GMV */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Platform GMV</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-white block">
            {formatPrice(totalGMV)}
          </span>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
            <TrendingUp className="h-3 w-3" />
            <span>+24.8% YoY</span>
          </div>
        </div>

        {/* Platform Commission Fee */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Platform Fees</span>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-blue-400 block">
            {formatPrice(platformCommissions)}
          </span>
          <span className="text-[11px] text-slate-400 block">
            Standard 10% take rate
          </span>
        </div>

        {/* Total Customers */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Buyers</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-white block">
            {customers.length || 4}
          </span>
          <span className="text-[11px] text-slate-400 block">
            Across 6 Indian metros
          </span>
        </div>

        {/* Total Sellers */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Merchants</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Store className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-white block">
            {activeVendors.length} Verified
          </span>
          <span className={`text-[11px] font-semibold block ${pendingVendors.length > 0 ? "text-amber-400" : "text-slate-400"}`}>
            {pendingVendors.length} pending approval
          </span>
        </div>

        {/* Total Products */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Products</span>
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-white block">
            {products.length}
          </span>
          <span className="text-[11px] text-slate-400 block">
            Live catalog listings
          </span>
        </div>

        {/* Total Orders */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Orders</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-white block">
            {orders.length}
          </span>
          <span className="text-[11px] text-amber-400 font-semibold block">
            {pendingOrders.length} pending dispatch
          </span>
        </div>
      </div>

      {/* Mid Section: Platform Revenue Chart & Top Performing Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trajectory Chart (2 cols) */}
        <div className="lg:col-span-2 border border-slate-800 rounded-2xl bg-slate-900/80 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-base text-white">Gross Marketplace Revenue (GMV)</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Aggregate trading volume and platform fee deductions
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full">
                ₹8.2L Peak Monthly GMV
              </span>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-64 flex items-end gap-4 sm:gap-8 pt-6 pb-2 px-2 border-b border-slate-800">
            {PLATFORM_REVENUE_CHART.map((point) => (
              <div key={point.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="relative w-full flex items-end justify-center h-full">
                  <div
                    style={{ height: point.height }}
                    className="w-full max-w-[40px] bg-gradient-to-t from-blue-700 via-indigo-600 to-indigo-400 rounded-t-lg transition-all duration-300 group-hover:brightness-125 shadow-lg relative"
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-slate-900 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-lg pointer-events-none whitespace-nowrap z-20">
                      ₹{(point.gmv / 1000).toFixed(0)}k
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-slate-400 group-hover:text-white transition-colors">
                  {point.month}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 gap-4">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-indigo-500" />
                <span>Gross Merchant Volume</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-blue-400" />
                <span>Retained Platform Fees (10%)</span>
              </span>
            </div>
            <Link href="/admin/analytics" className="text-blue-400 font-semibold hover:underline flex items-center gap-1">
              <span>View Deep Telemetry</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Top-Performing Sellers (1 col) */}
        <div className="border border-slate-800 rounded-2xl bg-slate-900/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-base text-white">Top Merchants</h3>
              <p className="text-xs text-slate-400 mt-0.5">Ranked by verified total sales</p>
            </div>
            <Link href="/admin/vendors">
              <Button variant="ghost" size="sm" className="text-xs text-slate-400 hover:text-white h-7 px-2">
                All Sellers
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            {topSellers.map((v, idx) => (
              <div key={v.id} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden relative shrink-0">
                  <Image src={v.logo || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200"} alt={v.storeName} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-white truncate">{v.storeName}</span>
                    {v.status === "APPROVED" && (
                      <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                    )}
                  </div>
                  <span className="text-[11px] text-emerald-400 font-semibold block font-mono">
                    {formatPrice(v.totalSales)} GMV
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-500 font-mono">#{idx + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top-Selling Products & Recent Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top-Selling Products (1 col) */}
        <div className="border border-slate-800 rounded-2xl bg-slate-900/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-base text-white">Top Catalog Items</h3>
              <p className="text-xs text-slate-400 mt-0.5">Leading products across marketplace</p>
            </div>
            <Link href="/admin/products">
              <Button variant="ghost" size="sm" className="text-xs text-slate-400 hover:text-white h-7 px-2">
                Catalog
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            {topProducts.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden relative shrink-0">
                  <Image src={p.images[0]?.url || "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=200"} alt={p.title} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs text-white truncate">{p.title}</p>
                  <p className="text-[11px] text-slate-400">
                    {p.salesCount} units • <strong className="text-emerald-400">{formatPrice(p.grossEarned)}</strong>
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{p.stock} left</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions Table (2 cols) */}
        <div className="lg:col-span-2 border border-slate-800 rounded-2xl bg-slate-900/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-base text-white">Recent Marketplace Transactions</h3>
              <p className="text-xs text-slate-400 mt-0.5">Live order captures, commissions, and fulfillment states</p>
            </div>
            <Link href="/admin/orders">
              <Button variant="outline" size="sm" className="text-xs border-slate-700 bg-slate-900 text-slate-200 hover:text-white hover:bg-slate-800 gap-1">
                <span>All Orders</span>
                <ArrowUpRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                  <th className="pb-3">Order #</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Gross Total</th>
                  <th className="pb-3">Fee (10%)</th>
                  <th className="pb-3">Payment</th>
                  <th className="pb-3">Order Status</th>
                  <th className="pb-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {orders.slice(0, 5).map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 font-mono font-bold text-blue-400">
                      <Link href={`/admin/orders/${ord.id}`} className="hover:underline">
                        {ord.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3 text-white font-medium">
                      {ord.shippingAddress.fullName}
                    </td>
                    <td className="py-3 font-mono font-bold text-white">
                      {formatPrice(ord.total)}
                    </td>
                    <td className="py-3 font-mono text-emerald-400">
                      {formatPrice(ord.total * 0.1)}
                    </td>
                    <td className="py-3">
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3">
                      <Badge
                        variant={
                          ord.status === "DELIVERED"
                            ? "success"
                            : ord.status === "SHIPPED"
                            ? "info"
                            : ord.status === "CANCELLED"
                            ? "destructive"
                            : "warning"
                        }
                        className="text-[10px]"
                      >
                        {ord.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-right text-slate-400 font-mono text-[11px]">
                      {formatDate(ord.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
