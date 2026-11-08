import * as React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/70",
        className
      )}
      {...props}
    />
  );
}

// Product Card Skeleton Loader
export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card p-0 shadow-subtle flex flex-col">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-10" />
          </div>
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/5" />
        </div>
        <div className="pt-2 flex items-center justify-between border-t border-border/40">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// Data Table Skeleton Loader
export function DataTableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full space-y-3">
      {/* Header filter skeleton */}
      <div className="flex items-center justify-between gap-4 py-1">
        <Skeleton className="h-9 w-64 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>
      {/* Table skeleton */}
      <div className="overflow-hidden rounded-xl border border-border/80 bg-background">
        <div className="border-b border-border/60 bg-surface/60 px-4 py-3 flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
        <div className="divide-y divide-border/40">
          {Array.from({ length: rows }).map((_, r) => (
            <div key={r} className="px-4 py-3.5 flex gap-4 items-center">
              {Array.from({ length: cols }).map((_, c) => (
                <Skeleton
                  key={c}
                  className={cn(
                    "h-4 flex-1",
                    c === 0 && "w-1/4",
                    c === cols - 1 && "h-7 w-16 flex-none rounded-md"
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Metric Card Skeleton
export function MetricCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/80 bg-card p-5 shadow-subtle space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>
      <Skeleton className="h-7 w-36" />
      <Skeleton className="h-3.5 w-48" />
    </div>
  );
}
