"use client";

import React, { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useUIStore } from "@/store/ui-store";
import {
  Tag,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  Percent,
} from "lucide-react";

interface CouponItem {
  id: string;
  code: string;
  discountPercent: number;
  minOrder: number;
  usedCount: number;
  maxUsage: number;
  expiresAt: string;
  isActive: boolean;
}

const INITIAL_COUPONS: CouponItem[] = [
  {
    id: "cpn_1",
    code: "TECHNEXUS15",
    discountPercent: 15,
    minOrder: 5000,
    usedCount: 42,
    maxUsage: 100,
    expiresAt: "31 Dec 2026",
    isActive: true,
  },
  {
    id: "cpn_2",
    code: "LAUNCH20",
    discountPercent: 20,
    minOrder: 8000,
    usedCount: 18,
    maxUsage: 50,
    expiresAt: "30 Nov 2026",
    isActive: true,
  },
  {
    id: "cpn_3",
    code: "STUDIO500",
    discountPercent: 10,
    minOrder: 3000,
    usedCount: 65,
    maxUsage: 100,
    expiresAt: "15 Jan 2027",
    isActive: false,
  },
];

export default function SellerPromotionsPage() {
  const { addToast } = useUIStore();
  const [coupons, setCoupons] = useState<CouponItem[]>(INITIAL_COUPONS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("10");
  const [minOrder, setMinOrder] = useState("2000");
  const [maxUsage, setMaxUsage] = useState("100");
  const [expiresAt, setExpiresAt] = useState("31 Dec 2026");

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) {
      addToast({
        title: "Code Required",
        description: "Please specify a coupon promo code.",
        type: "error",
      });
      return;
    }

    const newCoupon: CouponItem = {
      id: `cpn_${Date.now()}`,
      code: code.toUpperCase().trim(),
      discountPercent: parseInt(discountPercent, 10) || 10,
      minOrder: parseInt(minOrder, 10) || 0,
      usedCount: 0,
      maxUsage: parseInt(maxUsage, 10) || 100,
      expiresAt: expiresAt || "31 Dec 2026",
      isActive: true,
    };

    setCoupons([newCoupon, ...coupons]);
    setIsModalOpen(false);
    setCode("");
    addToast({
      title: "Coupon Activated",
      description: `Promo code "${newCoupon.code}" is now live for buyers.`,
      type: "success",
    });
  };

  const handleToggleActive = (id: string) => {
    setCoupons(
      coupons.map((c) =>
        c.id === id ? { ...c, isActive: !c.isActive } : c
      )
    );
  };

  const handleDelete = (id: string) => {
    setCoupons(coupons.filter((c) => c.id !== id));
    addToast({
      title: "Coupon Deleted",
      description: "Promo code removed from your active campaigns.",
      type: "default",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            Promotions & Discount Campaigns
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Create store vouchers, limited-time discount codes, and minimum basket incentives
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="rounded-xl text-xs font-bold gap-1.5 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Create Coupon</span>
        </Button>
      </div>

      {/* Coupons Table */}
      <div className="border border-border/80 rounded-2xl bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3.5 px-4">Coupon Code</th>
                <th className="py-3.5 px-4">Discount</th>
                <th className="py-3.5 px-4">Min. Basket Requirement</th>
                <th className="py-3.5 px-4">Usage / Redemptions</th>
                <th className="py-3.5 px-4">Validity</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-sm text-primary">
                    {c.code}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-600">
                    {c.discountPercent}% OFF
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground">
                    Min order: {formatPrice(c.minOrder)}
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    <span className="font-bold text-foreground">{c.usedCount}</span> / {c.maxUsage}
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground font-mono text-[11px]">
                    {c.expiresAt}
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleToggleActive(c.id)}
                      className="cursor-pointer"
                      title="Click to toggle active status"
                    >
                      <Badge
                        variant={c.isActive ? "success" : "secondary"}
                        className="text-[10px]"
                      >
                        {c.isActive ? "ACTIVE" : "PAUSED"}
                      </Badge>
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-1.5 text-muted-foreground hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete Coupon"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Coupon Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Store Discount Coupon"
      >
        <form onSubmit={handleCreateCoupon} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Coupon Code (e.g. FESTIVE20) <span className="text-rose-500">*</span>
            </label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="WINTER2026"
              className="text-xs h-9 font-mono uppercase"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Discount Percentage (%)
              </label>
              <Input
                type="number"
                min="1"
                max="90"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                className="text-xs h-9 font-mono"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Min. Order Value (₹)
              </label>
              <Input
                type="number"
                min="0"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                className="text-xs h-9 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Max Usages
              </label>
              <Input
                type="number"
                min="1"
                value={maxUsage}
                onChange={(e) => setMaxUsage(e.target.value)}
                className="text-xs h-9 font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Expiration Date
              </label>
              <Input
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                placeholder="31 Dec 2026"
                className="text-xs h-9"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="font-bold">
              Publish Coupon
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
