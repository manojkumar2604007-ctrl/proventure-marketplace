"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { productService } from "@/services/product.service";
import { adminService } from "@/services/admin.service";
import { Product, ProductStatus } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useUIStore } from "@/store/ui-store";
import {
  Sparkles,
  Eye,
  Trash2,
  Check,
  Ban,
  Search,
  Filter,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Store,
} from "lucide-react";

export default function AdminProductsPage() {
  const { addToast } = useUIStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Deletion Candidate
  const [deleteCandidate, setDeleteCandidate] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await productService.getProducts({ limit: 100 });
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

  const handleUpdateStatus = async (product: Product, newStatus: ProductStatus) => {
    const updated = await productService.updateProduct(product.id, { status: newStatus });
    if (updated) {
      setProducts(products.map((p) => (p.id === product.id ? updated : p)));

      adminService.recordAuditLog({
        adminName: "Alex Vane (Super Admin)",
        action: `PRODUCT_${newStatus}`,
        entityType: "Product",
        entityId: product.id,
        details: `Product "${product.title}" status changed to ${newStatus}.`,
      });

      addToast({
        title: "Product Moderated",
        description: `"${product.title}" is now ${newStatus}.`,
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

      adminService.recordAuditLog({
        adminName: "Alex Vane (Super Admin)",
        action: "PROHIBITED_PRODUCT_REMOVED",
        entityType: "Product",
        entityId: deleteCandidate.id,
        details: `Deleted prohibited product "${deleteCandidate.title}" from store ${deleteCandidate.seller?.storeName || deleteCandidate.sellerId}.`,
      });

      addToast({
        title: "Product Permanently Removed",
        description: `"${deleteCandidate.title}" was purged from the marketplace.`,
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
      !p.sku?.toLowerCase().includes(search.toLowerCase()) &&
      !p.seller?.storeName?.toLowerCase().includes(search.toLowerCase())
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
            Product Catalog Moderation & Content Review
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Approve listings, enforce compliance standards, feature storefront highlights, and purge prohibited merchandise
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-sm">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by product name, SKU, or merchant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs pb-1 sm:pb-0">
          <span className="text-slate-400 text-xs font-medium mr-1">Status:</span>
          {["ALL", "ACTIVE", "DRAFT", "ARCHIVED", "OUT_OF_STOCK"].map((st) => (
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

      {/* Products Table */}
      <div className="border border-slate-800 rounded-2xl bg-slate-900/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3.5 px-4">Item Details</th>
                <th className="py-3.5 px-4">Merchant</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Homepage Featured</th>
                <th className="py-3.5 px-4">Moderation Status</th>
                <th className="py-3.5 px-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginated.map((prod) => {
                const primaryImg =
                  prod.images.find((i) => i.isPrimary)?.url ||
                  prod.images[0]?.url ||
                  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800";

                return (
                  <tr key={prod.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-11 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
                          <Image src={primaryImg} alt={prod.title} fill className="object-cover" />
                        </div>
                        <div className="max-w-xs">
                          <span className="font-bold text-white block line-clamp-1">{prod.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">SKU: {prod.sku || "N/A"}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      <span className="font-bold text-white block">{prod.seller?.storeName || prod.sellerId}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{prod.category?.name || "General"}</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {formatPrice(prod.price)}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-300">
                      {prod.stock} units
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
                            : prod.status === "DRAFT"
                            ? "bg-slate-800 text-slate-400 border border-slate-700"
                            : "bg-rose-950 text-rose-400 border border-rose-800"
                        }`}
                      >
                        {prod.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/products/${prod.slug}`} target="_blank">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-400 hover:text-white hover:bg-slate-800"
                            title="Inspect Live Listing"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </Link>

                        {prod.status === "ACTIVE" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateStatus(prod, "ARCHIVED")}
                            className="h-7 px-2 text-xs font-bold text-amber-400 hover:bg-amber-950/40"
                            title="Suspend/Archive product"
                          >
                            Suspend
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateStatus(prod, "ACTIVE")}
                            className="h-7 px-2 text-xs font-bold text-emerald-400 hover:bg-emerald-950/40"
                            title="Approve & activate listing"
                          >
                            Approve
                          </Button>
                        )}

                        <button
                          onClick={() => setDeleteCandidate(prod)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-md hover:bg-rose-950/40 transition-colors"
                          title="Purge prohibited item"
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

        {/* Pagination Controls */}
        <div className="flex items-center justify-between p-4 border-t border-slate-800 text-xs text-slate-400">
          <span>
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} products
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

      {/* Prohibited Product Deletion Modal */}
      <Modal
        isOpen={Boolean(deleteCandidate)}
        onClose={() => setDeleteCandidate(null)}
        title="Remove Prohibited Product"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Are you sure you want to permanently delete <strong className="text-white">"{deleteCandidate?.title}"</strong>?
            This will purge the listing, inventory, and variants from marketplace catalog and record an administrative audit log.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteCandidate(null)}
              disabled={isDeleting}
              className="border-slate-700 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="font-bold"
            >
              {isDeleting ? "Purging..." : "Confirm Deletion"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
