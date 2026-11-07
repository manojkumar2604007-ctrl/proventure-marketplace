"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingBag,
  Heart,
  Menu,
  X,
  Store,
  ShieldCheck,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { useUIStore } from "@/store/ui-store";

export function StorefrontHeader() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const totalCartItems = useCartStore((state) => state.getTotalItems());
  const wishlistItems = useWishlistStore((state) => state.items);
  const { openCart, isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUIStore();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      closeMobileMenu();
    }
  };

  const navCategories = [
    { name: "Electronics", slug: "electronics" },
    { name: "Fashion", slug: "fashion" },
    { name: "Home & Living", slug: "home-living" },
    { name: "Beauty & Wellness", slug: "beauty-wellness" },
    { name: "Sports & Outdoors", slug: "sports-outdoor" },
    { name: "Horology & Watches", slug: "horology-jewelry" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-primary-950 via-primary-900 to-indigo-950 text-primary-100 text-xs py-2 px-4">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" /> Fast Dispatch
            </span>
            <span className="hidden sm:inline text-primary-200">|</span>
            <span className="hidden sm:inline">
              Free nationwide delivery on orders over ₹2,000
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/seller"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Store className="h-3.5 w-3.5 text-amber-400" />
              <span>Seller Portal</span>
            </Link>
            <span className="text-primary-700">|</span>
            <Link
              href="/admin"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
              <span>Admin Console</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="container py-3.5 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 -ml-2 rounded-lg hover:bg-muted"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-600 to-indigo-700 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
              P
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold tracking-tight text-lg text-foreground leading-none">
                PROVENTURE
              </span>
              <span className="text-[10px] tracking-widest text-primary font-bold uppercase">
                Marketplace
              </span>
            </div>
          </Link>
        </div>

        {/* Global Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex flex-1 max-w-xl relative items-center"
        >
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search across verified sellers, products, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-24 py-2 text-sm bg-muted/60 border border-border/80 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all"
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 rounded-full px-3 text-xs"
            >
              Search
            </Button>
          </div>
        </form>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Wishlist */}
          <Link href="/customer/wishlist">
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-foreground"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center shadow-sm">
                  {wishlistItems.length}
                </span>
              )}
            </Button>
          </Link>

          {/* Cart Trigger */}
          <Button
            onClick={openCart}
            variant="outline"
            className="relative flex items-center gap-2 rounded-full border-border/80 px-3 py-1.5 hover:border-primary transition-colors"
          >
            <ShoppingBag className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold hidden sm:inline">Cart</span>
            {totalCartItems > 0 && (
              <Badge variant="default" className="h-5 px-1.5 text-[11px] font-bold">
                {totalCartItems}
              </Badge>
            )}
          </Button>

          {/* Customer Account */}
          <Link href="/customer">
            <Button
              variant="ghost"
              className="hidden sm:flex items-center gap-1 text-xs font-medium text-foreground hover:bg-muted"
            >
              <span>Account</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Subcategory Bar (Desktop) */}
      <div className="hidden md:block border-t border-border/50 bg-muted/30">
        <div className="container py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-6 font-medium text-muted-foreground">
            <Link
              href="/products"
              className="text-foreground font-semibold hover:text-primary transition-colors"
            >
              All Departments
            </Link>
            {navCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="hover:text-primary transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4 text-muted-foreground font-medium">
            <Link
              href="/seller/register"
              className="text-primary hover:underline font-semibold"
            >
              Sell on ProVenture
            </Link>
            <span>•</span>
            <Link href="/customer/orders" className="hover:text-foreground">
              Track Order
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-background p-4 flex flex-col gap-4 shadow-xl">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products & vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-muted rounded-lg border focus:outline-none"
            />
          </form>

          <div className="flex flex-col gap-2 pt-2 border-t">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Departments
            </span>
            <Link
              href="/products"
              onClick={closeMobileMenu}
              className="text-sm font-medium py-1.5"
            >
              All Products
            </Link>
            {navCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                onClick={closeMobileMenu}
                className="text-sm text-muted-foreground hover:text-foreground py-1"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Portals
            </span>
            <Link
              href="/customer"
              onClick={closeMobileMenu}
              className="text-sm py-1 hover:text-primary"
            >
              Customer Account & Orders
            </Link>
            <Link
              href="/seller"
              onClick={closeMobileMenu}
              className="text-sm py-1 hover:text-primary"
            >
              Seller Dashboard
            </Link>
            <Link
              href="/admin"
              onClick={closeMobileMenu}
              className="text-sm py-1 hover:text-primary"
            >
              Admin Console
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
