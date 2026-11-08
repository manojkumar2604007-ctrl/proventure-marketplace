"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { orderService } from "@/services/order.service";
import { adminService } from "@/services/admin.service";
import { Order, OrderStatus } from "@/types";
import { formatPrice, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useUIStore } from "@/store/ui-store";
import {
  Package,
  Truck,
  ShieldCheck,
  Search,
  Filter,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function AdminOrdersPage() {
  const { addToast } = useUIStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");

  // Dispute resolution modal
  const [disputeCandidate, setDisputeCandidate] = useState<Order | null>(null);
  const [resolutionAction, setResolutionAction] = useState<"REFUND_BUYER" | "CANCELLED" | "RELEASE_TO_SELLER">("REFUND_BUYER");
  const [disputeNotes, setDisputeNotes] = useState("Customer reported damaged packaging; courier incident filed.");
  const [isResolving, setIsResolving] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    async function load() {
      setLoading(true);
      const all = await orderService.getAllOrders();
      setOrders(all);
      setLoading(false);
    }
    load();
  }, []);

  const handleExecuteDispute = async () => {
    if (!disputeCandidate) return;
    setIsResolving(true);

    const res = await adminService.resolveDispute(
      disputeCandidate.id,
      resolutionAction,
      disputeNotes
    );
    setIsResolving(false);

    if (res.success) {
      setOrders(
        orders.map((o) =>
          o.id === disputeCandidate.id
            ? {
                ...o,
                status: resolutionAction === "REFUND_BUYER" ? "REFUNDED" : "CANCELLED",
                paymentStatus: resolutionAction === "REFUND_BUYER" ? "REFUNDED" : o.paymentStatus,
              }
            : o
        )
      );

      addToast({
        title: "Dispute Settled",
        description: res.message,
        type: "success",
      });
    }

    setDisputeCandidate(null);
  };

  const filtered = orders.filter((o) => {
    if (statusFilter !== "ALL" && o.status !== statusFilter) return false;
    if (paymentFilter !== "ALL" && o.paymentStatus !== paymentFilter) return false;
    if (
      search &&
      !o.orderNumber.toLowerCase().includes(search.toLowerCase()) &&
      !o.shippingAddress.fullName.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Marketplace Orders & Dispute Resolution
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time audit log of multi-vendor checkout baskets, platform commission cuts, and mediation
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-sm">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by Order # or Customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs pb-1 sm:pb-0">
          <span className="text-slate-400 text-xs font-medium mr-1">Status:</span>
          {["ALL", "PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="border border-slate-800 rounded-2xl bg-slate-900/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-4">Customer Details</th>
                <th className="py-3.5 px-4">Merchandise & Sellers</th>
                <th className="py-3.5 px-4">Gross Total</th>
                <th className="py-3.5 px-4">Platform Fee (10%)</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Fulfillment Status</th>
                <th className="py-3.5 px-4 text-right">Intervention Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginated.map((ord) => {
                const commission = Math.round(ord.total * 0.1);
                const sellerCount = new Set(ord.items.map((i) => i.sellerId)).size;

                return (
                  <tr key={ord.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-400">
                      <Link href={`/admin/orders/${ord.id}`} className="hover:underline">
                        {ord.orderNumber}
                      </Link>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white block">
                        {ord.shippingAddress.fullName}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {ord.shippingAddress.city}, {ord.shippingAddress.state}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      <span>{ord.items.length} items</span>
                      <span className="text-[11px] text-slate-500 block">
                        across {sellerCount} merchant{sellerCount > 1 ? "s" : ""}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-white font-mono">
                      {formatPrice(ord.total)}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-emerald-400 font-mono">
                      +{formatPrice(commission)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                        <ShieldCheck className="h-3 w-3" /> {ord.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          ord.status === "DELIVERED"
                            ? "success"
                            : ord.status === "SHIPPED"
                            ? "info"
                            : ord.status === "CANCELLED"
                            ? "destructive"
                            : "warning"
                        }
                        className="text-[10px]"
                      >
                        {ord.status}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/admin/orders/${ord.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-slate-300 hover:text-white hover:bg-slate-800"
                          >
                            Details
                          </Button>
                        </Link>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDisputeCandidate(ord)}
                          className="h-7 text-xs border-slate-700 bg-slate-800 text-amber-400 hover:bg-amber-950/40 rounded-lg gap-1"
                          title="Manage dispute or override order status"
                        >
                          <AlertTriangle className="h-3 w-3" />
                          <span>Mediate</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between p-4 border-t border-slate-800 text-xs text-slate-400">
          <span>
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} orders
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-8 w-8 border-slate-800 bg-slate-900 text-slate-300 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-mono font-bold text-white px-2">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 w-8 border-slate-800 bg-slate-900 text-slate-300 hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Dispute Resolution Modal */}
      <Modal
        isOpen={Boolean(disputeCandidate)}
        onClose={() => setDisputeCandidate(null)}
        title="Admin Dispute Mediation & Status Override"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs space-y-1">
            <p className="font-bold text-white">Order {disputeCandidate?.orderNumber}</p>
            <p className="text-slate-300">
              Buyer: {disputeCandidate?.shippingAddress.fullName} • Gross Value:{" "}
              <strong className="text-emerald-400 font-mono">
                {formatPrice(disputeCandidate?.total || 0)}
              </strong>
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Resolution Action
            </label>
            <select
              value={resolutionAction}
              onChange={(e) => setResolutionAction(e.target.value as any)}
              className="w-full h-9 rounded-xl border border-slate-800 bg-slate-950 px-3 text-xs text-white"
            >
              <option value="REFUND_BUYER">Refund Buyer (Debit Merchant Settlement)</option>
              <option value="CANCELLED">Administrative Force Cancellation</option>
              <option value="RELEASE_TO_SELLER">Release Settlement to Merchant</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Mediation Rationale / Audit Notes
            </label>
            <Input
              value={disputeNotes}
              onChange={(e) => setDisputeNotes(e.target.value)}
              className="text-xs h-9 bg-slate-950 border-slate-800 text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDisputeCandidate(null)}
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
    </div>
  );
}
