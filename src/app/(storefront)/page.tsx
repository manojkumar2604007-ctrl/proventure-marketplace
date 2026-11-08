import React from "react";
import Link from "next/link";
import { productService } from "@/services/product.service";
import { vendorService } from "@/services/vendor.service";
import { categoryService } from "@/services/category.service";
import { HeroBanner } from "@/components/storefront/hero-banner";
import { CategoryGrid } from "@/components/storefront/category-grid";
import { ProductCard } from "@/components/storefront/product-card";
import { VendorSpotlight } from "@/components/storefront/vendor-spotlight";
import { NewsletterSection } from "@/components/storefront/newsletter-section";
import {
  ArrowRight,
  Flame,
  Sparkles,
  Award,
  Clock,
  Percent,
  CheckCircle2,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const revalidate = 60; // ISR cache revalidation every 60s

export default async function HomePage() {
  const [allProductsData, categories, vendors] = await Promise.all([
    productService.getProducts({ limit: 24 }),
    categoryService.getCategories(),
    vendorService.getApprovedVendors(),
  ]);

  const allProducts = allProductsData.products;

  // Split into curated storefront sections
  const trendingProducts = allProducts.slice(0, 4);
  const bestSellers = allProducts.slice(4, 8);
  const newArrivals = allProducts.slice(8, 12);

  return (
    <div className="space-y-6">
      {/* 1. Dynamic Hero Section */}
      <HeroBanner />

      {/* 2. Featured Categories Section */}
      <CategoryGrid categories={categories} />

      {/* 3. Trending Products Section */}
      <section className="py-10">
        <div className="container">
          <div className="flex items-end justify-between mb-8 pb-3 border-b border-border/60">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 uppercase tracking-wider">
                <Flame className="h-4 w-4 fill-current" />
                <span>Curated Highlights</span>
              </div>
              <h2 className="heading-1 mt-1">Trending Discoveries</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Top rated innovations and artisan lifestyle goods capturing shopper interest this week.
              </p>
            </div>

            <Link
              href="/products?sort=popular"
              className="text-xs sm:text-sm font-semibold text-secondary hover:underline flex items-center gap-1 shrink-0"
            >
              View Trending <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Promotional Flash Deals Banner */}
      <section className="py-6">
        <div className="container">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0A192F] via-[#1D4ED8] to-[#059669] p-8 sm:p-12 text-white shadow-modal">
            <div className="relative z-10 max-w-xl space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                  ⚡ Limited-Time Flash Event
                </span>
                <span className="text-xs font-semibold text-emerald-300">
                  Up to 40% Off Select Artisans
                </span>
              </div>

              <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                Direct Merchant Deals with Zero Platform Markups.
              </h3>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                Enjoy direct factory & studio pricing across mechanical keyboards, handcrafted leather goods, and high-fidelity audio equipment.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href="/products?featured=true">
                  <Button
                    size="lg"
                    className="bg-white text-[#0A192F] hover:bg-white/90 rounded-xl font-bold shadow-lg"
                  >
                    Shop Flash Deals <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                </Link>
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Free Shipping on ₹2,000+</span>
                </div>
              </div>
            </div>

            <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 hidden lg:block bg-[radial-gradient(#fff_2px,transparent_2px)] [background-size:20px_20px]" />
          </div>
        </div>
      </section>

      {/* 5. Best Sellers Section */}
      <section className="py-10">
        <div className="container">
          <div className="flex items-end justify-between mb-8 pb-3 border-b border-border/60">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 uppercase tracking-wider">
                <Award className="h-4 w-4" />
                <span>Verified Classics</span>
              </div>
              <h2 className="heading-1 mt-1">Marketplace Best Sellers</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Consistently highest-rated products with verified customer reviews and zero-return track records.
              </p>
            </div>

            <Link
              href="/products?sort=rating"
              className="text-xs sm:text-sm font-semibold text-secondary hover:underline flex items-center gap-1 shrink-0"
            >
              Browse Best Sellers <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. New Arrivals Section */}
      <section className="py-10">
        <div className="container">
          <div className="flex items-end justify-between mb-8 pb-3 border-b border-border/60">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-accent uppercase tracking-wider">
                <Sparkles className="h-4 w-4" />
                <span>Fresh Drop</span>
              </div>
              <h2 className="heading-1 mt-1">New Arrivals</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Newly vetted listings and seasonal collections launched this week by authorized sellers.
              </p>
            </div>

            <Link
              href="/products?sort=newest"
              className="text-xs sm:text-sm font-semibold text-secondary hover:underline flex items-center gap-1 shrink-0"
            >
              View All New Drops <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 7. Featured Sellers Spotlight */}
      <VendorSpotlight vendors={vendors} />

      {/* 8. Creator Community Promotional Banner */}
      <section className="py-12">
        <div className="container">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0A192F] via-[#102A43] to-slate-900 text-white p-8 sm:p-12 shadow-card border border-slate-800">
            <div className="relative z-10 max-w-xl space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-md text-amber-400">
                <Store className="h-3.5 w-3.5" /> Multi-Vendor Creator Community
              </span>
              <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                Empower your independent business on ProVenture.
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Join our curated network of brands and artisans. Access thousands of high-intent buyers,
                instant automated payouts via Razorpay, and comprehensive merchant analytics.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link href="/seller/register">
                  <Button size="lg" className="bg-white text-[#0A192F] hover:bg-white/90 rounded-xl font-bold shadow-lg">
                    Apply to Sell Today
                  </Button>
                </Link>
                <Link href="/seller">
                  <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 rounded-xl">
                    Seller Portal
                  </Button>
                </Link>
              </div>
            </div>

            <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 hidden lg:block bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          </div>
        </div>
      </section>

      {/* 9. Newsletter Subscription Section */}
      <NewsletterSection />
    </div>
  );
}
