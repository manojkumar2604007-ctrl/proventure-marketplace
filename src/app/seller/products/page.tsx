"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { productService } from "@/services/product.service";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUIStore } from "@/store/ui-store";
import { PlusCircle, Search, Trash2, Edit, ExternalLink } from "lucide-react";

export default function SellerProductsPage() {
  const { addToast } = useUIStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
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

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to remove "${title}"?`)) {
      await productService.deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
      addToast({
        title: "Product Removed",
        description: `"${title}" has been deleted from your catalog.`,
        type: "default",
      });
    }
  };

  const handleToggleStatus = async (product: Product) => {
    const newStatus = product.status === "ACTIVE" ? "DRAFT" : "ACTIVE";
    const updated = await productService.updateProduct(product.id, { status: newStatus });
    if (updated) {
      setProducts(products.map((p) => (p.id === product.id ? updated : p)));
      addToast({
        title: "Status Updated",
        description: `Product status changed to ${newStatus}.`,
        type: "success",
      });
    }
  };

  const filtered = products.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            Product Catalog
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your store&apos;s live inventory, pricing, and marketplace visibility
          </p>
        </div>

        <Link href="/seller/products/new">
          <Button size="sm" className="rounded-xl text-xs font-semibold gap-1.5 shadow-sm">
            <PlusCircle className="h-4 w-4" />
            <span>Add New Product</span>
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by title or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="border rounded-2xl bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b bg-muted/30 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((prod) => {
                const primaryImg =
                  prod.images.find((i) => i.isPrimary)?.url ||
                  prod.images[0]?.url ||
                  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80";

                return (
                  <tr key={prod.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted border shrink-0">
                          <Image
                            src={primaryImg}
                            alt={prod.title}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div className="max-w-xs">
                          <span className="font-bold text-foreground block line-clamp-1">
                            {prod.title}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {prod.rating.toFixed(1)} ★ ({prod.reviewCount} reviews)
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-medium text-muted-foreground">
                      {prod.sku || "N/A"}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-foreground">
                      {formatPrice(prod.price)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`font-semibold ${
                          prod.stock <= 5 ? "text-rose-500" : "text-emerald-600"
                        }`}
                      >
                        {prod.stock} units
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(prod)}
                        className="cursor-pointer"
                        title="Click to toggle status"
                      >
                        <Badge
                          variant={prod.status === "ACTIVE" ? "success" : "secondary"}
                          className="text-[10px]"
                        >
                          {prod.status}
                        </Badge>
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/products/${prod.slug}`} target="_blank">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            title="View Live Listing"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </Link>

                        <button
                          onClick={() => handleDelete(prod.id, prod.title)}
                          className="p-1.5 text-muted-foreground hover:text-rose-500 rounded-md transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
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
