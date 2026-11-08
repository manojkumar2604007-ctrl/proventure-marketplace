"use client";

import React from "react";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Percent,
  RotateCcw,
  Users,
  MapPin,
  ArrowUpRight,
} from "lucide-react";

const REGIONAL_SALES = [
  { city: "Bengaluru, Karnataka", percent: 38, revenue: 198000 },
  { city: "Mumbai, Maharashtra", percent: 24, revenue: 125000 },
  { city: "Delhi NCR", percent: 18, revenue: 94000 },
  { city: "Hyderabad, Telangana", percent: 11, revenue: 57000 },
  { city: "Chennai, Tamil Nadu", percent: 9, revenue: 46800 },
];

const CATEGORY_CONTRIBUTION = [
  { category: "Desktop Audio & Acoustic Studio", share: 44, amount: 229000 },
  { category: "Ergonomic Mounts & Risers", share: 31, amount: 161000 },
  { category: "Mechanical Keyboards & Peripherals", share: 25, amount: 130800 },
];

export default function SellerAnalyticsPage() {
  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">
          Merchant Performance & Store Analytics
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Deep-dive telemetry into revenue trajectories, average order values, and geographical demand
        </p>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-border/80 bg-card shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Average Order Value (AOV)</span>
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-foreground block">
            {formatPrice(7450)}
          </span>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
            <TrendingUp className="h-3 w-3" />
            <span>+12.8% vs last month</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border/80 bg-card shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Conversion Rate</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-foreground block">
            3.82%
          </span>
          <span className="text-[11px] text-muted-foreground block">
            Top 5% across computing niche
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-border/80 bg-card shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Repeat Buyer Ratio</span>
            <div className="h-8 w-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-foreground block">
            28.4%
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold block">
            High brand stickiness
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-border/80 bg-card shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Return Rate</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <RotateCcw className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-foreground block">
            0.85%
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold block">
            Under 1% threshold
          </span>
        </div>
      </div>

      {/* Regional Demand and Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional Dispatch */}
        <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Geographic Demand Distribution
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Top cities contributing to store sales in India
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-mono">
              Pan-India
            </Badge>
          </div>

          <div className="space-y-4 pt-1">
            {REGIONAL_SALES.map((reg) => (
              <div key={reg.city} className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-foreground">{reg.city}</span>
                  <span className="font-mono text-muted-foreground">
                    {formatPrice(reg.revenue)} ({reg.percent}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-surface rounded-full overflow-hidden border border-border/40">
                  <div
                    style={{ width: `${reg.percent}%` }}
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Contribution */}
        <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-emerald-600" />
                Catalog Revenue Attribution
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Sales generated across your active product lines
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-1">
            {CATEGORY_CONTRIBUTION.map((cat) => (
              <div key={cat.category} className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-foreground">{cat.category}</span>
                  <span className="font-mono text-muted-foreground">
                    {formatPrice(cat.amount)} ({cat.share}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-surface rounded-full overflow-hidden border border-border/40">
                  <div
                    style={{ width: `${cat.share}%` }}
                    className="h-full bg-emerald-500 rounded-full"
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
