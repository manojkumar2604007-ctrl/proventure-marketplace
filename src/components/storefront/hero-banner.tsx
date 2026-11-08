import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, ShieldCheck, Store, Zap, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/ui/search-bar";

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden marketplace-mesh border-b border-border/80 bg-background">
      <div className="container py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines & Search */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-xs font-semibold text-secondary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>India&apos;s Curated Multi-Vendor Marketplace</span>
            </div>

            <h1 className="heading-display leading-[1.08]">
              Curated Excellence. Direct from{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-[#1D4ED8] bg-clip-text text-transparent">
                Verified Creators.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
              Discover audiophile electronics, master-crafted horology, and artisan apparel straight from vetted independent merchants with unified Razorpay checkout and buyer assurance.
            </p>

            {/* Embedded Search Bar */}
            <div className="pt-1 max-w-xl">
              <SearchBar placeholder="Search over 15,000+ verified artisan goods..." />
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link href="/products">
                <Button size="lg" className="rounded-xl gap-2 font-bold shadow-card">
                  Explore Catalog <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/seller/register">
                <Button variant="outline" size="lg" className="rounded-xl font-semibold gap-2">
                  <Store className="h-4 w-4 text-secondary" />
                  Become a Seller
                </Button>
              </Link>
            </div>

            {/* Platform Trust Metrics */}
            <div className="pt-6 border-t border-border/60 grid grid-cols-3 gap-6 max-w-md">
              <div>
                <span className="text-2xl font-black text-primary">120+</span>
                <p className="text-xs text-muted-foreground mt-0.5">Vetted Sellers</p>
              </div>
              <div>
                <span className="text-2xl font-black text-primary">15k+</span>
                <p className="text-xs text-muted-foreground mt-0.5">Orders Delivered</p>
              </div>
              <div>
                <span className="text-2xl font-black text-primary">4.9/5</span>
                <p className="text-xs text-muted-foreground mt-0.5">Customer Rating</p>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-modal border border-border/80 bg-surface">
              <Image
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=80"
                alt="ProVenture Flagship Showcase"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 500px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

              {/* Floating Product Spotlight Tag */}
              <div className="absolute bottom-6 inset-x-6 p-4 rounded-2xl bg-card/95 backdrop-blur-md border border-border/80 shadow-modal flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-secondary font-bold">
                    <Zap className="h-3.5 w-3.5 fill-current" />
                    <span>FEATURED SPOTLIGHT</span>
                  </div>
                  <h4 className="text-sm font-bold text-primary mt-0.5">
                    AuraWave Pro Spatial ANC
                  </h4>
                  <p className="text-xs text-muted-foreground">by TechNexus Innovations</p>
                </div>
                <Link href="/products/aurawave-pro-spatial-anc-headphones">
                  <Button size="sm" className="rounded-xl text-xs font-semibold">
                    View
                  </Button>
                </Link>
              </div>
            </div>

            {/* Floating Trust Badge */}
            <div className="absolute -top-4 -left-4 bg-background/95 backdrop-blur-md border border-border/80 shadow-modal rounded-2xl p-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-accent">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-primary block leading-tight">
                  100% Verified
                </span>
                <span className="text-[10px] text-muted-foreground">Direct Studio Warranty</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
