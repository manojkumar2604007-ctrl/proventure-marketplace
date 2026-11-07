import React from "react";
import Link from "next/link";
import { ShieldCheck, Truck, RefreshCw, Headphones, ArrowRight } from "lucide-react";

export function StorefrontFooter() {
  return (
    <footer className="border-t bg-muted/20 text-muted-foreground mt-20">
      {/* Value Proposition Badges */}
      <div className="border-b bg-card">
        <div className="container py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Verified Sellers</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Every merchant is verified with KYC & performance standards
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Fast Nationwide Delivery</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tracked shipping with real-time courier status
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
              <RefreshCw className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Buyer Protection</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                10-day easy return and refund policy on eligible orders
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 shrink-0">
              <Headphones className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">24/7 Dedicated Support</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Dispute resolution and priority customer care
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container py-12 grid grid-cols-1 md:grid-cols-5 gap-8">
        <div className="md:col-span-2 space-y-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
              P
            </div>
            <span className="font-extrabold tracking-tight text-lg text-foreground">
              PROVENTURE MARKETPLACE
            </span>
          </Link>
          <p className="text-xs leading-relaxed max-w-sm">
            The next-generation curated commerce platform connecting quality conscious consumers
            with exceptional independent artisans, tech innovators, and lifestyle brands.
          </p>
          <div className="pt-2">
            <div className="inline-flex items-center gap-2 p-1 pl-3 bg-muted rounded-full border border-border/80 text-xs">
              <span className="font-medium text-foreground">Join our curated vendors</span>
              <Link
                href="/seller/register"
                className="inline-flex items-center gap-1 bg-primary text-white px-3 py-1 rounded-full font-semibold hover:bg-primary/90 transition-colors"
              >
                Start Selling <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        <div>
          <h5 className="text-sm font-semibold text-foreground mb-3">Shop Categories</h5>
          <ul className="space-y-2 text-xs">
            <li><Link href="/products?category=electronics" className="hover:text-primary">Consumer Electronics</Link></li>
            <li><Link href="/products?category=fashion" className="hover:text-primary">Apparel & Textiles</Link></li>
            <li><Link href="/products?category=home-living" className="hover:text-primary">Home & Living</Link></li>
            <li><Link href="/products?category=beauty-wellness" className="hover:text-primary">Beauty & Wellness</Link></li>
            <li><Link href="/products?category=sports-outdoor" className="hover:text-primary">Athletics & Gear</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="text-sm font-semibold text-foreground mb-3">Portals & Account</h5>
          <ul className="space-y-2 text-xs">
            <li><Link href="/customer" className="hover:text-primary">Customer Account</Link></li>
            <li><Link href="/customer/orders" className="hover:text-primary">Order Tracking</Link></li>
            <li><Link href="/customer/wishlist" className="hover:text-primary">Saved Wishlist</Link></li>
            <li><Link href="/seller" className="hover:text-primary">Seller Dashboard</Link></li>
            <li><Link href="/admin" className="hover:text-primary">Admin Portal</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="text-sm font-semibold text-foreground mb-3">Platform Policies</h5>
          <ul className="space-y-2 text-xs">
            <li><Link href="#" className="hover:text-primary">Terms of Service</Link></li>
            <li><Link href="#" className="hover:text-primary">Privacy Policy</Link></li>
            <li><Link href="#" className="hover:text-primary">Seller Agreement & Fees</Link></li>
            <li><Link href="#" className="hover:text-primary">Refund & Return Policy</Link></li>
            <li><Link href="#" className="hover:text-primary">Grievance Officer</Link></li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground/80">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} ProVenture Marketplace Inc. All rights reserved.</p>
          <div className="flex items-center gap-3 text-xs">
            <span className="font-medium text-foreground">Secured with 256-Bit SSL & Razorpay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
