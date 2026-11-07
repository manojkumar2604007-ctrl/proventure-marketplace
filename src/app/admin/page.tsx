import React from "react";
import Link from "next/link";
import { vendorService } from "@/services/vendor.service";
import { orderService } from "@/services/order.service";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function AdminDashboardPage() {
  const [vendors, orders] = await Promise.all([
    vendorService.getAllVendors(),
    orderService.getAllOrders(),
  ]);

  const totalGMV = vendors.reduce((sum, v) => sum + v.totalSales, 0);
  const platformCommissions = Math.round(totalGMV * 0.1);
  const activeVendors = vendors.filter((v) => v.status === "APPROVED");
  const pendingVendors = vendors.filter((v) => v.status === "PENDING");

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Marketplace Executive Overview
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Macro platform telemetry, multi-vendor GMV, commission liquidity, and merchant approvals
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/vendors">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold">
              Manage Vendors
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Platform GMV</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-white block">
            {formatPrice(totalGMV)}
          </span>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
            <TrendingUp className="h-3 w-3" />
            <span>+24.8% growth trajectory</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Platform Fee Revenue (10%)</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-white block">
            {formatPrice(platformCommissions)}
          </span>
          <span className="text-[11px] text-slate-400">
            Net collected from merchant orders
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Merchant Ecosystem</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-white block">
            {activeVendors.length} Verified
          </span>
          <span className="text-[11px] text-amber-400 font-semibold">
            {pendingVendors.length} awaiting KYC approval
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Platform Orders</span>
            <div className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-white block">
            {orders.length}
          </span>
          <span className="text-[11px] text-emerald-400 font-semibold">
            100% Razorpay settlement rate
          </span>
        </div>
      </div>

      {/* Pending Vendor Approvals Callout */}
      {pendingVendors.length > 0 && (
        <div className="p-5 rounded-2xl border border-amber-800/60 bg-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-amber-200">
                Action Required: {pendingVendors.length} New Merchant Application
              </h3>
              <p className="text-xs text-amber-300/80 mt-0.5">
                {pendingVendors[0].storeName} has applied to list products. Review their business documents.
              </p>
            </div>
          </div>

          <Link href="/admin/vendors">
            <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl">
              Review Application
            </Button>
          </Link>
        </div>
      )}

      {/* Recent Orders Overview */}
      <div className="border border-slate-800 rounded-2xl bg-slate-900/60 overflow-hidden shadow-sm space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="font-bold text-base text-white">Platform Transactions</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live order stream across all independent vendors
            </p>
          </div>
          <Link href="/admin/orders">
            <Button
              variant="outline"
              size="sm"
              className="text-xs gap-1 bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
            >
              All Orders <ArrowUpRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <th className="pb-3">Order Number</th>
                <th className="pb-3">Buyer</th>
                <th className="pb-3">Vendors Involved</th>
                <th className="pb-3">Gross Total</th>
                <th className="pb-3">Platform Cut (10%)</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {orders.map((ord) => {
                const vendorCount = new Set(ord.items.map((i) => i.sellerId)).size;
                const platformFee = Math.round(ord.total * 0.1);

                return (
                  <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 font-mono font-bold text-indigo-400">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3.5 font-medium text-slate-200">
                      {ord.customer?.name || ord.shippingAddress.fullName}
                    </td>
                    <td className="py-3.5 text-slate-400">
                      {vendorCount} {vendorCount === 1 ? "merchant" : "merchants"}
                    </td>
                    <td className="py-3.5 font-bold text-white">
                      {formatPrice(ord.total)}
                    </td>
                    <td className="py-3.5 font-bold text-emerald-400">
                      +{formatPrice(platformFee)}
                    </td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-400 text-right">
                      {formatDate(ord.createdAt)}
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
