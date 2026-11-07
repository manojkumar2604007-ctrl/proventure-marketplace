import React from "react";
import { orderService } from "@/services/order.service";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Package, Truck, CheckCircle2, Clock, MapPin } from "lucide-react";

export default async function CustomerOrdersPage() {
  const orders = await orderService.getCustomerOrders("usr_customer_1");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">
          Orders & Shipment Tracking
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Real-time delivery progress for each multi-vendor dispatch
        </p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => {
          const isDelivered = order.status === "DELIVERED";
          const isShipped = order.status === "SHIPPED";
          const isProcessing = order.status === "PROCESSING" || order.status === "CONFIRMED";

          return (
            <div
              key={order.id}
              className="border rounded-2xl bg-card overflow-hidden shadow-sm space-y-4 p-6"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-foreground">
                      Order #{order.orderNumber}
                    </span>
                    <Badge
                      variant={
                        isDelivered
                          ? "success"
                          : isShipped
                          ? "info"
                          : "warning"
                      }
                      className="text-[11px]"
                    >
                      {order.status}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground mt-0.5 block">
                    Placed on {formatDate(order.createdAt)} • Paid via {order.paymentStatus}
                  </span>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-sm font-black text-foreground">
                    {formatPrice(order.total)}
                  </span>
                  <span className="text-xs text-muted-foreground block">
                    {order.items.length} {order.items.length === 1 ? "item" : "items"}
                  </span>
                </div>
              </div>

              {/* Visual Shipment Timeline Tracker */}
              <div className="py-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3 block">
                  Delivery Progress
                </span>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="space-y-1">
                    <div className="h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-semibold text-foreground">
                      Ordered
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div
                      className={`h-2 rounded-full ${
                        isProcessing || isShipped || isDelivered
                          ? "bg-emerald-500"
                          : "bg-muted"
                      }`}
                    />
                    <span className="text-[10px] font-semibold text-foreground">
                      Processing
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div
                      className={`h-2 rounded-full ${
                        isShipped || isDelivered ? "bg-emerald-500" : "bg-muted"
                      }`}
                    />
                    <span className="text-[10px] font-semibold text-foreground">
                      Shipped
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div
                      className={`h-2 rounded-full ${
                        isDelivered ? "bg-emerald-500" : "bg-muted"
                      }`}
                    />
                    <span className="text-[10px] font-semibold text-foreground">
                      Delivered
                    </span>
                  </div>
                </div>
              </div>

              {/* Items in this Order */}
              <div className="border-t pt-4 space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-muted/30 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Package className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{item.title}</p>
                        {item.variantName && (
                          <p className="text-[11px] text-muted-foreground">
                            {item.variantName}
                          </p>
                        )}
                        <p className="text-[11px] text-muted-foreground">
                          Qty: {item.quantity} • {formatPrice(item.price)} each
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:text-right">
                      {item.trackingNumber ? (
                        <div className="text-[11px]">
                          <span className="text-muted-foreground block">
                            Courier: {item.carrier || "BlueDart Express"}
                          </span>
                          <span className="font-mono font-bold text-primary">
                            {item.trackingNumber}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">
                          Tracking will update once picked up
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Address */}
              <div className="pt-2 flex items-center gap-2 text-xs text-muted-foreground border-t">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="truncate">
                  Shipping to: {order.shippingAddress.fullName}, {order.shippingAddress.street},{" "}
                  {order.shippingAddress.city} - {order.shippingAddress.postalCode}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
