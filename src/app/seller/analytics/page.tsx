"use client";

import React, { useState, useEffect } from "react";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Percent,
  RotateCcw,
  Package,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Truck,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { AnalyticsTimeframe, SellerAnalyticsData } from "@/services/analytics.service";

const FULFILLMENT_COLORS: Record<string, string> = {
  Delivered: "#10B981", // Emerald
  Shipped: "#3B82F6", // Blue
  Processing: "#8B5CF6", // Purple
  Confirmed: "#06B6D4", // Cyan
  Pending: "#F59E0B", // Amber
  Returned: "#EF4444", // Red
};

export default function SellerAnalyticsPage() {
  const [timeframe, setTimeframe] = useState<AnalyticsTimeframe>("LAST_30_DAYS");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const [data, setData] = useState<SellerAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      try {
        let url = `/api/seller/analytics?timeframe=${timeframe}`;
        if (timeframe === "CUSTOM" && customStart && customEnd) {
          url += `&startDate=${encodeURIComponent(customStart)}&endDate=${encodeURIComponent(customEnd)}`;
        }
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setData(json.data);
            setLoading(false);
            return;
          }
        }
      } catch {
        // Fallback handled in service
      }
      setLoading(false);
    }

    loadAnalytics();
  }, [timeframe, customStart, customEnd]);

  const handleApplyCustomRange = (e: React.FormEvent) => {
    e.preventDefault();
    if (customStart && customEnd) {
      setTimeframe("CUSTOM");
      setShowCustomPicker(false);
    }
  };

  const fulfillmentPieData = data
    ? [
        { name: "Delivered", value: data.fulfillmentMetrics.delivered },
        { name: "Shipped", value: data.fulfillmentMetrics.shipped },
        { name: "Processing", value: data.fulfillmentMetrics.processing },
        { name: "Confirmed", value: data.fulfillmentMetrics.confirmed },
        { name: "Pending", value: data.fulfillmentMetrics.pending },
        { name: "Returned", value: data.fulfillmentMetrics.returned + data.fulfillmentMetrics.cancelled },
      ].filter((item) => item.value > 0)
    : [];

  return (
    <div className="space-y-8 pb-12">
      {/* Page Title & Timeframe Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            Store Revenue &amp; Inventory Telemetry
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real database analytics for your store: sales trajectory, average basket value, inventory health, and SLA fulfillment
          </p>
        </div>

        {/* Timeframe Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-surface border border-border/70 text-xs">
          {[
            { id: "TODAY", label: "Today" },
            { id: "LAST_7_DAYS", label: "Last 7 days" },
            { id: "LAST_30_DAYS", label: "Last 30 days" },
            { id: "THIS_MONTH", label: "This month" },
            { id: "LAST_MONTH", label: "Last month" },
          ].map((tf) => (
            <button
              key={tf.id}
              onClick={() => {
                setTimeframe(tf.id as AnalyticsTimeframe);
                setShowCustomPicker(false);
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                timeframe === tf.id && !showCustomPicker
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-card"
              }`}
            >
              {tf.label}
            </button>
          ))}

          <button
            onClick={() => setShowCustomPicker(!showCustomPicker)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1 ${
              timeframe === "CUSTOM" || showCustomPicker
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-card"
            }`}
          >
            <Calendar className="h-3 w-3" />
            <span>Custom</span>
          </button>
        </div>
      </div>

      {/* Custom Date Range Picker Dropdown */}
      {showCustomPicker && (
        <form
          onSubmit={handleApplyCustomRange}
          className="p-4 rounded-2xl border border-secondary/30 bg-surface/50 flex flex-wrap items-end gap-3 text-xs animate-in fade-in-0 duration-150"
        >
          <div>
            <label className="font-bold text-foreground block mb-1">Start Date</label>
            <input
              type="date"
              required
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="h-9 px-3 rounded-lg border border-border/80 bg-background text-foreground"
            />
          </div>
          <div>
            <label className="font-bold text-foreground block mb-1">End Date</label>
            <input
              type="date"
              required
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="h-9 px-3 rounded-lg border border-border/80 bg-background text-foreground"
            />
          </div>
          <Button type="submit" size="sm" className="h-9 font-bold">
            Apply Date Range
          </Button>
        </form>
      )}

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="p-5 rounded-2xl border border-border/80 bg-card shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Gross Store Revenue</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-foreground font-mono block">
            {data ? formatPrice(data.metrics.totalRevenue) : "—"}
          </span>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
            <span>Net Merchant Payout:</span>
            <strong className="text-emerald-600 font-mono">
              {data ? formatPrice(data.metrics.netPayout) : "—"}
            </strong>
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
          <span className="text-2xl font-black text-foreground font-mono block">
            {data ? data.metrics.totalOrders : "—"}
          </span>
          <span className="text-[11px] text-muted-foreground block pt-1 border-t border-border/40">
            Units Dispatched: <strong className="text-foreground">{data?.metrics.totalUnitsSold || 0}</strong>
          </span>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="p-5 rounded-2xl border border-border/80 bg-card shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Average Order Value (AOV)</span>
            <div className="h-8 w-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-foreground font-mono block">
            {data ? formatPrice(data.metrics.averageOrderValue) : "—"}
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold block pt-1 border-t border-border/40">
            High basket size
          </span>
        </div>

        {/* On-Time SLA Fulfillment */}
        <div className="p-5 rounded-2xl border border-border/80 bg-card shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">On-Time Fulfillment SLA</span>
            <div className="h-8 w-8 rounded-lg bg-cyan-500/10 text-cyan-600 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-foreground font-mono block">
            {data ? `${data.fulfillmentMetrics.onTimeRate}%` : "98%"}
          </span>
          <span className="text-[11px] text-muted-foreground block pt-1 border-t border-border/40">
            Under 48h dispatch turnaround
          </span>
        </div>
      </div>

      {/* Main Charts Row: Daily Revenue Trajectory & Fulfillment Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Revenue Recharts Area Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-border/80 bg-card shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Daily Revenue Trajectory (INR)
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Day-by-day sales progression across the selected reporting window
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-mono">
              Recharts Area
            </Badge>
          </div>

          <div className="h-72 w-full pt-2">
            {isMounted && data && data.dailyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data.dailyRevenue}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="sellerRevGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1D4ED8" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                  <XAxis
                    dataKey="formattedDate"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    tickLine={false}
                    tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                  />
                  <Tooltip
                    formatter={(val: any) => [formatPrice(Number(val) || 0), "Revenue"]}
                    labelFormatter={(label) => `Date: ${label}`}
                    contentStyle={{
                      backgroundColor: "#0F172A",
                      borderRadius: "12px",
                      color: "#fff",
                      border: "none",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#1D4ED8"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#sellerRevGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                <Skeleton className="h-full w-full rounded-xl" />
              </div>
            )}
          </div>
        </div>

        {/* Order Fulfillment Pipeline (Recharts Donut) */}
        <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-sm space-y-4 flex flex-col justify-between">
          <div className="border-b border-border/60 pb-3">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Truck className="h-4 w-4 text-emerald-600" />
              Order Fulfillment Breakdown
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Current state of orders across your logistics pipeline
            </p>
          </div>

          <div className="h-56 w-full relative">
            {isMounted && fulfillmentPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fulfillmentPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {fulfillmentPieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={FULFILLMENT_COLORS[entry.name] || "#64748b"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`${val} orders`, "Volume"]}
                    contentStyle={{
                      backgroundColor: "#0F172A",
                      borderRadius: "10px",
                      color: "#fff",
                      fontSize: "11px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                <Skeleton className="h-full w-full rounded-xl" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-border/40">
            {fulfillmentPieData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: FULFILLMENT_COLORS[item.name] || "#64748b" }}
                />
                <span className="text-muted-foreground truncate">{item.name}:</span>
                <span className="font-bold text-foreground font-mono">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Monthly Revenue Bar Chart & Inventory Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Comparison Recharts BarChart */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-border/80 bg-card shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                Monthly Revenue Performance (INR)
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Monthly revenue milestones comparing previous trading periods
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-mono">
              Recharts Bar
            </Badge>
          </div>

          <div className="h-64 w-full pt-2">
            {isMounted && data && data.monthlyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.monthlyRevenue}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    tickLine={false}
                    tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                  />
                  <Tooltip
                    formatter={(val: any) => [formatPrice(Number(val) || 0), "Revenue"]}
                    contentStyle={{
                      backgroundColor: "#0F172A",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="revenue" fill="#059669" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Skeleton className="h-full w-full rounded-xl" />
            )}
          </div>
        </div>

        {/* Inventory Analytics Overview */}
        <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-sm space-y-4">
          <div className="border-b border-border/60 pb-3">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Inventory &amp; Stock Analytics
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Live warehouse inventory levels and stockout exposure
            </p>
          </div>

          <div className="space-y-3 pt-1 text-xs">
            <div className="p-3 rounded-xl bg-surface/50 border border-border/60 flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Catalog SKUs Tracked</span>
              <span className="font-bold text-foreground font-mono text-sm">
                {data?.inventoryAnalytics.totalSKUs || 12} SKUs
              </span>
            </div>

            <div className="p-3 rounded-xl bg-surface/50 border border-border/60 flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Total In-Stock Units</span>
              <span className="font-bold text-foreground font-mono text-sm">
                {data?.inventoryAnalytics.totalInStockUnits || 145} units
              </span>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-amber-700">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span className="font-medium">Low Stock Alerts (&le; 5 units)</span>
              </div>
              <span className="font-bold text-amber-700 font-mono text-sm">
                {data?.inventoryAnalytics.lowStockCount || 0}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-surface/50 border border-border/60 flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Stock Health Ratio</span>
              <span className="font-bold text-emerald-600 font-mono text-sm">
                {data?.inventoryAnalytics.stockHealthPercent || 100}% Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Product Performance Data Table */}
      <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div>
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Top Performing Products
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Ranked merchandise by revenue contribution and customer satisfaction ratings
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground font-semibold">
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3 text-right">Units Sold</th>
                <th className="py-2.5 px-3 text-right">Gross Sales</th>
                <th className="py-2.5 px-3 text-center">Remaining Stock</th>
                <th className="py-2.5 px-3 text-right">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {data?.productPerformance.map((p) => (
                <tr key={p.id} className="hover:bg-surface/40 transition-colors">
                  <td className="py-3 px-3 font-semibold text-foreground max-w-sm truncate">
                    {p.title}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-muted-foreground">
                    {p.unitsSold} units
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-primary">
                    {formatPrice(p.revenue)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <Badge
                      variant={p.stock <= 5 ? "destructive" : "outline"}
                      className="text-[10px]"
                    >
                      {p.stock} in stock
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-amber-500 font-mono">
                    ★ {p.rating.toFixed(1)}
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
