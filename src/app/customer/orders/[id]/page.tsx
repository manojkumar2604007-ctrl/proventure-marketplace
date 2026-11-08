"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { orderService } from "@/services/order.service";
import { Order, OrderStatus } from "@/types";
import { formatPrice, formatDate } from "@/lib/utils";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ArrowLeft,
  FileText,
  RotateCcw,
  XCircle,
  ShieldCheck,
  MapPin,
  Store,
  Printer,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/form-fields";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { useUIStore } from "@/store/ui-store";

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const router = useRouter();
  const { addToast } = useUIStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [returnReason, setReturnReason] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      setLoading(true);
      const res = await orderService.getOrderById(orderId);
      setOrder(res);
      setLoading(false);
    }

    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <ErrorState
        title="Order Not Found"
        message="The requested order could not be located or does not belong to your account."
        showBack
      />
    );
  }

  const isDelivered = order.status === "DELIVERED";
  const isShipped = order.status === "SHIPPED";
  const isProcessing = order.status === "PROCESSING" || order.status === "CONFIRMED";
  const isCancelled = order.status === "CANCELLED";
  const isRefunded = order.status === "REFUNDED";

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleConfirmCancel = async () => {
    setIsActionLoading(true);
    const res = await orderService.requestCancellation(order.id, cancelReason);
    setIsActionLoading(false);
    setIsCancelModalOpen(false);

    if (res.success && res.order) {
      setOrder({ ...res.order });
      addToast({
        title: "Order Cancelled",
        description: res.message,
        type: "success",
      });
    } else {
      addToast({
        title: "Cancellation Failed",
        description: res.message,
        type: "error",
      });
    }
  };

  const handleConfirmReturn = async () => {
    setIsActionLoading(true);
    const res = await orderService.requestReturn(order.id, returnReason);
    setIsActionLoading(false);
    setIsReturnModalOpen(false);

    if (res.success && res.order) {
      setOrder({ ...res.order });
      addToast({
        title: "Return Initiated",
        description: res.message,
        type: "success",
      });
    } else {
      addToast({
        title: "Return Request Failed",
        description: res.message,
        type: "error",
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Back button & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <Link href="/customer/orders">
            <Button variant="outline" size="icon-sm" aria-label="Back to orders">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold text-primary">
                Order #{order.orderNumber}
              </h1>
              <Badge
                variant={
                  isDelivered
                    ? "success"
                    : isShipped
                    ? "info"
                    : isCancelled
                    ? "destructive"
                    : isRefunded
                    ? "outline"
                    : "warning"
                }
                size="sm"
                dot
              >
                {order.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Placed on {formatDate(order.createdAt)} • Payment Method: Razorpay UPI
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrintInvoice}
            leftIcon={<Printer className="h-4 w-4" />}
            className="text-xs"
          >
            Download / Print Invoice
          </Button>

          {/* Cancellation button for non-shipped */}
          {!isCancelled && !isDelivered && !isShipped && !isRefunded && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsCancelModalOpen(true)}
              leftIcon={<XCircle className="h-4 w-4" />}
              className="text-xs"
            >
              Cancel Order
            </Button>
          )}

          {/* Return button for delivered */}
          {isDelivered && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsReturnModalOpen(true)}
              leftIcon={<RotateCcw className="h-4 w-4" />}
              className="text-xs text-rose-600 hover:text-rose-700 hover:border-rose-300"
            >
              Request Return
            </Button>
          )}
        </div>
      </div>

      {/* Shipment Status Visual Tracker */}
      {!isCancelled && !isRefunded && (
        <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-primary flex items-center gap-2">
              <Truck className="h-4 w-4 text-secondary" /> Shipment &amp; Dispatch Tracking
            </h3>
            <span className="text-xs font-semibold text-secondary font-mono">
              Courier: Express Cargo • TRK-EXP-48219
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs py-2">
            <div className="space-y-1.5">
              <div className="h-2 rounded-full bg-accent" />
              <p className="font-bold text-primary">Order Confirmed</p>
              <span className="text-[10px] text-muted-foreground block">
                {formatDate(order.createdAt)}
              </span>
            </div>
            <div className="space-y-1.5">
              <div
                className={`h-2 rounded-full ${
                  isProcessing || isShipped || isDelivered ? "bg-accent" : "bg-muted"
                }`}
              />
              <p className="font-bold text-foreground">Processing</p>
              <span className="text-[10px] text-muted-foreground block">
                Studio Verification
              </span>
            </div>
            <div className="space-y-1.5">
              <div
                className={`h-2 rounded-full ${
                  isShipped || isDelivered ? "bg-accent" : "bg-muted"
                }`}
              />
              <p className="font-bold text-foreground">Shipped</p>
              <span className="text-[10px] text-muted-foreground block">
                In Courier Transit
              </span>
            </div>
            <div className="space-y-1.5">
              <div
                className={`h-2 rounded-full ${isDelivered ? "bg-accent" : "bg-muted"}`}
              />
              <p className="font-bold text-foreground">Delivered</p>
              <span className="text-[10px] text-muted-foreground block">
                Signed by Recipient
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Items Breakdown Table */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-subtle">
        <div className="p-5 border-b border-border/60 bg-surface/50 flex items-center justify-between">
          <h3 className="font-bold text-sm text-primary flex items-center gap-2">
            <Package className="h-4 w-4 text-secondary" /> Ordered Items ({order.items.length})
          </h3>
          <span className="text-xs text-muted-foreground">
            Multi-vendor packaging &amp; dispatch
          </span>
        </div>

        <div className="divide-y divide-border/40 p-5">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-1 max-w-lg">
                <Link
                  href={`/products/${item.productId}`}
                  className="font-bold text-sm text-primary hover:text-secondary transition-colors"
                >
                  {item.title}
                </Link>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <span>Unit Price: {formatPrice(item.price)}</span>
                  <span>•</span>
                  <span>Quantity: {item.quantity}</span>
                  {item.variantName && <span>• Option: {item.variantName}</span>}
                </div>
                {item.trackingNumber && (
                  <p className="text-[11px] text-secondary font-mono">
                    Tracking: {item.carrier} • {item.trackingNumber}
                  </p>
                )}
              </div>

              <div className="text-left sm:text-right">
                <span className="text-sm font-extrabold text-foreground">
                  {formatPrice(item.total)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Financial Summary */}
        <div className="p-6 bg-surface/40 border-t border-border/60 flex flex-col sm:flex-row justify-between gap-6">
          <div className="text-xs text-muted-foreground space-y-1 max-w-sm">
            <p className="font-semibold text-foreground">Buyer Protection Guarantee</p>
            <p>
              All purchases protected by ProVenture authentic escrow and 10-day replacement policy.
            </p>
          </div>

          <div className="w-full sm:w-64 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold text-foreground">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Shipping Fee</span>
              <span className="font-semibold text-accent">
                {order.shippingFee === 0 ? "FREE" : formatPrice(order.shippingFee)}
              </span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between py-1 border-b border-border/40 text-rose-600">
                <span>Coupon Savings</span>
                <span className="font-semibold">-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between py-1.5 text-sm font-black text-primary border-t border-border">
              <span>Total Amount Paid</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Address & Recipient Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-subtle space-y-3">
          <h3 className="font-bold text-sm text-primary flex items-center gap-2">
            <MapPin className="h-4 w-4 text-secondary" /> Delivery Destination
          </h3>
          <p className="text-xs text-foreground font-semibold leading-relaxed">
            {order.shippingAddress.fullName}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {order.shippingAddress.street}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
          </p>
          <p className="text-xs text-muted-foreground">
            Contact: <span className="font-mono text-foreground font-semibold">{order.shippingAddress.phone}</span>
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-subtle space-y-3">
          <h3 className="font-bold text-sm text-primary flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-secondary" /> Need Assistance?
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            If you have issues with damaged goods, dispatch delays, or merchant communication, contact our 24/7 dedicated support team.
          </p>
          <div className="pt-2">
            <Button variant="outline" size="sm" className="text-xs">
              Open Support Ticket
            </Button>
          </div>
        </div>
      </div>

      {/* Cancellation Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Request Order Cancellation"
        description="Cancellation is available before shipping dispatch. Refunds are returned to original UPI account within 3-5 business days."
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCancelModalOpen(false)}
            >
              Keep Order
            </Button>
            <Button
              variant="destructive"
              size="sm"
              isLoading={isActionLoading}
              onClick={handleConfirmCancel}
            >
              Confirm Cancellation
            </Button>
          </>
        }
      >
        <div className="space-y-3 py-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            Reason for Cancellation
          </label>
          <Textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="e.g. Ordered by mistake, found alternative, changed delivery address..."
            rows={3}
          />
        </div>
      </Modal>

      {/* Return Request Modal */}
      <Modal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        title="Request Product Return &amp; Refund"
        description="10-day replacement &amp; return policy. A courier pickup will be arranged at your registered shipping address."
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsReturnModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              isLoading={isActionLoading}
              onClick={handleConfirmReturn}
            >
              Submit Return Request
            </Button>
          </>
        }
      >
        <div className="space-y-3 py-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            Reason for Return
          </label>
          <Textarea
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
            placeholder="e.g. Size mismatch, defective component, item differs from catalog description..."
            rows={3}
          />
        </div>
      </Modal>
    </div>
  );
}
