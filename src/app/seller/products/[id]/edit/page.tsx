"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { productService } from "@/services/product.service";
import { Product, ProductStatus } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/form-fields";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { useUIStore } from "@/store/ui-store";
import {
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  ExternalLink,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";

const CATEGORY_OPTIONS = [
  { id: "cat_electronics", name: "Electronics & Computing" },
  { id: "cat_fashion", name: "Fashion & Lifestyle" },
  { id: "cat_home", name: "Home & Furniture" },
  { id: "cat_beauty", name: "Health & Personal Care" },
  { id: "cat_sports", name: "Sports & Outdoor" },
  { id: "cat_books", name: "Books & Media" },
];

export default function EditProductPage() {
  const params = useParams();
  const productId = params.id as string;
  const router = useRouter();
  const { addToast } = useUIStore();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [sku, setSku] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState("cat_electronics");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState<ProductStatus>("ACTIVE");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const prod = await productService.getProductById(productId);
      if (prod) {
        setProduct(prod);
        setTitle(prod.title);
        setSlug(prod.slug);
        setDescription(prod.description);
        setShortDescription(prod.shortDescription || "");
        setPrice(prod.price.toString());
        setComparePrice(prod.comparePrice ? prod.comparePrice.toString() : "");
        setSku(prod.sku || "");
        setStock(prod.stock.toString());
        setCategoryId(prod.categoryId || "cat_electronics");
        setImageUrl(prod.images[0]?.url || "");
        setStatus(prod.status);
      }
      setLoading(false);
    }
    if (productId) load();
  }, [productId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (!product) {
    return (
      <ErrorState
        title="Product Not Found"
        message="The requested product does not exist in your store catalog."
        showBack
      />
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !description) {
      addToast({
        title: "Required Fields Missing",
        description: "Please specify title, price, and description.",
        type: "error",
      });
      return;
    }

    setIsSaving(true);
    try {
      const updated = await productService.updateProduct(product.id, {
        title,
        slug,
        description,
        shortDescription,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        sku,
        stock: parseInt(stock, 10) || 0,
        categoryId,
        status,
        images: [
          {
            id: `img_${Date.now()}`,
            url: imageUrl || product.images[0]?.url,
            altText: title,
            isPrimary: true,
            order: 0,
          },
        ],
      });

      if (updated) {
        setProduct(updated);
        addToast({
          title: "Product Updated",
          description: "All changes are now active on your store.",
          type: "success",
        });
        router.push("/seller/products");
      }
    } catch {
      addToast({
        title: "Update Error",
        description: "Failed to persist product edits. Please retry.",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border/60">
        <div>
          <Link
            href="/seller/products"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Products</span>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-foreground tracking-tight">
              Edit Product Listing
            </h1>
            <Badge variant={status === "ACTIVE" ? "success" : "secondary"}>
              {status}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/products/${product.slug}`} target="_blank">
            <Button variant="outline" size="sm" className="text-xs gap-1.5">
              <span>View Live</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <Button
            type="submit"
            form="edit-product-form"
            size="sm"
            disabled={isSaving}
            className="text-xs font-bold gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isSaving ? "Saving..." : "Save Changes"}</span>
          </Button>
        </div>
      </div>

      <form id="edit-product-form" onSubmit={handleSave} className="space-y-8">
        {/* Basic Details */}
        <div className="p-6 rounded-2xl border border-border/80 bg-card space-y-4 shadow-sm">
          <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary" />
            General Information
          </h2>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Product Title <span className="text-rose-500">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xs h-9"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                URL Slug
              </label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="text-xs h-9 font-mono bg-muted/40"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-9 rounded-xl border border-border/80 bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Short Description
            </label>
            <Input
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="text-xs h-9"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Full Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="text-xs"
              required
            />
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="p-6 rounded-2xl border border-border/80 bg-card space-y-4 shadow-sm">
          <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Pricing & Inventory
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Selling Price (₹) <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="text-xs h-9 font-mono"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Compare Price (₹)
              </label>
              <Input
                type="number"
                value={comparePrice}
                onChange={(e) => setComparePrice(e.target.value)}
                className="text-xs h-9 font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Current Stock (Units)
              </label>
              <Input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="text-xs h-9 font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                SKU Identifier
              </label>
              <Input
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="text-xs h-9 font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Publication Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProductStatus)}
                className="w-full h-9 rounded-xl border border-border/80 bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-bold"
              >
                <option value="ACTIVE">ACTIVE (Visible on Marketplace)</option>
                <option value="DRAFT">DRAFT (Hidden from Buyers)</option>
                <option value="OUT_OF_STOCK">OUT OF STOCK</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>
          </div>
        </div>

        {/* Image */}
        <div className="p-6 rounded-2xl border border-border/80 bg-card space-y-4 shadow-sm">
          <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-secondary" />
            Media & Imagery
          </h2>

          <div className="flex items-center gap-6">
            <div className="h-28 w-28 rounded-2xl bg-surface border border-border/80 overflow-hidden relative shrink-0">
              <Image src={imageUrl || product.images[0]?.url} alt={title} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-foreground block mb-1">
                Primary Image URL
              </label>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="text-xs h-9 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
          <Link href="/seller/products">
            <Button type="button" variant="outline" size="sm" className="text-xs">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            size="sm"
            disabled={isSaving}
            className="text-xs font-bold gap-1.5 min-w-[120px]"
          >
            {isSaving ? "Saving..." : "Save Edits"}
          </Button>
        </div>
      </form>
    </div>
  );
}
