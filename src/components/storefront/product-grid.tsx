"use client";

import React, { useState } from "react";
import { LayoutGrid, List, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { Product } from "@/types";
import { ProductCard } from "./product-card";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/form-fields";
import { cn } from "@/lib/utils";

export interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  title?: string;
  subtitle?: string;
  totalCount?: number;
  showControls?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onSortChange?: (sortOption: string) => void;
  className?: string;
}

export function ProductGrid({
  products,
  isLoading = false,
  title,
  subtitle,
  totalCount,
  showControls = true,
  emptyTitle = "No products found",
  emptyDescription = "We couldn't find any items matching your selected criteria. Try adjusting your filters or search query.",
  onSortChange,
  className,
}: ProductGridProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentSort, setCurrentSort] = useState("featured");

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setCurrentSort(val);
    if (onSortChange) onSortChange(val);
  };

  const count = totalCount ?? products.length;

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Header & Controls */}
      {(title || showControls) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
          <div>
            {title && (
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-primary">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {subtitle}
              </p>
            )}
          </div>

          {showControls && (
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <span className="text-xs text-muted-foreground hidden md:inline">
                Showing <span className="font-semibold text-foreground">{count}</span> items
              </span>

              {/* View Switcher */}
              <div className="flex items-center rounded-lg border border-border/80 p-0.5 bg-surface/50">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-1.5 rounded-md text-xs transition-colors",
                    viewMode === "grid"
                      ? "bg-background text-primary shadow-subtle font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-1.5 rounded-md text-xs transition-colors",
                    viewMode === "list"
                      ? "bg-background text-primary shadow-subtle font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              {/* Sort Selector */}
              <div className="w-40 sm:w-48">
                <Select
                  value={currentSort}
                  onChange={handleSortChange}
                  className="h-9 text-xs"
                  options={[
                    { value: "featured", label: "Featured" },
                    { value: "price_asc", label: "Price: Low to High" },
                    { value: "price_desc", label: "Price: High to Low" },
                    { value: "rating", label: "Customer Rating" },
                    { value: "newest", label: "Newest Arrivals" },
                  ]}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Grid Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div
          className={cn(
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              : "grid grid-cols-1 gap-4"
          )}
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          actionLabel="Clear Filters"
          onAction={() => window.location.reload()}
        />
      )}
    </div>
  );
}
