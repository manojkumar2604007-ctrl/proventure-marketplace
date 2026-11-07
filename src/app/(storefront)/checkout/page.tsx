"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart-store";
import { useUIStore } from "@/store/ui-store";
import { orderService } from "@/services/order.service";
import { paymentService } from "@/services/payment.service";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShieldCheck,
  CreditCard,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, getShippingFee, getDiscount, getTotal, clearCart } = useCartStore();
  const { addToast } = useUIStore();

  const [fullName, setFullName] = useState("Priya Sharma");
  const [phone, setPhone] = useState("+91 91234 56789");
  const [street, setStreet] = useState("Flat 402, Oakwood Greens, Indiranagar");
  const [city, setCity] = useState("Bengaluru");
  const [state, setState] = useState("Karnataka");
  const [postalCode, setPostalCode] = useState("560038");

  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaidSuccess, setIsPaidSuccess] = useState(false);
  const [confirmedOrderNumber, setConfirmedOrderNumber] = useState<string | null>(null);

  const subtotal = getSubtotal();
  const shippingFee = getShippingFee();
  const discount = getDiscount();
  const total = getTotal();

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !street || !city || !postalCode) {
      addToast({
        title: "Missing Information",
        description: "Please fill in all required shipping address fields.",
        type: "error",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create Razorpay order
      const rzpOrder = await paymentService.createRazorpayOrder(
        total,
        `receipt_${Date.now()}`
      );

      // Simulate instantaneous Razorpay verification for test run
      await new Promise((res) => setTimeout(res, 1200));

      // 2. Persist Order in order service
      const newOrder = await orderService.createOrder({
        customerId: "usr_customer_1",
        customerName: fullName,
        customerEmail: "customer@example.com",
        items: items.map((i) => ({
          productId: i.productId,
          sellerId: i.sellerId,
          title: i.title,
          price: i.price,
          quantity: i.quantity,
          variantName: i.variantName,
        })),
        subtotal,
        shippingFee,
        discount,
        total,
        shippingAddress: {
          fullName,
          phone,
          street,
          city,
          state,
          postalCode,
          country: "India",
        },
        paymentMethod: paymentMethod === "razorpay" ? "Razorpay UPI / Cards" : "COD",
      });

      clearCart();
      setConfirmedOrderNumber(newOrder.orderNumber);
      setIsPaidSuccess(true);

      addToast({
        title: "Order Placed Successfully!",
        description: `Order ${newOrder.orderNumber} confirmed.`,
        type: "success",
      });
    } catch {
      addToast({
        title: "Payment Error",
        description: "An error occurred while placing your order. Please retry.",
        type: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isPaidSuccess && confirmedOrderNumber) {
    return (
      <div className="container py-20 max-w-lg mx-auto text-center space-y-6">
        <div className="h-20 w-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-foreground">Order Confirmed!</h1>
          <p className="text-sm text-muted-foreground">
            Thank you for shopping on ProVenture Marketplace.
          </p>
        </div>

        <div className="p-6 rounded-2xl border bg-card text-left space-y-3">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Order Reference:</span>
            <span className="font-bold text-foreground">{confirmedOrderNumber}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Payment Status:</span>
            <span className="font-bold text-emerald-600">PAID via Razorpay</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Total Paid:</span>
            <span className="font-bold text-foreground">{formatPrice(total)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Shipping To:</span>
            <span className="font-medium text-foreground text-right">{street}, {city}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link href="/customer/orders" className="flex-1">
            <Button size="lg" className="w-full rounded-xl text-xs font-bold gap-2">
              Track Your Order <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/products" className="flex-1">
            <Button variant="outline" size="lg" className="w-full rounded-xl text-xs font-semibold">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center max-w-md mx-auto space-y-4">
        <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto" />
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <p className="text-xs text-muted-foreground">
          You don&apos;t have any items to checkout.
        </p>
        <Link href="/products">
          <Button size="sm">Browse Marketplace</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          Secure Checkout
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Multi-Vendor Unified Dispatch & Encrypted Razorpay Gateway
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Shipping & Payment (7 Cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Section 1: Shipping Address */}
          <div className="p-6 rounded-2xl border bg-card space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b pb-3">
              <Truck className="h-4 w-4 text-primary" />
              <h3 className="font-bold text-sm text-foreground">1. Shipping Address</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Full Name *
                </label>
                <Input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="text-xs h-9"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Contact Phone *
                </label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="text-xs h-9"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-foreground block mb-1">
                  Street Address & Apartment *
                </label>
                <Input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="text-xs h-9"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  City *
                </label>
                <Input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="text-xs h-9"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  State *
                </label>
                <Input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="text-xs h-9"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Postal Code *
                </label>
                <Input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="text-xs h-9"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Country
                </label>
                <Input
                  type="text"
                  value="India"
                  disabled
                  className="text-xs h-9 bg-muted"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Payment Gateway */}
          <div className="p-6 rounded-2xl border bg-card space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b pb-3">
              <CreditCard className="h-4 w-4 text-primary" />
              <h3 className="font-bold text-sm text-foreground">2. Payment Gateway</h3>
            </div>

            <div className="space-y-3">
              <label
                onClick={() => setPaymentMethod("razorpay")}
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === "razorpay"
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:bg-muted/40"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "razorpay"}
                  onChange={() => setPaymentMethod("razorpay")}
                  className="mt-1 text-primary focus:ring-primary"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">
                      Razorpay Gateway (UPI, Cards, NetBanking, Wallets)
                    </span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold px-2 py-0.5 rounded-full">
                      Instant & Zero Fee
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Pay securely using Google Pay, PhonePe, Paytm, or any Visa, Mastercard, RuPay card.
                  </p>
                </div>
              </label>

              <label
                onClick={() => setPaymentMethod("cod")}
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === "cod"
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:bg-muted/40"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="mt-1 text-primary focus:ring-primary"
                />
                <div className="flex-1">
                  <span className="text-xs font-bold text-foreground">
                    Cash on Delivery (COD)
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Pay with cash or UPI upon courier arrival at your doorstep.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Review (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border rounded-2xl bg-card p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-foreground">Review Order ({items.length} items)</h3>

            {/* Line items preview */}
            <div className="max-h-64 overflow-y-auto divide-y pr-1">
              {items.map((item) => (
                <div key={item.id} className="py-3 flex gap-3 items-center">
                  <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted border shrink-0">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-semibold truncate leading-tight">
                      {item.title}
                    </h5>
                    <p className="text-[11px] text-muted-foreground">
                      Qty: {item.quantity} • Seller: {item.sellerName}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-foreground">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-2 text-xs border-t pt-4">
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
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-foreground border-t pt-3">
                <span>Total Due</span>
                <span className="text-primary">{formatPrice(total)}</span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isProcessing}
              size="lg"
              className="w-full rounded-xl font-bold text-xs gap-2 mt-2"
            >
              <Lock className="h-4 w-4" />
              <span>
                {isProcessing
                  ? "Processing Payment..."
                  : `Authorize & Pay ${formatPrice(total)}`}
              </span>
            </Button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground pt-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Razorpay Verified Merchant Escrow Protection</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
