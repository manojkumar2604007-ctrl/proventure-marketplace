"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { vendorService } from "@/services/vendor.service";
import { SellerProfile } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/form-fields";
import { Badge } from "@/components/ui/badge";
import { useUIStore } from "@/store/ui-store";
import {
  Store,
  ExternalLink,
  Save,
  UploadCloud,
  CheckCircle2,
  ShieldCheck,
  Building,
  Phone,
  Mail,
  MapPin,
  Image as ImageIcon,
} from "lucide-react";

export default function SellerStoreProfilePage() {
  const sellerId = "seller_technexus";
  const { addToast } = useUIStore();

  const [loading, setLoading] = useState(false);
  const [storeName, setStoreName] = useState("TechNexus Innovations");
  const [slug, setSlug] = useState("technexus");
  const [description, setDescription] = useState(
    "Flagship computing peripherals, architectural desktop acoustics, and high-precision mechanical keyboards."
  );
  const [logo, setLogo] = useState(
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80"
  );
  const [banner, setBanner] = useState(
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80"
  );
  const [email, setEmail] = useState("contact@technexus.com");
  const [phone, setPhone] = useState("+91 98765 11111");
  const [street, setStreet] = useState("Tower 4, Electronic City Phase 1");
  const [city, setCity] = useState("Bengaluru");
  const [state, setState] = useState("Karnataka");
  const [postalCode, setPostalCode] = useState("560100");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate update
    setTimeout(() => {
      setLoading(false);
      addToast({
        title: "Store Profile Updated",
        description: "Your public storefront branding and contact details are saved.",
        type: "success",
      });
    }, 400);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            Store Profile & Merchant Branding
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure how your multi-vendor shop appears to buyers across PROVENTURE MARKETPLACE
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/stores/${slug}`} target="_blank">
            <Button variant="outline" size="sm" className="text-xs gap-1.5">
              <span>View Public Store</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <Button
            type="submit"
            form="store-profile-form"
            size="sm"
            disabled={loading}
            className="text-xs font-bold gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{loading ? "Saving..." : "Save Store Details"}</span>
          </Button>
        </div>
      </div>

      <form id="store-profile-form" onSubmit={handleSave} className="space-y-8">
        {/* Visual Brand Assets */}
        <div className="p-6 rounded-2xl border border-border/80 bg-card space-y-6 shadow-sm">
          <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-primary" />
            Visual Brand Assets (Store Banner & Logo)
          </h2>

          {/* Banner Preview */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground block">
              Store Banner Image (1200 × 300 recommended)
            </label>
            <div className="h-36 sm:h-44 w-full rounded-2xl overflow-hidden relative border border-border/80 bg-surface">
              <Image src={banner} alt="Store Banner" fill className="object-cover" />
              <div className="absolute inset-0 bg-black/20" />
            </div>
            <Input
              value={banner}
              onChange={(e) => setBanner(e.target.value)}
              placeholder="Banner Image URL"
              className="text-xs h-9 font-mono mt-1"
            />
          </div>

          {/* Logo & Store Identity */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
            <div className="h-24 w-24 rounded-2xl overflow-hidden relative border-2 border-primary/20 shadow-sm shrink-0 bg-surface">
              <Image src={logo} alt="Store Logo" fill className="object-cover" />
            </div>
            <div className="flex-1 w-full space-y-2">
              <label className="text-xs font-medium text-foreground block">
                Store Logo Image URL
              </label>
              <Input
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                placeholder="Logo Image URL"
                className="text-xs h-9 font-mono"
              />
              <p className="text-[11px] text-muted-foreground">
                Square ratio (200x200px minimum). PNG, JPG or WebP.
              </p>
            </div>
          </div>
        </div>

        {/* Store Information */}
        <div className="p-6 rounded-2xl border border-border/80 bg-card space-y-4 shadow-sm">
          <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Store className="h-4 w-4 text-primary" />
            Store Identification & Biography
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Store Display Name <span className="text-rose-500">*</span>
              </label>
              <Input
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="text-xs h-9"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Public Store Handle (URL Slug)
              </label>
              <Input
                value={slug}
                disabled
                className="text-xs h-9 font-mono bg-muted/40 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Store Bio / About the Brand
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="text-xs"
            />
          </div>
        </div>

        {/* Contact & Physical Address */}
        <div className="p-6 rounded-2xl border border-border/80 bg-card space-y-4 shadow-sm">
          <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Merchant Contact & Dispatch Hub Address
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Customer Support Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-xs h-9"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Support Phone Line
              </label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="text-xs h-9"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Dispatch Hub / Warehouse Street Address
            </label>
            <Input
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="text-xs h-9"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                City
              </label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="text-xs h-9"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                State
              </label>
              <Input
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="text-xs h-9"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Postal Code (PIN)
              </label>
              <Input
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="text-xs h-9 font-mono"
                required
              />
            </div>
          </div>
        </div>

        {/* Merchant Account Tier & Status */}
        <div className="p-6 rounded-2xl border border-border/80 bg-card space-y-4 shadow-sm">
          <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Merchant Verification & Account Tier
          </h2>

          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>
              Verified Merchant Tier: <strong>10% standard marketplace commission rate</strong>.
            </span>
          </div>
        </div>

        {/* Bottom Save Action */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
          <Button
            type="submit"
            size="sm"
            disabled={loading}
            className="text-xs font-bold gap-1.5 min-w-[140px]"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{loading ? "Saving..." : "Update Store"}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
