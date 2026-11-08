"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { orderService } from "@/services/order.service";
import { Order, OrderStatus } from "@/types";
import { formatPrice, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { useUIStore } from "@/store/ui-store";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Mail,
  RotateCcw,
  XCircle,
  FileText,
  Printer,
  ShieldCheck,
} from "lucide-react";

export default function SellerOrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const sellerId = "seller_technexus";
  const { addToast } = useUIStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Status Action Modals
  const [isShipModalOpen, setIsShipModalOpen] = useState(false);
  const [carrier, setCarrier] = useState("Blue Dart Express");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await orderService.getOrderById(orderId);
      setOrder(res);
      setLoading(false);
    }
    if (orderId) load();
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <ErrorState
        title="Order Not Located"
        message="The requested order could not be found or does not contain merchandise from your store."
        showBack
      />
    );
  }

  const sellerItems = order.items.filter((i) => i.sellerId === sellerId);
  const sellerSubtotal = sellerItems.reduce((acc, it) => acc + it.total, 0);

  const handleUpdateItemStatus = async (
    itemId: string,
    status: OrderStatus,
    awb?: string
  ) => {
    setIsUpdating(true);
    const updated = await orderService.updateItemFulfillmentStatus(
      order.id,
      itemId,
      status,
      awb
    );
    setIsUpdating(false);

    if (updated) {
      setOrder({ ...updated });
      addToast({
        title: "Status Updated",
        description: `Order item updated to ${status}.`,
        type: "success",
      });
    }
  };

  const handleConfirmShipment = async (itemId: string) => {
    if (!trackingNumber) {
      addToast({
        title: "Missing Tracking Number",
        description: "Please specify the AWB tracking number.",
        type: "error",
      });
      return;
    }
    await handleUpdateItemStatus(itemId, "SHIPPED", `${carrier} — ${trackingNumber}`);
    setIsShipModalOpen(false);
    setTrackingNumber("");
  };

  const handleApproveCancellation = async () => {
    const res = await orderService.requestCancellation(order.id, "Approved by seller");
    if (res.success && res.order) {
      setOrder({ ...res.order });
      addToast({
        title: "Cancellation Approved",
        description: "Order marked as cancelled. Refund will be processed.",
        type: "default",
      });
    }
  };

  const handleApproveReturn = async () => {
    const res = await orderService.requestReturn(order.id, "Return inspected & accepted by seller");
    if (res.success && res.order) {
      setOrder({ ...res.order });
      addToast({
        title: "Return Processed",
        description: "Return accepted and refund credited to buyer.",
        type: "success",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <Link
            href="/seller/orders"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Orders</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-foreground tracking-tight">
              Order {order.orderNumber}
            </h1>
            <Badge
              variant={
                order.status === "DELIVERED"
                  ? "success"
                  : order.status === "SHIPPED"
                  ? "info"
                  : order.status === "CANCELLED"
                  ? "destructive"
                  : "warning"
              }
            >
              {order.status}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Placed on {formatDate(order.createdAt)} • Payment Status:{" "}
            <strong className="text-emerald-600">{order.paymentStatus}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="text-xs gap-1.5"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Invoice</span>
          </Button>
        </div>
      </div>

      {/* Customer & Shipping Destination */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl border border-border/80 bg-card space-y-2 shadow-sm text-xs">
          <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Shipping Destination
          </h2>
          <p className="font-bold text-foreground text-sm">
            {order.shippingAddress.fullName}
          </p>
          <p className="text-muted-foreground leading-relaxed">
            {order.shippingAddress.street}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
            <br />
            {order.shippingAddress.country}
          </p>
          <p className="text-muted-foreground pt-1 flex items-center gap-1.5">
            <Phone className="h-3 w-3" />
            <span>{order.shippingAddress.phone}</span>
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-border/80 bg-card space-y-2 shadow-sm text-xs">
          <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Financial Settlement Summary
          </h2>
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Seller Line Item Subtotal:</span>
              <span className="font-bold text-foreground">{formatPrice(sellerSubtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Marketplace Commission (10%):</span>
              <span className="text-muted-foreground">- {formatPrice(sellerSubtotal * 0.1)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border/60">
              <span className="font-bold text-foreground">Net Payout to Merchant:</span>
              <span className="font-mono font-bold text-sm text-emerald-600">
                {formatPrice(sellerSubtotal * 0.9)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Seller Line Items & Stage Execution */}
      <div className="border border-border/80 rounded-2xl bg-card p-6 shadow-sm space-y-4">
        <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" />
          Merchandise Line Items & Dispatch Controls
        </h2>

        <div className="divide-y divide-border/40">
          {sellerItems.map((item) => (
            <div
              key={item.id}
              className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-1">
                <p className="font-bold text-foreground text-sm">{item.title}</p>
                <p className="text-muted-foreground">
                  Quantity: <strong className="text-foreground">{item.quantity}</strong> × {formatPrice(item.price)} ={" "}
                  <strong className="text-foreground">{formatPrice(item.total)}</strong>
                </p>
                {item.variantName && (
                  <p className="text-muted-foreground text-[11px]">Variant: {item.variantName}</p>
                )}
                {item.trackingNumber && (
                  <p className="text-xs font-mono font-bold text-primary flex items-center gap-1.5 pt-1">
                    <Truck className="h-3.5 w-3.5" />
                    <span>Tracking: {item.trackingNumber}</span>
                  </p>
                )}
              </div>

              {/* Action Pipeline */}
              <div className="flex items-center gap-2 flex-wrap">
                {item.fulfillmentStatus === "PENDING" && (
                  <Button
                    size="sm"
                    onClick={() => handleUpdateItemStatus(item.id, "CONFIRMED")}
                    disabled={isUpdating}
                    className="text-xs font-bold"
                  >
                    Accept & Confirm
                  </Button>
                )}

                {item.fulfillmentStatus === "CONFIRMED" && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleUpdateItemStatus(item.id, "PROCESSING")}
                    disabled={isUpdating}
                    className="text-xs font-bold"
                  >
                    Move to Packaging
                  </Button>
                )}

                {item.fulfillmentStatus === "PROCESSING" && (
                  <Button
                    size="sm"
                    onClick={() => setIsShipModalOpen(true)}
                    disabled={isUpdating}
                    className="text-xs font-bold gap-1.5"
                  >
                    <Truck className="h-3.5 w-3.5" />
                    <span>Ship Item (AWB)</span>
                  </Button>
                )}

                {item.fulfillmentStatus === "SHIPPED" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateItemStatus(item.id, "DELIVERED")}
                    disabled={isUpdating}
                    className="text-xs font-bold text-emerald-600 border-emerald-500/30"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    <span>Mark as Delivered</span>
                  </Button>
                )}

                {item.fulfillmentStatus === "DELIVERED" && (
                  <Badge variant="success" className="text-xs font-bold py-1">
                    Delivered & Verified
                  </Badge>
                )}
              </div>

              {/* Shipping Modal */}
              <Modal
                isOpen={isShipModalOpen}
                onClose={() => setIsShipModalOpen(false)}
                title="Enter Courier Dispatch Tracking"
              >
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">
                      Logistics Courier
                    </label>
                    <select
                      value={carrier}
                      onChange={(e) => setCarrier(e.target.value)}
                      className="w-full h-9 rounded-xl border border-border/80 bg-background px-3 text-xs"
                    >
                      <option value="Blue Dart Express">Blue Dart Express</option>
                      <option value="Delhivery">Delhivery</option>
                      <option value="DTDC Logistics">DTDC Logistics</option>
                      <option value="India Post Speed Post">India Post Speed Post</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">
                      Airway Bill (AWB) / Tracking Number
                    </label>
                    <Input
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="e.g. BLUEDART-992102"
                      className="text-xs h-9 font-mono"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsShipModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleConfirmShipment(item.id)}
                      disabled={isUpdating}
                      className="font-bold"
                    >
                      {isUpdating ? "Saving..." : "Confirm & Ship"}
                    </Button>
                  </div>
                </div>
              </Modal>
            </div>
          ))}
        </div>
      </div>

      {/* Cancellation & Return Exception Management */}
      <div className="p-5 rounded-2xl border border-border/80 bg-card space-y-4 shadow-sm text-xs">
        <h2 className="font-bold text-sm text-foreground">
          Exception & Dispute Resolution Controls
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-surface/50 border border-border/40">
          <div>
            <span className="font-bold text-foreground block">Buyer Order Cancellation</span>
            <span className="text-muted-foreground text-[11px]">
              If buyer requested cancellation prior to carrier handoff, accept to trigger automated refund.
            </span>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleApproveCancellation}
            disabled={order.status === "DELIVERED" || order.status === "CANCELLED"}
            className="text-xs font-bold shrink-0"
          >
            Approve Cancellation
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-surface/50 border border-border/40">
          <div>
            <span className="font-bold text-foreground block">Customer Return Inspection</span>
            <span className="text-muted-foreground text-[11px]">
              If returned merchandise has been received and verified in warehouse, process refund closure.
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleApproveReturn}
            disabled={order.status !== "DELIVERED"}
            className="text-xs font-bold text-emerald-600 border-emerald-500/30 hover:bg-emerald-50 shrink-0"
          >
            Approve Return & Refund
          </Button>
        </div>
      </div>
    </div>
  );
}
