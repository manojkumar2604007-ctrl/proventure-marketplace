"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { productService } from "@/services/product.service";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useUIStore } from "@/store/ui-store";
import {
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle2,
  Layers,
  History,
  Search,
  Filter,
  Boxes,
  Edit2,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

interface StockLog {
  id: string;
  productTitle: string;
  sku: string;
  delta: number;
  newStock: number;
  reason: string;
  timestamp: string;
}

export default function SellerInventoryPage() {
  const sellerId = "seller_technexus";
  const { addToast } = useUIStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Quick Adjustment Modal State
  const [adjustCandidate, setAdjustCandidate] = useState<Product | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<string>("10");
  const [adjustType, setAdjustType] = useState<"ADD" | "SET" | "REMOVE">("ADD");
  const [adjustReason, setAdjustReason] = useState("Warehouse Inbound Shipment");

  // Stock Audit Log
  const [stockLogs, setStockLogs] = useState<StockLog[]>([
    {
      id: "log_1",
      productTitle: "ProVent Ergonomic Aluminum Laptop Stand",
      sku: "TN-STN-401",
      delta: +25,
      newStock: 32,
      reason: "Supplier Bulk Delivery Batch #992",
      timestamp: "Today, 10:30 AM",
    },
    {
      id: "log_2",
      productTitle: "Aura Spatial Wireless Headphones",
      sku: "TN-AUD-108",
      delta: -1,
      newStock: 14,
      reason: "Customer Order Fulfillment #ORD-8821",
      timestamp: "Today, 09:15 AM",
    },
    {
      id: "log_3",
      productTitle: "UltraGlide Magnetic Desk Mat",
      sku: "TN-MAT-203",
      delta: +15,
      newStock: 28,
      reason: "Restocked from Secondary Hub",
      timestamp: "Yesterday, 04:45 PM",
    },
  ]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const items = await productService.getProductsBySeller(sellerId);
      setProducts(items);
      setLoading(false);
    }
    load();
  }, [sellerId]);

  const handleInlineStockUpdate = async (product: Product, delta: number) => {
    const newStock = Math.max(0, product.stock + delta);
    const updated = await productService.updateProduct(product.id, {
      stock: newStock,
      status: newStock === 0 ? "OUT_OF_STOCK" : "ACTIVE",
    });

    if (updated) {
      setProducts(products.map((p) => (p.id === product.id ? updated : p)));
      setStockLogs([
        {
          id: `log_${Date.now()}`,
          productTitle: product.title,
          sku: product.sku || "N/A",
          delta,
          newStock,
          reason: delta > 0 ? "Manual Inline Increment" : "Manual Deduction",
          timestamp: "Just now",
        },
        ...stockLogs,
      ]);

      addToast({
        title: "Stock Updated",
        description: `${product.title} updated to ${newStock} units.`,
        type: "success",
      });
    }
  };

  const handleExecuteModalAdjustment = async () => {
    if (!adjustCandidate) return;

    const val = parseInt(adjustAmount, 10) || 0;
    let newStock = adjustCandidate.stock;

    if (adjustType === "ADD") newStock += val;
    else if (adjustType === "REMOVE") newStock = Math.max(0, newStock - val);
    else if (adjustType === "SET") newStock = Math.max(0, val);

    const delta = newStock - adjustCandidate.stock;

    const updated = await productService.updateProduct(adjustCandidate.id, {
      stock: newStock,
      status: newStock === 0 ? "OUT_OF_STOCK" : "ACTIVE",
    });

    if (updated) {
      setProducts(products.map((p) => (p.id === adjustCandidate.id ? updated : p)));
      setStockLogs([
        {
          id: `log_${Date.now()}`,
          productTitle: adjustCandidate.title,
          sku: adjustCandidate.sku || "N/A",
          delta,
          newStock,
          reason: adjustReason,
          timestamp: "Just now",
        },
        ...stockLogs,
      ]);

      addToast({
        title: "Inventory Calibrated",
        description: `New stock level for "${adjustCandidate.title}" is ${newStock} units.`,
        type: "success",
      });
    }

    setAdjustCandidate(null);
  };

  const filtered = products.filter((p) => {
    if (showLowStockOnly && p.stock > 5) return false;
    if (
      search &&
      !p.title.toLowerCase().includes(search.toLowerCase()) &&
      !p.sku?.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const lowStockCount = products.filter((p) => p.stock <= 5).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            Inventory & Stock Control
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitor real-time warehouse inventory, manage SKUs, track variant stocks, and review restock logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/seller/products/new">
            <Button size="sm" className="rounded-xl text-xs font-bold gap-1.5 shadow-sm">
              <Boxes className="h-4 w-4" />
              <span>Add New SKU</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Low Stock Warning Banner */}
      {lowStockCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-600 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold">
                Low Stock Warning: {lowStockCount} items have 5 or fewer units remaining.
              </p>
              <p className="text-[11px] text-amber-800">
                Replenish these items to prevent unfulfillable orders and avoid marketplace delisting.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className="text-xs font-bold border-amber-500/40 text-amber-800 hover:bg-amber-500/10 shrink-0"
          >
            {showLowStockOnly ? "Show All Items" : "Filter Low Stock"}
          </Button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border/80 shadow-sm">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter by SKU or product title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-border/80 bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={showLowStockOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className="text-xs gap-1.5"
          >
            <Filter className="h-3 w-3" />
            <span>Low Stock Only ({lowStockCount})</span>
          </Button>
        </div>
      </div>

      {/* Main Stock Table */}
      <div className="border border-border/80 rounded-2xl bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3.5 px-4">Item Details</th>
                <th className="py-3.5 px-4">Master SKU</th>
                <th className="py-3.5 px-4">Stock Health</th>
                <th className="py-3.5 px-4">Available Units</th>
                <th className="py-3.5 px-4 text-center">Quick +/- Increment</th>
                <th className="py-3.5 px-4 text-right">Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtered.map((prod) => {
                const isLow = prod.stock <= 5;
                const isOut = prod.stock === 0;

                return (
                  <tr key={prod.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-surface border border-border/60 overflow-hidden relative shrink-0">
                          <Image
                            src={prod.images[0]?.url || "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=200"}
                            alt={prod.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <span className="font-bold text-foreground block truncate">
                            {prod.title}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {prod.variants?.length ? `${prod.variants.length} Variants Tracked` : "Single SKU"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-primary">
                      {prod.sku || "N/A"}
                    </td>

                    <td className="py-3.5 px-4">
                      {isOut ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-500">
                          <AlertTriangle className="h-3 w-3" /> Depleted
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-500">
                          <AlertTriangle className="h-3 w-3" /> Critical Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                          <CheckCircle2 className="h-3 w-3" /> Optimal
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-sm font-black text-foreground">
                        {prod.stock}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 bg-surface/80 p-1 rounded-xl border border-border/60">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleInlineStockUpdate(prod, -1)}
                          disabled={prod.stock === 0}
                          className="h-6 w-6 rounded-lg text-muted-foreground hover:text-foreground"
                          title="Decrement 1 Unit"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-mono font-bold text-xs">
                          {prod.stock}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleInlineStockUpdate(prod, 1)}
                          className="h-6 w-6 rounded-lg text-muted-foreground hover:text-foreground"
                          title="Increment 1 Unit"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAdjustCandidate(prod);
                          setAdjustAmount("10");
                          setAdjustType("ADD");
                        }}
                        className="text-xs h-7 px-2 font-bold"
                      >
                        Adjust Stock
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock History Audit Log */}
      <div className="border border-border/80 rounded-2xl bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div>
            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              Stock History & Audit Trail
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Verified record of inbound receipts, order decrements, and inventory adjustments
            </p>
          </div>
          <Badge variant="outline" className="text-xs font-mono">
            {stockLogs.length} events logged
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                <th className="pb-3">Product / SKU</th>
                <th className="pb-3">Stock Delta</th>
                <th className="pb-3">Balance After</th>
                <th className="pb-3">Adjustment Reason</th>
                <th className="pb-3 text-right">Logged At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {stockLogs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3">
                    <span className="font-bold text-foreground block">{log.productTitle}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">{log.sku}</span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`font-mono font-bold ${
                        log.delta > 0 ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {log.delta > 0 ? `+${log.delta}` : log.delta}
                    </span>
                  </td>
                  <td className="py-3 font-mono font-bold text-foreground">
                    {log.newStock} units
                  </td>
                  <td className="py-3 text-muted-foreground">{log.reason}</td>
                  <td className="py-3 text-right text-muted-foreground font-mono text-[11px]">
                    {log.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Adjustment Modal */}
      <Modal
        isOpen={Boolean(adjustCandidate)}
        onClose={() => setAdjustCandidate(null)}
        title="Calibrate Stock Level"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-surface/80 border border-border/60 text-xs space-y-1">
            <p className="font-bold text-foreground">{adjustCandidate?.title}</p>
            <p className="text-muted-foreground">
              Current Available Stock: <span className="font-mono font-bold text-foreground">{adjustCandidate?.stock} units</span>
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(["ADD", "SET", "REMOVE"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setAdjustType(type)}
                className={`py-2 text-xs font-bold rounded-xl border transition-colors ${
                  adjustType === type
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border/80 bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {type === "ADD" ? "+ Receive Stock" : type === "SET" ? "Set Exact Count" : "- Deduct Stock"}
              </button>
            ))}
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Quantity to {adjustType === "ADD" ? "Add" : adjustType === "SET" ? "Set" : "Deduct"}
            </label>
            <Input
              type="number"
              min="1"
              value={adjustAmount}
              onChange={(e) => setAdjustAmount(e.target.value)}
              className="text-xs h-9 font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Audit Reason
            </label>
            <Input
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              placeholder="e.g. Inbound shipment arrival, stock count audit"
              className="text-xs h-9"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAdjustCandidate(null)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleExecuteModalAdjustment}
              className="font-bold"
            >
              Confirm Adjustment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
