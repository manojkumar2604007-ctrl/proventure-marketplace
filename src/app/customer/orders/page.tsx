import React from "react";
import Link from "next/link";
import { orderService } from "@/services/order.service";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileText,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

export const revalidate = 0;

export default async function CustomerOrdersPage() {
  const orders = await orderService.getCustomerOrders("usr_customer_1");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <h1 className="heading-1">My Orders &amp; Shipment Tracking</h1>
          <p className="subheading mt-1">
            Track multi-vendor dispatches, download GST invoices, and manage returns.
          </p>
        </div>
        <Link href="/products">
          <Button size="sm" variant="outline" className="text-xs">
            Browse More Products
          </Button>
        </Link>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {orders.map((order) => {
          const isDelivered = order.status === "DELIVERED";
          const isShipped = order.status === "SHIPPED";
          const isProcessing = order.status === "PROCESSING" || order.status === "CONFIRMED";
          const isCancelled = order.status === "CANCELLED";
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
                  <span className="text-xs text-muted-foreground mt-0.5 block">
                    Placed on {formatDate(order.createdAt)} • Payment: <strong className="text-foreground">{order.paymentStatus}</strong>
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
                      <span>View Details</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Delivery Progress Bar */}
              {!isCancelled && !isRefunded && (
                <div className="py-1">
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="space-y-1">
                      <div className="h-2 rounded-full bg-accent" />
                      <span className="text-[11px] font-bold text-primary">
                        Confirmed
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div
                        className={`h-2 rounded-full ${
                          isProcessing || isShipped || isDelivered
                            ? "bg-accent"
                            : "bg-muted"
                        }`}
                      />
                      <span className="text-[11px] font-medium text-foreground">
                        Processing
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div
                        className={`h-2 rounded-full ${
                          isShipped || isDelivered ? "bg-accent" : "bg-muted"
                        }`}
                      />
                      <span className="text-[11px] font-medium text-foreground">
                        In Transit
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div
                        className={`h-2 rounded-full ${
                          isDelivered ? "bg-accent" : "bg-muted"
                        }`}
                      />
                      <span className="text-[11px] font-medium text-foreground">
                        Delivered
                      </span>
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
                            • {item.carrier}: {item.trackingNumber}
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
                    Ship to: <strong className="text-foreground">{order.shippingAddress.city}, {order.shippingAddress.postalCode}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/customer/orders/${order.id}`}>
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                      <FileText className="h-3.5 w-3.5" />
                      <span>Invoice &amp; Actions</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
