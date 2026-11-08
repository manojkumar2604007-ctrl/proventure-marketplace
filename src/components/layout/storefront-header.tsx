"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Heart,
  Menu,
  X,
  Store,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/ui/search-bar";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { useUIStore } from "@/store/ui-store";

export function StorefrontHeader() {
  const router = useRouter();
  const totalCartItems = useCartStore((state) => state.getTotalItems());
  const wishlistItems = useWishlistStore((state) => state.items);
  const { openCart, isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUIStore();

  const navCategories = [
    { name: "Electronics", slug: "electronics" },
    { name: "Fashion", slug: "fashion" },
    { name: "Home & Living", slug: "home-living" },
    { name: "Beauty & Wellness", slug: "beauty-wellness" },
    { name: "Sports & Outdoors", slug: "sports-outdoor" },
    { name: "Horology & Watches", slug: "horology-jewelry" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-md">
      {/* Top Utility Bar: Deep Navy with Emerald Accents */}
      <div className="bg-[#0A192F] text-slate-200 text-xs py-2 px-4 border-b border-slate-800">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 font-semibold text-accent">
              <Sparkles className="h-3.5 w-3.5" /> Fast Dispatch
            </span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline text-slate-300">
              Free nationwide delivery on orders over ₹2,000
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-300">
            <Link
              href="/seller"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Store className="h-3.5 w-3.5 text-amber-400" />
              <span>Seller Portal</span>
            </Link>
            <span className="text-slate-600">|</span>
            <Link
              href="/admin"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
              <span>Admin Console</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="container py-3 flex items-center justify-between gap-4">
        {/* Brand & Mobile Hamburger */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 -ml-2 rounded-lg text-foreground hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#0A192F] to-[#1D4ED8] flex items-center justify-center text-white font-extrabold text-lg shadow-subtle group-hover:scale-105 transition-transform">
              P
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold tracking-tight text-lg text-primary leading-none">
                PROVENTURE
              </span>
              <span className="text-[10px] tracking-widest text-secondary font-bold uppercase">
                Marketplace
              </span>
            </div>
          </Link>
        </div>

        {/* Global Search Bar (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-xl">
          <SearchBar />
        </div>

        {/* Actions: Wishlist, Cart, Account */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Wishlist */}
          <Link href="/customer/wishlist">
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-foreground hover:bg-surface"
              aria-label="View wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center shadow-subtle">
                  {wishlistItems.length}
                </span>
              )}
            </Button>
          </Link>

          {/* Cart Trigger */}
          <Button
            onClick={openCart}
            variant="outline"
            className="relative flex items-center gap-2 rounded-xl border-border/80 px-3.5 py-1.5 hover:border-secondary transition-colors"
            aria-label="Open cart"
          >
            <ShoppingBag className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold hidden sm:inline">Cart</span>
            {totalCartItems > 0 && (
              <Badge variant="accent" size="sm" className="h-5 px-1.5 text-[11px] font-bold">
                {totalCartItems}
              </Badge>
            )}
          </Button>

          {/* Customer Account */}
          <Link href="/customer">
            <Button
              variant="ghost"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-foreground hover:bg-surface rounded-xl"
            >
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Account</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Subcategory Bar (Desktop) */}
      <div className="hidden md:block border-t border-border/60 bg-surface/50">
        <div className="container py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-6 font-medium text-muted-foreground">
            <Link
              href="/categories"
              className="text-primary font-bold hover:text-secondary transition-colors"
            >
              All Categories
            </Link>
            {navCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="hover:text-primary transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4 text-muted-foreground font-medium">
            <Link
              href="/seller/register"
              className="text-secondary hover:underline font-semibold"
            >
              Sell on ProVenture
            </Link>
            <span>•</span>
            <Link href="/customer/orders" className="hover:text-primary">
              Track Order
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border/80 bg-background p-4 flex flex-col gap-4 shadow-modal animate-in fade-in-0 slide-in-from-top-2">
          <SearchBar onSearchSubmit={() => closeMobileMenu()} />

          <div className="flex flex-col gap-1.5 pt-2 border-t border-border/60">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Departments &amp; Categories
            </span>
            <Link
              href="/categories"
              onClick={closeMobileMenu}
              className="text-sm font-semibold text-primary py-1.5 hover:text-secondary"
            >
              All Categories
            </Link>
            {navCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                onClick={closeMobileMenu}
                className="text-sm text-muted-foreground hover:text-foreground py-1"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-1.5 pt-2 border-t border-border/60">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Marketplace Portals
            </span>
            <Link
              href="/customer"
              onClick={closeMobileMenu}
              className="text-sm py-1 font-medium text-foreground hover:text-secondary"
            >
              Customer Account & Orders
            </Link>
            <Link
              href="/seller"
              onClick={closeMobileMenu}
              className="text-sm py-1 font-medium text-foreground hover:text-secondary"
            >
              Seller Dashboard
            </Link>
            <Link
              href="/admin"
              onClick={closeMobileMenu}
              className="text-sm py-1 font-medium text-foreground hover:text-secondary"
            >
              Admin Console
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
