"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { orderService } from "@/services/order.service";
import { Order, OrderStatus } from "@/types";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useUIStore } from "@/store/ui-store";
import {
  Package,
  Truck,
  CheckCircle2,
  Search,
  Filter,
  ArrowRight,
  Clock,
  RotateCcw,
  XCircle,
  ExternalLink,
} from "lucide-react";

const COURIER_CARRIERS = [
  "Blue Dart Express",
  "Delhivery",
  "DTDC Logistics",
  "Ekart Logistics",
  "India Post Speed Post",
];

export default function SellerOrdersPage() {
  const sellerId = "seller_technexus";
  const { addToast } = useUIStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  // Shipping Modal State
  const [shippingCandidate, setShippingCandidate] = useState<{
    orderId: string;
    itemId: string;
    itemTitle: string;
  } | null>(null);
  const [carrier, setCarrier] = useState(COURIER_CARRIERS[0]);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const items = await orderService.getSellerOrders(sellerId);
      setOrders(items);
      setLoading(false);
    }
    load();
  }, [sellerId]);

  const handleUpdateStatus = async (
    orderId: string,
    itemId: string,
    newStatus: OrderStatus,
    trackingNo?: string
  ) => {
    const updated = await orderService.updateItemFulfillmentStatus(
      orderId,
      itemId,
      newStatus,
      trackingNo
    );
    if (updated) {
      setOrders(orders.map((o) => (o.id === orderId ? updated : o)));
      addToast({
        title: "Fulfillment Status Updated",
        description: `Order item marked as ${newStatus}.`,
        type: "success",
      });
    }
  };

  const handleDispatchOrder = async () => {
    if (!shippingCandidate) return;
    if (!trackingNumber) {
      addToast({
        title: "Missing Tracking Number",
        description: "Please specify the Courier Airway Bill (AWB) number.",
        type: "error",
      });
      return;
    }

    setIsUpdating(true);
    await handleUpdateStatus(
      shippingCandidate.orderId,
      shippingCandidate.itemId,
      "SHIPPED",
      `${carrier} — ${trackingNumber}`
    );
    setIsUpdating(false);
    setShippingCandidate(null);
    setTrackingNumber("");
  };

  const filtered = orders.filter((o) => {
    if (filterStatus !== "ALL" && o.status !== filterStatus) return false;
    if (
      search &&
      !o.orderNumber.toLowerCase().includes(search.toLowerCase()) &&
      !o.shippingAddress.fullName.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            Order Fulfillment Pipeline
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Process customer orders, allocate courier airway bills, and coordinate logistics dispatches
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border/80 shadow-sm">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by Order # or Customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-border/80 bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs pb-1 sm:pb-0">
          <span className="text-muted-foreground text-xs font-medium mr-1">Status:</span>
          {[
            "ALL",
            "PENDING",
            "CONFIRMED",
            "PROCESSING",
            "SHIPPED",
            "DELIVERED",
            "RETURN_REQUESTED",
            "RETURNED",
            "CANCELLED",
          ].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filterStatus === st
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-surface hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {st === "RETURN_REQUESTED"
                ? "Returns Pending"
                : st === "RETURNED"
                ? "Returned"
                : st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List / Cards */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="border border-border/80 rounded-2xl bg-card p-12 text-center text-muted-foreground">
            <Package className="h-10 w-10 mx-auto text-muted-foreground/60 mb-2" />
            <p className="font-bold text-foreground">No orders match the selected criteria.</p>
            <p className="text-xs text-muted-foreground mt-1">Try switching status filters or clearing the search query.</p>
          </div>
        ) : (
          filtered.map((order) => {
            const sellerItems = order.items.filter((i) => i.sellerId === sellerId);
            const sellerTotal = sellerItems.reduce((acc, it) => acc + it.total, 0);

            return (
              <div
                key={order.id}
                className="border border-border/80 rounded-2xl bg-card p-6 shadow-sm space-y-4 hover:border-primary/40 transition-colors"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border/60 gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm text-primary">
                      {order.orderNumber}
                    </span>
                    <Badge
                      variant={
                        order.status === "DELIVERED"
                          ? "success"
                          : order.status === "SHIPPED"
                          ? "info"
                          : order.status === "CANCELLED"
                          ? "destructive"
                          : order.status === "RETURN_REQUESTED"
                          ? "warning"
                          : order.status === "RETURNED"
                          ? "outline"
                          : "secondary"
                      }
                      className="text-[10px]"
                    >
                      {order.status}
                    </Badge>
                    {order.refundStatus && (
                      <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300">
                        Refund: {order.refundStatus}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      Placed: {formatDate(order.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      Seller Share: <strong className="text-foreground">{formatPrice(sellerTotal)}</strong>
                    </span>
                    <Link href={`/seller/orders/${order.id}`}>
                      <Button variant="outline" size="sm" className="text-xs h-7 gap-1 font-bold">
                        <span>Full Details</span>
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Customer Address Snapshot */}
                <div className="text-xs text-muted-foreground bg-surface/50 p-3 rounded-xl border border-border/40 flex flex-col sm:flex-row justify-between gap-2">
                  <div>
                    <span className="font-bold text-foreground block">
                      Delivery Destination: {order.shippingAddress.fullName}
                    </span>
                    <span>
                      {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
                      {order.shippingAddress.state} - {order.shippingAddress.postalCode}
                    </span>
                  </div>
                  <div className="text-right sm:text-right">
                    <span className="font-medium text-foreground block">
                      Phone: {order.shippingAddress.phone}
                    </span>
                    <span>Payment: <strong className="text-emerald-600">{order.paymentStatus}</strong></span>
                  </div>
                </div>

                {/* Return Request Banner if applicable */}
                {order.status === "RETURN_REQUESTED" && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                    <div className="flex items-center gap-2 text-amber-700">
                      <RotateCcw className="h-4 w-4 shrink-0" />
                      <span>
                        <strong>Return Requested:</strong> {order.returnReason || "Customer requested product return"}.
                      </span>
                    </div>
                    <Link href={`/seller/orders/${order.id}`}>
                      <Button size="sm" className="text-xs h-7 font-bold bg-amber-600 hover:bg-amber-700 text-white shrink-0">
                        Review &amp; Resolve Return
                      </Button>
                    </Link>
                  </div>
                )}

                {/* Line Items for this Seller */}
                <div className="divide-y divide-border/40">
                  {sellerItems.map((item) => (
                    <div
                      key={item.id}
                      className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                    >
                      <div>
                        <p className="font-bold text-foreground text-sm">{item.title}</p>
                        <p className="text-muted-foreground">
                          Qty: <span className="font-bold text-foreground">{item.quantity}</span> × {formatPrice(item.price)}
                          {item.variantName && ` • Variant: ${item.variantName}`}
                        </p>
                        {item.trackingNumber && (
                          <p className="text-[11px] font-mono text-primary mt-0.5">
                            AWB: {item.trackingNumber}
                          </p>
                        )}
                      </div>

                      {/* Fulfillment Actions */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.fulfillmentStatus === "PENDING" && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(order.id, item.id, "CONFIRMED")}
                            className="text-xs h-8 font-bold"
                          >
                            Accept Order
                          </Button>
                        )}

                        {item.fulfillmentStatus === "CONFIRMED" && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleUpdateStatus(order.id, item.id, "PROCESSING")}
                            className="text-xs h-8 font-bold"
                          >
                            Mark In Packaging
                          </Button>
                        )}

                        {item.fulfillmentStatus === "PROCESSING" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              setShippingCandidate({
                                orderId: order.id,
                                itemId: item.id,
                                itemTitle: item.title,
                              })
                            }
                            className="text-xs h-8 font-bold gap-1.5"
                          >
                            <Truck className="h-3.5 w-3.5" />
                            <span>Assign Courier & Ship</span>
                          </Button>
                        )}

                        {item.fulfillmentStatus === "SHIPPED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(order.id, item.id, "DELIVERED")}
                            className="text-xs h-8 font-bold text-emerald-600 border-emerald-500/30 hover:bg-emerald-50"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            <span>Confirm Delivery</span>
                          </Button>
                        )}

                        {item.fulfillmentStatus === "DELIVERED" && (
                          <Badge variant="success" className="text-xs font-bold py-1">
                            Delivered Successfully
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Dispatch & Shipping Modal */}
      <Modal
        isOpen={Boolean(shippingCandidate)}
        onClose={() => setShippingCandidate(null)}
        title="Dispatch Order & Assign Courier"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-surface/80 border border-border/60 text-xs">
            <span className="font-bold text-foreground block">
              {shippingCandidate?.itemTitle}
            </span>
            <span className="text-muted-foreground">
              Please enter official tracking info for customer real-time tracking.
            </span>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Logistics Courier Partner
            </label>
            <select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="w-full h-9 rounded-xl border border-border/80 bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-medium"
            >
              {COURIER_CARRIERS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Courier Airway Bill (AWB) / Tracking Number
            </label>
            <Input
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g. BLUEDART-8829102"
              className="text-xs h-9 font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShippingCandidate(null)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleDispatchOrder}
              disabled={isUpdating}
              className="font-bold"
            >
              {isUpdating ? "Dispatching..." : "Confirm Shipment"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
