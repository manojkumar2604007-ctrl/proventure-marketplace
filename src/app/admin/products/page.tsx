"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { productService } from "@/services/product.service";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/ui-store";
import { Sparkles, Eye, Trash2, Check, Ban } from "lucide-react";

export default function AdminProductsPage() {
  const { addToast } = useUIStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await productService.getProducts({ limit: 50 });
      setProducts(res.products);
      setLoading(false);
    }
    load();
  }, []);

  const handleToggleFeatured = async (product: Product) => {
    const updated = await productService.updateProduct(product.id, {
      featured: !product.featured,
    });
    if (updated) {
      setProducts(products.map((p) => (p.id === product.id ? updated : p)));
      addToast({
        title: updated.featured ? "Product Featured" : "Removed from Featured",
        description: `"${product.title}" homepage promotion updated.`,
        type: "success",
      });
    }
  };

  const handleArchive = async (product: Product) => {
    const newStatus = product.status === "ACTIVE" ? "ARCHIVED" : "ACTIVE";
    const updated = await productService.updateProduct(product.id, { status: newStatus });
    if (updated) {
      setProducts(products.map((p) => (p.id === product.id ? updated : p)));
      addToast({
        title: "Product Moderated",
        description: `Status changed to ${newStatus}.`,
        type: "default",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Product Catalog Moderation
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Curate homepage featured listings and enforce content guidelines
        </p>
      </div>

      <div className="border border-slate-800 rounded-2xl bg-slate-900/60 overflow-hidden shadow-sm">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
              <th className="py-3.5 px-4">Item Details</th>
              <th className="py-3.5 px-4">Price</th>
              <th className="py-3.5 px-4">Department</th>
              <th className="py-3.5 px-4">Featured</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Moderation Controls</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {products.map((prod) => {
              const primaryImg =
                prod.images.find((i) => i.isPrimary)?.url ||
                prod.images[0]?.url ||
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80";

              return (
                <tr key={prod.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
                        <Image
                          src={primaryImg}
                          alt={prod.title}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div className="max-w-xs">
                        <span className="font-bold text-white block line-clamp-1">
                          {prod.title}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          SKU: {prod.sku || "N/A"}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-white">
                    {formatPrice(prod.price)}
                  </td>

                  <td className="py-3.5 px-4 text-slate-300">
                    {prod.categoryId}
                  </td>

                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleToggleFeatured(prod)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition-colors ${
                        prod.featured
                          ? "bg-indigo-950 text-indigo-300 border border-indigo-700"
                          : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>{prod.featured ? "Featured" : "Regular"}</span>
                    </button>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        prod.status === "ACTIVE"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : "bg-rose-950 text-rose-400 border border-rose-800"
                      }`}
                    >
                      {prod.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/products/${prod.slug}`} target="_blank">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </Link>

                      <Button
                        onClick={() => handleArchive(prod)}
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs border-slate-700 bg-slate-800 text-slate-300 hover:text-white"
                      >
                        {prod.status === "ACTIVE" ? "Archive" : "Activate"}
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
