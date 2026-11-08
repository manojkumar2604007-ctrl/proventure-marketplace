"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { orderService, OrderInvoiceData } from "@/services/order.service";
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
  DollarSign,
  AlertTriangle,
  History,
  Download,
  X,
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
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState<OrderInvoiceData | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [returnReason, setReturnReason] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      setLoading(true);
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setOrder(data.data);
            return;
          }
        }
      } catch (err) {
        console.error("API order fetch error, falling back to service:", err);
      }

      // Fallback
      const fallback = await orderService.getOrderById(orderId);
      setOrder(fallback);
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
  const isReturnRequested = order.status === "RETURN_REQUESTED";
  const isReturned = order.status === "RETURNED";
  const isRefunded = order.status === "REFUNDED";

  const handleOpenInvoice = async () => {
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(order.id)}/invoice`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setInvoiceData(data.data);
          setIsInvoiceModalOpen(true);
          return;
        }
      }
    } catch {
      // Fallback
    }

    const fallbackData = await orderService.generateInvoiceData(order.id);
    setInvoiceData(fallbackData);
    setIsInvoiceModalOpen(true);
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleConfirmCancel = async () => {
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/customer/orders/${encodeURIComponent(order.id)}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setOrder(data.order || { ...order, status: "CANCELLED", refundStatus: "PROCESSED" });
        addToast({
          title: "Order Cancelled",
          description: data.message || "Cancellation confirmed.",
          type: "success",
        });
      } else {
        throw new Error(data.message || data.error || "Cancellation failed");
      }
    } catch (err: any) {
      addToast({
        title: "Cancellation Error",
        description: err.message,
        type: "error",
      });
    } finally {
      setIsActionLoading(false);
      setIsCancelModalOpen(false);
    }
  };

  const handleConfirmReturn = async () => {
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/customer/orders/${encodeURIComponent(order.id)}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: returnReason }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setOrder(data.order || { ...order, status: "RETURN_REQUESTED", refundStatus: "REQUESTED" });
        addToast({
          title: "Return Initiated",
          description: data.message || "Return request submitted.",
          type: "success",
        });
      } else {
        throw new Error(data.message || data.error || "Return request failed");
      }
    } catch (err: any) {
      addToast({
        title: "Return Error",
        description: err.message,
        type: "error",
      });
    } finally {
      setIsActionLoading(false);
      setIsReturnModalOpen(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
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
                    : isRefunded || isReturned
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
              Placed on {formatDate(order.createdAt)} • Payment Status:{" "}
              <strong className="text-foreground">{order.paymentStatus}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenInvoice}
            leftIcon={<FileText className="h-4 w-4" />}
            className="text-xs"
          >
            Download GST Invoice
          </Button>

          {/* Cancellation allowed only for non-shipped active orders */}
          {!isCancelled && !isDelivered && !isShipped && !isRefunded && !isReturned && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsCancelModalOpen(true)}
              leftIcon={<XCircle className="h-4 w-4" />}
              className="text-xs"
            >
              Request Cancellation
            </Button>
          )}

          {/* Return allowed ONLY for delivered orders */}
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

      {/* Refund Tracking Status Card */}
      {order.refundStatus && order.refundStatus !== "NONE" && (
        <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold flex items-center gap-1.5 text-foreground">
              <DollarSign className="h-4 w-4 text-amber-600" />
              Refund &amp; Return Status:{" "}
              <strong className="text-primary">
                {order.refundStatus === "PROCESSED"
                  ? "Refund Credited"
                  : order.refundStatus === "REQUESTED"
                  ? "Refund Under Review"
                  : "Refund Declined"}
              </strong>
            </span>
            <span className="font-extrabold text-sm text-primary">
              {formatPrice(order.refundAmount || order.total)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {order.refundStatus === "PROCESSED"
              ? "Your refund has been verified and credited back to your original payment method (Razorpay UPI / Cards)."
              : order.refundStatus === "REQUESTED"
              ? "Your return/cancellation request is undergoing merchant review. Courier pickup will be scheduled upon approval."
              : "The refund request was declined after inspection. Please contact customer support for disputes."}
          </p>
        </div>
      )}

      {/* Shipment Status Visual Tracker */}
      {!isCancelled && !isRefunded && !isReturned && (
        <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-primary flex items-center gap-2">
              <Truck className="h-4 w-4 text-secondary" /> Shipment &amp; Dispatch Timeline
            </h3>
            <span className="text-xs font-semibold text-secondary font-mono">
              {order.items[0]?.carrier || "Express Cargo"} • {order.items[0]?.trackingNumber || "Pending Dispatch"}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs py-2">
            <div className="space-y-1.5">
              <div className="h-2 rounded-full bg-emerald-500" />
              <p className="font-bold text-primary">Order Confirmed</p>
              <span className="text-[10px] text-muted-foreground block">
                {formatDate(order.createdAt)}
              </span>
            </div>
            <div className="space-y-1.5">
              <div
                className={`h-2 rounded-full ${
                  isProcessing || isShipped || isDelivered ? "bg-emerald-500" : "bg-muted"
                }`}
              />
              <p className="font-bold text-foreground">Processing</p>
              <span className="text-[10px] text-muted-foreground block">
                Packaging &amp; QC
              </span>
            </div>
            <div className="space-y-1.5">
              <div
                className={`h-2 rounded-full ${
                  isShipped || isDelivered ? "bg-emerald-500" : "bg-muted"
                }`}
              />
              <p className="font-bold text-foreground">Shipped</p>
              <span className="text-[10px] text-muted-foreground block">
                In Transit with AWB
              </span>
            </div>
            <div className="space-y-1.5">
              <div
                className={`h-2 rounded-full ${isDelivered ? "bg-emerald-500" : "bg-muted"}`}
              />
              <p className="font-bold text-foreground">Delivered</p>
              <span className="text-[10px] text-muted-foreground block">
                Signed by Recipient
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Ordered Items Breakdown */}
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
                <div className="flex items-center gap-3 text-muted-foreground flex-wrap">
                  <span>Unit Price: {formatPrice(item.price)}</span>
                  <span>•</span>
                  <span>Quantity: {item.quantity}</span>
                  {item.variantName && <span>• Option: {item.variantName}</span>}
                  <Badge variant="outline" size="sm" className="text-[10px]">
                    Status: {item.fulfillmentStatus || order.status}
                  </Badge>
                </div>
                {item.trackingNumber && (
                  <p className="text-[11px] text-secondary font-mono font-semibold pt-0.5">
                    Dispatch: {item.carrier || "BlueDart"} • AWB: {item.trackingNumber}
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
            <p className="font-semibold text-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Verified Escrow &amp; Buyer Guarantee
            </p>
            <p>
              Your transaction is secured with 256-bit SSL encryption. All multi-vendor packages are covered under 7-day return protection.
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
              <div className="flex justify-between py-1 border-b border-border/40 text-emerald-600 font-bold">
                <span>Voucher Savings</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between py-1 border-b border-border/40 text-muted-foreground text-[11px]">
              <span>Estimated GST (18% inclusive)</span>
              <span>{formatPrice(Math.round(Math.max(0, order.subtotal - order.discount) * 0.18))}</span>
            </div>
            <div className="flex justify-between py-1.5 text-sm font-black text-primary border-t border-border">
              <span>Total Amount Paid</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Status History Timeline Ledger */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-subtle space-y-4">
        <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
          <History className="h-4 w-4 text-primary" /> Order Status History &amp; Audit Ledger
        </h3>

        {order.statusHistory && order.statusHistory.length > 0 ? (
          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
            {order.statusHistory.map((entry, idx) => (
              <div key={entry.id || idx} className="relative text-xs space-y-0.5">
                <div className="absolute -left-6 top-1 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-card" />
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-foreground">
                    {entry.previousStatus ? `${entry.previousStatus} ➔ ` : ""}
                    {entry.newStatus}
                  </span>
                  <Badge variant="outline" size="sm" className="text-[10px] py-0">
                    By: {entry.changedByName || entry.changedByRole || "System"}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {formatDate(entry.timestamp)}
                  </span>
                </div>
                {entry.description && (
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    {entry.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Initial status recorded: {order.status} on {formatDate(order.createdAt)}.
          </p>
        )}
      </div>

      {/* Recipient & Shipping Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-subtle space-y-3 text-xs">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" /> Delivery Destination
          </h3>
          <div className="space-y-1 text-muted-foreground leading-relaxed pl-6">
            <p className="font-bold text-foreground text-sm">
              {order.shippingAddress.fullName}
            </p>
            <p>{order.shippingAddress.street}</p>
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
            </p>
            <p className="pt-1 font-mono text-foreground font-semibold">
              Contact: {order.shippingAddress.phone}
            </p>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-subtle space-y-3 text-xs">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Store className="h-4 w-4 text-primary" /> Merchant Fulfillment Center
          </h3>
          <div className="space-y-1 text-muted-foreground leading-relaxed pl-6">
            <p className="font-semibold text-foreground">
              {order.items[0]?.seller?.storeName || "TechNexus Electronics"}
            </p>
            <p>Registered Multi-Vendor Hub</p>
            <p>Fulfillment Service Level Agreement: 24–48 Hours</p>
            <p className="pt-1 text-[11px]">
              Invoice Ref: <span className="font-mono font-bold">INV-{order.orderNumber.replace(/[^0-9]/g, "")}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Cancellation Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Order"
        description="Cancellation is only permitted prior to courier handover. Reason is required for inventory audit."
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Cancellation Reason *
            </label>
            <Textarea
              placeholder="Please specify why you are cancelling (e.g. Ordered by mistake, found better price, etc.)."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCancelModalOpen(false)}
              disabled={isActionLoading}
            >
              Keep Order
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmCancel}
              isLoading={isActionLoading}
              disabled={!cancelReason.trim()}
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>

      {/* Return Request Modal */}
      <Modal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        title="Request Merchandise Return"
        description="Returns are accepted for delivered items within 7 business days under our Authentic Escrow Guarantee."
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Return Reason *
            </label>
            <Textarea
              placeholder="Please detail reason for return (e.g. Defective hardware, wrong variant received, etc.)."
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsReturnModalOpen(false)}
              disabled={isActionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleConfirmReturn}
              isLoading={isActionLoading}
              disabled={!returnReason.trim()}
            >
              Submit Return Request
            </Button>
          </div>
        </div>
      </Modal>

      {/* Printable GST Tax Invoice Modal */}
      {isInvoiceModalOpen && invoiceData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border rounded-2xl max-w-2xl w-full p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="font-extrabold text-lg text-primary">Tax Invoice / Receipt</h3>
                <p className="text-xs text-muted-foreground font-mono">
                  {invoiceData.invoiceNumber} • Order #{invoiceData.orderNumber}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handlePrintInvoice} className="text-xs gap-1.5">
                  <Printer className="h-3.5 w-3.5" /> Print
                </Button>
                <button
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Buyer & Seller Header */}
            <div className="grid grid-cols-2 gap-4 text-xs border-b pb-4">
              <div className="space-y-1">
                <span className="font-bold text-foreground block">Billed To (Customer):</span>
                <p className="font-medium">{invoiceData.customer.name}</p>
                <p className="text-muted-foreground">{invoiceData.customer.shippingAddress}</p>
                <p className="text-muted-foreground">Phone: {invoiceData.customer.phone}</p>
              </div>
              <div className="space-y-1 text-right">
                <span className="font-bold text-foreground block">Dispatched From (Platform):</span>
                <p className="font-medium">ProVenture Multi-Vendor Marketplace</p>
                <p className="text-muted-foreground">GSTIN: 29AABCU9603R1ZM</p>
                <p className="text-muted-foreground">Invoice Date: {invoiceData.invoiceDate}</p>
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-foreground">Itemized Particulars</h4>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b text-muted-foreground font-medium">
                    <th className="py-2">Item Description</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Unit Price</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {invoiceData.sellers.flatMap((s) =>
                    s.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-2 font-medium">
                          {it.title}
                          {it.variantName && (
                            <span className="text-[11px] text-muted-foreground block">
                              Option: {it.variantName}
                            </span>
                          )}
                        </td>
                        <td className="py-2 text-center">{it.quantity}</td>
                        <td className="py-2 text-right">{formatPrice(it.unitPrice)}</td>
                        <td className="py-2 text-right font-bold">{formatPrice(it.totalPrice)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Tax Breakdown */}
            <div className="border-t pt-4 space-y-1.5 text-xs text-right">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal:</span>
                <span>{formatPrice(invoiceData.financials.subtotal)}</span>
              </div>
              {invoiceData.financials.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Voucher Savings:</span>
                  <span>-{formatPrice(invoiceData.financials.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Taxable Value:</span>
                <span>{formatPrice(invoiceData.financials.taxableAmount)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Central GST (CGST 9%):</span>
                <span>{formatPrice(invoiceData.financials.cgst)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>State GST (SGST 9%):</span>
                <span>{formatPrice(invoiceData.financials.sgst)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping Fee:</span>
                <span>{invoiceData.financials.shippingFee === 0 ? "FREE" : formatPrice(invoiceData.financials.shippingFee)}</span>
              </div>
              <div className="flex justify-between font-black text-base text-primary border-t pt-2">
                <span>Total Amount Paid (INR):</span>
                <span>{formatPrice(invoiceData.financials.grandTotal)}</span>
              </div>
            </div>

            <div className="pt-2 border-t text-[11px] text-muted-foreground text-center">
              Thank you for choosing ProVenture Marketplace. This is a computer-generated invoice.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
