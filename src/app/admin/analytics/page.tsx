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
  Users,
  Store,
  Layers,
  Calendar,
  CheckCircle2,
  Package,
  ShieldCheck,
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
import { AnalyticsTimeframe, AdminAnalyticsData } from "@/services/analytics.service";

const CATEGORY_COLORS = ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EC4899", "#06B6D4"];

export default function AdminAnalyticsPage() {
  const [timeframe, setTimeframe] = useState<AnalyticsTimeframe>("LAST_30_DAYS");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const [data, setData] = useState<AdminAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    async function loadAdminAnalytics() {
      setLoading(true);
      try {
        let url = `/api/admin/analytics?timeframe=${timeframe}`;
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
        // Fallback
      }
      setLoading(false);
    }

    loadAdminAnalytics();
  }, [timeframe, customStart, customEnd]);

  const handleApplyCustomRange = (e: React.FormEvent) => {
    e.preventDefault();
    if (customStart && customEnd) {
      setTimeframe("CUSTOM");
      setShowCustomPicker(false);
    }
  };

  const categoryPieData = data
    ? data.categoryPerformance.map((c) => ({
        name: c.name,
        value: c.gmv,
        percent: c.percent,
      }))
    : [];

  return (
    <div className="space-y-8 pb-12">
      {/* Title & Timeframe Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Marketplace Macro Economics &amp; GMV Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Supervisory analytics: platform GMV trajectories, commission revenues, buyer growth, vendor performance, and department share
          </p>
        </div>

        {/* Timeframe Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
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
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {tf.label}
            </button>
          ))}

          <button
            onClick={() => setShowCustomPicker(!showCustomPicker)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1 ${
              timeframe === "CUSTOM" || showCustomPicker
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Calendar className="h-3 w-3" />
            <span>Custom</span>
          </button>
        </div>
      </div>

      {/* Custom Date Range Picker */}
      {showCustomPicker && (
        <form
          onSubmit={handleApplyCustomRange}
          className="p-4 rounded-2xl border border-blue-500/30 bg-slate-900/90 flex flex-wrap items-end gap-3 text-xs animate-in fade-in-0 duration-150 text-white"
        >
          <div>
            <label className="font-bold text-slate-300 block mb-1">Start Date</label>
            <input
              type="date"
              required
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="h-9 px-3 rounded-lg border border-slate-700 bg-slate-950 text-white"
            />
          </div>
          <div>
            <label className="font-bold text-slate-300 block mb-1">End Date</label>
            <input
              type="date"
              required
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="h-9 px-3 rounded-lg border border-slate-700 bg-slate-950 text-white"
            />
          </div>
          <Button type="submit" size="sm" className="h-9 font-bold bg-blue-600 hover:bg-blue-500 text-white">
            Apply Date Range
          </Button>
        </form>
      )}

      {/* 4 Macro KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Marketplace GMV */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Marketplace Revenue (GMV)</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-white font-mono block">
            {data ? formatPrice(data.metrics.marketplaceGMV) : "—"}
          </span>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold pt-1 border-t border-slate-800">
            <TrendingUp className="h-3 w-3" />
            <span>Platform checkout basket volume</span>
          </div>
        </div>

        {/* Marketplace Commission */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Platform Fee Commission (10%)</span>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-blue-400 font-mono block">
            {data ? formatPrice(data.metrics.marketplaceCommission) : "—"}
          </span>
          <span className="text-[11px] text-slate-400 block pt-1 border-t border-slate-800">
            Retained platform revenue
          </span>
        </div>

        {/* Total Transactions */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Transactions</span>
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-white font-mono block">
            {data ? data.metrics.totalTransactions : "—"}
          </span>
          <span className="text-[11px] text-slate-400 block pt-1 border-t border-slate-800">
            Average Basket: <strong className="text-white font-mono">{data ? formatPrice(data.metrics.averageTransactionValue) : "—"}</strong>
          </span>
        </div>

        {/* Customer Base */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Customer Ecosystem</span>
            <div className="h-8 w-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-white font-mono block">
            {data ? data.metrics.totalCustomersCount : "—"}
          </span>
          <span className="text-[11px] text-slate-400 block pt-1 border-t border-slate-800">
            Across {data?.metrics.activeVendorsCount || 4} verified vendors
          </span>
        </div>
      </div>

      {/* Row 1 Charts: GMV & Commission Dual Recharts Area Chart */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              Marketplace Gross Merchandise Value &amp; Commission Yield (INR)
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Dual-series progression showing daily GMV and 10% platform take rate
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-blue-400">
              <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              <span>Gross GMV</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span>Commission (10%)</span>
            </div>
          </div>
        </div>

        <div className="h-80 w-full pt-2">
          {isMounted && data && data.dailyGMVTrajectory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data.dailyGMVTrajectory}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gmvGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="commGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.8} />
                <XAxis dataKey="formattedDate" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    formatPrice(Number(val) || 0),
                    name === "gmv" ? "Marketplace GMV" : "Platform Commission",
                  ]}
                  contentStyle={{
                    backgroundColor: "#020617",
                    borderRadius: "12px",
                    border: "1px solid #1e293b",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="gmv"
                  stroke="#3B82F6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#gmvGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="commission"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#commGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <Skeleton className="h-full w-full rounded-xl bg-slate-800" />
          )}
        </div>
      </div>

      {/* Row 2: Customer Growth Recharts BarChart & Category Performance Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Growth Recharts Bar */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Users className="h-4 w-4 text-cyan-400" />
                Customer Ecosystem Acquisition &amp; Cumulative Growth
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                New buyer onboarding pace and total verified buyer population
              </p>
            </div>
            <Badge variant="outline" className="border-slate-700 text-slate-300 font-mono text-xs">
              Recharts Bar
            </Badge>
          </div>

          <div className="h-64 w-full pt-2">
            {isMounted && data && data.customerGrowth.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.customerGrowth}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.8} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} />
                  <Tooltip
                    formatter={(val: any, name: any) => [
                      `${val} buyers`,
                      name === "newCustomers" ? "New Registrations" : "Cumulative Buyers",
                    ]}
                    contentStyle={{
                      backgroundColor: "#020617",
                      borderRadius: "12px",
                      border: "1px solid #1e293b",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="newCustomers" fill="#06B6D4" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="cumulativeCustomers" fill="#3B82F6" radius={[6, 6, 0, 0]} opacity={0.4} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Skeleton className="h-full w-full rounded-xl bg-slate-800" />
            )}
          </div>
        </div>

        {/* Category Contribution Recharts Donut */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-purple-400" />
              Category GMV Share
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Marketplace volume split across departments
            </p>
          </div>

          <div className="h-56 w-full relative">
            {isMounted && categoryPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryPieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [formatPrice(Number(val) || 0), "GMV"]}
                    contentStyle={{
                      backgroundColor: "#020617",
                      borderRadius: "10px",
                      border: "1px solid #1e293b",
                      color: "#fff",
                      fontSize: "11px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Skeleton className="h-full w-full rounded-xl bg-slate-800" />
            )}
          </div>

          <div className="space-y-1.5 text-[11px] pt-2 border-t border-slate-800">
            {categoryPieData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                  <div
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                  />
                  <span className="text-slate-300 truncate">{item.name}</span>
                </div>
                <span className="font-mono text-white font-bold">{item.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Seller Performance & Product Performance Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Verified Merchants */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Store className="h-4 w-4 text-emerald-400" />
                Top Performing Merchants (GMV)
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Verified sellers ranked by sales volume and platform commission generated
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="py-2.5 px-3">Merchant Store</th>
                  <th className="py-2.5 px-3 text-right">Orders</th>
                  <th className="py-2.5 px-3 text-right">Gross GMV</th>
                  <th className="py-2.5 px-3 text-right">Take Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data?.sellerPerformance.map((s) => (
                  <tr key={s.storeId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-bold text-white block">{s.storeName}</span>
                      <span className="text-[10px] text-amber-400 font-semibold">★ {s.rating.toFixed(1)}</span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-300">
                      {s.ordersCount} orders
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-white">
                      {formatPrice(s.gmv)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-400 font-semibold">
                      +{formatPrice(s.commission)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Performing Marketplace Merchandise */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-400" />
                Top Marketplace Products
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Highest grossing products across all multi-vendor storefronts
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">Merchant</th>
                  <th className="py-2.5 px-3 text-right">Units</th>
                  <th className="py-2.5 px-3 text-right">Total GMV</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data?.productPerformance.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-semibold text-white max-w-[180px] truncate">
                      {p.title}
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px] truncate max-w-[120px]">
                      {p.sellerName}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-300">
                      {p.unitsSold}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-blue-400">
                      {formatPrice(p.gmv)}
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
