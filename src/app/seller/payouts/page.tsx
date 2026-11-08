"use client";

import React, { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useUIStore } from "@/store/ui-store";
import {
  CircleDollarSign,
  Building,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  Download,
} from "lucide-react";

interface PayoutRecord {
  id: string;
  referenceUtr: string;
  date: string;
  grossAmount: number;
  commission: number;
  netPayout: number;
  bankAccount: string;
  status: "PAID" | "PROCESSING" | "PENDING";
}

const MOCK_PAYOUTS: PayoutRecord[] = [
  {
    id: "pay_101",
    referenceUtr: "HDFC9981203912",
    date: "04 Nov 2026",
    grossAmount: 54000,
    commission: 5400,
    netPayout: 48600,
    bankAccount: "HDFC Bank (•••• 4921)",
    status: "PAID",
  },
  {
    id: "pay_102",
    referenceUtr: "HDFC8810294811",
    date: "28 Oct 2026",
    grossAmount: 68500,
    commission: 6850,
    netPayout: 61650,
    bankAccount: "HDFC Bank (•••• 4921)",
    status: "PAID",
  },
  {
    id: "pay_103",
    referenceUtr: "HDFC7720194820",
    date: "21 Oct 2026",
    grossAmount: 42000,
    commission: 4200,
    netPayout: 37800,
    bankAccount: "HDFC Bank (•••• 4921)",
    status: "PAID",
  },
];

export default function SellerPayoutsPage() {
  const { addToast } = useUIStore();
  const [payouts, setPayouts] = useState<PayoutRecord[]>(MOCK_PAYOUTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const availableBalance = 32800;
  const pendingClearance = 14500;

  const handleRequestPayout = () => {
    setIsRequesting(true);
    setTimeout(() => {
      setIsRequesting(false);
      setIsModalOpen(false);

      const newRecord: PayoutRecord = {
        id: `pay_${Date.now()}`,
        referenceUtr: `NEFT${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        date: "Today",
        grossAmount: Math.round(availableBalance / 0.9),
        commission: Math.round((availableBalance / 0.9) * 0.1),
        netPayout: availableBalance,
        bankAccount: "HDFC Bank (•••• 4921)",
        status: "PROCESSING",
      };

      setPayouts([newRecord, ...payouts]);
      addToast({
        title: "Disbursement Requested",
        description: `₹${availableBalance.toLocaleString()} initiated to HDFC Bank (•••• 4921). UTR will be generated upon NEFT settlement.`,
        type: "success",
      });
    }, 600);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            Payouts & Settlement Ledger
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Automated direct-to-bank NEFT/RTGS transfers, commission deductions, and transaction receipts
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="rounded-xl text-xs font-bold gap-1.5 shadow-sm"
        >
          <CreditCard className="h-4 w-4" />
          <span>Request Payout</span>
        </Button>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-border/80 bg-card shadow-sm space-y-2">
          <span className="text-xs font-medium text-muted-foreground block">
            Available for Withdrawal
          </span>
          <span className="text-3xl font-black text-emerald-600 font-mono block">
            {formatPrice(availableBalance)}
          </span>
          <span className="text-[11px] text-muted-foreground block">
            Net after 10% platform fee
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-border/80 bg-card shadow-sm space-y-2">
          <span className="text-xs font-medium text-muted-foreground block">
            In Transit / Pending Clearance
          </span>
          <span className="text-3xl font-black text-foreground font-mono block">
            {formatPrice(pendingClearance)}
          </span>
          <span className="text-[11px] text-amber-600 font-semibold block">
            Clears after 7-day customer return window
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-border/80 bg-card shadow-sm space-y-2">
          <span className="text-xs font-medium text-muted-foreground block">
            Linked Settlement Account
          </span>
          <div className="flex items-center gap-2 pt-0.5">
            <Building className="h-4 w-4 text-primary" />
            <span className="font-bold text-foreground text-sm">HDFC Bank</span>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground block">
            A/C: ••••••••4921 • IFSC: HDFC0001234
          </span>
        </div>
      </div>

      {/* Payouts Table */}
      <div className="border border-border/80 rounded-2xl bg-card overflow-hidden shadow-sm space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div>
            <h3 className="font-bold text-base text-foreground">Disbursement History</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Official records of past bank transfers with bank UTR reference numbers
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                <th className="pb-3">Payout Reference</th>
                <th className="pb-3">Gross Sales</th>
                <th className="pb-3">Fee Deducted (10%)</th>
                <th className="pb-3">Net Disbursed</th>
                <th className="pb-3">Bank Destination</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Settled Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {payouts.map((p) => (
                <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3.5">
                    <span className="font-bold font-mono text-primary block">
                      {p.referenceUtr}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">{p.id}</span>
                  </td>
                  <td className="py-3.5 font-mono text-muted-foreground">
                    {formatPrice(p.grossAmount)}
                  </td>
                  <td className="py-3.5 font-mono text-rose-500">
                    - {formatPrice(p.commission)}
                  </td>
                  <td className="py-3.5 font-mono font-bold text-emerald-600 text-sm">
                    {formatPrice(p.netPayout)}
                  </td>
                  <td className="py-3.5 text-muted-foreground">{p.bankAccount}</td>
                  <td className="py-3.5">
                    <Badge
                      variant={
                        p.status === "PAID"
                          ? "success"
                          : p.status === "PROCESSING"
                          ? "warning"
                          : "secondary"
                      }
                      className="text-[10px]"
                    >
                      {p.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 text-right font-mono text-muted-foreground">
                    {p.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payout Request Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirm Instant Payout Request"
      >
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            You are initiating a disbursement for your currently cleared balance. Funds will be transferred via NEFT/RTGS to your registered bank account.
          </p>

          <div className="p-4 rounded-xl bg-surface/80 border border-border/60 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transfer Amount:</span>
              <span className="font-mono font-bold text-foreground text-sm">
                {formatPrice(availableBalance)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Destination Bank:</span>
              <span className="font-bold text-foreground">HDFC Bank (•••• 4921)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated Delivery:</span>
              <span className="font-bold text-emerald-600">Within 2 to 4 Business Hours</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              disabled={isRequesting}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleRequestPayout}
              disabled={isRequesting}
              className="font-bold"
            >
              {isRequesting ? "Processing..." : "Confirm & Transfer"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
