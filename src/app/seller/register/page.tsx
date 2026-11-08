"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { vendorService } from "@/services/vendor.service";
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUIStore } from "@/store/ui-store";
import { Store, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";

export default function SellerRegisterPage() {
  const router = useRouter();
  const { addToast } = useUIStore();

  const [storeName, setStoreName] = useState("");
  const [slug, setSlug] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setStoreName(val);
    setSlug(slugify(val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName || !email || !phone || !city) {
      addToast({
        title: "Required Fields",
        description: "Please complete all mandatory store application fields.",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await vendorService.createVendor({
        userId: `usr_vend_${Date.now()}`,
        storeName,
        slug: slug || slugify(storeName),
        email,
        phone,
        city,
        state: state || "Karnataka",
        postalCode: postalCode || "560001",
        description,
      });

      setIsSuccess(true);
      addToast({
        title: "Merchant Application Submitted",
        description: "Your application is under review by marketplace admins.",
        type: "success",
      });
    } catch {
      addToast({
        title: "Submission Error",
        description: "Failed to submit application. Please retry.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="container py-20 max-w-lg mx-auto text-center space-y-6">
        <div className="h-20 w-20 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-extrabold text-foreground">
          Application Received!
        </h1>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Welcome to the ProVenture merchant ecosystem. Our administrative team will verify your store and business profile within 24 hours.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link href="/seller">
            <Button size="lg" className="rounded-xl text-xs font-semibold">
              Preview Seller Dashboard
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="lg" className="rounded-xl text-xs font-semibold">
              Back to Storefront
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12 max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5" /> Merchant Onboarding
        </div>
        <h1 className="text-3xl font-black text-foreground tracking-tight">
          Launch Your Shop on ProVenture
        </h1>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          Sell to discerning customers with guaranteed 10% competitive platform commissions and weekly bank payouts.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 rounded-3xl border bg-card shadow-sm space-y-5">
        <div>
          <label className="text-xs font-semibold text-foreground block mb-1">
            Store / Brand Name *
          </label>
          <Input
            placeholder="e.g. Lumina Crafts Studio"
            value={storeName}
            onChange={handleNameChange}
            required
            className="text-xs h-9"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground block mb-1">
            Custom URL Handle
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-mono">
              proventure.com/shop/
            </span>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="text-xs h-9 font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Business Email *
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="text-xs h-9"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Direct Contact Phone *
            </label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="text-xs h-9"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              City *
            </label>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              className="text-xs h-9"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              State *
            </label>
            <Input
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
              className="text-xs h-9"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Postal Code *
            </label>
            <Input
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              required
              className="text-xs h-9"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground block mb-1">
            Brand Bio & Products Overview
          </label>
          <textarea
            rows={3}
            placeholder="Tell us what you make or sell, manufacturing location, and experience..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-xs p-2.5 rounded-xl border bg-background"
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            size="lg"
            className="w-full rounded-xl text-xs font-bold gap-2"
          >
            <Store className="h-4 w-4" />
            <span>{isSubmitting ? "Submitting Application..." : "Submit Seller Application"}</span>
          </Button>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground pt-1">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Zero upfront listing fees • Pay only when you sell</span>
        </div>
      </form>
    </div>
  );
}
