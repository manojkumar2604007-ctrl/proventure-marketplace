"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUIStore } from "@/store/ui-store";
import { Percent, Clock, DollarSign, ShieldAlert } from "lucide-react";

export default function AdminCommissionsPage() {
  const { addToast } = useUIStore();
  const [defaultRate, setDefaultRate] = useState("10");
  const [settlementCycle, setSettlementCycle] = useState("bi-weekly");
  const [returnHoldDays, setReturnHoldDays] = useState("7");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addToast({
      title: "Fee Policy Updated",
      description: `Marketplace base take rate saved at ${defaultRate}%.`,
      type: "success",
    });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Commission Structure & Escrow Holds
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure platform monetisation, seller deduction tiers, and payout maturity schedules
        </p>
      </div>

      <form onSubmit={handleSave} className="p-6 rounded-2xl border border-slate-800 bg-slate-900 space-y-5 shadow-sm">
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Global Default Marketplace Commission (%)
          </label>
          <div className="relative">
            <Input
              type="number"
              value={defaultRate}
              onChange={(e) => setDefaultRate(e.target.value)}
              className="text-xs h-9 bg-slate-950 border-slate-800 text-white pl-8 font-bold"
            />
            <Percent className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Standard cut automatically deducted from seller disbursements upon order completion.
          </p>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Automated Payout Remittance Cycle
          </label>
          <select
            value={settlementCycle}
            onChange={(e) => setSettlementCycle(e.target.value)}
            className="w-full text-xs h-9 px-3 rounded-lg border border-slate-800 bg-slate-950 text-white focus:outline-none"
          >
            <option value="weekly">Weekly Settlement (Every Monday)</option>
            <option value="bi-weekly">Bi-Weekly Settlement (1st and 16th of month)</option>
            <option value="monthly">Monthly Settlement</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Buyer Protection Escrow Maturity Period (Days)
          </label>
          <Input
            type="number"
            value={returnHoldDays}
            onChange={(e) => setReturnHoldDays(e.target.value)}
            className="text-xs h-9 bg-slate-950 border-slate-800 text-white"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Days post-delivery before seller balance matures to protect against customer return claims.
          </p>
        </div>

        <div className="pt-2">
          <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-xs rounded-xl font-semibold">
            Save Commission Architecture
          </Button>
        </div>
      </form>
    </div>
  );
}
