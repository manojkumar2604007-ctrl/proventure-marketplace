"use client";

import React, { useState, useEffect } from "react";
import { orderService } from "@/services/order.service";
import { Order, OrderStatus } from "@/types";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUIStore } from "@/store/ui-store";
import { Package, Truck, CheckCircle2, Search, Filter } from "lucide-react";

export default function SellerOrdersPage() {
  const sellerId = "seller_technexus";
  const { addToast } = useUIStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const items = await orderService.getSellerOrders(sellerId);
      setOrders(items);
      setLoading(false);
    }
    load();
  }, []);

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
        title: "Fulfillment Updated",
        description: `Order item marked as ${newStatus}.`,
        type: "success",
      });
    }
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
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">
          Order Fulfillment Management
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Process customer orders, assign courier airway bills, and mark dispatches
        </p>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by Order # or Customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Status:</span>
          {["ALL", "PROCESSING", "SHIPPED", "DELIVERED"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterStatus === st
                  ? "bg-primary text-white font-bold"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filtered.map((order) => {
          const sellerItems = order.items.filter((i) => i.sellerId === sellerId);
          const sellerTotal = sellerItems.reduce((acc, i) => acc + i.total, 0);

          return (
            <div
              key={order.id}
              className="border rounded-2xl bg-card overflow-hidden shadow-sm p-6 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-foreground font-mono">
                      Order #{order.orderNumber}
                    </span>
                    <Badge
                      variant={
                        order.status === "DELIVERED"
                          ? "success"
                          : order.status === "SHIPPED"
                          ? "info"
                          : "warning"
                      }
                      className="text-[10px]"
                    >
                      {order.status}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground mt-0.5 block">
                    Customer: {order.shippingAddress.fullName} • Placed {formatDate(order.createdAt)}
                  </span>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-sm font-black text-foreground">
                    Your Share: {formatPrice(sellerTotal)}
                  </span>
                  <span className="text-[11px] text-emerald-600 block font-semibold">
                    Net Payout: {formatPrice(Math.round(sellerTotal * 0.9))}
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-3">
                {sellerItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-muted/20 border text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">{item.title}</h4>
                        {item.variantName && (
                          <p className="text-muted-foreground text-[11px]">
                            {item.variantName}
                          </p>
                        )}
                        <p className="text-muted-foreground text-[11px]">
                          Qty: {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>

                    {/* Actions and tracking */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                          Current Status
                        </span>
                        <select
                          value={item.fulfillmentStatus}
                          onChange={(e) =>
                            handleUpdateStatus(
                              order.id,
                              item.id,
                              e.target.value as OrderStatus,
                              item.trackingNumber || `TRK-EXP-${Math.floor(10000 + Math.random() * 90000)}`
                            )
                          }
                          className="bg-background border rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="PROCESSING">Processing</option>
                          <option value="SHIPPED">Shipped</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </div>

                      {item.trackingNumber && (
                        <div className="p-2 rounded-lg bg-muted border font-mono text-[11px]">
                          <span className="text-muted-foreground block text-[9px] uppercase font-bold">
                            Airway Bill
                          </span>
                          <span className="font-bold text-primary">
                            {item.trackingNumber}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery destination */}
              <div className="pt-2 text-xs text-muted-foreground flex items-center justify-between border-t">
                <span>
                  Ship To: {order.shippingAddress.street}, {order.shippingAddress.city} (
                  {order.shippingAddress.postalCode})
                </span>
                <span className="font-semibold text-foreground">
                  Contact: {order.shippingAddress.phone}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
