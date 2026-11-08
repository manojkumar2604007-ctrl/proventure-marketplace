"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/cart-store";
import { useUIStore } from "@/store/ui-store";
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
  MapPin,
  Plus,
  Zap,
  Tag,
  AlertCircle,
  Package,
} from "lucide-react";
import { Order } from "@/types";

interface SavedAddress {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const {
    items,
    coupon,
    deliveryMethod,
    setDeliveryMethod,
    getSubtotal,
    getShippingFee,
    getDiscount,
    getTax,
    getTotal,
    getGroupedBySeller,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCartStore();
  const { addToast } = useUIStore();

  // Address state
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("new");
  const [useNewAddress, setUseNewAddress] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("Karnataka");
  const [postalCode, setPostalCode] = useState("");

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");
  const [couponInput, setCouponInput] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Submission state
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const subtotal = getSubtotal();
  const shippingFee = getShippingFee();
  const discount = getDiscount();
  const tax = getTax();
  const total = getTotal();
  const grouped = getGroupedBySeller();

  // Load saved addresses for user
  useEffect(() => {
    async function fetchAddresses() {
      try {
        const res = await fetch("/api/customer/addresses");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data && data.data.length > 0) {
            setSavedAddresses(data.data);
            const defaultAddr = data.data.find((a: SavedAddress) => a.isDefault) || data.data[0];
            setSelectedAddressId(defaultAddr.id);
            setFullName(defaultAddr.fullName);
            setPhone(defaultAddr.phone);
            setStreet(defaultAddr.street);
            setCity(defaultAddr.city);
            setState(defaultAddr.state || "Karnataka");
            setPostalCode(defaultAddr.postalCode);
            setUseNewAddress(false);
            return;
          }
        }
      } catch {
        // Fallback to manual entry
      }

      // Default mock if none returned
      setFullName((session?.user?.name as string) || "Priya Sharma");
      setPhone("+91 91234 56789");
      setStreet("Flat 402, Oakwood Greens, 100 Feet Rd, Indiranagar");
      setCity("Bengaluru");
      setState("Karnataka");
      setPostalCode("560038");
      setUseNewAddress(true);
    }

