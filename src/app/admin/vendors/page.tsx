"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { vendorService } from "@/services/vendor.service";
import { adminService } from "@/services/admin.service";
import { SellerProfile, SellerStatus } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useUIStore } from "@/store/ui-store";
import {
  ShieldCheck,
  Check,
  X,
  Ban,
  Percent,
  Star,
  Search,
  Filter,
  Package,
  ShoppingBag,
  ExternalLink,
  Store,
} from "lucide-react";

export default function AdminVendorsPage() {
  const { addToast } = useUIStore();
  const [vendors, setVendors] = useState<SellerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Commission Modal State
  const [commissionTarget, setCommissionTarget] = useState<SellerProfile | null>(null);
  const [commissionInput, setCommissionInput] = useState("10");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await vendorService.getAllVendors();
      setVendors(data);
      setLoading(false);
    }
    load();
  }, []);

  const handleUpdateStatus = async (sellerId: string, status: SellerStatus, storeName: string) => {
    const updated = await vendorService.updateVendorStatus(sellerId, status);
    if (updated) {
      setVendors(vendors.map((v) => (v.id === sellerId ? updated : v)));

      adminService.recordAuditLog({
        adminName: "Alex Vane (Super Admin)",
        action: `VENDOR_${status}`,
        entityType: "SellerProfile",
        entityId: sellerId,
        details: `Merchant "${storeName}" status was updated to ${status}.`,
      });

      addToast({
        title: "Vendor Status Updated",
        description: `"${storeName}" status set to ${status}.`,
        type: status === "APPROVED" ? "success" : "default",
      });
    }
  };

  const handleSaveCommission = async () => {
    if (!commissionTarget) return;
    const rate = parseFloat(commissionInput);
    if (isNaN(rate) || rate < 0 || rate > 50) {
      addToast({
        title: "Invalid Commission Rate",
        description: "Commission rate must be between 0% and 50%.",
        type: "error",
      });
      return;
    }

    const updated = await vendorService.updateCommissionRate(commissionTarget.id, rate);
    if (updated) {
      setVendors(vendors.map((v) => (v.id === commissionTarget.id ? updated : v)));

      adminService.recordAuditLog({
        adminName: "Alex Vane (Super Admin)",
        action: "COMMISSION_UPDATED",
        entityType: "Store",
        entityId: commissionTarget.id,
        details: `Updated platform take rate for "${commissionTarget.storeName}" to ${rate}%.`,
      });

      addToast({
        title: "Commission Rate Adjusted",
        description: `Take rate for "${commissionTarget.storeName}" is now ${rate}%.`,
        type: "success",
      });
    }

    setCommissionTarget(null);
  };

  const filtered = vendors.filter((v) => {
    if (statusFilter !== "ALL" && v.status !== statusFilter) return false;
    if (
      search &&
      !v.storeName.toLowerCase().includes(search.toLowerCase()) &&
      !v.email?.toLowerCase().includes(search.toLowerCase()) &&
      !v.city?.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Vendor & Merchant Ecosystem
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Approve merchant onboarding applications, monitor aggregate GMV, and calibrate store commissions
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-sm">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search merchants by store name, email, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs pb-1 sm:pb-0">
          <span className="text-slate-400 text-xs font-medium mr-1">Status:</span>
          {["ALL", "PENDING", "APPROVED", "SUSPENDED", "REJECTED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Vendors Table */}
      <div className="border border-slate-800 rounded-2xl bg-slate-900/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3.5 px-4">Merchant Store</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Performance GMV</th>
                <th className="py-3.5 px-4">Take Rate</th>
                <th className="py-3.5 px-4">KYC Status</th>
                <th className="py-3.5 px-4">Catalog / Orders</th>
                <th className="py-3.5 px-4 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((v) => (
                <tr key={v.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden relative shrink-0">
                        <Image src={v.logo || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200"} alt={v.storeName} fill className="object-cover" />
                      </div>
                      <div className="min-w-0 max-w-xs">
                        <Link href={`/stores/${v.slug}`} target="_blank" className="font-bold text-white hover:text-blue-400 transition-colors block truncate text-sm">
                          {v.storeName}
                        </Link>
                        <span className="text-[11px] text-slate-400 truncate block">
                          {v.email} • {v.phone}
                        </span>
                      </div>
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
                        <span className="text-slate-500 font-normal">
                          ({v.reviewCount})
                        </span>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-emerald-400 block">
                        {formatPrice(v.totalSales)}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => {
                        setCommissionTarget(v);
                        setCommissionInput(v.commissionRate.toString());
                      }}
                      className="inline-flex items-center gap-1 font-mono font-bold text-blue-400 hover:underline"
                      title="Click to adjust commission rate"
                    >
                      <Percent className="h-3 w-3" />
                      <span>{v.commissionRate}%</span>
                    </button>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        v.status === "APPROVED"
                          ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800"
                          : v.status === "PENDING"
                          ? "bg-amber-950/80 text-amber-400 border border-amber-800"
                          : "bg-rose-950/80 text-rose-400 border border-rose-800"
                      }`}
                    >
                      {v.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/products?seller=${v.slug}`}>
                        <Button variant="ghost" size="sm" className="text-xs h-7 px-2 text-slate-300 hover:text-white hover:bg-slate-800 gap-1">
                          <Package className="h-3 w-3" />
                          <span>Products</span>
                        </Button>
                      </Link>
                      <Link href={`/admin/orders?seller=${v.slug}`}>
                        <Button variant="ghost" size="sm" className="text-xs h-7 px-2 text-slate-300 hover:text-white hover:bg-slate-800 gap-1">
                          <ShoppingBag className="h-3 w-3" />
                          <span>Orders</span>
                        </Button>
                      </Link>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {v.status === "PENDING" && (
                        <>
                          <Button
                            onClick={() => handleUpdateStatus(v.id, "APPROVED", v.storeName)}
                            size="sm"
                            className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg gap-1 font-bold"
                          >
                            <Check className="h-3 w-3" />
                            <span>Approve</span>
                          </Button>
                          <Button
                            onClick={() => handleUpdateStatus(v.id, "REJECTED", v.storeName)}
                            variant="destructive"
                            size="sm"
                            className="h-7 text-xs rounded-lg gap-1 font-bold"
                          >
                            <X className="h-3 w-3" />
                            <span>Reject</span>
                          </Button>
                        </>
                      )}

                      {v.status === "APPROVED" && (
                        <Button
                          onClick={() => handleUpdateStatus(v.id, "SUSPENDED", v.storeName)}
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs border-slate-700 bg-slate-800 text-rose-400 hover:bg-rose-950/40 rounded-lg gap-1 font-bold"
                        >
                          <Ban className="h-3 w-3" />
                          <span>Suspend</span>
                        </Button>
                      )}

                      {(v.status === "SUSPENDED" || v.status === "REJECTED") && (
                        <Button
                          onClick={() => handleUpdateStatus(v.id, "APPROVED", v.storeName)}
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs border-slate-700 bg-slate-800 text-emerald-400 hover:bg-emerald-950/40 rounded-lg gap-1 font-bold"
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

      {/* Commission Modal */}
      <Modal
        isOpen={Boolean(commissionTarget)}
        onClose={() => setCommissionTarget(null)}
        title="Adjust Merchant Commission Take Rate"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Set the custom marketplace commission percentage for{" "}
            <strong className="text-white">{commissionTarget?.storeName}</strong>. This fee is automatically deducted from gross sales during weekly settlements.
          </p>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Commission Percentage (%)
            </label>
            <Input
              type="number"
              min="0"
              max="50"
              step="0.5"
              value={commissionInput}
              onChange={(e) => setCommissionInput(e.target.value)}
              className="text-xs h-9 font-mono bg-slate-950 border-slate-800 text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCommissionTarget(null)}
              className="border-slate-700 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveCommission}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold"
            >
              Update Take Rate
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
