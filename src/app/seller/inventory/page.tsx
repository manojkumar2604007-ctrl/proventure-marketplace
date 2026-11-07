"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { productService } from "@/services/product.service";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/ui-store";
import { Plus, Minus, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function SellerInventoryPage() {
  const { addToast } = useUIStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const items = await productService.getProductsBySeller("seller_technexus");
      setProducts(items);
      setLoading(false);
    }
    load();
  }, []);

  const handleStockUpdate = async (product: Product, delta: number) => {
    const newStock = Math.max(0, product.stock + delta);
    const updated = await productService.updateProduct(product.id, {
      stock: newStock,
      status: newStock === 0 ? "OUT_OF_STOCK" : "ACTIVE",
    });

    if (updated) {
      setProducts(products.map((p) => (p.id === product.id ? updated : p)));
      addToast({
        title: "Stock Updated",
        description: `${product.title} updated to ${newStock} units.`,
        type: "success",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">
          Inventory Control
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Real-time stock level monitoring with instant decrement and threshold alerts
        </p>
      </div>

      <div className="border rounded-2xl bg-card overflow-hidden shadow-sm">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b bg-muted/30 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
              <th className="py-3.5 px-4">Item</th>
              <th className="py-3.5 px-4">SKU</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Available Units</th>
              <th className="py-3.5 px-4 text-right">Quick Stock Adjustment</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((prod) => {
              const isLow = prod.stock <= 5;
              const isOut = prod.stock === 0;

              return (
                <tr key={prod.id} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-foreground">
                    {prod.title}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-muted-foreground">
                    {prod.sku || "N/A"}
                  </td>
                  <td className="py-3.5 px-4">
                    {isOut ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-500">
                        <AlertTriangle className="h-3 w-3" /> Out of Stock
                      </span>
                    ) : isLow ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-500">
                        <AlertTriangle className="h-3 w-3" /> Low Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                        <CheckCircle2 className="h-3 w-3" /> Healthy
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-sm font-black text-foreground">
                      {prod.stock}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        onClick={() => handleStockUpdate(prod, -5)}
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        disabled={prod.stock < 5}
                      >
                        -5
                      </Button>
                      <Button
                        onClick={() => handleStockUpdate(prod, -1)}
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0"
                        disabled={prod.stock === 0}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Button
                        onClick={() => handleStockUpdate(prod, 1)}
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        onClick={() => handleStockUpdate(prod, 10)}
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs"
                      >
                        +10
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