    fetchAddresses();
  }, [session]);

  const handleSelectSavedAddress = (addr: SavedAddress) => {
    setSelectedAddressId(addr.id);
    setUseNewAddress(false);
    setFullName(addr.fullName);
    setPhone(addr.phone);
    setStreet(addr.street);
    setCity(addr.city);
    setState(addr.state || "Karnataka");
    setPostalCode(addr.postalCode);
  };

  const handleSelectNewAddress = () => {
    setSelectedAddressId("new");
    setUseNewAddress(true);
    setFullName((session?.user?.name as string) || "");
    setPhone("");
    setStreet("");
    setCity("");
    setState("Karnataka");
    setPostalCode("");
  };

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

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
        title: "Coupon Applied",
        description: `Saved ₹${cpn.discountAmount} with code ${cpn.code}`,
        type: "success",
      });
    } catch {
      addToast({
        title: "Error",
        description: "Failed to validate coupon.",
        type: "error",
      });
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !phone.trim() || !street.trim() || !city.trim() || !postalCode.trim()) {
      addToast({
        title: "Incomplete Address",
        description: "Please complete all required shipping address fields.",
        type: "error",
      });
      return;
    }

    if (items.length === 0) {
      addToast({
        title: "Cart is empty",
        description: "Cannot checkout an empty shopping cart.",
        type: "error",
      });
      return;
    }

    setIsProcessing(true);

    try {
      let rzpOrderId: string | undefined = undefined;
      let rzpPaymentId: string | undefined = undefined;

      // 1. If Razorpay, generate order token
      if (paymentMethod === "razorpay") {
        const rzpResponse = await paymentService.createRazorpayOrder(
          total,
          `rcpt_${Date.now()}`
        );
        rzpOrderId = rzpResponse.id;
        rzpPaymentId = `pay_${Math.random().toString(36).substring(2, 14)}`;

        // Simulated payment gateway authorization latency
        await new Promise((res) => setTimeout(res, 900));
      }

      // 2. Submit order to server API with Authoritative Server Pricing
      // Note: We only send product IDs, variant IDs, quantities, address, coupon, and payment tokens.
      // The server recalculates and enforces authoritative prices from the database.
      const payload = {
        customerId: (session?.user as any)?.id || "usr_customer_1",
        customerName: fullName,
        customerEmail: session?.user?.email || "customer@example.com",
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId || undefined,
          quantity: i.quantity,
        })),
        shippingAddress: {
          fullName,
          phone,
          street,
          city,
          state,
          postalCode,
          country: "India",
        },
        deliveryMethod,
        couponCode: coupon?.code || undefined,
        paymentMethod: paymentMethod === "razorpay" ? "RAZORPAY" : "COD",
        razorpayOrderId: rzpOrderId,
        razorpayPaymentId: rzpPaymentId,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to process order.");
      }

      // Order created successfully!
      const createdOrder: Order = data.data;
      setConfirmedOrder(createdOrder);
      clearCart();

      addToast({
        title: "Order Placed Successfully!",
        description: `Order #${createdOrder.orderNumber} confirmed.`,
        type: "success",
      });
    } catch (err: any) {
      console.error("Checkout submission failed:", err);
      addToast({
        title: "Checkout Error",
        description: err.message || "An error occurred while creating your order. Please retry.",
        type: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Success Confirmation Screen
  if (confirmedOrder) {
    // Group line items by seller for multi-vendor fulfillment view
    const sellerDispatches = confirmedOrder.items.reduce((acc, item) => {
      const sellerKey = item.sellerId || "default";
      if (!acc[sellerKey]) {
        acc[sellerKey] = {
          sellerName: item.seller?.storeName || item.title.includes("Audio") ? "SoundCraft Pro" : "Verified Merchant",
          carrier: item.carrier || "BlueDart Express",
          trackingNumber: item.trackingNumber || `TRK-${confirmedOrder.orderNumber}`,
          fulfillmentStatus: item.fulfillmentStatus || "CONFIRMED",
          items: [],
        };
      }
      acc[sellerKey].items.push(item);
      return acc;
    }, {} as Record<string, { sellerName: string; carrier: string; trackingNumber: string; fulfillmentStatus: string; items: typeof confirmedOrder.items }>);

    return (
      <div className="container py-16 max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <div className="h-20 w-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Order Confirmed!</h1>
          <p className="text-sm text-muted-foreground">
            Thank you for shopping on ProVenture Marketplace. Your order has been placed successfully.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="border rounded-2xl bg-card p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">Order Reference</span>
              <span className="font-extrabold text-base text-primary">
                #{confirmedOrder.orderNumber}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Payment Status</span>
              <span
                className={`font-bold inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full ${
                  confirmedOrder.paymentStatus === "PAID"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400"
                }`}
              >
                ● {confirmedOrder.paymentStatus === "PAID" ? "PAID via Razorpay" : "PENDING (Cash on Delivery)"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Total Authorized</span>
              <span className="font-extrabold text-base text-foreground">
                {formatPrice(confirmedOrder.total)}
              </span>
            </div>
          </div>

          {/* Shipping Address Snapshot */}
          <div className="space-y-1.5 text-xs">
            <h4 className="font-bold text-foreground flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-primary" /> Delivery Destination
            </h4>
            <p className="text-muted-foreground pl-5 leading-relaxed">
              <strong>{confirmedOrder.shippingAddress.fullName}</strong> ({confirmedOrder.shippingAddress.phone})<br />
              {confirmedOrder.shippingAddress.street}, {confirmedOrder.shippingAddress.city},{" "}
              {confirmedOrder.shippingAddress.state} - {confirmedOrder.shippingAddress.postalCode}
            </p>
          </div>

          {/* Multi-Seller Fulfillment Dispatches */}
          <div className="space-y-4 pt-2 border-t">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                <Package className="h-4 w-4 text-primary" /> Multi-Vendor Dispatch Shipments ({Object.keys(sellerDispatches).length})
              </h4>
              <span className="text-[11px] text-muted-foreground">
                Independent Carrier Tracking
              </span>
            </div>

            <div className="space-y-3">
              {Object.entries(sellerDispatches).map(([sellerKey, dispatch], idx) => (
                <div key={sellerKey} className="border rounded-xl p-4 bg-muted/20 space-y-3 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
                    <span className="font-bold text-foreground">
                      Package {idx + 1}: {dispatch.sellerName}
                    </span>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">
                        Carrier: {dispatch.carrier}
                      </span>
                      <span className="font-mono text-muted-foreground">
                        AWB: {dispatch.trackingNumber}
                      </span>
                    </div>
                  </div>

                  <div className="divide-y divide-border/60">
                    {dispatch.items.map((item) => (
                      <div key={item.id} className="py-1.5 flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">
                          {item.title} {item.variantName ? `(${item.variantName})` : ""} × {item.quantity}
                        </span>
                        <span className="font-bold text-foreground">
                          {formatPrice(item.total)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Navigation */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Link href="/customer/orders" className="flex-1">
              <Button size="lg" className="w-full rounded-xl text-xs font-bold gap-2">
                View in My Orders <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/products" className="flex-1">
              <Button variant="outline" size="lg" className="w-full rounded-xl text-xs font-semibold">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If cart is empty and not confirmed
  if (items.length === 0) {
    return (
      <div className="container py-20 text-center max-w-md mx-auto space-y-4">
        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <p className="text-xs text-muted-foreground">
          You don&apos;t have any items to checkout. Add items from verified merchants first.
        </p>
        <Link href="/products">
          <Button size="sm" className="rounded-xl font-bold">
            Browse Marketplace
          </Button>
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
          Multi-Vendor Unified Dispatch • Authoritative Server Pricing • 256-Bit SSL Protection
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Shipping Address & Delivery & Payment (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Shipping Address */}
          <div className="p-6 rounded-2xl border bg-card space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <h3 className="font-bold text-sm text-foreground">1. Shipping Address</h3>
              </div>
              {savedAddresses.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectNewAddress}
                  className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" /> Add New Address
                </button>
              )}
            </div>

            {/* Saved Addresses Selector */}
            {savedAddresses.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground block">
                  Select a saved destination:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedAddresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id && !useNewAddress;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => handleSelectSavedAddress(addr)}
                        className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border hover:bg-muted/40"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-foreground truncate">
                            {addr.fullName}
                          </span>
                          {addr.isDefault && (
                            <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground text-[11px] line-clamp-2">
                          {addr.street}, {addr.city}, {addr.state} - {addr.postalCode}
                        </p>
                        <p className="text-muted-foreground text-[10px] mt-1 font-mono">
                          {addr.phone}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Address Input Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Full Name *
                </label>
                <Input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="text-xs h-9"
                  placeholder="e.g. Priya Sharma"
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
                  placeholder="+91 98765 43210"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-foreground block mb-1">
                  Street Address & Flat / Building *
                </label>
                <Input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="text-xs h-9"
                  placeholder="e.g. Flat 402, Oakwood Greens, 100 Feet Rd"
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
                  placeholder="e.g. Bengaluru"
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
                  placeholder="Karnataka"
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
                  placeholder="560038"
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
                  className="text-xs h-9 bg-muted text-muted-foreground"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Delivery Preference */}
          <div className="p-6 rounded-2xl border bg-card space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b pb-3">
              <Truck className="h-4 w-4 text-primary" />
              <h3 className="font-bold text-sm text-foreground">2. Delivery Speed</h3>
            </div>

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
                  name="checkoutDelivery"
                  checked={deliveryMethod === "standard"}
                  onChange={() => setDeliveryMethod("standard")}
                  className="mt-0.5 text-primary"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Standard Ground</span>
                    <span className="text-xs font-bold text-primary">
                      {subtotal >= 2999 ? "FREE" : "₹149"}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Estimated 3-5 business days delivery.
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
                  name="checkoutDelivery"
                  checked={deliveryMethod === "express"}
                  onChange={() => setDeliveryMethod("express")}
                  className="mt-0.5 text-primary"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1">
                      <Zap className="h-3 w-3 text-amber-500 fill-amber-500" /> Priority Air Express
                    </span>
                    <span className="text-xs font-bold text-primary">
                      {subtotal >= 2999 ? "₹199" : "₹348"}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Guaranteed 24-48 hour delivery via air cargo.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Section 3: Payment Gateway */}
          <div className="p-6 rounded-2xl border bg-card space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b pb-3">
              <CreditCard className="h-4 w-4 text-primary" />
              <h3 className="font-bold text-sm text-foreground">3. Payment Method</h3>
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
                      Razorpay Gateway (UPI, Cards, NetBanking)
                    </span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold px-2 py-0.5 rounded-full">
                      Instant & Zero Surcharge
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Pay securely using Google Pay, PhonePe, Paytm UPI, or Visa, MasterCard, RuPay cards.
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
                    Pay with cash or scan delivery agent UPI QR upon courier arrival at your doorstep.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Review & Breakdown (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border rounded-2xl bg-card p-6 shadow-sm space-y-5">
            <h3 className="font-bold text-sm text-foreground flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs text-muted-foreground font-normal">
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            </h3>

            {/* Multi-Seller Items Grouping */}
            <div className="max-h-72 overflow-y-auto space-y-4 pr-1">
              {Object.entries(grouped).map(([sellerId, group]) => (
                <div key={sellerId} className="border rounded-xl p-3 bg-muted/20 space-y-2">
                  <div className="flex items-center justify-between text-[11px] border-b pb-1.5">
                    <span className="font-bold text-foreground">
                      Dispatched by: {group.sellerName}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {group.items.length} {group.items.length === 1 ? "item" : "items"}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {group.items.map((item) => (
                      <div key={item.id} className="flex gap-2.5 items-center">
                        <div className="relative h-11 w-11 rounded-lg overflow-hidden bg-muted border shrink-0">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-medium truncate text-foreground leading-tight">
                            {item.title}
                          </h5>
                          <p className="text-[10px] text-muted-foreground">
                            Qty: {item.quantity} {item.variantName ? `• ${item.variantName}` : ""}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-foreground">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Multi-Vendor Fulfillment Notice */}
            <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/15 text-[11px] text-muted-foreground flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>
                Items from multiple independent merchants will be dispatched in separate packages with distinct tracking IDs.
              </span>
            </div>

            {/* Coupon Section */}
            <div className="space-y-2 border-t pt-3">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Tag className="h-3.5 w-3.5 text-primary" /> Promo Voucher
              </label>

              {coupon ? (
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300">
                    {coupon.code} (-₹{discount.toLocaleString("en-IN")})
                  </span>
                  <button
                    type="button"
                    onClick={() => removeCoupon()}
                    className="text-[11px] text-rose-500 hover:underline font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="text-xs h-8 uppercase"
                  />
                  <Button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={isValidatingCoupon || !couponInput.trim()}
                    size="sm"
                    variant="outline"
                    className="text-xs h-8"
                  >
                    Apply
                  </Button>
                </div>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 text-xs border-t pt-3">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping ({deliveryMethod === "express" ? "Express" : "Standard"})</span>
                <span>{shippingFee === 0 ? "FREE" : formatPrice(shippingFee)}</span>
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
              <div className="flex justify-between text-base font-extrabold text-foreground border-t pt-2.5">
                <span>Total Due</span>
                <span className="text-primary text-lg font-black">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Submit Action */}
            <Button
              type="submit"
              disabled={isProcessing}
              size="lg"
              className="w-full rounded-xl font-bold text-xs gap-2 mt-2 shadow-md"
            >
              <Lock className="h-4 w-4" />
              <span>
                {isProcessing
                  ? "Verifying & Creating Order..."
                  : paymentMethod === "cod"
                  ? `Confirm Order with COD (${formatPrice(total)})`
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
