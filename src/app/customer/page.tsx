import React from "react";
import Link from "next/link";
import { orderService } from "@/services/order.service";
import { formatPrice, formatDate } from "@/lib/utils";
import {
  ShoppingBag,
  Heart,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Clock,
  User,
  PackageCheck,
  Truck,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const revalidate = 0; // Dynamic

export default async function CustomerDashboardPage() {
  const orders = await orderService.getCustomerOrders("usr_customer_1");
  const recentOrders = orders.slice(0, 3);
  const activeOrder = orders.find((o) => o.status === "PROCESSING" || o.status === "SHIPPED") || orders[0];

  return (
    <div className="space-y-8">
      {/* 1. Welcome Message & Account Summary Header */}
      <div className="p-6 rounded-3xl border border-border/80 bg-gradient-to-r from-surface via-background to-surface shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-[#0A192F] text-white flex items-center justify-center font-extrabold text-2xl shadow-subtle shrink-0">
            PS
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="heading-1">Welcome back, Priya!</h1>
              <Badge variant="success" size="sm" dot>
                Verified Buyer
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Account ID: <span className="font-mono text-foreground">usr_customer_1</span> • Member since Nov 2026
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <Link href="/customer/profile">
            <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5">
              <User className="h-3.5 w-3.5" />
              <span>Edit Profile</span>
            </Button>
          </Link>
          <Link href="/products">
            <Button size="sm" className="rounded-xl text-xs gap-1.5 font-bold shadow-subtle">
              <span>Start Shopping</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-subtle flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-primary">{orders.length}</span>
            <p className="text-xs text-muted-foreground">Total Orders Placed</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-subtle flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-primary">
              {orders.filter((o) => o.status === "SHIPPED" || o.status === "PROCESSING").length}
            </span>
            <p className="text-xs text-muted-foreground">Active Shipments</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-subtle flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
            <Heart className="h-5 w-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-primary">4</span>
            <p className="text-xs text-muted-foreground">Saved Wishlist Items</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-subtle flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-emerald-500/10 flex items-center justify-center text-accent shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-accent">Active</span>
            <p className="text-xs text-muted-foreground">100% Buyer Protection</p>
          </div>
        </div>
      </div>

      {/* 3. Active Order Status Live Tracker */}
      {activeOrder && (
        <div className="rounded-2xl border border-secondary/30 bg-blue-50/30 dark:bg-blue-950/20 p-6 shadow-subtle space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-secondary/20 pb-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-secondary animate-pulse" />
              <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                Active Order Tracking
              </span>
              <span className="text-xs font-mono font-bold text-foreground">
                #{activeOrder.orderNumber}
              </span>
            </div>
            <Link
              href={`/customer/orders/${activeOrder.id}`}
              className="text-xs font-bold text-secondary hover:underline flex items-center gap-1"
            >
              <span>Track Detailed Delivery Status</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 rounded-xl bg-background border border-border/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Order Placed
              </span>
              <p className="text-xs font-bold text-foreground mt-1">Confirmed</p>
            </div>
            <div className="p-3 rounded-xl bg-background border border-border/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Fulfillment
              </span>
              <p className="text-xs font-bold text-accent mt-1">Dispatched from Studio</p>
            </div>
            <div className="p-3 rounded-xl bg-background border border-border/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Courier Tracking
              </span>
              <p className="text-xs font-mono font-bold text-secondary mt-1">TRK-EXP-48219</p>
            </div>
            <div className="p-3 rounded-xl bg-background border border-border/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Estimated Arrival
              </span>
              <p className="text-xs font-bold text-foreground mt-1">Tomorrow by 8:00 PM</p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Recent Orders List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="heading-2">Recent Marketplace Orders</h2>
          <Link
            href="/customer/orders"
            className="text-xs font-semibold text-secondary hover:underline flex items-center gap-1"
          >
            <span>View All Orders ({orders.length})</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {recentOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-border/80 bg-card p-5 shadow-subtle hover:shadow-card transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-sm text-primary">
                    #{order.orderNumber}
                  </span>
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
                    size="sm"
                    dot
                  >
                    {order.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Placed on {formatDate(order.createdAt)}
                  </span>
                </div>

                <div className="text-xs text-muted-foreground line-clamp-1">
                  {order.items.map((i) => `${i.quantity}x ${i.title}`).join(" • ")}
                </div>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
                <span className="text-sm font-extrabold text-foreground">
                  {formatPrice(order.total)}
                </span>
                <Link href={`/customer/orders/${order.id}`}>
                  <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1">
                    <span>Details</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Account Information & Wishlist Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Information Card */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h3 className="font-bold text-sm text-primary flex items-center gap-2">
              <User className="h-4 w-4 text-secondary" /> Account Details
            </h3>
            <Link
              href="/customer/profile"
              className="text-xs text-secondary hover:underline font-semibold"
            >
              Edit
            </Link>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Full Name</span>
              <span className="font-semibold text-foreground">Priya Sharma</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Email Address</span>
              <span className="font-semibold text-foreground">customer@example.com</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Mobile Phone</span>
              <span className="font-semibold text-foreground">+91 91234 56789</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Default Address</span>
              <span className="font-semibold text-foreground text-right max-w-[200px] truncate">
                Flat 402, Oakwood Greens, Bengaluru
              </span>
            </div>
          </div>
        </div>

        {/* Wishlist Summary Card */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h3 className="font-bold text-sm text-primary flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-500" /> Saved Wishlist
            </h3>
            <Link
              href="/customer/wishlist"
              className="text-xs text-secondary hover:underline font-semibold"
            >
              View All (4)
            </Link>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-surface/50 border border-border/60">
              <div>
                <p className="font-bold text-primary truncate max-w-[180px]">
                  Aura ANC Studio Wireless
                </p>
                <span className="text-[11px] text-muted-foreground font-semibold">
                  ₹18,999 • In Stock
                </span>
              </div>
              <Link href="/products/aura-anc-studio-wireless-headphones">
                <Button size="sm" variant="default" className="h-7 text-[11px] px-2.5">
                  View
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-surface/50 border border-border/60">
              <div>
                <p className="font-bold text-primary truncate max-w-[180px]">
                  Leather Briefcase
                </p>
                <span className="text-[11px] text-muted-foreground font-semibold">
                  ₹8,499 • In Stock
                </span>
              </div>
              <Link href="/products/handcrafted-full-grain-leather-briefcase">
                <Button size="sm" variant="default" className="h-7 text-[11px] px-2.5">
                  View
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
