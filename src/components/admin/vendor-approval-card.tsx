import React from "react";
import { SellerProfile } from "@/types";
import { Button } from "@/components/ui/button";
import { Check, X, ShieldAlert } from "lucide-react";

interface VendorApprovalCardProps {
  vendor: SellerProfile;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function VendorApprovalCard({
  vendor,
  onApprove,
  onReject,
}: VendorApprovalCardProps) {
  return (
    <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 flex items-center justify-between gap-4">
      <div className="space-y-1">
        <h4 className="font-bold text-sm text-white">{vendor.storeName}</h4>
        <p className="text-xs text-slate-400">
          {vendor.email} • {vendor.city}, {vendor.state}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          onClick={() => onApprove(vendor.id)}
          size="sm"
          className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white gap-1 rounded-lg"
        >
          <Check className="h-3 w-3" /> Approve
        </Button>
        <Button
          onClick={() => onReject(vendor.id)}
          variant="outline"
          size="sm"
          className="h-8 text-xs border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-lg gap-1"
        >
          <X className="h-3 w-3" /> Decline
        </Button>
      </div>
    </div>
  );
}
