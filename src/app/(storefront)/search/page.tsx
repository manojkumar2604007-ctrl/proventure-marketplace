"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { productService } from "@/services/product.service";
import { categoryService } from "@/services/category.service";
import { vendorService } from "@/services/vendor.service";
import { ProductCard } from "@/components/storefront/product-card";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Product, Category, SellerProfile } from "@/types";
import {
  Search,
  SlidersHorizontal,
  X,
  LayoutGrid,
  List,
  ChevronDown,
  Sparkles,
  Star,
  RotateCcw,
  Store,
  Tag,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, Checkbox } from "@/components/ui/form-fields";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { cn, formatPrice } from "@/lib/utils";

const BRANDS = [
  "Audio",
  "Titanium",
  "Leather",
  "Mechanical",
  "Ceramics",
  "Watches",
  "Handcrafted",
  "Ergonomic",
];

const PRICE_PRESETS = [
  { label: "All Prices", min: undefined, max: undefined },
  { label: "Under ₹2,000", min: 0, max: 2000 },
  { label: "₹2,000 - ₹10,000", min: 2000, max: 10000 },
  { label: "₹10,000 - ₹25,000", min: 10000, max: 25000 },
  { label: "Above ₹25,000", min: 25000, max: undefined },
];

const DISCOUNT_PRESETS = [
  { label: "All Deals", value: undefined },
  { label: "10% Off or More", value: 10 },
  { label: "20% Off or More", value: 20 },
  { label: "30% Off or More", value: 30 },
  { label: "50% Off or More", value: 50 },
];

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") || searchParams.get("query") || searchParams.get("search") || "";

  const [query, setQuery] = useState(queryParam);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sellers, setSellers] = useState<SellerProfile[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [selectedSeller, setSelectedSeller] = useState(searchParams.get("seller") || "");
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get("brand") || "");
  const [minPrice, setMinPrice] = useState<number | undefined>(
    searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined
  );
  const [maxPrice, setMaxPrice] = useState<number | undefined>(
    searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined
  );
  const [minRating, setMinRating] = useState<number | undefined>(
    searchParams.get("rating") ? Number(searchParams.get("rating")) : undefined
  );
  const [discount, setDiscount] = useState<number | undefined>(
    searchParams.get("discount") ? Number(searchParams.get("discount")) : undefined
  );
  const [inStockOnly, setInStockOnly] = useState(searchParams.get("inStock") === "true");

  // Sorting & View
  const [sortOption, setSortOption] = useState<any>(searchParams.get("sort") || "popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  useEffect(() => {
    setQuery(queryParam);
  }, [queryParam]);

  useEffect(() => {
    async function executeSearch() {
      setLoading(true);
      const [cats, vends, result] = await Promise.all([
        categoryService.getCategories(),
        vendorService.getApprovedVendors(),
        productService.getProducts({
          search: query || undefined,
          category: selectedCategory || undefined,
          seller: selectedSeller || undefined,
          brand: selectedBrand || undefined,
          minPrice,
          maxPrice,
          rating: minRating,
          discount,
          inStock: inStockOnly || undefined,
          sort: sortOption,
          limit: 30,
        }),
      ]);

      setCategories(cats);
      setSellers(vends);
      setProducts(result.products);
      setTotalCount(result.total);
      setLoading(false);
    }

    executeSearch();
  }, [
    query,
    selectedCategory,
    selectedSeller,
    selectedBrand,
    minPrice,
    maxPrice,
    minRating,
    discount,
    inStockOnly,
    sortOption,
  ]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleClearFilters = () => {
    setSelectedCategory("");
    setSelectedSeller("");
    setSelectedBrand("");
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setMinRating(undefined);
    setDiscount(undefined);
    setInStockOnly(false);
    setSortOption("popular");
  };

  const activeFiltersCount = [
    Boolean(selectedCategory),
    Boolean(selectedSeller),
    Boolean(selectedBrand),
    minPrice !== undefined || maxPrice !== undefined,
    minRating !== undefined,
    discount !== undefined,
    inStockOnly,
  ].filter(Boolean).length;

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
      <div className="rounded-3xl border border-border/80 bg-surface/50 p-6 sm:p-8 space-y-6">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Product Discovery &amp; Search
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
            Showing <strong className="text-foreground">{products.length}</strong> matching products across verified stores.
          </p>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="max-w-xl flex gap-2">
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search keywords, items, categories, or brands..."
            leftIcon={<Search className="h-4 w-4" />}
            className="h-11 rounded-xl bg-background shadow-subtle"
          />
          <Button type="submit" size="default" className="h-11 rounded-xl px-6 font-semibold">
            Search
          </Button>
        </form>

        {/* Category Pills Filter */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-bold text-muted-foreground mr-1">
            Department:
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

      {/* Main Content Layout with Sidebar Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Filters Sidebar */}
        <div className="hidden lg:block space-y-6">
          <div className="p-5 rounded-2xl border border-border/80 bg-card shadow-subtle space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <span className="font-bold text-sm text-foreground flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-primary" /> Refine Search
              </span>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleClearFilters}
                  className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" /> Reset
                </button>
              )}
            </div>

            {/* Price Ranges */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Price Range
              </label>
              <div className="space-y-1.5 text-xs">
                {PRICE_PRESETS.map((p, idx) => {
                  const isChecked = minPrice === p.min && maxPrice === p.max;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setMinPrice(p.min);
                        setMaxPrice(p.max);
                      }}
                      className={cn(
                        "w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between",
                        isChecked
                          ? "bg-primary/10 text-primary font-bold border border-primary/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-surface"
                      )}
                    >
                      <span>{p.label}</span>
                      {isChecked && <Check className="h-3.5 w-3.5 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Discount Deals Filter */}
            <div className="space-y-3 pt-3 border-t border-border/60">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Discount Deals
              </label>
              <div className="space-y-1.5 text-xs">
                {DISCOUNT_PRESETS.map((d, idx) => {
                  const isChecked = discount === d.value;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setDiscount(d.value)}
                      className={cn(
                        "w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between",
                        isChecked
                          ? "bg-accent/10 text-accent font-bold border border-accent/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-surface"
                      )}
                    >
                      <span>{d.label}</span>
                      {isChecked && <Check className="h-3.5 w-3.5 text-accent" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Minimum Rating */}
            <div className="space-y-3 pt-3 border-t border-border/60">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Customer Rating
              </label>
              <div className="space-y-1.5 text-xs">
                {[4, 3, 2].map((r) => {
                  const isChecked = minRating === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setMinRating(isChecked ? undefined : r)}
                      className={cn(
                        "w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between",
                        isChecked
                          ? "bg-amber-500/10 text-amber-600 font-bold border border-amber-500/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-surface"
                      )}
                    >
                      <span className="flex items-center gap-1.5">
                        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        <span>{r}★ &amp; Above</span>
                      </span>
                      {isChecked && <Check className="h-3.5 w-3.5 text-amber-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Brands / Tags */}
            <div className="space-y-3 pt-3 border-t border-border/60">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Brands &amp; Craft
              </label>
              <div className="flex flex-wrap gap-1.5">
                {BRANDS.map((br) => {
                  const isSelected = selectedBrand.toLowerCase() === br.toLowerCase();
                  return (
                    <button
                      key={br}
                      type="button"
                      onClick={() => setSelectedBrand(isSelected ? "" : br)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-xs transition-colors font-medium",
                        isSelected
                          ? "bg-primary text-primary-foreground font-bold shadow-subtle"
                          : "bg-surface text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      {br}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Verified Sellers */}
            <div className="space-y-3 pt-3 border-t border-border/60">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Verified Merchant
              </label>
              <div className="space-y-1 text-xs max-h-36 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => setSelectedSeller("")}
                  className={cn(
                    "w-full text-left px-2 py-1 rounded-lg transition-colors",
                    !selectedSeller ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  All Stores
                </button>
                {sellers.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedSeller(selectedSeller === s.slug ? "" : s.slug)}
                    className={cn(
                      "w-full text-left px-2 py-1 rounded-lg transition-colors truncate block",
                      selectedSeller === s.slug
                        ? "text-primary font-bold bg-primary/10"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {s.storeName}
                  </button>
                ))}
              </div>
            </div>

            {/* In Stock Toggle */}
            <div className="pt-3 border-t border-border/60 flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">In Stock Only</span>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Sorting & Layout Switcher Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
            <span className="text-xs text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{products.length}</span> of{" "}
              <span className="font-semibold text-foreground">{totalCount}</span> results
            </span>

            <div className="flex items-center gap-3 self-end sm:self-auto">
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

              {/* Sort Selector (All 6 options supported) */}
              <div className="w-48">
                <Select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="h-9 text-xs"
                  options={[
                    { value: "popular", label: "Most Popular" },
                    { value: "bestselling", label: "Best Selling" },
                    { value: "newest", label: "Newest Arrivals" },
                    { value: "rating", label: "Highest Rated" },
                    { value: "price-asc", label: "Price: Low to High" },
                    { value: "price-desc", label: "Price: High to Low" },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Active Filter Tags */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-xs text-muted-foreground mr-1">Active filters:</span>
              {selectedCategory && (
                <Badge variant="outline" className="gap-1 text-xs">
                  Category: {selectedCategory}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory("")} />
                </Badge>
              )}
              {selectedSeller && (
                <Badge variant="outline" className="gap-1 text-xs">
                  Seller: {selectedSeller}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedSeller("")} />
                </Badge>
              )}
              {selectedBrand && (
                <Badge variant="outline" className="gap-1 text-xs">
                  Brand: {selectedBrand}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedBrand("")} />
                </Badge>
              )}
              {(minPrice !== undefined || maxPrice !== undefined) && (
                <Badge variant="outline" className="gap-1 text-xs">
                  Price: ₹{minPrice || 0} - ₹{maxPrice || "Max"}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => { setMinPrice(undefined); setMaxPrice(undefined); }} />
                </Badge>
              )}
              {minRating !== undefined && (
                <Badge variant="outline" className="gap-1 text-xs">
                  Rating: {minRating}★+
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setMinRating(undefined)} />
                </Badge>
              )}
              {discount !== undefined && (
                <Badge variant="outline" className="gap-1 text-xs text-emerald-600 border-emerald-500/30">
                  {discount}%+ Off
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setDiscount(undefined)} />
                </Badge>
              )}
              {inStockOnly && (
                <Badge variant="outline" className="gap-1 text-xs">
                  In Stock Only
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setInStockOnly(false)} />
                </Badge>
              )}
            </div>
          )}

          {/* Product Results */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div
              className={cn(
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
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
              description="We couldn't find any products matching your specific query and active filters. Try clearing some filters or searching with broader keywords."
              actionLabel="Clear All Filters"
              onAction={handleClearFilters}
            />
          )}
        </div>
      </div>
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
