"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { productService } from "@/services/product.service";
import { categoryService } from "@/services/category.service";
import { vendorService } from "@/services/vendor.service";
import { ProductCard } from "@/components/storefront/product-card";
import { Product, Category, SellerProfile } from "@/types";
import {
  SlidersHorizontal,
  X,
  Search,
  Check,
  ChevronDown,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vendors, setVendors] = useState<SellerProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("category") || "");
  const [sellerFilter, setSellerFilter] = useState(searchParams.get("seller") || "");
  const [searchFilter, setSearchFilter] = useState(searchParams.get("search") || "");
  const [sortOption, setSortOption] = useState<any>(searchParams.get("sort") || "newest");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

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
        search: searchFilter || undefined,
        sort: sortOption,
        inStock: inStockOnly || undefined,
      });

      setProducts(result.products);
      setLoading(false);
    }

    loadData();
  }, [categoryFilter, sellerFilter, searchFilter, sortOption, inStockOnly]);

  const clearAllFilters = () => {
    setCategoryFilter("");
    setSellerFilter("");
    setSearchFilter("");
    setSortOption("newest");
    setInStockOnly(false);
    router.push("/products");
  };

  const hasActiveFilters =
    Boolean(categoryFilter) ||
    Boolean(sellerFilter) ||
    Boolean(searchFilter) ||
    inStockOnly;

  return (
    <div className="container py-8">
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b">
        <div>
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
            Marketplace Catalog
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground mt-0.5">
            {categoryFilter
              ? categories.find((c) => c.slug === categoryFilter)?.name || "Department"
              : sellerFilter
              ? vendors.find((v) => v.slug === sellerFilter)?.storeName || "Vendor Store"
              : searchFilter
              ? `Results for "${searchFilter}"`
              : "All Products"}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Showing {products.length} curated products across verified sellers
          </p>
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden flex items-center gap-2 text-xs"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
          </Button>

          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="hidden sm:inline">Sort by:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-background border rounded-lg px-2.5 py-1.5 text-xs text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
              <option value="popular">Popularity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Layout: Filters Sidebar + Grid */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden md:block space-y-6">
          <div className="flex items-center justify-between pb-3 border-b">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              Filter By
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-primary hover:underline font-semibold"
              >
                Reset
              </button>
            )}
          </div>

          {/* Department Filter */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-foreground">Department</h4>
            <div className="space-y-1">
              <button
                onClick={() => setCategoryFilter("")}
                className={`text-xs w-full text-left py-1 px-2 rounded-md transition-colors ${
                  categoryFilter === ""
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All Departments
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.slug)}
                  className={`text-xs w-full text-left py-1 px-2 rounded-md transition-colors ${
                    categoryFilter === cat.slug
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Seller / Store Filter */}
          <div className="space-y-2 pt-4 border-t">
            <h4 className="text-xs font-semibold text-foreground">Verified Merchants</h4>
            <div className="space-y-1">
              <button
                onClick={() => setSellerFilter("")}
                className={`text-xs w-full text-left py-1 px-2 rounded-md transition-colors ${
                  sellerFilter === ""
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All Merchants
              </button>
              {vendors.map((vend) => (
                <button
                  key={vend.id}
                  onClick={() => setSellerFilter(vend.slug)}
                  className={`text-xs w-full text-left py-1 px-2 rounded-md transition-colors ${
                    sellerFilter === vend.slug
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {vend.storeName}
                </button>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="pt-4 border-t">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary h-4 w-4"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="md:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="rounded-2xl border bg-card p-4 h-80 animate-pulse flex flex-col justify-between"
                >
                  <div className="bg-muted rounded-xl h-44 w-full" />
                  <div className="space-y-2">
                    <div className="bg-muted rounded h-4 w-3/4" />
                    <div className="bg-muted rounded h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 border rounded-2xl bg-card p-8 space-y-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                No matching products found
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Try clearing your search query or adjusting your department and seller filters.
              </p>
              <Button onClick={clearAllFilters} size="sm" variant="outline" className="text-xs">
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
