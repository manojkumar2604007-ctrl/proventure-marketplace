"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Tag,
  ArrowLeft,
} from "lucide-react";
import { useUIStore } from "@/store/ui-store";

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    getSubtotal,
    getShippingFee,
    getDiscount,
    getTotal,
    getGroupedBySeller,
  } = useCartStore();

  const { addToast } = useUIStore();
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);

  const subtotal = getSubtotal();
  const shippingFee = getShippingFee();
  const baseDiscount = getDiscount();
  const promoDiscount = appliedPromo ? 500 : 0;
  const totalDiscount = baseDiscount + promoDiscount;
  const finalTotal = Math.max(0, subtotal + shippingFee - totalDiscount);
  const grouped = getGroupedBySeller();

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === "PROVENTURE500") {
      setAppliedPromo("PROVENTURE500");
      addToast({
        title: "Promo Applied!",
        description: "₹500 flat discount applied to your order.",
        type: "success",
      });
    } else {
      addToast({
        title: "Invalid Promo Code",
        description: "Try using code PROVENTURE500",
        type: "error",
      });
    }
  };

  if (items.length === 0) {
    return (
      <div className="container py-24 text-center max-w-md mx-auto space-y-4">
        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-extrabold text-foreground">Your cart is empty</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Looks like you haven&apos;t added any items from our curated marketplace yet.
          Explore verified tech gadgets, fashion, and artisanal home decor.
        </p>
        <div className="pt-2">
          <Link href="/products">
            <Button size="lg" className="rounded-xl font-semibold gap-2">
              Start Shopping <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {items.length} {items.length === 1 ? "product" : "products"} from{" "}
            {Object.keys(grouped).length} independent{" "}
            {Object.keys(grouped).length === 1 ? "merchant" : "merchants"}
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-rose-500 hover:underline font-semibold"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Items grouped by Seller (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {Object.entries(grouped).map(([sellerId, group]) => (
            <div key={sellerId} className="border rounded-2xl bg-card overflow-hidden shadow-sm">
              <div className="p-4 bg-muted/40 border-b flex items-center justify-between text-xs">
                <span className="font-bold text-foreground">
                  Merchant: {group.sellerName}
                </span>
                <span className="text-muted-foreground">
                  {group.items.length} {group.items.length === 1 ? "item" : "items"}
                </span>
              </div>

              <div className="divide-y">
                {group.items.map((item) => (
                  <div key={item.id} className="p-4 sm:p-5 flex gap-4 items-center">
                    <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-muted border shrink-0">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.productId}`}
                        className="font-bold text-sm text-foreground hover:text-primary transition-colors line-clamp-1"
                      >
                        {item.title}
                      </Link>
                      {item.variantName && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.variantName}
                        </p>
                      )}
                      <div className="text-xs font-bold text-foreground mt-1">
                        {formatPrice(item.price)}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Quantity */}
                      <div className="flex items-center border rounded-xl overflow-hidden bg-muted/40">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2.5 py-1.5 hover:bg-muted text-xs text-muted-foreground"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-3 text-xs font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2.5 py-1.5 hover:bg-muted text-xs text-muted-foreground"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Total for this line */}
                      <span className="text-sm font-black text-foreground min-w-[70px] text-right hidden sm:inline">
                        {formatPrice(item.price * item.quantity)}
                      </span>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 text-muted-foreground hover:text-rose-500 rounded-lg transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <Link href="/products" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" /> Continue Shopping
          </Link>
        </div>

        {/* Right: Summary & Checkout (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="border rounded-2xl bg-card p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-base text-foreground">Order Summary</h3>

            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} className="space-y-2">
              <label className="text-xs font-medium text-foreground flex items-center gap-1">
                <Tag className="h-3.5 w-3.5 text-primary" /> Promo or Voucher Code
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="e.g. PROVENTURE500"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="text-xs h-9"
                />
                <Button type="submit" size="sm" variant="outline" className="text-xs h-9">
                  Apply
                </Button>
              </div>
              {appliedPromo && (
                <p className="text-[11px] text-emerald-600 font-medium">
                  ✓ Voucher &quot;{appliedPromo}&quot; applied (-₹500)
                </p>
              )}
            </form>

            {/* Breakdown */}
            <div className="space-y-2 text-xs border-t pt-4">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Estimated Shipping</span>
                <span>{shippingFee === 0 ? "FREE" : formatPrice(shippingFee)}</span>
              </div>
              {baseDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Cart Savings (5%)</span>
                  <span>-{formatPrice(baseDiscount)}</span>
                </div>
              )}
              {promoDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Voucher Discount</span>
                  <span>-{formatPrice(promoDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-foreground border-t pt-3">
                <span>Total Amount</span>
                <span className="text-primary">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <Link href="/checkout" className="block">
              <Button size="lg" className="w-full rounded-xl font-bold gap-2 text-sm">
                Proceed to Checkout <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground pt-1">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Encrypted 256-Bit SSL Checkout with Razorpay</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
