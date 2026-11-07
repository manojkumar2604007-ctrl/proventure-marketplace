"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { productService } from "@/services/product.service";
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUIStore } from "@/store/ui-store";
import { ArrowLeft, UploadCloud, Sparkles, Check } from "lucide-react";
import Link from "next/link";

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
  const [stock, setStock] = useState("20");
  const [categoryId, setCategoryId] = useState("cat_electronics");
  const [imageUrl, setImageUrl] = useState(
    "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80"
  );
  const [tagsInput, setTagsInput] = useState("Premium, New Arrival, Flagship");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    setSlug(slugify(val));
    if (!sku && val.length > 2) {
      setSku(`TN-${val.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !description) {
      addToast({
        title: "Missing Fields",
        description: "Title, Price, and Description are required.",
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

      await productService.createProduct({
        title,
        slug: slug || slugify(title),
        description,
        shortDescription,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : undefined,
        sku,
        stock: parseInt(stock, 10) || 10,
        sellerId: "seller_technexus",
        categoryId,
        imageUrl,
        tags,
      });

      addToast({
        title: "Product Published!",
        description: `"${title}" is now active in your marketplace shop.`,
        type: "success",
      });

      router.push("/seller/products");
    } catch {
      addToast({
        title: "Error",
        description: "Failed to publish product. Please retry.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <Link
            href="/seller/products"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Products
          </Link>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            Add New Marketplace Product
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure catalog item details, inventory quantities, and visual assets
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="p-6 rounded-2xl border bg-card space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-foreground">1. Basic Details</h3>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Product Title *
              </label>
              <Input
                type="text"
                placeholder="e.g. Apex Acoustic Hi-Res Wireless Monitors"
                value={title}
                onChange={handleTitleChange}
                required
                className="text-xs h-9"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Product Slug (URL Friendly)
                </label>
                <Input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="text-xs h-9 font-mono bg-muted/40"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Department / Category *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full text-xs h-9 px-3 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="cat_electronics">Consumer Electronics</option>
                  <option value="cat_fashion">Apparel & Textiles</option>
                  <option value="cat_home">Home & Living</option>
                  <option value="cat_wellness">Beauty & Wellness</option>
                  <option value="cat_sports">Athletics & Gear</option>
                  <option value="cat_watches">Horology & Jewelry</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Short Highlight Summary
              </label>
              <Input
                type="text"
                placeholder="A concise single-sentence punchline for cards and search snippets"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Comprehensive Description & Specifications *
              </label>
              <textarea
                rows={5}
                placeholder="Detail technical features, build materials, warranty, and compatibility..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full p-3 rounded-xl border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="p-6 rounded-2xl border bg-card space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-foreground">2. Pricing & Inventory</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Listing Price (₹) *
              </label>
              <Input
                type="number"
                placeholder="9999"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="text-xs h-9 font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Compare-at Price (₹)
              </label>
              <Input
                type="number"
                placeholder="12999"
                value={comparePrice}
                onChange={(e) => setComparePrice(e.target.value)}
                className="text-xs h-9 text-muted-foreground"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Stock Keeping Unit (SKU)
              </label>
              <Input
                type="text"
                placeholder="TN-HP-88"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="text-xs h-9 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Inventory Units *
              </label>
              <Input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
                className="text-xs h-9"
              />
            </div>
          </div>
        </div>

        {/* Imagery & Media */}
        <div className="p-6 rounded-2xl border bg-card space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">
              3. Visual Assets (Cloudinary Ready)
            </h3>
            <span className="text-[11px] text-muted-foreground">
              CDN URL or direct preset upload
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Primary Image URL
              </label>
              <Input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            {imageUrl && (
              <div className="flex items-center gap-4 p-3 rounded-xl bg-muted/40 border">
                <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-muted border shrink-0">
                  <Image
                    src={imageUrl}
                    alt="Product preview"
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <span className="text-xs font-bold text-foreground block">
                    Asset Preview
                  </span>
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                    <Check className="h-3 w-3" /> Ready for marketplace display
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Search Tags (Comma separated)
              </label>
              <Input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="text-xs h-9"
              />
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Link href="/seller/products">
            <Button variant="outline" size="sm" type="button" className="text-xs rounded-xl">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isSubmitting}
            size="lg"
            className="rounded-xl text-xs font-bold gap-2"
          >
            <Sparkles className="h-4 w-4" />
            <span>{isSubmitting ? "Publishing..." : "Publish to Marketplace"}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
