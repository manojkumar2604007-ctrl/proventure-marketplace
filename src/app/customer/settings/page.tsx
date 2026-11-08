"use client";

import React, { useState } from "react";
import { Lock, Bell, Shield, Smartphone, Globe, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/form-fields";
import { Badge } from "@/components/ui/badge";
import { useUIStore } from "@/store/ui-store";

export default function CustomerSettingsPage() {
  const { addToast } = useUIStore();

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Preference switches
  const [emailReceipts, setEmailReceipts] = useState(true);
  const [smsTracking, setSmsTracking] = useState(true);
  const [promoNewsletters, setPromoNewsletters] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      addToast({
        title: "Missing Fields",
        description: "Please enter your current and new password.",
        type: "error",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      addToast({
        title: "Passwords Do Not Match",
        description: "New password and confirmation must match.",
        type: "error",
      });
      return;
    }

    setIsUpdatingPassword(true);
    setTimeout(() => {
      setIsUpdatingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      addToast({
        title: "Password Updated",
        description: "Your password has been changed securely.",
        type: "success",
      });
    }, 600);
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="pb-4 border-b border-border/60">
        <h1 className="heading-1">Account &amp; Security Settings</h1>
        <p className="subheading mt-1">
          Manage your credentials, 2FA authentication, communication preferences, and session security.
        </p>
      </div>

      {/* Password Change Card */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-subtle space-y-4">
        <h3 className="font-bold text-sm text-primary flex items-center gap-2 border-b border-border/60 pb-3">
          <Lock className="h-4 w-4 text-secondary" /> Change Password
        </h3>

        <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
          <Input
            type="password"
            label="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••••••"
            required
          />

          <Input
            type="password"
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimum 8 characters"
            helperText="Include uppercase, lowercase, numbers, and symbols."
            required
          />

          <Input
            type="password"
            label="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••••••"
            required
          />

          <Button
            type="submit"
            size="sm"
            variant="default"
            isLoading={isUpdatingPassword}
            className="rounded-xl font-semibold"
          >
            Update Password
          </Button>
        </form>
      </div>

      {/* Two-Factor Authentication & Communication Preferences */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-subtle space-y-6">
        <h3 className="font-bold text-sm text-primary flex items-center gap-2 border-b border-border/60 pb-3">
          <Bell className="h-4 w-4 text-secondary" /> Notification &amp; Communication Preferences
        </h3>

        <div className="space-y-4">
          <Switch
            checked={twoFactorAuth}
            onCheckedChange={setTwoFactorAuth}
            label="Two-Factor Authentication (2FA)"
            description="Require an SMS verification code whenever signing in from a new browser."
          />

          <div className="border-t border-border/40 pt-3" />

          <Switch
            checked={emailReceipts}
            onCheckedChange={setEmailReceipts}
            label="Automated Email Invoices &amp; Receipts"
            description="Receive GST tax invoice and payment vouchers instantly upon Razorpay capture."
          />

          <div className="border-t border-border/40 pt-3" />

          <Switch
            checked={smsTracking}
            onCheckedChange={setSmsTracking}
            label="SMS Courier Delivery Updates"
            description="Receive real-time courier out-for-delivery alerts on +91 91234 56789."
          />

          <div className="border-t border-border/40 pt-3" />

          <Switch
            checked={promoNewsletters}
            onCheckedChange={setPromoNewsletters}
            label="Weekly Creator Flash Drop Newsletter"
            description="Get handpicked artisan collections and exclusive subscriber promo codes."
          />
        </div>
      </div>

      {/* Active Login Sessions */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-subtle space-y-4">
        <h3 className="font-bold text-sm text-primary flex items-center gap-2 border-b border-border/60 pb-3">
          <Globe className="h-4 w-4 text-secondary" /> Active Sessions &amp; Security
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-surface/50 border border-border/60">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
                <Globe className="h-4 w-4" />
              </div>
              <div>
                <p className="font-bold text-foreground">Chrome on Windows (Current Session)</p>
                <span className="text-[11px] text-muted-foreground">Bengaluru, India • IP 106.51.x.x</span>
              </div>
            </div>
            <Badge variant="success" size="sm" dot>
              Active Now
            </Badge>
          </div>

          <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-surface/50 border border-border/60">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
                <Smartphone className="h-4 w-4" />
              </div>
              <div>
                <p className="font-bold text-foreground">Safari on iPhone 15 Pro</p>
                <span className="text-[11px] text-muted-foreground">Bengaluru, India • Last active yesterday</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                addToast({
                  title: "Session Terminated",
                  description: "iPhone session logged out successfully.",
                  type: "default",
                })
              }
              className="text-[11px] h-7 px-2.5"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
