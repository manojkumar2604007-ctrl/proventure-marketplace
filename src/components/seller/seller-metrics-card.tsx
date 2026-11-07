import React from "react";
import { LucideIcon } from "lucide-react";

interface SellerMetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  trend?: string;
}

export function SellerMetricsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  trend,
}: SellerMetricsCardProps) {
  return (
    <div className="p-5 rounded-2xl border bg-card shadow-sm space-y-2">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs font-medium">{title}</span>
        <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <span className="text-2xl font-black text-foreground block">{value}</span>
      {(subtitle || trend) && (
        <div className="flex items-center justify-between text-[11px]">
          {trend && <span className="text-emerald-600 font-semibold">{trend}</span>}
          {subtitle && <span className="text-muted-foreground">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
