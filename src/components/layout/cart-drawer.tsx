"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useUIStore } from "@/store/ui-store";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";

export function CartDrawer() {
  const { isCartOpen, closeCart } = useUIStore();
  const {
    items,
    removeItem,
    updateQuantity,
    getSubtotal,
    getShippingFee,
    getDiscount,
    getTotal,
    getGroupedBySeller,
  } = useCartStore();

  const subtotal = getSubtotal();
  const shippingFee = getShippingFee();
  const discount = getDiscount();
  const total = getTotal();
  const grouped = getGroupedBySeller();
  const freeShippingThreshold = 2000;
  const progressToFreeShipping = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer content */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="relative w-full max-w-md bg-background h-full shadow-2xl flex flex-col z-10"
          >
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-base">Your Cart</h3>
                <span className="text-xs text-muted-foreground">
                  ({items.length} {items.length === 1 ? "item" : "items"})
                </span>
              </div>
              <button
                onClick={closeCart}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Free Shipping Progress */}
            <div className="bg-muted/40 p-3 border-b text-xs">
              {subtotal >= freeShippingThreshold ? (
                <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                  <ShieldCheck className="h-4 w-4" />
                  <span>You qualified for FREE shipping!</span>
                </div>
              ) : (
                <div>
                  <p className="text-muted-foreground mb-1.5">
                    Add <span className="font-semibold text-foreground">{formatPrice(freeShippingThreshold - subtotal)}</span> more for FREE delivery
                  </p>
                  <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${progressToFreeShipping}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Item List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                    <ShoppingBag className="h-8 w-8" />
                  </div>
                  <h4 className="font-semibold text-foreground">Your cart is empty</h4>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    Explore our curated marketplace and add products from independent artisans and brands.
                  </p>
                  <Button
                    onClick={closeCart}
                    variant="default"
                    size="sm"
                    className="mt-2"
                  >
                    Start Shopping
                  </Button>
                </div>
              ) : (
                Object.entries(grouped).map(([sellerId, group]) => (
                  <div key={sellerId} className="border rounded-xl p-3 bg-card space-y-3">
                    <div className="flex items-center justify-between border-b pb-2 text-xs">
                      <span className="font-semibold text-foreground flex items-center gap-1">
                        Seller: {group.sellerName}
                      </span>
                      <span className="text-muted-foreground">
                        {group.items.length} items
                      </span>
                    </div>

                    <div className="space-y-3">
                      {group.items.map((item) => (
                        <div key={item.id} className="flex gap-3 items-center">
                          <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted shrink-0 border">
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-semibold truncate leading-tight">
                              {item.title}
                            </h5>
                            {item.variantName && (
                              <span className="text-[11px] text-muted-foreground block truncate">
                                {item.variantName}
                              </span>
                            )}
                            <div className="text-xs font-bold text-foreground mt-1">
                              {formatPrice(item.price)}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1.5">
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-muted-foreground hover:text-rose-500 transition-colors p-1"
                              aria-label="Remove item"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>

                            <div className="flex items-center border rounded-md overflow-hidden bg-muted/40">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="px-1.5 py-0.5 hover:bg-muted text-xs"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="px-2 text-xs font-semibold">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="px-1.5 py-0.5 hover:bg-muted text-xs"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer & Checkout */}
            {items.length > 0 && (
              <div className="p-4 border-t bg-muted/20 space-y-3">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>{shippingFee === 0 ? "FREE" : formatPrice(shippingFee)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Order Savings (5%)</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-foreground border-t pt-2">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link href="/cart" onClick={closeCart} className="w-full">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      View Cart
                    </Button>
                  </Link>
                  <Link href="/checkout" onClick={closeCart} className="w-full">
                    <Button size="sm" className="w-full text-xs gap-1">
                      Checkout <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
