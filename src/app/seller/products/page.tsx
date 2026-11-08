"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { productService } from "@/services/product.service";
import { Product, ProductStatus } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useUIStore } from "@/store/ui-store";
import {
  PlusCircle,
  Search,
  Trash2,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Layers,
} from "lucide-react";

export default function SellerProductsPage() {
  const sellerId = "seller_technexus";
  const { addToast } = useUIStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  // Delete modal state
  const [deleteCandidate, setDeleteCandidate] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const items = await productService.getProductsBySeller(sellerId);
      setProducts(items);
      setLoading(false);
    }
    load();
  }, [sellerId]);

  const handleToggleStatus = async (product: Product) => {
    const newStatus: ProductStatus = product.status === "ACTIVE" ? "DRAFT" : "ACTIVE";
    const updated = await productService.updateProduct(product.id, { status: newStatus });
    if (updated) {
      setProducts(products.map((p) => (p.id === product.id ? updated : p)));
      addToast({
        title: newStatus === "ACTIVE" ? "Product Published" : "Product Unpublished",
        description: `"${product.title}" status changed to ${newStatus}.`,
        type: newStatus === "ACTIVE" ? "success" : "default",
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);
    const success = await productService.deleteProduct(deleteCandidate.id);
    setIsDeleting(false);

    if (success) {
      setProducts(products.filter((p) => p.id !== deleteCandidate.id));
      addToast({
        title: "Product Deleted",
        description: `"${deleteCandidate.title}" has been permanently removed from your catalog.`,
        type: "default",
      });
    }
    setDeleteCandidate(null);
  };

  const filtered = products.filter((p) => {
    if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
    if (
      search &&
      !p.title.toLowerCase().includes(search.toLowerCase()) &&
      !p.sku?.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            Product Catalog Management
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Create, update, publish, or modify your store&apos;s product listings and variants
          </p>
        </div>

        <Link href="/seller/products/new">
          <Button size="sm" className="rounded-xl text-xs font-bold gap-1.5 shadow-sm">
            <PlusCircle className="h-4 w-4" />
            <span>Add New Product</span>
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border/80 shadow-sm">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by product title or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-border/80 bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs pb-1 sm:pb-0">
          <span className="text-muted-foreground text-xs font-medium mr-1">Status:</span>
          {["ALL", "ACTIVE", "DRAFT", "OUT_OF_STOCK"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-surface hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {st === "ALL" ? "All Products" : st.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="border border-border/80 rounded-2xl bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3.5 px-4">Item Details</th>
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Available Units</th>
                <th className="py-3.5 px-4">Market Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <p className="font-semibold">No products match your search or filter.</p>
                    <p className="text-[11px] mt-1">Try resetting filters or click Add New Product.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => {
                  const isLow = prod.stock <= 5;
                  const isOut = prod.stock === 0;

                  return (
                    <tr key={prod.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl bg-surface border border-border/60 overflow-hidden relative shrink-0">
                            <Image
                              src={prod.images[0]?.url || "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=200"}
                              alt={prod.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0 max-w-xs sm:max-w-md">
                            <Link
                              href={`/seller/products/${prod.id}/edit`}
                              className="font-bold text-foreground hover:text-primary transition-colors line-clamp-1"
                            >
                              {prod.title}
                            </Link>
                            <span className="text-[11px] text-muted-foreground block truncate">
                              Category: {prod.category?.name || "General"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-muted-foreground">
                        {prod.sku || "N/A"}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-foreground">
                        {formatPrice(prod.price)}
                        {prod.comparePrice && (
                          <span className="text-[10px] text-muted-foreground line-through block font-normal">
                            {formatPrice(prod.comparePrice)}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm">{prod.stock}</span>
                          {isOut ? (
                            <Badge variant="destructive" className="text-[9px] px-1.5 py-0">Out</Badge>
                          ) : isLow ? (
                            <Badge variant="warning" className="text-[9px] px-1.5 py-0">Low</Badge>
                          ) : (
                            <Badge variant="success" className="text-[9px] px-1.5 py-0">Healthy</Badge>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleStatus(prod)}
                          className="cursor-pointer group inline-flex items-center gap-1.5"
                          title="Click to toggle publish status"
                        >
                          <Badge
                            variant={
                              prod.status === "ACTIVE"
                                ? "success"
                                : prod.status === "DRAFT"
                                ? "secondary"
                                : "destructive"
                            }
                            className="text-[10px] group-hover:opacity-80 transition-opacity"
                          >
                            {prod.status}
                          </Badge>
                          {prod.status === "ACTIVE" ? (
                            <Eye className="h-3 w-3 text-muted-foreground group-hover:text-foreground" />
                          ) : (
                            <EyeOff className="h-3 w-3 text-muted-foreground group-hover:text-foreground" />
                          )}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/seller/products/${prod.id}/edit`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              title="Edit Product & Variants"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                          </Link>

                          <Link href={`/products/${prod.slug}`} target="_blank">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              title="View Live Listing"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </Link>

                          <button
                            onClick={() => setDeleteCandidate(prod)}
                            className="p-2 text-muted-foreground hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteCandidate)}
        onClose={() => setDeleteCandidate(null)}
        title="Confirm Product Deletion"
      >
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Are you sure you want to remove <span className="font-bold text-foreground">"{deleteCandidate?.title}"</span>? This will permanently erase the product, SKU, and all associated inventory configurations from the marketplace.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteCandidate(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Permanently Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
