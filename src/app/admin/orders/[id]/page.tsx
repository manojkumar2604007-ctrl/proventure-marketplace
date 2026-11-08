"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { orderService } from "@/services/order.service";
import { adminService } from "@/services/admin.service";
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
  ShieldCheck,
  Printer,
  MapPin,
  Phone,
  Mail,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Store,
  History,
  FileText,
  X,
  XCircle,
} from "lucide-react";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const { addToast } = useUIStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Dispute & Override Modal State
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeAction, setDisputeAction] = useState<"REFUND_BUYER" | "CANCELLED" | "RELEASE_TO_SELLER">("REFUND_BUYER");
  const [disputeNotes, setDisputeNotes] = useState("");
  const [isResolving, setIsResolving] = useState(false);

  // Invoice Modal State
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);

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
        title="Order Not Found"
        message="The requested marketplace order could not be located in Neon PostgreSQL."
        showBack
      />
    );
  }

  const platformFee = Math.round(order.total * 0.1);
  const sellerPayoutTotal = order.total - platformFee;

  const handleOpenInvoice = () => {
    const data = orderService.generateInvoiceData(order.id);
    setInvoiceData(data);
    setIsInvoiceModalOpen(true);
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleExecuteDispute = async () => {
    if (!order) return;
    setIsResolving(true);

    const res = await adminService.resolveDispute(
      order.id,
      disputeAction,
      disputeNotes || `Administrative status intervention: ${disputeAction}`
    );
    setIsResolving(false);

    if (res.success) {
      // Reload updated order details including statusHistory
      const refreshed = await orderService.getOrderById(order.id);
      if (refreshed) {
        setOrder(refreshed);
      } else {
        setOrder({
          ...order,
          status: disputeAction === "REFUND_BUYER" ? "REFUNDED" : disputeAction === "CANCELLED" ? "CANCELLED" : order.status,
          paymentStatus: disputeAction === "REFUND_BUYER" ? "REFUNDED" : order.paymentStatus,
          refundStatus: disputeAction === "REFUND_BUYER" ? "PROCESSED" : order.refundStatus,
          refundAmount: disputeAction === "REFUND_BUYER" ? order.total : order.refundAmount,
        });
      }

      addToast({
        title: "Dispute Settled & Logged",
        description: res.message,
        type: "success",
      });
      setIsDisputeModalOpen(false);
      setDisputeNotes("");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Orders</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Order {order.orderNumber}
            </h1>
            <Badge
              variant={
                order.status === "DELIVERED"
                  ? "success"
                  : order.status === "SHIPPED"
                  ? "info"
                  : order.status === "CANCELLED" || order.status === "REFUNDED"
                  ? "destructive"
                  : order.status === "RETURN_REQUESTED"
                  ? "warning"
                  : "secondary"
              }
            >
              {order.status}
            </Badge>
            {order.refundStatus && (
              <Badge variant="outline" className="text-xs border-amber-500 text-amber-400">
                Refund: {order.refundStatus}
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Placed on {formatDate(order.createdAt)} • Payment:{" "}
            <strong className="text-emerald-400">{order.paymentStatus}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenInvoice}
            className="text-xs border-slate-700 bg-slate-900 text-slate-200 hover:text-white gap-1.5"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Tax Invoice</span>
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setDisputeNotes(`Mediation review for order ${order.orderNumber}`);
              setIsDisputeModalOpen(true);
            }}
            className="text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white gap-1.5 shadow-sm"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Dispute Mediation</span>
          </Button>
        </div>
      </div>

      {/* Return or Cancellation Attention Banner */}
      {(order.status === "RETURN_REQUESTED" || order.cancellationReason || order.returnReason) && (
        <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-800/60 text-xs space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <RotateCcw className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="font-bold text-amber-300 text-sm">
                  {order.status === "RETURN_REQUESTED" ? "Customer Return Requested" : "Order Exception / Cancellation"}
                </h3>
                <p className="text-slate-300">
                  {order.returnReason
                    ? `Reason: "${order.returnReason}"`
                    : order.cancellationReason
                    ? `Cancellation Reason: "${order.cancellationReason}"`
                    : "Customer reported an issue with shipment fulfillment."}
                </p>
                {order.refundAmount && (
                  <p className="text-emerald-400 font-mono font-semibold pt-1">
                    Refund Amount: {formatPrice(order.refundAmount)} • Status: {order.refundStatus || "PENDING"}
                  </p>
                )}
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => {
                setDisputeAction("REFUND_BUYER");
                setDisputeNotes(`Approved refund for returned order: ${order.returnReason || "Customer return"}`);
                setIsDisputeModalOpen(true);
              }}
              className="text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shrink-0"
            >
              Issue Admin Refund
            </Button>
          </div>
        </div>
      )}

      {/* Customer & Financial Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Buyer info */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-2 shadow-sm text-xs">
          <h2 className="font-bold text-sm text-white flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-400" />
            Customer &amp; Delivery Destination
          </h2>
          <p className="font-bold text-white text-sm">
            {order.shippingAddress.fullName}
          </p>
          <p className="text-slate-300 leading-relaxed">
            {order.shippingAddress.street}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
            <br />
            {order.shippingAddress.country}
          </p>
          <p className="text-slate-400 pt-1 flex items-center gap-1.5">
            <Phone className="h-3 w-3" />
            <span>{order.shippingAddress.phone}</span>
          </p>
        </div>

        {/* Financial Distribution */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-2 shadow-sm text-xs">
          <h2 className="font-bold text-sm text-white flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Platform Financial Distribution
          </h2>
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Gross Basket Value:</span>
              <span className="font-bold text-white font-mono">{formatPrice(order.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Retained Marketplace Fee (10%):</span>
              <span className="font-bold text-emerald-400 font-mono">+{formatPrice(platformFee)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-800">
              <span className="text-slate-300">Net Merchant Remittance:</span>
              <span className="font-mono font-bold text-sm text-blue-400">
                {formatPrice(sellerPayoutTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Vendor Order Line Items */}
      <div className="border border-slate-800 rounded-2xl bg-slate-900/80 p-6 shadow-sm space-y-4">
        <h2 className="font-bold text-sm text-white flex items-center gap-2">
          <Package className="h-4 w-4 text-blue-400" />
          Multi-Vendor Line Items ({order.items.length})
        </h2>

        <div className="divide-y divide-slate-800/60">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-1">
                <p className="font-bold text-white text-sm">{item.title}</p>
                <div className="flex items-center gap-2 text-slate-400 flex-wrap">
                  <span>Merchant ID: <strong className="text-slate-200">{item.sellerId}</strong></span>
                  <span>•</span>
                  <span>Qty: <strong className="text-white">{item.quantity}</strong> × {formatPrice(item.price)}</span>
                  <span>•</span>
                  <span className="font-bold text-white">{formatPrice(item.total)}</span>
                </div>
                {item.trackingNumber && (
                  <p className="text-xs font-mono font-bold text-blue-400 flex items-center gap-1.5 pt-0.5">
                    <Truck className="h-3 w-3" />
                    <span>Courier AWB: {item.trackingNumber}</span>
                  </p>
                )}
              </div>

              <div>
                <Badge
                  variant={
                    item.fulfillmentStatus === "DELIVERED"
                      ? "success"
                      : item.fulfillmentStatus === "SHIPPED"
                      ? "info"
                      : "secondary"
                  }
                  className="text-[10px]"
                >
                  {item.fulfillmentStatus}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Status History & Audit Trail */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-sm space-y-4 text-xs">
        <h2 className="font-bold text-sm text-white flex items-center gap-2">
          <History className="h-4 w-4 text-blue-400" />
          Order Status History &amp; Immutable Audit Trail
        </h2>

        {order.statusHistory && order.statusHistory.length > 0 ? (
          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {order.statusHistory.map((item, idx) => (
              <div key={item.id || idx} className="relative space-y-0.5">
                <div className="absolute -left-6 top-1 h-2.5 w-2.5 rounded-full bg-blue-500 ring-4 ring-slate-900" />
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-white">
                    {item.previousStatus ? `${item.previousStatus} ➔ ` : ""}
                    {item.newStatus}
                  </span>
                  <Badge variant="outline" size="sm" className="text-[10px] py-0 border-slate-700 text-slate-300">
                    {item.changedByName || item.changedByRole || "System"}
                  </Badge>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {formatDate(item.timestamp)}
                  </span>
                </div>
                {item.description && (
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">
            Initial status recorded: {order.status} on {formatDate(order.createdAt)}.
          </p>
        )}
      </div>

      {/* Admin Dispute Mediation Modal */}
      <Modal
        isOpen={isDisputeModalOpen}
        onClose={() => setIsDisputeModalOpen(false)}
        title="Admin Dispute Mediation &amp; Status Override"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs space-y-1">
            <p className="font-bold text-white">Order #{order.orderNumber}</p>
            <p className="text-slate-300">
              Customer: {order.shippingAddress.fullName} • Gross Basket:{" "}
              <strong className="text-emerald-400 font-mono">
                {formatPrice(order.total)}
              </strong>
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Resolution Action
            </label>
            <select
              value={disputeAction}
              onChange={(e) => setDisputeAction(e.target.value as any)}
              className="w-full h-9 rounded-xl border border-slate-800 bg-slate-950 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="REFUND_BUYER">Refund Buyer (Debit Settlement &amp; Mark Refunded)</option>
              <option value="CANCELLED">Administrative Force Cancellation</option>
              <option value="RELEASE_TO_SELLER">Release Settlement to Merchant</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Mediation Rationale / Audit Notes *
            </label>
            <Input
              value={disputeNotes}
              onChange={(e) => setDisputeNotes(e.target.value)}
              placeholder="e.g. Return inspection confirmed item intact; issued refund."
              className="text-xs h-9 bg-slate-950 border-slate-800 text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDisputeModalOpen(false)}
              className="border-slate-700 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleExecuteDispute}
              disabled={isResolving}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold"
            >
              {isResolving ? "Resolving..." : "Apply Admin Ruling"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Printable GST Tax Invoice Modal */}
      {isInvoiceModalOpen && invoiceData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-extrabold text-lg text-white">Tax Invoice / Audit Receipt</h3>
                <p className="text-xs text-slate-400 font-mono">
                  {invoiceData.invoiceNumber} • Order #{invoiceData.orderNumber}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handlePrintInvoice} className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-500">
                  <Printer className="h-3.5 w-3.5" /> Print
                </Button>
                <button
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Buyer & Seller Header */}
            <div className="grid grid-cols-2 gap-4 text-xs border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <span className="font-bold text-white block">Billed To (Customer):</span>
                <p className="font-medium text-slate-200">{invoiceData.customer.name}</p>
                <p className="text-slate-400">{invoiceData.customer.shippingAddress}</p>
                <p className="text-slate-400">Phone: {invoiceData.customer.phone}</p>
              </div>
              <div className="space-y-1 text-right">
                <span className="font-bold text-white block">Marketplace Escrow Platform:</span>
                <p className="font-medium text-slate-200">ProVenture Multi-Vendor Marketplace</p>
                <p className="text-slate-400">GSTIN: 29AABCU9603R1ZM</p>
                <p className="text-slate-400">Invoice Date: {invoiceData.invoiceDate}</p>
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-slate-300">Itemized Particulars</h4>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-medium">
                    <th className="py-2">Item Description</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Unit Price</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {invoiceData.sellers.flatMap((s: any) =>
                    s.items.map((it: any, idx: number) => (
                      <tr key={idx}>
                        <td className="py-2 font-medium text-slate-200">
                          {it.title}
                          {it.variantName && (
                            <span className="text-[11px] text-slate-400 block">
                              Option: {it.variantName}
                            </span>
                          )}
                        </td>
                        <td className="py-2 text-center text-slate-300">{it.quantity}</td>
                        <td className="py-2 text-right text-slate-300">{formatPrice(it.unitPrice)}</td>
                        <td className="py-2 text-right font-bold text-white">{formatPrice(it.totalPrice)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Tax Breakdown */}
            <div className="border-t border-slate-800 pt-4 space-y-1.5 text-xs text-right">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span>{formatPrice(invoiceData.financials.subtotal)}</span>
              </div>
              {invoiceData.financials.discount > 0 && (
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>Voucher Savings:</span>
                  <span>-{formatPrice(invoiceData.financials.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>Taxable Value:</span>
                <span>{formatPrice(invoiceData.financials.taxableAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Central GST (CGST 9%):</span>
                <span>{formatPrice(invoiceData.financials.cgst)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>State GST (SGST 9%):</span>
                <span>{formatPrice(invoiceData.financials.sgst)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Shipping Fee:</span>
                <span>{invoiceData.financials.shippingFee === 0 ? "FREE" : formatPrice(invoiceData.financials.shippingFee)}</span>
              </div>
              <div className="flex justify-between font-black text-base text-white border-t border-slate-800 pt-2">
                <span>Total Gross Amount (INR):</span>
                <span>{formatPrice(invoiceData.financials.grandTotal)}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 text-center">
              ProVenture Multi-Vendor Marketplace • GST-Compliant Electronic Invoice
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
