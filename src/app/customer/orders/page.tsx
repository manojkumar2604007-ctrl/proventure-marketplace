"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Order, OrderStatus } from "@/types";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileText,
  AlertCircle,
  RotateCcw,
  Search,
  Filter,
  DollarSign,
  Download,
} from "lucide-react";

export default function CustomerOrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      try {
        const res = await fetch("/api/orders");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setOrders(data.data);
          }
        }
      } catch (err) {
        console.error("Failed to load customer orders:", err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [session]);

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== "ALL") {
      if (statusFilter === "ACTIVE") {
        if (!["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"].includes(order.status)) {
          return false;
        }
      } else if (statusFilter === "RETURNS_REFUNDS") {
        if (!["RETURN_REQUESTED", "RETURNED", "REFUNDED"].includes(order.status) && order.refundStatus === "NONE") {
          return false;
        }
      } else if (order.status !== statusFilter) {
        return false;
      }
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchNumber = order.orderNumber.toLowerCase().includes(q);
      const matchItem = order.items.some((i) => i.title.toLowerCase().includes(q));
      if (!matchNumber && !matchItem) return false;
    }

    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <h1 className="heading-1">My Orders &amp; Shipment Tracking</h1>
          <p className="subheading mt-1">
            Track multi-vendor shipments, monitor refund approvals, and access GST tax invoices.
          </p>
        </div>
        <Link href="/products">
          <Button size="sm" variant="outline" className="text-xs">
            Browse More Products
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Order # or item name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs h-9 bg-card"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {[
            { key: "ALL", label: "All Orders" },
            { key: "ACTIVE", label: "In Transit & Active" },
            { key: "DELIVERED", label: "Delivered" },
            { key: "RETURNS_REFUNDS", label: "Returns & Refunds" },
            { key: "CANCELLED", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-colors ${
                statusFilter === tab.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-44 w-full rounded-2xl" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="border rounded-2xl p-12 text-center bg-card space-y-3">
          <Package className="h-12 w-12 text-muted-foreground mx-auto" />
          <h3 className="font-bold text-base text-foreground">No matching orders found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {search || statusFilter !== "ALL"
              ? "Try adjusting your search criteria or filter to locate your transactions."
              : "You haven't placed any orders yet. Discover trending products on our marketplace."}
          </p>
          <Link href="/products">
            <Button size="sm" className="mt-2 text-xs">
              Explore Products
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const isDelivered = order.status === "DELIVERED";
            const isShipped = order.status === "SHIPPED";
            const isProcessing = order.status === "PROCESSING" || order.status === "CONFIRMED";
            const isCancelled = order.status === "CANCELLED";
            const isReturnRequested = order.status === "RETURN_REQUESTED";
            const isReturned = order.status === "RETURNED";
            const isRefunded = order.status === "REFUNDED";

            return (
              <div
                key={order.id}
                className="rounded-2xl border border-border/80 bg-card p-6 shadow-subtle hover:shadow-card transition-all space-y-5"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-base text-primary">
                        Order #{order.orderNumber}
                      </span>
                      <Badge
                        variant={
                          isDelivered
                            ? "success"
                            : isShipped
                            ? "info"
                            : isCancelled
                            ? "destructive"
                            : isRefunded || isReturned
                            ? "outline"
                            : isReturnRequested
                            ? "warning"
                            : "warning"
                        }
                        size="sm"
                        dot
                      >
                        {order.status}
                      </Badge>

                      {/* Refund Status Pill */}
                      {order.refundStatus && order.refundStatus !== "NONE" && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            order.refundStatus === "PROCESSED"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400"
                              : order.refundStatus === "REQUESTED"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400"
                              : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400"
                          }`}
                        >
                          <DollarSign className="h-3 w-3" />
                          <span>
                            {order.refundStatus === "PROCESSED"
                              ? `Refund Credited (₹${(order.refundAmount || order.total).toLocaleString("en-IN")})`
                              : order.refundStatus === "REQUESTED"
                              ? "Refund Under Review"
                              : "Refund Rejected"}
                          </span>
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground mt-0.5 block">
                      Placed on {formatDate(order.createdAt)} • Payment:{" "}
                      <strong className="text-foreground">{order.paymentStatus}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-4 self-start sm:self-auto">
                    <div className="text-left sm:text-right">
                      <span className="text-base font-extrabold text-primary">
                        {formatPrice(order.total)}
                      </span>
                      <span className="text-[11px] text-muted-foreground block">
                        {order.items.length} {order.items.length === 1 ? "item" : "items"}
                      </span>
                    </div>

                    <Link href={`/customer/orders/${order.id}`}>
                      <Button variant="default" size="sm" className="rounded-xl text-xs gap-1 font-semibold">
                        <span>Track &amp; Details</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Delivery Progress Bar */}
                {!isCancelled && !isRefunded && !isReturned && (
                  <div className="py-1">
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="space-y-1">
                        <div className="h-2 rounded-full bg-emerald-500" />
                        <span className="text-[11px] font-bold text-primary">Confirmed</span>
                      </div>
                      <div className="space-y-1">
                        <div
                          className={`h-2 rounded-full ${
                            isProcessing || isShipped || isDelivered ? "bg-emerald-500" : "bg-muted"
                          }`}
                        />
                        <span className="text-[11px] font-medium text-foreground">Processing</span>
                      </div>
                      <div className="space-y-1">
                        <div
                          className={`h-2 rounded-full ${
                            isShipped || isDelivered ? "bg-emerald-500" : "bg-muted"
                          }`}
                        />
                        <span className="text-[11px] font-medium text-foreground">In Transit</span>
                      </div>
                      <div className="space-y-1">
                        <div
                          className={`h-2 rounded-full ${isDelivered ? "bg-emerald-500" : "bg-muted"}`}
                        />
                        <span className="text-[11px] font-medium text-foreground">Delivered</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Items Snapshot */}
                <div className="divide-y divide-border/40">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <p className="font-bold text-foreground text-sm">{item.title}</p>
                        <div className="flex items-center gap-2 text-muted-foreground mt-0.5">
                          <span>Quantity: {item.quantity}</span>
                          {item.variantName && <span>• Option: {item.variantName}</span>}
                          {item.trackingNumber && (
                            <span className="text-secondary font-mono font-semibold">
                              • {item.carrier || "Courier"}: {item.trackingNumber}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="font-extrabold text-foreground self-end sm:self-auto">
                        {formatPrice(item.total)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer Quick Links */}
                <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Truck className="h-4 w-4 text-secondary" />
                    <span>
                      Destination:{" "}
                      <strong className="text-foreground">
                        {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/customer/orders/${order.id}`}>
                      <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                        <FileText className="h-3.5 w-3.5" />
                        <span>Tax Invoice &amp; History</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
