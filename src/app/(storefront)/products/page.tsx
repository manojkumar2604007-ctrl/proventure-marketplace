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
  SlidersHorizontal,
  X,
  Search,
  Check,
  ChevronDown,
  Star,
  RotateCcw,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, Checkbox, Switch } from "@/components/ui/form-fields";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { cn } from "@/lib/utils";

const BRANDS_AND_TAGS = [
  "Audio",
  "Wireless",
  "Titanium",
  "Leather",
  "Mechanical",
  "Ceramics",
  "Watches",
  "Handcrafted",
  "Ergonomic",
];

const PRICE_RANGES = [
  { label: "All Prices", min: undefined, max: undefined },
  { label: "Under ₹2,000", min: 0, max: 2000 },
  { label: "₹2,000 - ₹10,000", min: 2000, max: 10000 },
  { label: "₹10,000 - ₹25,000", min: 10000, max: 25000 },
  { label: "Above ₹25,000", min: 25000, max: undefined },
];

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vendors, setVendors] = useState<SellerProfile[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filter States initialized from URL search params
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("category") || "");
  const [sellerFilter, setSellerFilter] = useState(searchParams.get("seller") || "");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
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
  const [discountFilter, setDiscountFilter] = useState<number | undefined>(
    searchParams.get("discount") ? Number(searchParams.get("discount")) : undefined
  );
  const [inStockOnly, setInStockOnly] = useState(searchParams.get("inStock") === "true");
  const [sortOption, setSortOption] = useState<any>(searchParams.get("sort") || "newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const PAGE_SIZE = 12;

  // Sync state when URL params change
  useEffect(() => {
    const cat = searchParams.get("category") || "";
    const sel = searchParams.get("seller") || "";
    const q = searchParams.get("search") || "";
    const br = searchParams.get("brand") || "";
    setCategoryFilter(cat);
    setSellerFilter(sel);
    setSearchQuery(q);
    setSelectedBrand(br);
    setCurrentPage(1);
  }, [searchParams]);

  // Fetch products and taxonomy
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [cats, vends] = await Promise.all([
        categoryService.getCategories(),
        vendorService.getApprovedVendors(),
      ]);
      setCategories(cats);
      setVendors(vends);

      const result = await productService.getProducts({
        category: categoryFilter || undefined,
        seller: sellerFilter || undefined,
        search: (searchQuery || selectedBrand) || undefined,
        minPrice,
        maxPrice,
        rating: minRating,
        discount: discountFilter,
        sort: sortOption,
        inStock: inStockOnly || undefined,
        page: currentPage,
        limit: PAGE_SIZE,
      });

      setProducts(result.products);
      setTotalCount(result.total);
      setLoading(false);
    }

    loadData();
  }, [
    categoryFilter,
    sellerFilter,
    searchQuery,
    selectedBrand,
    minPrice,
    maxPrice,
    minRating,
    sortOption,
    inStockOnly,
    currentPage,
  ]);

  const clearAllFilters = () => {
    setCategoryFilter("");
    setSellerFilter("");
    setSearchQuery("");
    setSelectedBrand("");
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setMinRating(undefined);
    setInStockOnly(false);
    setSortOption("newest");
    setCurrentPage(1);
    router.push("/products");
  };

  const activeFiltersCount = [
    Boolean(categoryFilter),
    Boolean(sellerFilter),
    Boolean(searchQuery),
    Boolean(selectedBrand),
    minPrice !== undefined || maxPrice !== undefined,
    minRating !== undefined,
    inStockOnly,
  ].filter(Boolean).length;

  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;

  // Filter Sidebar Content (shared between desktop and mobile)
  const FilterContent = (
    <div className="space-y-6 text-sm">
      {/* Search Input Filter */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
          Keyword Search
        </label>
        <div className="relative">
          <Input
            type="search"
            placeholder="Search titles, tags..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="space-y-2 pt-2 border-t border-border/60">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Category
          </label>
          {categoryFilter && (
            <button
              onClick={() => setCategoryFilter("")}
              className="text-[11px] text-secondary hover:underline"
            >
              Clear
            </button>
          )}
        </div>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => {
              setCategoryFilter("");
              setCurrentPage(1);
            }}
            className={cn(
              "w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between",
              !categoryFilter
                ? "bg-primary text-primary-foreground font-bold shadow-subtle"
                : "text-foreground hover:bg-surface"
            )}
          >
            <span>All Departments</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setCategoryFilter(cat.slug);
                setCurrentPage(1);
              }}
              className={cn(
                "w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between",
                categoryFilter === cat.slug
                  ? "bg-primary text-primary-foreground font-bold shadow-subtle"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface"
              )}
            >
              <span className="truncate">{cat.name}</span>
              <span className="text-[10px] opacity-70">
                {cat.productCount ?? 12}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Presets & Inputs */}
      <div className="space-y-3 pt-2 border-t border-border/60">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
          Price Range (INR)
        </label>
        <div className="space-y-1">
          {PRICE_RANGES.map((range, i) => {
            const isSelected =
              minPrice === range.min && maxPrice === range.max;
            return (
              <button
                key={i}
                onClick={() => {
                  setMinPrice(range.min);
                  setMaxPrice(range.max);
                  setCurrentPage(1);
                }}
                className={cn(
                  "w-full text-left px-2.5 py-1 rounded-md text-xs transition-colors flex items-center justify-between",
                  isSelected
                    ? "text-secondary font-bold bg-secondary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface"
                )}
              >
                <span>{range.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5 text-secondary" />}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Input
            type="number"
            placeholder="Min"
            value={minPrice ?? ""}
            onChange={(e) => {
              setMinPrice(e.target.value ? Number(e.target.value) : undefined);
              setCurrentPage(1);
            }}
            className="h-8 text-xs"
          />
          <span className="text-xs text-muted-foreground">-</span>
          <Input
            type="number"
            placeholder="Max"
            value={maxPrice ?? ""}
            onChange={(e) => {
              setMaxPrice(e.target.value ? Number(e.target.value) : undefined);
              setCurrentPage(1);
            }}
            className="h-8 text-xs"
          />
        </div>
      </div>

      {/* Brand / Material Tags */}
      <div className="space-y-2 pt-2 border-t border-border/60">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Brand / Feature
          </label>
          {selectedBrand && (
            <button
              onClick={() => setSelectedBrand("")}
              className="text-[11px] text-secondary hover:underline"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {BRANDS_AND_TAGS.map((tag) => {
            const isSelected = selectedBrand === tag;
            return (
              <button
                key={tag}
                onClick={() => {
                  setSelectedBrand(isSelected ? "" : tag);
                  setCurrentPage(1);
                }}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs transition-colors border",
                  isSelected
                    ? "bg-secondary text-white border-secondary font-semibold shadow-subtle"
                    : "border-border/80 bg-background text-muted-foreground hover:text-foreground hover:bg-surface"
                )}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Verified Sellers */}
      <div className="space-y-2 pt-2 border-t border-border/60">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Verified Sellers
          </label>
          {sellerFilter && (
            <button
              onClick={() => setSellerFilter("")}
              className="text-[11px] text-secondary hover:underline"
            >
              Clear
            </button>
          )}
        </div>
        <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
          {vendors.map((vendor) => {
            const isSelected = sellerFilter === vendor.slug;
            return (
              <button
                key={vendor.id}
                onClick={() => {
                  setSellerFilter(isSelected ? "" : vendor.slug);
                  setCurrentPage(1);
                }}
                className={cn(
                  "w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between",
                  isSelected
                    ? "bg-secondary/10 text-secondary font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface"
                )}
              >
                <span className="truncate">{vendor.storeName}</span>
                {isSelected && <Check className="h-3.5 w-3.5 text-secondary" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Customer Rating Filter */}
      <div className="space-y-2 pt-2 border-t border-border/60">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Minimum Rating
          </label>
          {minRating && (
            <button
              onClick={() => setMinRating(undefined)}
              className="text-[11px] text-secondary hover:underline"
            >
              Clear
            </button>
          )}
        </div>
        <div className="space-y-1">
          {[4, 3, 2].map((stars) => {
            const isSelected = minRating === stars;
            return (
              <button
                key={stars}
                onClick={() => {
                  setMinRating(isSelected ? undefined : stars);
                  setCurrentPage(1);
                }}
                className={cn(
                  "w-full text-left px-2.5 py-1 rounded-md text-xs transition-colors flex items-center justify-between",
                  isSelected
                    ? "bg-secondary/10 text-secondary font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface"
                )}
              >
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: stars }).map((_, idx) => (
                    <Star key={idx} className="h-3.5 w-3.5 fill-current" />
                  ))}
                  <span className="text-foreground ml-1 text-xs">
                    &amp; Above
                  </span>
                </div>
                {isSelected && <Check className="h-3.5 w-3.5 text-secondary" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Availability / In-Stock Toggle */}
      <div className="pt-3 border-t border-border/60">
        <Switch
          checked={inStockOnly}
          onCheckedChange={(checked) => {
            setInStockOnly(checked);
            setCurrentPage(1);
          }}
          label="In Stock Only"
          description="Hide items currently sold out"
        />
      </div>

      {/* Clear All CTA */}
      {activeFiltersCount > 0 && (
        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="w-full text-xs gap-1.5"
            leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
          >
            Clear All Filters ({activeFiltersCount})
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="container py-8 space-y-6">
      {/* Breadcrumbs Navigation */}
      <Breadcrumbs
        items={[
          { label: "Marketplace Catalog", href: "/products" },
          ...(categoryFilter
            ? [
                {
                  label:
                    categories.find((c) => c.slug === categoryFilter)?.name ||
                    categoryFilter,
                },
              ]
            : []),
        ]}
      />

      {/* Header Banner & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <h1 className="heading-1">
            {categoryFilter
              ? categories.find((c) => c.slug === categoryFilter)?.name || "Category"
              : sellerFilter
              ? vendors.find((v) => v.slug === sellerFilter)?.storeName || "Store"
              : searchQuery
              ? `Results for "${searchQuery}"`
              : "All Marketplace Products"}
          </h1>
          <p className="subheading mt-1">
            Showing <span className="font-semibold text-foreground">{totalCount}</span> verified
            products
          </p>
        </div>

        {/* Action Controls: Mobile Filters Button, View Switcher, Sort Dropdown */}
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMobileFiltersOpen(true)}
            className="lg:hidden text-xs gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" size="sm" className="h-4 px-1 text-[10px]">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>

          {/* Grid / List View Switcher */}
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

          {/* Sorting Selector */}
          <div className="w-44">
            <Select
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 text-xs"
              options={[
                { value: "popular", label: "Most Popular" },
                { value: "bestselling", label: "Best Selling" },
                { value: "newest", label: "Newest Arrivals" },
                { value: "rating", label: "Customer Rating" },
                { value: "price-asc", label: "Price: Low to High" },
                { value: "price-desc", label: "Price: High to Low" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Active Filter Pill Tags */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
          <span className="text-xs text-muted-foreground font-medium">
            Active filters:
          </span>
          {categoryFilter && (
            <Badge variant="subtle" className="gap-1.5 text-xs">
              Category: {categories.find((c) => c.slug === categoryFilter)?.name || categoryFilter}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => setCategoryFilter("")}
              />
            </Badge>
          )}
          {sellerFilter && (
            <Badge variant="subtle" className="gap-1.5 text-xs">
              Seller: {vendors.find((v) => v.slug === sellerFilter)?.storeName || sellerFilter}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => setSellerFilter("")}
              />
            </Badge>
          )}
          {searchQuery && (
            <Badge variant="subtle" className="gap-1.5 text-xs">
              Search: "{searchQuery}"
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => setSearchQuery("")}
              />
            </Badge>
          )}
          {selectedBrand && (
            <Badge variant="subtle" className="gap-1.5 text-xs">
              Tag: {selectedBrand}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => setSelectedBrand("")}
              />
            </Badge>
          )}
          {(minPrice !== undefined || maxPrice !== undefined) && (
            <Badge variant="subtle" className="gap-1.5 text-xs">
              Price: ₹{minPrice ?? 0} - ₹{maxPrice ?? "Any"}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => {
                  setMinPrice(undefined);
                  setMaxPrice(undefined);
                }}
              />
            </Badge>
          )}
          {minRating && (
            <Badge variant="subtle" className="gap-1.5 text-xs">
              Rating: {minRating}★+
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => setMinRating(undefined)}
              />
            </Badge>
          )}
          {inStockOnly && (
            <Badge variant="subtle" className="gap-1.5 text-xs">
              In Stock Only
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => setInStockOnly(false)}
              />
            </Badge>
          )}
          <button
            onClick={clearAllFilters}
            className="text-xs text-secondary hover:underline font-semibold ml-2"
          >
            Reset all
          </button>
        </div>
      )}

      {/* Main Layout: Filters Column + Product Grid */}
      <div className="flex gap-8 items-start">
        {/* Desktop Filters Column */}
        <aside className="hidden lg:block w-72 shrink-0 rounded-2xl border border-border/80 bg-card p-5 shadow-subtle sticky top-24">
          <div className="flex items-center justify-between pb-4 border-b border-border/60">
            <h3 className="text-sm font-bold text-primary flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-secondary" /> Filter Products
            </h3>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" size="sm">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          <div className="mt-4">{FilterContent}</div>
        </aside>

        {/* Mobile Filter Slide-Over Drawer */}
        {isMobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-primary-950/60 backdrop-blur-sm"
              onClick={() => setIsMobileFiltersOpen(false)}
            />
            <div className="relative ml-auto w-full max-w-xs bg-background h-full shadow-modal p-6 overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-border/60 mb-4">
                <h3 className="text-base font-bold text-primary">
                  Filter Catalog
                </h3>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="p-1 rounded-lg text-muted-foreground hover:bg-surface"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {FilterContent}
              <div className="pt-6">
                <Button
                  className="w-full"
                  onClick={() => setIsMobileFiltersOpen(false)}
                >
                  Apply Filters ({totalCount} items)
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Product Grid / List Section */}
        <main className="flex-1 min-w-0 space-y-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div
              className={cn(
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                  : "grid grid-cols-1 gap-4"
              )}
            >
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  layout={viewMode}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Products Match Your Filter Criteria"
              description="Try broadening your price range, clearing specific seller filters, or searching with different keywords."
              actionLabel="Clear All Filters"
              onAction={clearAllFilters}
            />
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-border/60 pt-6 gap-4">
              <span className="text-xs text-muted-foreground">
                Showing page <span className="font-semibold text-foreground">{currentPage}</span> of{" "}
                <span className="font-semibold text-foreground">{totalPages}</span>
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  leftIcon={<ChevronLeft className="h-4 w-4" />}
                >
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5 && currentPage > 3) {
                      pageNum = currentPage - 3 + i;
                      if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={cn(
                          "h-8 w-8 rounded-lg text-xs font-semibold transition-colors",
                          currentPage === pageNum
                            ? "bg-primary text-primary-foreground font-bold shadow-subtle"
                            : "hover:bg-surface text-foreground"
                        )}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  rightIcon={<ChevronRight className="h-4 w-4" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-16 flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
