"use client";

import React, { useState, useEffect } from "react";
import { formatPrice } from "@/lib/utils";
import { adminService } from "@/services/admin.service";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Store,
  Layers,
  MapPin,
  Percent,
} from "lucide-react";

const REGIONAL_MARKETPLACE_DATA = [
  { region: "Bengaluru Metros (KA)", gmv: 342000, share: 36 },
  { region: "Mumbai & Pune (MH)", gmv: 238000, share: 25 },
  { region: "Delhi NCR (DL, HR, UP)", gmv: 184000, share: 19 },
  { region: "Hyderabad (TS)", gmv: 105000, share: 11 },
  { region: "Chennai (TN)", gmv: 81000, share: 9 },
];

const CATEGORY_SHARE_DATA = [
  { name: "Electronics & Computing", gmv: 420000, share: 44, color: "bg-blue-500" },
  { name: "Home & Furniture", gmv: 260000, share: 28, color: "bg-indigo-500" },
  { name: "Fashion & Lifestyle", gmv: 160000, share: 17, color: "bg-purple-500" },
  { name: "Health & Personal Care", gmv: 110000, share: 11, color: "bg-emerald-500" },
];

export default function AdminAnalyticsPage() {
  const [metrics, setMetrics] = useState<{
    totalGMV: number;
    platformCommissions: number;
    totalCustomers: number;
    totalSellers: number;
  } | null>(null);

  useEffect(() => {
    async function load() {
      const data = await adminService.getPlatformMetrics();
      setMetrics(data);
    }
    load();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Platform-Wide Macro Analytics & GMV Trajectory
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Ecosystem economics, multi-vendor commission yields, regional order density, and category performance
        </p>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Cumulative Marketplace GMV</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-white font-mono block">
            {metrics ? formatPrice(metrics.totalGMV) : "₹14,50,000"}
          </span>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
            <TrendingUp className="h-3 w-3" />
            <span>+28.4% YoY acceleration</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Platform Fee Revenues</span>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-blue-400 font-mono block">
            {metrics ? formatPrice(metrics.platformCommissions) : "₹1,45,000"}
          </span>
          <span className="text-[11px] text-slate-400 block">
            Automated net take rate
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Average Order Value (AOV)</span>
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-white font-mono block">
            ₹8,650
          </span>
          <span className="text-[11px] text-emerald-400 font-semibold block">
            Multi-vendor bundle uplift
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Customer Repeat Rate</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-white font-mono block">
            34.2%
          </span>
          <span className="text-[11px] text-slate-400 block">
            Buyers purchasing &gt; 1 merchant
          </span>
        </div>
      </div>

      {/* Regional & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional Volume */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-400" />
                Regional GMV Geographical Distribution
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Order concentration across Indian metropolitan delivery zones
              </p>
            </div>
            <Badge variant="outline" className="border-slate-700 text-slate-300">
              Pan-India
            </Badge>
          </div>

          <div className="space-y-4 pt-1">
            {REGIONAL_MARKETPLACE_DATA.map((reg) => (
              <div key={reg.region} className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">{reg.region}</span>
                  <span className="font-mono text-slate-400">
                    {formatPrice(reg.gmv)} ({reg.share}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    style={{ width: `${reg.share}%` }}
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Contribution */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-emerald-400" />
                Department Contribution & Category Share
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Marketplace revenue distribution across active verticals
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-1">
            {CATEGORY_SHARE_DATA.map((cat) => (
              <div key={cat.name} className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">{cat.name}</span>
                  <span className="font-mono text-slate-400">
                    {formatPrice(cat.gmv)} ({cat.share}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    style={{ width: `${cat.share}%` }}
                    className={`h-full ${cat.color} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
