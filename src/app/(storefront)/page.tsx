import React from "react";
import Link from "next/link";
import { productService } from "@/services/product.service";
import { vendorService } from "@/services/vendor.service";
import { categoryService } from "@/services/category.service";
import { HeroBanner } from "@/components/storefront/hero-banner";
import { CategoryGrid } from "@/components/storefront/category-grid";
import { ProductCard } from "@/components/storefront/product-card";
import { VendorSpotlight } from "@/components/storefront/vendor-spotlight";
import { ArrowRight, Flame, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const [featuredProductsData, categories, vendors] = await Promise.all([
    productService.getProducts({ limit: 8, featured: true }),
    categoryService.getCategories(),
    vendorService.getApprovedVendors(),
  ]);

  const featuredProducts = featuredProductsData.products;

  return (
    <div className="space-y-4">
      {/* Dynamic Hero Section */}
      <HeroBanner />

      {/* Featured Categories */}
      <CategoryGrid categories={categories} />

      {/* Featured / Trending Products Grid */}
      <section className="py-12">
        <div className="container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-500 uppercase tracking-wider">
                <Flame className="h-4 w-4 fill-current" />
                <span>Curated Highlights</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-1">
                Trending Discoveries
              </h2>
            </div>

            <Link
              href="/products"
              className="text-xs sm:text-sm font-semibold text-primary hover:underline flex items-center gap-1"
            >
              Browse All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/products">
              <Button size="lg" variant="outline" className="rounded-xl px-8 font-semibold">
                View Full Marketplace Catalog
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Vendor Spotlight */}
      <VendorSpotlight vendors={vendors} />

      {/* Promotional Callout Banner */}
      <section className="py-16">
        <div className="container">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary-950 via-primary-900 to-indigo-900 text-white p-8 sm:p-12 shadow-2xl">
            <div className="relative z-10 max-w-xl space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Multi-Vendor Creator Community
              </span>
              <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                Empower your independent business on ProVenture.
              </h3>
              <p className="text-xs sm:text-sm text-primary-200 leading-relaxed">
                Join our curated network of brands and artisans. Access thousands of high-intent buyers,
                instant automated payouts, and comprehensive merchant analytics.
              </p>
              <div className="pt-2">
                <Link href="/seller/register">
                  <Button size="lg" className="bg-white text-primary-950 hover:bg-white/90 rounded-xl font-bold shadow-lg">
                    Apply to Sell Today
                  </Button>
                </Link>
              </div>
            </div>

            <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 hidden lg:block bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          </div>
        </div>
      </section>
    </div>
  );
}
