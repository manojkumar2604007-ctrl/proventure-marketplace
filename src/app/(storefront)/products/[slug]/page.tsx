"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { productService } from "@/services/product.service";
import { vendorService } from "@/services/vendor.service";
import { ProductGallery } from "@/components/storefront/product-gallery";
import { ReviewSection } from "@/components/storefront/review-section";
import { ProductCard } from "@/components/storefront/product-card";
import { Product, SellerProfile, ProductVariant } from "@/types";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { useUIStore } from "@/store/ui-store";
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Store,
  Plus,
  Minus,
  Heart,
  ShoppingBag,
  Zap,
  ArrowRight,
  CheckCircle2,
  Share2,
} from "lucide-react";
import { MOCK_REVIEWS } from "@/lib/db/mock-data";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "specifications" | "reviews">("description");
  const [loading, setLoading] = useState(true);

  const addItem = useCartStore((state) => state.addItem);
  const { toggleItem, isInWishlist } = useWishlistStore();
  const { addToast, openCart } = useUIStore();

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      const prod = await productService.getProductBySlug(slug);
      if (!prod) {
        setLoading(false);
        return;
      }
      setProduct(prod);

      if (prod.variants && prod.variants.length > 0) {
        setSelectedVariant(prod.variants[0]);
      }

      const [sellerData, relatedData] = await Promise.all([
        prod.seller?.slug ? vendorService.getVendorBySlug(prod.seller.slug) : vendorService.getVendorById(prod.sellerId),
        productService.getRelatedProducts(prod.id, prod.categoryId, 4),
      ]);

      setSeller(sellerData || prod.seller || null);
      setRelatedProducts(relatedData);
      setLoading(false);
    }

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="container py-12 space-y-8">
        <Skeleton className="h-6 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7">
            <Skeleton className="aspect-square w-full rounded-2xl" />
          </div>
          <div className="lg:col-span-5 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-20">
        <ErrorState
          title="Product Not Found"
          message="The requested product could not be found or may have been unlisted by the merchant."
          showBack
        />
      </div>
    );
  }

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const discount = calculateDiscount(currentPrice, product.comparePrice);
  const isWishlisted = isInWishlist(product.id);
  const primaryImage = product.images?.[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80";

  const handleAddToCart = () => {
    addItem(
      {
        id: `${product.id}_${selectedVariant?.id || "default"}`,
        productId: product.id,
        title: product.title,
        price: currentPrice,
        comparePrice: product.comparePrice,
        image: primaryImage,
        sellerId: product.sellerId,
        sellerName: seller?.storeName || product.seller?.storeName || "Verified Merchant",
        stock: product.stock,
        variantName: selectedVariant?.name,
      },
      quantity
    );

    addToast({
      title: "Added to Cart",
      description: `${quantity}x ${product.title} placed in your shopping bag.`,
      type: "success",
    });

    openCart();
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  const handleWishlistToggle = () => {
    toggleItem(product);
    addToast({
      title: isWishlisted ? "Removed from Wishlist" : "Saved to Wishlist",
      description: product.title,
      type: "default",
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast({
        title: "Link Copied",
        description: "Product link copied to clipboard.",
        type: "success",
      });
    }
  };

  return (
    <div className="container py-8 space-y-12">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Products", href: "/products" },
          ...(product.category
            ? [{ label: product.category.name, href: `/categories/${product.category.slug}` }]
            : []),
          { label: product.title },
        ]}
      />

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Gallery */}
        <div className="lg:col-span-7">
          <ProductGallery images={product.images} title={product.title} />
        </div>

        {/* Right Column: Buying Details & CTAs */}
        <div className="lg:col-span-5 space-y-6">
          {/* Header & Badges */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Link
                href={`/stores/${seller?.slug || product.seller?.slug || "store"}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary hover:underline"
              >
                <Store className="h-3.5 w-3.5" />
                <span>{seller?.storeName || product.seller?.storeName || "Verified Vendor"}</span>
              </Link>

              <button
                onClick={handleShare}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-surface hover:text-foreground transition-colors"
                aria-label="Share product"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary leading-tight">
              {product.title}
            </h1>

            {/* Rating & Review Counter */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                <Star className="h-4 w-4 fill-current" />
                <span>{product.rating.toFixed(1)}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                ({product.reviewCount} customer reviews)
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-xs font-semibold text-accent flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> 100% Authentic
              </span>
            </div>
          </div>

          {/* Pricing & Savings */}
          <div className="p-4 rounded-2xl bg-surface/80 border border-border/80 space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-primary">
                {formatPrice(currentPrice)}
              </span>
              {product.comparePrice && product.comparePrice > currentPrice && (
                <span className="text-base text-muted-foreground line-through">
                  {formatPrice(product.comparePrice)}
                </span>
              )}
              {discount > 0 && (
                <Badge variant="accent" size="default" className="font-bold">
                  Save {discount}%
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Inclusive of all applicable GST taxes. Instant invoice generated upon dispatch.
            </p>
          </div>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Select Option: <span className="text-foreground">{selectedVariant?.name}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => {
                  const isSelected = selectedVariant?.id === variant.id;
                  return (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        isSelected
                          ? "border-secondary bg-secondary text-white shadow-subtle"
                          : "border-border/80 bg-background text-foreground hover:bg-surface"
                      }`}
                    >
                      {variant.name} - {formatPrice(variant.price)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Selector & Stock Status */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Quantity
              </label>
              <span
                className={`text-xs font-bold ${
                  product.stock > 0 ? "text-accent" : "text-destructive"
                }`}
              >
                {product.stock > 0
                  ? `In Stock (${product.stock} units available)`
                  : "Sold Out"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-xl border border-border/80 bg-background shadow-subtle p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || product.stock <= 0}
                  className="p-1.5 rounded-lg text-muted-foreground hover:bg-surface hover:text-foreground disabled:opacity-30"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center text-sm font-bold text-foreground">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock || product.stock <= 0}
                  className="p-1.5 rounded-lg text-muted-foreground hover:bg-surface hover:text-foreground disabled:opacity-30"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Wishlist Button */}
              <Button
                variant="outline"
                size="default"
                onClick={handleWishlistToggle}
                className={isWishlisted ? "text-rose-500 border-rose-200" : ""}
                leftIcon={
                  <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
                }
              >
                {isWishlisted ? "Saved" : "Wishlist"}
              </Button>
            </div>
          </div>

          {/* Action CTAs: Add to Cart & Buy Now */}
          <div className="space-y-2.5 pt-2">
            <Button
              size="lg"
              variant="default"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="w-full h-12 rounded-xl text-base font-bold shadow-card"
              leftIcon={<ShoppingBag className="h-5 w-5" />}
            >
              {product.stock > 0 ? "Add to Cart" : "Currently Out of Stock"}
            </Button>

            <Button
              size="lg"
              variant="accent"
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
              className="w-full h-12 rounded-xl text-base font-bold shadow-card"
              leftIcon={<Zap className="h-5 w-5" />}
            >
              Buy Now with 1-Click
            </Button>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/60 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-secondary shrink-0" />
              <span>Fast 2-3 Day Tracked Dispatch</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-accent shrink-0" />
              <span>10-Day Hassle-Free Returns</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Direct Verified Merchant Warranty</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500 shrink-0" />
              <span>Secured with Razorpay UPI</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description, Specifications, Reviews */}
      <div className="pt-8 border-t border-border/80 space-y-6">
        <div className="flex items-center gap-6 border-b border-border/80">
          <button
            onClick={() => setActiveTab("description")}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === "description"
                ? "border-secondary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Product Overview
          </button>
          <button
            onClick={() => setActiveTab("specifications")}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === "specifications"
                ? "border-secondary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Technical Specifications
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === "reviews"
                ? "border-secondary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Customer Reviews ({product.reviewCount})
          </button>
        </div>

        {/* Tab Content: Description */}
        {activeTab === "description" && (
          <div className="prose max-w-none text-sm text-foreground/90 leading-relaxed space-y-4">
            <p className="text-base font-medium text-foreground">
              {product.shortDescription || product.description}
            </p>
            <p>{product.description}</p>
            <div className="rounded-2xl border border-border/80 bg-surface/50 p-6 space-y-2 mt-4">
              <h4 className="font-bold text-sm text-primary">Creator Craftsmanship Note:</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Every unit sold by {seller?.storeName || "this merchant"} undergoes rigorous quality testing before packaging. Built with sustainable and durable premium materials for extended longevity.
              </p>
            </div>
          </div>
        )}

        {/* Tab Content: Specifications */}
        {activeTab === "specifications" && (
          <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-subtle">
            <table className="w-full text-left text-xs sm:text-sm">
              <tbody className="divide-y divide-border/60">
                <tr className="bg-surface/40">
                  <td className="px-5 py-3 font-semibold text-muted-foreground w-1/3">Stock Keeping Unit (SKU)</td>
                  <td className="px-5 py-3 font-mono font-bold text-foreground">{product.sku || "PV-PRD-8941"}</td>
                </tr>
                <tr>
                  <td className="px-5 py-3 font-semibold text-muted-foreground">Merchant / Studio</td>
                  <td className="px-5 py-3 text-foreground">{seller?.storeName || "Verified Studio"}</td>
                </tr>
                <tr className="bg-surface/40">
                  <td className="px-5 py-3 font-semibold text-muted-foreground">Category Department</td>
                  <td className="px-5 py-3 text-foreground">{product.category?.name || "General"}</td>
                </tr>
                <tr>
                  <td className="px-5 py-3 font-semibold text-muted-foreground">Warranty Period</td>
                  <td className="px-5 py-3 text-foreground">1 Year Comprehensive Manufacturer Replacement</td>
                </tr>
                <tr className="bg-surface/40">
                  <td className="px-5 py-3 font-semibold text-muted-foreground">Country of Origin</td>
                  <td className="px-5 py-3 text-foreground">India</td>
                </tr>
                <tr>
                  <td className="px-5 py-3 font-semibold text-muted-foreground">Tags &amp; Features</td>
                  <td className="px-5 py-3 text-foreground">
                    <div className="flex flex-wrap gap-1.5">
                      {product.tags.map((tag) => (
                        <Badge key={tag} variant="subtle" size="sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Tab Content: Reviews */}
        {activeTab === "reviews" && (
          <ReviewSection
            productId={product.id}
            reviews={MOCK_REVIEWS}
            rating={product.rating}
            reviewCount={product.reviewCount}
          />
        )}
      </div>

      {/* Seller Profile Card Spotlight */}
      {seller && (
        <div className="p-6 rounded-3xl border border-border/80 bg-gradient-to-r from-surface to-background shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-[#0A192F] text-white flex items-center justify-center font-extrabold text-2xl shadow-subtle">
              {seller.storeName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-primary">{seller.storeName}</h3>
                <Badge variant="success" size="sm" dot>
                  Verified Merchant
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 max-w-md">
                {seller.description || "Curated independent seller on ProVenture Marketplace"}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5">
                <span className="flex items-center gap-1 font-semibold text-amber-500">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  {seller.rating.toFixed(1)}
                </span>
                <span>•</span>
                <span>{seller.reviewCount} verified sales</span>
              </div>
            </div>
          </div>

          <Link href={`/stores/${seller.slug}`}>
            <Button variant="outline" size="sm" className="rounded-xl gap-2 font-semibold">
              <Store className="h-4 w-4" />
              <span>Visit Seller Store</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      )}

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <section className="pt-8 border-t border-border/80 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Similar Collections
              </span>
              <h2 className="heading-2 mt-0.5">Customers Also Viewed</h2>
            </div>
            <Link
              href="/products"
              className="text-xs font-semibold text-secondary hover:underline flex items-center gap-1"
            >
              Explore More <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
