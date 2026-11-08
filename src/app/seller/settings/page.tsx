"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/form-fields";
import { useUIStore } from "@/store/ui-store";
import {
  Settings,
  Truck,
  Building,
  Bell,
  Save,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

export default function SellerSettingsPage() {
  const { addToast } = useUIStore();

  // Shipping & Dispatch SLAs
  const [dispatchSla, setDispatchSla] = useState("24 Hours");
  const [defaultCarrier, setDefaultCarrier] = useState("Blue Dart Express");
  const [freeShippingThreshold, setFreeShippingThreshold] = useState("2999");

  // Notifications
  const [smsOrderAlerts, setSmsOrderAlerts] = useState(true);
  const [emailDailyDigest, setEmailDailyDigest] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);

  // Bank Info
  const [accountHolder, setAccountHolder] = useState("TechNexus Innovations Pvt Ltd");
  const [bankName, setBankName] = useState("HDFC Bank");
  const [accountNumber, setAccountNumber] = useState("50200012345678");
  const [ifsc, setIfsc] = useState("HDFC0001234");

  // Store Policy
  const [returnDays, setReturnDays] = useState("7 Days Hassle-Free Replacement");
  const [warrantyInfo, setWarrantyInfo] = useState("1 Year Manufacturer Limited Warranty");

  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      addToast({
        title: "Settings Saved",
        description: "Your operational configurations and bank details have been updated.",
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
            Store Preferences & Operational Settings
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure order fulfillment SLAs, bank settlement routing, and merchant alert triggers
          </p>
        </div>

        <Button
          type="submit"
          form="seller-settings-form"
          size="sm"
          disabled={saving}
          className="text-xs font-bold gap-1.5"
        >
          <Save className="h-3.5 w-3.5" />
          <span>{saving ? "Saving..." : "Save Settings"}</span>
        </Button>
      </div>

      <form id="seller-settings-form" onSubmit={handleSave} className="space-y-8">
        {/* Shipping & Fulfillment Rules */}
        <div className="p-6 rounded-2xl border border-border/80 bg-card space-y-4 shadow-sm">
          <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Truck className="h-4 w-4 text-primary" />
            Shipping & Dispatch Operations
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Standard Dispatch SLA
              </label>
              <select
                value={dispatchSla}
                onChange={(e) => setDispatchSla(e.target.value)}
                className="w-full h-9 rounded-xl border border-border/80 bg-background px-3 text-xs"
              >
                <option value="Same Day (Cutoff 2 PM)">Same Day (Cutoff 2 PM)</option>
                <option value="24 Hours">24 Hours</option>
                <option value="48 Hours">48 Hours</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Default Logistics Partner
              </label>
              <select
                value={defaultCarrier}
                onChange={(e) => setDefaultCarrier(e.target.value)}
                className="w-full h-9 rounded-xl border border-border/80 bg-background px-3 text-xs"
              >
                <option value="Blue Dart Express">Blue Dart Express</option>
                <option value="Delhivery">Delhivery</option>
                <option value="DTDC Logistics">DTDC Logistics</option>
                <option value="Ekart Logistics">Ekart Logistics</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Free Shipping Basket (₹)
              </label>
              <Input
                type="number"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(e.target.value)}
                className="text-xs h-9 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Bank Details for Automatic Settlements */}
        <div className="p-6 rounded-2xl border border-border/80 bg-card space-y-4 shadow-sm">
          <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Building className="h-4 w-4 text-emerald-600" />
            Bank Account for Direct Payouts
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Account Holder Name
              </label>
              <Input
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                className="text-xs h-9"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Bank Name
              </label>
              <Input
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="text-xs h-9"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Bank Account Number
              </label>
              <Input
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="text-xs h-9 font-mono"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                IFSC Code
              </label>
              <Input
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                className="text-xs h-9 font-mono uppercase"
                required
              />
            </div>
          </div>
        </div>

        {/* Store Policies */}
        <div className="p-6 rounded-2xl border border-border/80 bg-card space-y-4 shadow-sm">
          <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Store Guarantee & Warranty Policies
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Return & Replacement Window
              </label>
              <Input
                value={returnDays}
                onChange={(e) => setReturnDays(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Manufacturer Warranty Clause
              </label>
              <Input
                value={warrantyInfo}
                onChange={(e) => setWarrantyInfo(e.target.value)}
                className="text-xs h-9"
              />
            </div>
          </div>
        </div>

        {/* Automated Notifications */}
        <div className="p-6 rounded-2xl border border-border/80 bg-card space-y-4 shadow-sm">
          <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            Merchant Notification Alerts
          </h2>

          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={smsOrderAlerts}
                onChange={(e) => setSmsOrderAlerts(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary h-4 w-4"
              />
              <div>
                <span className="font-bold text-foreground block">Instant SMS for New Orders</span>
                <span className="text-muted-foreground text-[11px]">
                  Receive an immediate SMS notification whenever a buyer places an order.
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={lowStockAlerts}
                onChange={(e) => setLowStockAlerts(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary h-4 w-4"
              />
              <div>
                <span className="font-bold text-foreground block">Critical Low Stock Reminders</span>
                <span className="text-muted-foreground text-[11px]">
                  Automated email alerts when any SKU drops to 5 units or lower.
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={emailDailyDigest}
                onChange={(e) => setEmailDailyDigest(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary h-4 w-4"
              />
              <div>
                <span className="font-bold text-foreground block">Daily Settlement & Sales Summary</span>
                <span className="text-muted-foreground text-[11px]">
                  Receive daily performance analytics and pending payout notices.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Bottom Save Action */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
          <Button
            type="submit"
            size="sm"
            disabled={saving}
            className="text-xs font-bold gap-1.5 min-w-[140px]"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{saving ? "Saving..." : "Save Preferences"}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
