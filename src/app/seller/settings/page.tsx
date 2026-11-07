"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUIStore } from "@/store/ui-store";

export default function SellerSettingsPage() {
  const { addToast } = useUIStore();
  const [storeName, setStoreName] = useState("TechNexus Innovations");
  const [slug, setSlug] = useState("technexus");
  const [email, setEmail] = useState("contact@technexus.com");
  const [phone, setPhone] = useState("+91 98765 11111");
  const [city, setCity] = useState("Bengaluru");
  const [state, setState] = useState("Karnataka");
  const [description, setDescription] = useState(
    "Architectural audio, flagship computing peripherals, and futuristic smart workspace accessories."
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addToast({
      title: "Store Profile Updated",
      description: "Changes are now live on your marketplace storefront.",
      type: "success",
    });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">
          Shop Profile & Settings
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Public marketplace profile, contact info, and branding details
        </p>
      </div>

      <form onSubmit={handleSave} className="p-6 rounded-2xl border bg-card space-y-4 shadow-sm">
        <div>
          <label className="text-xs font-medium text-foreground block mb-1">
            Store Name
          </label>
          <Input
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="text-xs h-9"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-foreground block mb-1">
            Store Slug (URL Identifier)
          </label>
          <Input
            value={slug}
            disabled
            className="text-xs h-9 font-mono bg-muted"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Business Email
            </label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-xs h-9"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Support Phone
            </label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="text-xs h-9"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Dispatch City
            </label>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="text-xs h-9"
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
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-foreground block mb-1">
            Storefront Bio & Brand Story
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-xs p-2.5 rounded-lg border bg-background"
          />
        </div>

        <Button type="submit" size="sm" className="rounded-xl text-xs font-semibold">
          Save Profile Updates
        </Button>
      </form>
    </div>
  );
}
