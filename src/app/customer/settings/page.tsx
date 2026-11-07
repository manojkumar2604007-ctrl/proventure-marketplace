"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUIStore } from "@/store/ui-store";

export default function CustomerSettingsPage() {
  const { addToast } = useUIStore();
  const [name, setName] = useState("Priya Sharma");
  const [email, setEmail] = useState("customer@example.com");
  const [phone, setPhone] = useState("+91 91234 56789");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addToast({
      title: "Settings Saved",
      description: "Your customer profile has been updated.",
      type: "success",
    });
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">
          Account Settings
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Update your personal contact details and security preferences
        </p>
      </div>

      <form onSubmit={handleSave} className="p-6 rounded-2xl border bg-card space-y-4 shadow-sm">
        <div>
          <label className="text-xs font-medium text-foreground block mb-1">
            Display Name
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-xs h-9"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-foreground block mb-1">
            Email Address
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="text-xs h-9"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-foreground block mb-1">
            Phone Number
          </label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="text-xs h-9"
          />
        </div>

        <div className="pt-2">
          <Button type="submit" size="sm" className="rounded-xl text-xs font-semibold">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
