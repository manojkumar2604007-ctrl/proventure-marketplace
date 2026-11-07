import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, ShieldCheck, Store, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden hero-gradient border-b">
      <div className="container py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines & CTA */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Next-Gen Multi-Vendor Commerce</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              Curated Excellence. Direct from{" "}
              <span className="bg-gradient-to-r from-primary via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Verified Creators.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
              Discover audiophile sound, artisan architecture decor, and master-crafted fashion
              straight from vetted independent merchants with unified checkout and buyer assurance.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/products">
                <Button size="lg" className="rounded-xl gap-2 font-semibold shadow-lg shadow-primary/25">
                  Explore Catalog <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/seller/register">
                <Button variant="outline" size="lg" className="rounded-xl font-semibold gap-2">
                  <Store className="h-4 w-4" />
                  Become a Seller
                </Button>
              </Link>
            </div>

            {/* Platform Metrics */}
            <div className="pt-8 border-t grid grid-cols-3 gap-6 max-w-md">
              <div>
                <span className="text-2xl font-black text-foreground">120+</span>
                <p className="text-xs text-muted-foreground mt-0.5">Vetted Sellers</p>
              </div>
              <div>
                <span className="text-2xl font-black text-foreground">15k+</span>
                <p className="text-xs text-muted-foreground mt-0.5">Orders Delivered</p>
              </div>
              <div>
                <span className="text-2xl font-black text-foreground">4.9/5</span>
                <p className="text-xs text-muted-foreground mt-0.5">Customer Rating</p>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-muted">
              <Image
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=80"
                alt="ProVenture Flagship Audio Showcase"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 500px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Floating Product Tag */}
              <div className="absolute bottom-6 inset-x-6 p-4 rounded-2xl bg-card/90 backdrop-blur-md border border-border shadow-lg flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-primary font-bold">
                    <Zap className="h-3.5 w-3.5 fill-current" />
                    <span>FEATURED SPOTLIGHT</span>
                  </div>
                  <h4 className="text-sm font-bold text-foreground mt-0.5">
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
            <div className="absolute -top-4 -left-4 bg-background/95 backdrop-blur-md border border-border shadow-xl rounded-2xl p-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-foreground">Buyer Protection</p>
                <p className="text-[11px] text-muted-foreground">100% Escrow Guaranteed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
