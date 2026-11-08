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
  Truck,
  Sparkles,
  Zap,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useUIStore } from "@/store/ui-store";

export default function CartPage() {
  const {
    items,
    coupon,
    deliveryMethod,
    removeItem,
    updateQuantity,
    clearCart,
    applyCoupon,
    removeCoupon,
    setDeliveryMethod,
    getSubtotal,
    getShippingFee,
    getDiscount,
    getTax,
    getTotal,
    getGroupedBySeller,
  } = useCartStore();

  const { addToast } = useUIStore();
  const [couponInput, setCouponInput] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const subtotal = getSubtotal();
  const shippingFee = getShippingFee();
  const discount = getDiscount();
  const tax = getTax();
  const total = getTotal();
  const grouped = getGroupedBySeller();

  // Free shipping threshold
  const FREE_SHIPPING_THRESHOLD = 2999;
  const progressToFreeShipping = Math.min(
    100,
    Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100)
  );
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) {
      addToast({
        title: "Coupon code required",
        description: "Please enter a valid promotional voucher code.",
        type: "error",
      });
      return;
    }

    setIsValidatingCoupon(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        addToast({
          title: "Coupon Failed",
          description: data.error || "Invalid or expired coupon code.",
          type: "error",
        });
        return;
      }

      const cpn = data.data;
      if (cpn.discountType === "PERCENTAGE") {
        applyCoupon(cpn.code, cpn.discountValue, undefined);
      } else {
        applyCoupon(cpn.code, undefined, cpn.discountValue);
      }

      setCouponInput("");
      addToast({
        title: "Coupon Activated!",
        description: `Voucher ${cpn.code} applied: save ₹${cpn.discountAmount.toLocaleString("en-IN")}.`,
        type: "success",
      });
    } catch {
      addToast({
        title: "Validation Error",
        description: "Failed to validate voucher code. Please try again.",
        type: "error",
      });
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    addToast({
      title: "Coupon Removed",
      description: "Promotional discount removed from cart.",
      type: "default",
    });
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
          Explore verified tech gadgets, fashion, and artisanal goods from top sellers.
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {items.length} {items.length === 1 ? "product" : "products"} across{" "}
            {Object.keys(grouped).length} independent{" "}
            {Object.keys(grouped).length === 1 ? "merchant" : "merchants"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/products">
            <Button variant="ghost" size="sm" className="text-xs gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" /> Continue Shopping
            </Button>
          </Link>
          <button
            onClick={clearCart}
            className="text-xs text-rose-500 hover:underline font-semibold"
          >
            Clear Cart
          </button>
        </div>
      </div>

      {/* Free Shipping Progress Bar */}
      <div className="p-4 rounded-2xl border bg-card/60 backdrop-blur-sm space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold flex items-center gap-1.5 text-foreground">
            <Truck className="h-4 w-4 text-primary" />
            {remainingForFreeShipping === 0 ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> You&apos;ve unlocked FREE Standard Delivery!
              </span>
            ) : (
              <span>
                Add <strong className="text-primary">{formatPrice(remainingForFreeShipping)}</strong> more to get{" "}
                <strong>FREE Standard Shipping</strong>
              </span>
            )}
          </span>
          <span className="text-[11px] font-bold text-muted-foreground">
            {progressToFreeShipping}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              remainingForFreeShipping === 0 ? "bg-emerald-500" : "bg-primary"
            }`}
            style={{ width: `${progressToFreeShipping}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Vendor-Grouped Line Items (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {Object.entries(grouped).map(([sellerId, group]) => (
            <div key={sellerId} className="border rounded-2xl bg-card overflow-hidden shadow-sm">
              {/* Seller Header */}
              <div className="p-4 bg-muted/40 border-b flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                    {group.sellerName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-bold text-foreground">
                      Dispatched by: {group.sellerName}
                    </span>
                    <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 font-semibold px-1.5 py-0.5 rounded">
                      Verified Seller
                    </span>
                  </div>
                </div>
                <span className="text-muted-foreground text-[11px]">
                  {group.items.length} {group.items.length === 1 ? "line item" : "line items"}
                </span>
              </div>

              {/* Items List */}
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
                          Variant: <span className="font-medium text-foreground">{item.variantName}</span>
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-bold text-foreground">
                          {formatPrice(item.price)}
                        </span>
                        {item.comparePrice && item.comparePrice > item.price && (
                          <span className="text-xs text-muted-foreground line-through">
                            {formatPrice(item.comparePrice)}
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground">
                          ({item.stock > 10 ? "In Stock" : `Only ${item.stock} left`})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Quantity Controller */}
                      <div className="flex items-center border rounded-xl overflow-hidden bg-muted/40">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2.5 py-1.5 hover:bg-muted text-xs text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-3 text-xs font-bold min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => {
                            if (item.quantity < item.stock) {
                              updateQuantity(item.id, item.quantity + 1);
                            } else {
                              addToast({
                                title: "Stock limit reached",
                                description: `Only ${item.stock} units available in stock.`,
                                type: "warning",
                              });
                            }
                          }}
                          className="px-2.5 py-1.5 hover:bg-muted text-xs text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Line Item Total */}
                      <span className="text-sm font-black text-foreground min-w-[80px] text-right hidden sm:inline">
                        {formatPrice(item.price * item.quantity)}
                      </span>

                      {/* Remove Button */}
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

          {/* Delivery Method Selector */}
          <div className="border rounded-2xl bg-card p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" /> Delivery Method Preference
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                onClick={() => setDeliveryMethod("standard")}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                  deliveryMethod === "standard"
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:bg-muted/40"
                }`}
              >
                <input
                  type="radio"
                  name="deliveryMethod"
                  checked={deliveryMethod === "standard"}
                  onChange={() => setDeliveryMethod("standard")}
                  className="mt-0.5 text-primary"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Standard Ground</span>
                    <span className="text-xs font-semibold text-primary">
                      {subtotal >= 2999 ? "FREE" : "₹149"}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Estimated 3-5 business days delivery across all pincodes.
                  </p>
                </div>
              </label>

              <label
                onClick={() => setDeliveryMethod("express")}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                  deliveryMethod === "express"
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:bg-muted/40"
                }`}
              >
                <input
                  type="radio"
                  name="deliveryMethod"
                  checked={deliveryMethod === "express"}
                  onChange={() => setDeliveryMethod("express")}
                  className="mt-0.5 text-primary"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1">
                      <Zap className="h-3 w-3 text-amber-500 fill-amber-500" /> Priority Air Express
                    </span>
                    <span className="text-xs font-semibold text-primary">
                      {subtotal >= 2999 ? "₹199" : "₹348"}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Guaranteed 24-48 hour delivery via dedicated air cargo.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Checkout (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="border rounded-2xl bg-card p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-base text-foreground">Order Summary</h3>

            {/* Promo Code Input */}
            <div className="space-y-3">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-primary" /> Promo or Voucher Code
              </label>

              {coupon ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <span className="font-extrabold text-emerald-800 dark:text-emerald-300">
                        {coupon.code}
                      </span>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                        {coupon.discountAmount
                          ? `₹${coupon.discountAmount} flat voucher active`
                          : `${coupon.discountPercent}% discount active`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-xs text-rose-500 hover:underline font-semibold flex items-center gap-1"
                  >
                    <XCircle className="h-4 w-4" /> Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="e.g. PROVENTURE500"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleApplyCoupon();
                        }
                      }}
                      className="text-xs h-9 uppercase"
                    />
                    <Button
                      onClick={() => handleApplyCoupon()}
                      disabled={isValidatingCoupon || !couponInput.trim()}
                      size="sm"
                      variant="outline"
                      className="text-xs h-9 font-semibold"
                    >
                      {isValidatingCoupon ? "Checking..." : "Apply"}
                    </Button>
                  </div>

                  {/* Quick-Apply Suggestion Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon("PROVENTURE500")}
                      className="text-[10px] bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 rounded-md px-2 py-0.5 font-medium transition-colors"
                    >
                      + PROVENTURE500 (₹500 off)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon("TECHNEXUS15")}
                      className="text-[10px] bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 rounded-md px-2 py-0.5 font-medium transition-colors"
                    >
                      + TECHNEXUS15 (15% off)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2.5 text-xs border-t pt-4">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal ({items.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
                <span className="font-medium text-foreground">{formatPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between text-muted-foreground">
                <span>
                  Estimated Shipping ({deliveryMethod === "express" ? "Express Priority" : "Standard"})
                </span>
                <span className="font-medium text-foreground">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    formatPrice(shippingFee)
                  )}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Voucher Savings ({coupon?.code})</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-muted-foreground text-[11px]">
                <span>Estimated GST (18% inclusive)</span>
                <span>{formatPrice(tax)}</span>
              </div>

              <div className="flex justify-between text-base font-extrabold text-foreground border-t pt-3">
                <span>Grand Total</span>
                <span className="text-primary text-lg font-black">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Checkout Action */}
            <Link href="/checkout" className="block">
              <Button size="lg" className="w-full rounded-xl font-bold gap-2 text-sm shadow-md">
                Proceed to Checkout <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <div className="space-y-2 pt-2 border-t text-[11px] text-muted-foreground text-center">
              <div className="flex items-center justify-center gap-1.5 font-medium text-emerald-600">
                <ShieldCheck className="h-4 w-4" />
                <span>Multi-Vendor Unified Escrow Guarantee</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-tight">
                Independent merchant tracking numbers will be provided upon dispatch.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
