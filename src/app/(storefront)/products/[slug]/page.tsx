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
  ArrowRight,
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
        vendorService.getVendorById(prod.sellerId),
        productService.getProducts({ category: prod.categoryId, limit: 4 }),
      ]);

      setSeller(sellerData);
      setRelatedProducts(relatedData.products.filter((p) => p.id !== prod.id));
      setLoading(false);
    }

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="container py-16 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">Product Not Found</h2>
        <p className="text-sm text-muted-foreground">
          The requested product could not be located in our marketplace.
        </p>
        <Link href="/products">
          <Button>Back to Marketplace Catalog</Button>
        </Link>
      </div>
    );
  }

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const discount = calculateDiscount(currentPrice, product.comparePrice);
  const isWishlisted = isInWishlist(product.id);
  const primaryImg =
    product.images.find((i) => i.isPrimary)?.url ||
    product.images[0]?.url ||
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80";

  const handleAddToCart = () => {
    addItem(
      {
        id: selectedVariant ? `${product.id}_${selectedVariant.id}` : `${product.id}_default`,
        productId: product.id,
        variantId: selectedVariant?.id,
        variantName: selectedVariant?.name,
        title: product.title,
        price: currentPrice,
        comparePrice: product.comparePrice,
        image: primaryImg,
        sellerId: product.sellerId,
        sellerName: seller?.storeName || "Verified Vendor",
        stock: selectedVariant ? selectedVariant.stock : product.stock,
      },
      quantity
    );

    addToast({
      title: "Added to Cart",
      description: `${quantity}x ${product.title} placed in cart.`,
      type: "success",
    });

    openCart();
  };

  const productReviews = MOCK_REVIEWS.filter((r) => r.productId === product.id);

  return (
    <div className="container py-8 space-y-12">
      {/* Breadcrumb */}
      <nav className="text-xs text-muted-foreground flex items-center gap-2">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-foreground">Products</Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate max-w-xs">{product.title}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Gallery (7 Cols) */}
        <div className="lg:col-span-7">
          <ProductGallery images={product.images} title={product.title} />
        </div>

        {/* Right: Product Actions & Buy Box (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            {/* Seller attribution badge */}
            <div className="flex items-center justify-between mb-2">
              <Link
                href={`/products?seller=${seller?.slug}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                <Store className="h-3.5 w-3.5" />
                <span>{seller?.storeName || "Verified Merchant"}</span>
              </Link>
              {product.stock > 0 ? (
                <Badge variant="success" className="text-[10px]">In Stock</Badge>
              ) : (
                <Badge variant="destructive" className="text-[10px]">Sold Out</Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight leading-snug">
              {product.title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-xs font-bold">{product.rating.toFixed(1)}</span>
              </div>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">
                {product.reviewCount} verified ratings
              </span>
              {product.sku && (
                <>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">SKU: {product.sku}</span>
                </>
              )}
            </div>
          </div>

          {/* Price Box */}
          <div className="p-4 rounded-2xl bg-muted/30 border space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-foreground">
                {formatPrice(currentPrice)}
              </span>
              {product.comparePrice && product.comparePrice > currentPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.comparePrice)}
                </span>
              )}
              {discount > 0 && (
                <Badge variant="destructive" className="font-bold text-xs">
                  Save {discount}%
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Inclusive of all taxes. Free shipping on this order.
            </p>
          </div>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground block">
                Select Option / Variant
              </label>
              <div className="grid grid-cols-2 gap-2">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`p-3 rounded-xl border text-left transition-all text-xs ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary font-semibold text-primary"
                          : "border-border hover:border-muted-foreground/30 text-foreground"
                      }`}
                    >
                      <div className="font-medium truncate">{v.name}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {formatPrice(v.price)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity and Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              {/* Quantity incrementer */}
              <div className="flex items-center border rounded-xl bg-muted/40 p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 text-sm font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Add to Cart CTA */}
              <Button
                onClick={handleAddToCart}
                size="lg"
                className="flex-1 rounded-xl gap-2 font-bold shadow-md shadow-primary/20"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Add to Cart</span>
              </Button>

              {/* Wishlist CTA */}
              <Button
                onClick={() => {
                  toggleItem(product);
                  addToast({
                    title: isWishlisted ? "Removed from Wishlist" : "Saved to Wishlist",
                    description: product.title,
                  });
                }}
                variant="outline"
                size="lg"
                className={`rounded-xl px-4 ${
                  isWishlisted ? "text-rose-500 border-rose-200 bg-rose-50 dark:bg-rose-950/20" : ""
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`} />
              </Button>
            </div>
          </div>

          {/* Seller Store Card */}
          {seller && (
            <div className="p-4 rounded-2xl border bg-card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">
                    Fulfilled by {seller.storeName}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                      <Star className="h-3 w-3 fill-current" /> {seller.rating}
                    </span>
                    <span>•</span>
                    <span>{seller.city}, {seller.state}</span>
                  </div>
                </div>
              </div>
              <Link href={`/products?seller=${seller.slug}`}>
                <Button variant="outline" size="sm" className="text-xs rounded-lg">
                  Visit Store
                </Button>
              </Link>
            </div>
          )}

          {/* Value Highlights */}
          <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs text-muted-foreground">
            <div className="p-3 rounded-xl border bg-muted/10 space-y-1">
              <Truck className="h-4 w-4 mx-auto text-primary" />
              <p className="font-semibold text-foreground text-[11px]">Direct Dispatch</p>
              <p className="text-[10px]">Dispatches in 24 hrs</p>
            </div>
            <div className="p-3 rounded-xl border bg-muted/10 space-y-1">
              <RotateCcw className="h-4 w-4 mx-auto text-emerald-600" />
              <p className="font-semibold text-foreground text-[11px]">10-Day Returns</p>
              <p className="text-[10px]">Hassle-free exchange</p>
            </div>
            <div className="p-3 rounded-xl border bg-muted/10 space-y-1">
              <ShieldCheck className="h-4 w-4 mx-auto text-amber-500" />
              <p className="font-semibold text-foreground text-[11px]">Authentic</p>
              <p className="text-[10px]">100% Genuine brand</p>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Technical Specs Tabs */}
      <div className="border-t pt-8 space-y-6">
        <h3 className="text-xl font-bold text-foreground">Product Information & Specifications</h3>
        <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
          <p>{product.description}</p>
        </div>

        {product.tags && product.tags.length > 0 && (
          <div className="flex items-center gap-2 pt-2">
            <span className="text-xs font-semibold text-foreground">Tags:</span>
            <div className="flex flex-wrap gap-1.5">
              {product.tags.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 rounded-md bg-muted text-[11px] text-muted-foreground font-medium"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reviews Section */}
      <div className="border-t pt-10">
        <h3 className="text-xl font-bold text-foreground mb-6">Customer Ratings & Reviews</h3>
        <ReviewSection
          productId={product.id}
          reviews={productReviews}
          rating={product.rating}
          reviewCount={product.reviewCount}
        />
      </div>

      {/* Related Products from Marketplace */}
      {relatedProducts.length > 0 && (
        <div className="border-t pt-10 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-foreground">You May Also Like</h3>
            <Link
              href="/products"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              See More <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
