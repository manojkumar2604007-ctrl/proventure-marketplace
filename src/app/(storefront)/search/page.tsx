"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { productService } from "@/services/product.service";
import { categoryService } from "@/services/category.service";
import { ProductCard } from "@/components/storefront/product-card";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Product, Category } from "@/types";
import {
  Search,
  SlidersHorizontal,
  X,
  LayoutGrid,
  List,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/form-fields";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { cn } from "@/lib/utils";

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") || searchParams.get("query") || searchParams.get("search") || "";

  const [query, setQuery] = useState(queryParam);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [sortOption, setSortOption] = useState<any>("popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setQuery(queryParam);
  }, [queryParam]);

  useEffect(() => {
    async function executeSearch() {
      setLoading(true);
      const [cats, result] = await Promise.all([
        categoryService.getCategories(),
        productService.getProducts({
          search: query || undefined,
          category: selectedCategory || undefined,
          sort: sortOption,
          limit: 24,
        }),
      ]);
      setCategories(cats);
      setProducts(result.products);
      setLoading(false);
    }

    executeSearch();
  }, [query, selectedCategory, sortOption]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="container py-8 space-y-8">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Search Results", href: "/search" },
          ...(query ? [{ label: `"${query}"` }] : []),
        ]}
      />

      {/* Search Header Banner */}
      <div className="rounded-3xl border border-border/80 bg-surface/50 p-6 sm:p-10 space-y-6">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Marketplace Discovery
          </span>
          <h1 className="heading-1">
            {query ? (
              <>
                Search Results for <span className="text-secondary">"{query}"</span>
              </>
            ) : (
              "Explore All Marketplace Listings"
            )}
          </h1>
          <p className="subheading">
            Found <strong className="text-foreground">{products.length}</strong> matching products across verified stores.
          </p>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="max-w-xl flex gap-2">
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search keywords, items, or brands..."
            leftIcon={<Search className="h-4 w-4" />}
            className="h-11 rounded-xl bg-background shadow-subtle"
          />
          <Button type="submit" size="default" className="h-11 rounded-xl px-6 font-semibold">
            Search
          </Button>
        </form>

        {/* Category Pills Filter */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs font-bold text-muted-foreground mr-1">
            Filter by Department:
          </span>
          <button
            type="button"
            onClick={() => setSelectedCategory("")}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold border transition-colors",
              !selectedCategory
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border text-foreground hover:bg-surface"
            )}
          >
            All
          </button>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(isSelected ? "" : cat.slug)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-semibold border transition-colors",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border text-foreground hover:bg-surface"
                )}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sorting & Layout Switcher Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-border/60">
        <span className="text-xs text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{products.length}</span> results
        </span>

        <div className="flex items-center gap-3">
          {/* View Switcher */}
          <div className="flex items-center rounded-xl border border-border/80 p-0.5 bg-surface/50">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1.5 rounded-lg text-xs transition-colors",
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
                "p-1.5 rounded-lg text-xs transition-colors",
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
          <div className="w-44">
            <Select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="h-9 text-xs"
              options={[
                { value: "popular", label: "Most Popular" },
                { value: "newest", label: "Newest Arrivals" },
                { value: "price-asc", label: "Price: Low to High" },
                { value: "price-desc", label: "Price: High to Low" },
                { value: "rating", label: "Top Rated" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Product Results */}
      {loading ? (
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
            <ProductCard key={product.id} product={product} layout={viewMode} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={`No Results for "${query}"`}
          description="We couldn't find any products matching your search term. Try checking for typos or searching with different keywords."
          actionLabel="Clear Search"
          onAction={() => {
            setQuery("");
            setSelectedCategory("");
            router.push("/products");
          }}
        />
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-16 flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
