"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { productService } from "@/services/product.service";
import { slugify, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/form-fields";
import { Badge } from "@/components/ui/badge";
import { useUIStore } from "@/store/ui-store";
import {
  ArrowLeft,
  UploadCloud,
  Sparkles,
  Plus,
  Trash2,
  DollarSign,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";

interface VariantItem {
  id: string;
  name: string;
  sku: string;
  price: string;
  stock: string;
}

const CATEGORY_OPTIONS = [
  { id: "cat_electronics", name: "Electronics & Computing" },
  { id: "cat_fashion", name: "Fashion & Lifestyle" },
  { id: "cat_home", name: "Home & Furniture" },
  { id: "cat_beauty", name: "Health & Personal Care" },
  { id: "cat_sports", name: "Sports & Outdoor" },
  { id: "cat_books", name: "Books & Media" },
];

const PRESET_IMAGES = [
  "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80",
];

export default function NewProductPage() {
  const router = useRouter();
  const { addToast } = useUIStore();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [sku, setSku] = useState("");
  const [stock, setStock] = useState("25");
  const [categoryId, setCategoryId] = useState("cat_electronics");
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0]);
  const [tagsInput, setTagsInput] = useState("Premium, Flagship, New Arrival");
  const [status, setStatus] = useState<"ACTIVE" | "DRAFT">("ACTIVE");

  // Variant Matrix state
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<VariantItem[]>([
    { id: "v_1", name: "Space Gray / Standard", sku: "TN-GRY-01", price: "", stock: "15" },
    { id: "v_2", name: "Silver / Standard", sku: "TN-SLV-02", price: "", stock: "10" },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    setSlug(slugify(val));
    if (!sku && val.length > 2) {
      setSku(`TN-${val.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`);
    }
  };

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      {
        id: `v_${Date.now()}`,
        name: "New Variant Option",
        sku: `${sku || "TN"}-VAR-${variants.length + 1}`,
        price: price || "0",
        stock: "10",
      },
    ]);
  };

  const handleRemoveVariant = (id: string) => {
    setVariants(variants.filter((v) => v.id !== id));
  };

  const handleUpdateVariant = (id: string, field: keyof VariantItem, val: string) => {
    setVariants(variants.map((v) => (v.id === id ? { ...v, [field]: val } : v)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !description) {
      addToast({
        title: "Required Fields Missing",
        description: "Please specify Product Title, Base Price, and Description.",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const numPrice = parseFloat(price);
      const numCompare = comparePrice ? parseFloat(comparePrice) : undefined;
      const numStock = parseInt(stock, 10) || 10;

      await productService.createProduct({
        title,
        slug: slug || slugify(title),
        description,
        shortDescription,
        price: numPrice,
        comparePrice: numCompare,
        sku: sku || `TN-${Date.now().toString().slice(-6)}`,
        stock: numStock,
        sellerId: "seller_technexus",
        categoryId,
        imageUrl,
        tags,
        status,
      });

      addToast({
        title: status === "ACTIVE" ? "Product Published!" : "Draft Saved",
        description: `"${title}" has been successfully created.`,
        type: "success",
      });

      router.push("/seller/products");
    } catch {
      addToast({
        title: "Creation Error",
        description: "Failed to create product listing. Please verify inputs.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pricing calculations
  const parsedPrice = parseFloat(price) || 0;
  const parsedCompare = parseFloat(comparePrice) || 0;
  const discountPercent =
    parsedCompare > parsedPrice ? Math.round(((parsedCompare - parsedPrice) / parsedCompare) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border/60">
        <div>
          <Link
            href="/seller/products"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Catalog</span>
          </Link>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            Add New Marketplace Product
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setStatus("DRAFT")}
            className="text-xs"
          >
            Save Draft
          </Button>
          <Button
            type="submit"
            form="new-product-form"
            size="sm"
            disabled={isSubmitting}
            className="text-xs font-bold gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{isSubmitting ? "Publishing..." : "Publish Product"}</span>
          </Button>
        </div>
      </div>

      <form id="new-product-form" onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="p-6 rounded-2xl border border-border/80 bg-card space-y-4 shadow-sm">
          <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary" />
            Basic Product Information
          </h2>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Product Title <span className="text-rose-500">*</span>
            </label>
            <Input
              value={title}
              onChange={handleTitleChange}
              placeholder="e.g. ProVent Ergonomic Studio Headphones"
              className="text-xs h-10"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                URL Slug (Auto-generated)
              </label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="provent-ergonomic-studio-headphones"
                className="text-xs h-9 font-mono bg-muted/40"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Product Category <span className="text-rose-500">*</span>
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
              Short Description (Storefront Teaser)
            </label>
            <Input
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Brief 1-sentence value proposition displayed on product cards."
              className="text-xs h-9"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Full Product Description <span className="text-rose-500">*</span>
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe materials, engineering highlights, dimensions, warranty, and compatibility."
              rows={4}
              className="text-xs"
              required
            />
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="p-6 rounded-2xl border border-border/80 bg-card space-y-4 shadow-sm">
          <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Pricing & Stock Control (INR)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Selling Price (₹) <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                min="1"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="4999"
                className="text-xs h-9 font-mono"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Compare-at Price (MRP ₹)
              </label>
              <Input
                type="number"
                min="1"
                step="0.01"
                value={comparePrice}
                onChange={(e) => setComparePrice(e.target.value)}
                placeholder="6999"
                className="text-xs h-9 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Initial Stock Units <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="25"
                className="text-xs h-9 font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Master SKU
              </label>
              <Input
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="TN-PRD-882"
                className="text-xs h-9 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Search Tags (comma-separated)
              </label>
              <Input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Ergonomic, Flagship, Wireless"
                className="text-xs h-9"
              />
            </div>
          </div>

          {discountPercent > 0 && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between text-xs text-emerald-700">
              <span className="font-semibold">Customer Savings Calculated:</span>
              <span className="font-bold font-mono">
                {discountPercent}% OFF (Saves {formatPrice(parsedCompare - parsedPrice)})
              </span>
            </div>
          )}
        </div>

        {/* Media & Image Upload */}
        <div className="p-6 rounded-2xl border border-border/80 bg-card space-y-4 shadow-sm">
          <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-secondary" />
            Product Imagery (Cloudinary Supported)
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="h-32 w-32 rounded-2xl bg-surface border border-border/80 overflow-hidden relative shrink-0">
              <Image src={imageUrl} alt="Thumbnail Preview" fill className="object-cover" />
            </div>

            <div className="flex-1 space-y-3 w-full">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Primary Image URL (Cloudinary / CDN)
                </label>
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://res.cloudinary.com/... or https://images.unsplash.com/..."
                  className="text-xs h-9 font-mono"
                />
              </div>

              <div>
                <span className="text-[11px] text-muted-foreground block mb-1.5">
                  Or pick a curated demo preset:
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {PRESET_IMAGES.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setImageUrl(img)}
                      className={`h-10 w-10 rounded-lg overflow-hidden relative border-2 transition-all shrink-0 ${
                        imageUrl === img ? "border-primary ring-2 ring-primary/30" : "border-border/60 opacity-60"
                      }`}
                    >
                      <Image src={img} alt={`Preset ${i}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Variant Matrix */}
        <div className="p-6 rounded-2xl border border-border/80 bg-card space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-purple-500" />
              Product Variants & Matrix
            </h2>
            <button
              type="button"
              onClick={() => setHasVariants(!hasVariants)}
              className="text-xs font-semibold text-primary hover:underline"
            >
              {hasVariants ? "Disable Variants" : "+ Enable Variant Matrix"}
            </button>
          </div>

          {hasVariants ? (
            <div className="space-y-3">
              <div className="space-y-2">
                {variants.map((v, idx) => (
                  <div
                    key={v.id}
                    className="flex flex-col sm:flex-row items-center gap-2 p-3 rounded-xl bg-surface/60 border border-border/60 text-xs"
                  >
                    <div className="flex-1 w-full sm:w-auto">
                      <span className="text-[10px] text-muted-foreground block mb-0.5">Variant Title</span>
                      <Input
                        value={v.name}
                        onChange={(e) => handleUpdateVariant(v.id, "name", e.target.value)}
                        placeholder="e.g. Matte Black / 256GB"
                        className="text-xs h-8"
                      />
                    </div>
                    <div className="w-full sm:w-36">
                      <span className="text-[10px] text-muted-foreground block mb-0.5">SKU</span>
                      <Input
                        value={v.sku}
                        onChange={(e) => handleUpdateVariant(v.id, "sku", e.target.value)}
                        placeholder="SKU-001"
                        className="text-xs h-8 font-mono"
                      />
                    </div>
                    <div className="w-full sm:w-28">
                      <span className="text-[10px] text-muted-foreground block mb-0.5">Price (₹)</span>
                      <Input
                        type="number"
                        value={v.price}
                        onChange={(e) => handleUpdateVariant(v.id, "price", e.target.value)}
                        placeholder={price || "0"}
                        className="text-xs h-8 font-mono"
                      />
                    </div>
                    <div className="w-full sm:w-24">
                      <span className="text-[10px] text-muted-foreground block mb-0.5">Stock</span>
                      <Input
                        type="number"
                        value={v.stock}
                        onChange={(e) => handleUpdateVariant(v.id, "stock", e.target.value)}
                        placeholder="10"
                        className="text-xs h-8 font-mono"
                      />
                    </div>
                    <div className="pt-3 sm:pt-4">
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(v.id)}
                        className="p-1.5 text-muted-foreground hover:text-rose-600 rounded-md transition-colors"
                        title="Remove Variant"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddVariant}
                className="text-xs gap-1.5 w-full border-dashed"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Another Variant (Size, Color, Model)</span>
              </Button>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              This product is single-SKU. Click "+ Enable Variant Matrix" above if this item has multiple colors, sizes, or technical configurations.
            </p>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
          <Link href="/seller/products">
            <Button type="button" variant="outline" size="sm" className="text-xs">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting}
            className="text-xs font-bold gap-1.5 min-w-[140px]"
          >
            {isSubmitting ? "Creating..." : "Save & Publish"}
          </Button>
        </div>
      </form>
    </div>
  );
}
