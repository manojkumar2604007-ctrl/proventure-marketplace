"use client";

import React, { useState, useEffect } from "react";
import { vendorService } from "@/services/vendor.service";
import { SellerProfile, SellerStatus } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUIStore } from "@/store/ui-store";
import { ShieldCheck, Check, X, Ban, Percent, Star } from "lucide-react";

export default function AdminVendorsPage() {
  const { addToast } = useUIStore();
  const [vendors, setVendors] = useState<SellerProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await vendorService.getAllVendors();
      setVendors(data);
      setLoading(false);
    }
    load();
  }, []);

  const handleUpdateStatus = async (sellerId: string, status: SellerStatus) => {
    const updated = await vendorService.updateVendorStatus(sellerId, status);
    if (updated) {
      setVendors(vendors.map((v) => (v.id === sellerId ? updated : v)));
      addToast({
        title: "Vendor Status Updated",
        description: `Store status set to ${status}.`,
        type: "success",
      });
    }
  };

  const handleUpdateCommission = async (sellerId: string) => {
    const newRateStr = prompt("Enter new commission rate (%) for this merchant:", "10");
    if (newRateStr && !isNaN(parseFloat(newRateStr))) {
      const rate = parseFloat(newRateStr);
      const updated = await vendorService.updateCommissionRate(sellerId, rate);
      if (updated) {
        setVendors(vendors.map((v) => (v.id === sellerId ? updated : v)));
        addToast({
          title: "Commission Rate Adjusted",
          description: `Rate set to ${rate}%.`,
          type: "success",
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Vendor & Merchant Management
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Approve onboarding applications, monitor seller ratings, and set custom commission rates
        </p>
      </div>

      <div className="border border-slate-800 rounded-2xl bg-slate-900/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3.5 px-4">Merchant Store</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Performance</th>
                <th className="py-3.5 px-4">Commission</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {vendors.map((v) => (
                <tr key={v.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div>
                      <span className="font-bold text-white block text-sm">
                        {v.storeName}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {v.email} • {v.phone}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-300">
                    {v.city}, {v.state}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="h-3 w-3 fill-current" />
                        <span>{v.rating.toFixed(1)}</span>
                        <span className="text-slate-400 font-normal">
                          ({v.reviewCount})
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        Lifetime GMV: {formatPrice(v.totalSales)}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleUpdateCommission(v.id)}
                      className="inline-flex items-center gap-1 font-mono font-bold text-indigo-400 hover:underline"
                      title="Click to edit commission"
                    >
                      <Percent className="h-3 w-3" />
                      <span>{v.commissionRate}%</span>
                    </button>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        v.status === "APPROVED"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : v.status === "PENDING"
                          ? "bg-amber-950 text-amber-400 border border-amber-800"
                          : "bg-rose-950 text-rose-400 border border-rose-800"
                      }`}
                    >
                      {v.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {v.status === "PENDING" && (
                        <Button
                          onClick={() => handleUpdateStatus(v.id, "APPROVED")}
                          size="sm"
                          className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg gap-1"
                        >
                          <Check className="h-3 w-3" />
                          <span>Approve</span>
                        </Button>
                      )}

                      {v.status === "APPROVED" && (
                        <Button
                          onClick={() => handleUpdateStatus(v.id, "SUSPENDED")}
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs border-slate-700 bg-slate-800 text-rose-400 hover:bg-rose-950/40 rounded-lg gap-1"
                        >
                          <Ban className="h-3 w-3" />
                          <span>Suspend</span>
                        </Button>
                      )}

                      {v.status === "SUSPENDED" && (
                        <Button
                          onClick={() => handleUpdateStatus(v.id, "APPROVED")}
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs border-slate-700 bg-slate-800 text-emerald-400 hover:bg-emerald-950/40 rounded-lg gap-1"
                        >
                          <Check className="h-3 w-3" />
                          <span>Reactivate</span>
                        </Button>
                      )}
                    </div>
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
