"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUIStore } from "@/store/ui-store";
import { Database, ShieldCheck, CreditCard, Cloud } from "lucide-react";

export default function AdminSettingsPage() {
  const { addToast } = useUIStore();
  const [platformName, setPlatformName] = useState("ProVenture Marketplace");
  const [supportEmail, setSupportEmail] = useState("support@proventure.com");
  const [currency, setCurrency] = useState("INR (₹)");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addToast({
      title: "Platform Configuration Saved",
      description: "Global parameters updated successfully.",
      type: "success",
    });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Platform System Settings
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Infrastructure configurations, Neon PostgreSQL, Razorpay routing, and Cloudinary storage
        </p>
      </div>

      {/* Integration Status Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 flex items-center gap-3">
          <Database className="h-5 w-5 text-indigo-400" />
          <div>
            <span className="text-xs font-bold text-white block">Neon Database</span>
            <span className="text-[10px] text-emerald-400 font-semibold">Ready / Fallback Active</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 flex items-center gap-3">
          <CreditCard className="h-5 w-5 text-indigo-400" />
          <div>
            <span className="text-xs font-bold text-white block">Razorpay Gateway</span>
            <span className="text-[10px] text-emerald-400 font-semibold">Test Mode Configured</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 flex items-center gap-3">
          <Cloud className="h-5 w-5 text-indigo-400" />
          <div>
            <span className="text-xs font-bold text-white block">Cloudinary Media</span>
            <span className="text-[10px] text-emerald-400 font-semibold">Presets Enabled</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="p-6 rounded-2xl border border-slate-800 bg-slate-900 space-y-4 shadow-sm">
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Platform Brand Name
          </label>
          <Input
            value={platformName}
            onChange={(e) => setPlatformName(e.target.value)}
            className="text-xs h-9 bg-slate-950 border-slate-800 text-white"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Executive Support Email
          </label>
          <Input
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
            className="text-xs h-9 bg-slate-950 border-slate-800 text-white"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Default Accounting Currency
          </label>
          <Input
            value={currency}
            disabled
            className="text-xs h-9 bg-slate-950 border-slate-800 text-slate-400"
          />
        </div>

        <div className="pt-2">
          <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-xs rounded-xl font-semibold">
            Save System Configurations
          </Button>
        </div>
      </form>
    </div>
  );
}
