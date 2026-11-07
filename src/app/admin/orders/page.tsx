import React from "react";
import { orderService } from "@/services/order.service";
import { formatPrice, formatDate } from "@/lib/utils";
import { Package, Truck, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function AdminOrdersPage() {
  const orders = await orderService.getAllOrders();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Marketplace Platform Orders
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Audited log of multi-vendor checkout baskets and payment settlements
        </p>
      </div>

      <div className="border border-slate-800 rounded-2xl bg-slate-900/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-4">Customer Details</th>
                <th className="py-3.5 px-4">Items / Vendors</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Platform Cut</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Order Status</th>
                <th className="py-3.5 px-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {orders.map((ord) => {
                const commission = Math.round(ord.total * 0.1);

                return (
                  <tr key={ord.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">
                      {ord.orderNumber}
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
                      {ord.items.length} items across {new Set(ord.items.map((i) => i.sellerId)).size} sellers
                    </td>

                    <td className="py-3.5 px-4 font-bold text-white">
                      {formatPrice(ord.total)}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-emerald-400">
                      +{formatPrice(commission)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                        <ShieldCheck className="h-3 w-3" /> {ord.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-200">
                        {ord.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 text-right">
                      {formatDate(ord.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
