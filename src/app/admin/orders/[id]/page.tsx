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
} from "lucide-react";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const { addToast } = useUIStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

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
        message="The requested marketplace order could not be located."
        showBack
      />
    );
  }

  const platformFee = Math.round(order.total * 0.1);
  const sellerPayoutTotal = order.total - platformFee;

  const handleAdminRefund = async () => {
    if (confirm("Confirm administrative refund override? This will mark the order refunded.")) {
      const res = await adminService.resolveDispute(
        order.id,
        "REFUND_BUYER",
        "Administrative refund issued from Order Details view."
      );
      if (res.success) {
        setOrder({
          ...order,
          status: "REFUNDED",
          paymentStatus: "REFUNDED",
        });
        addToast({
          title: "Refund Processed",
          description: "Order marked refunded and customer credited.",
          type: "success",
        });
      }
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
                  : order.status === "CANCELLED"
                  ? "destructive"
                  : "warning"
              }
            >
              {order.status}
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Placed on {formatDate(order.createdAt)} • Payment:{" "}
            <strong className="text-emerald-400">{order.paymentStatus}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="text-xs border-slate-700 bg-slate-900 text-slate-200 hover:text-white gap-1.5"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Audit Receipt</span>
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleAdminRefund}
            disabled={order.status === "REFUNDED"}
            className="text-xs font-bold gap-1"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Refund Buyer</span>
          </Button>
        </div>
      </div>

      {/* Customer & Financial Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Buyer info */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-2 shadow-sm text-xs">
          <h2 className="font-bold text-sm text-white flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-400" />
            Customer & Delivery Destination
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
                <div className="flex items-center gap-2 text-slate-400">
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
    </div>
  );
}
