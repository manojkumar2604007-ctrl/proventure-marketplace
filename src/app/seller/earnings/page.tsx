import React from "react";
import { MOCK_PAYOUTS } from "@/lib/db/mock-data";
import { formatPrice, formatDate } from "@/lib/utils";
import { DollarSign, Percent, ShieldCheck, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SellerEarningsPage() {
  const sellerPayouts = MOCK_PAYOUTS.filter((p) => p.sellerId === "seller_technexus");
  const totalSettled = sellerPayouts
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.netAmount, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">
          Earnings & Bank Settlements
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Transparent breakdown of platform commissions, net merchant balances, and remittance logs
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border bg-card shadow-sm space-y-1">
          <span className="text-xs text-muted-foreground font-medium">Lifetime Disbursed</span>
          <span className="text-2xl font-black text-foreground block">
            {formatPrice(totalSettled || 135000)}
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Transferred to Bank Account
          </span>
        </div>

        <div className="p-5 rounded-2xl border bg-card shadow-sm space-y-1">
          <span className="text-xs text-muted-foreground font-medium">Marketplace Commission</span>
          <span className="text-2xl font-black text-foreground block">
            10.0%
          </span>
          <span className="text-[11px] text-muted-foreground">
            Standard Electronics Category Tier
          </span>
        </div>

        <div className="p-5 rounded-2xl border bg-card shadow-sm space-y-1">
          <span className="text-xs text-muted-foreground font-medium">Next Scheduled Settlement</span>
          <span className="text-2xl font-black text-primary block">
            {formatPrice(112500)}
          </span>
          <span className="text-[11px] text-amber-600 font-semibold flex items-center gap-1">
            <Clock className="h-3 w-3" /> In Processing (Due on 1st)
          </span>
        </div>
      </div>

      {/* Payouts Table */}
      <div className="border rounded-2xl bg-card overflow-hidden shadow-sm space-y-4 p-6">
        <div className="border-b pb-3">
          <h3 className="font-bold text-base text-foreground">Remittance History</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Automated direct bank deposits via Razorpay Route & NEFT
          </p>
        </div>

        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
              <th className="pb-3">Reference #</th>
              <th className="pb-3">Gross Sales</th>
              <th className="pb-3">Commission (10%)</th>
              <th className="pb-3">Net Settled</th>
              <th className="pb-3">Status</th>
              <th className="pb-3 text-right">Settlement Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sellerPayouts.map((pay) => (
              <tr key={pay.id} className="hover:bg-muted/20 transition-colors">
                <td className="py-3.5 font-mono font-bold text-primary">
                  {pay.referenceNumber || "PENDING-CLEARANCE"}
                </td>
                <td className="py-3.5 text-muted-foreground">
                  {formatPrice(pay.amount)}
                </td>
                <td className="py-3.5 text-rose-500 font-medium">
                  -{formatPrice(pay.commissionDeducted)}
                </td>
                <td className="py-3.5 font-bold text-foreground">
                  {formatPrice(pay.netAmount)}
                </td>
                <td className="py-3.5">
                  <Badge
                    variant={pay.status === "PAID" ? "success" : "warning"}
                    className="text-[10px]"
                  >
                    {pay.status}
                  </Badge>
                </td>
                <td className="py-3.5 text-muted-foreground text-right">
                  {formatDate(pay.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
