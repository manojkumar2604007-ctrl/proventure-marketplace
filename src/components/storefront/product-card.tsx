"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, ShoppingBag, Heart, CheckCircle2 } from "lucide-react";
import { Product } from "@/types";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { useUIStore } from "@/store/ui-store";

interface ProductCardProps {
  product: Product;
  layout?: "grid" | "list";
}

export function ProductCard({ product, layout = "grid" }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { toggleItem, isInWishlist } = useWishlistStore();
  const { addToast, openCart } = useUIStore();

  const isWishlisted = isInWishlist(product.id);
  const discountPercent = calculateDiscount(product.price, product.comparePrice);
  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      id: `${product.id}_default`,
      productId: product.id,
      title: product.title,
      price: product.price,
      comparePrice: product.comparePrice,
      image: primaryImage,
      sellerId: product.sellerId,
      sellerName: product.seller?.storeName || "Verified Vendor",
      stock: product.stock,
    });

    addToast({
      title: "Added to Cart",
      description: `${product.title} has been added to your shopping bag.`,
      type: "success",
    });

    openCart();
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
    addToast({
      title: isWishlisted ? "Removed from Wishlist" : "Saved to Wishlist",
      description: product.title,
      type: "default",
    });
  };

  if (layout === "list") {
    return (
      <div className="group relative flex flex-col sm:flex-row rounded-xl border border-border/70 bg-card overflow-hidden shadow-subtle hover:shadow-card transition-all duration-200">
        <div className="relative aspect-video sm:aspect-square sm:w-56 shrink-0 bg-surface">
          <Link href={`/products/${product.slug}`} className="block h-full w-full">
            <Image
              src={primaryImage}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 100vw, 224px"
              className="object-cover transition-transform duration-300 group-hover:scale-102"
            />
          </Link>
          {discountPercent > 0 && (
            <div className="absolute top-2.5 left-2.5 pointer-events-none">
              <Badge variant="accent" size="sm" className="shadow-subtle">
                Save {discountPercent}%
              </Badge>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-between p-5">
          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <Link
                href={`/stores/${product.seller?.slug || "store"}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 font-medium hover:text-secondary transition-colors"
              >
                <CheckCircle2 className="h-3 w-3 text-accent" />
                {product.seller?.storeName || "Verified Vendor"}
              </Link>
              {product.rating > 0 && (
                <div className="flex items-center gap-1 font-semibold text-amber-500">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <span>{product.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground font-normal">
                    ({product.reviewCount})
                  </span>
                </div>
              )}
            </div>

            <Link href={`/products/${product.slug}`}>
              <h3 className="font-bold text-base text-primary hover:text-secondary transition-colors line-clamp-1">
                {product.title}
              </h3>
            </Link>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-extrabold text-primary">
                {formatPrice(product.price)}
              </span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(product.comparePrice)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={handleWishlistToggle}
                className={isWishlisted ? "text-rose-500 border-rose-200" : ""}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
              </Button>
              <Button
                size="sm"
                variant="default"
                onClick={handleAddToCart}
                leftIcon={<ShoppingBag className="h-3.5 w-3.5" />}
              >
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative flex flex-col rounded-xl border border-border/80 bg-card overflow-hidden shadow-subtle hover:shadow-card transition-all duration-200">
      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface">
        <Link href={`/products/${product.slug}`} className="block h-full w-full">
          <Image
            src={primaryImage}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-103"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10 pointer-events-none">
          {discountPercent > 0 && (
            <Badge variant="accent" size="sm" className="shadow-subtle">
              Save {discountPercent}%
            </Badge>
          )}
          {product.featured && (
            <Badge variant="secondary" size="sm" className="shadow-subtle">
              Featured
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all duration-200 z-10 ${
            isWishlisted
              ? "bg-rose-500 text-white shadow-subtle"
              : "bg-white/85 text-muted-foreground hover:text-rose-600 hover:bg-white shadow-subtle"
          }`}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
        </button>

        {/* Quick Add Button overlay on hover */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:block">
          <Button
            size="sm"
            variant="default"
            onClick={handleAddToCart}
            className="w-full shadow-dropdown text-xs font-semibold"
            leftIcon={<ShoppingBag className="h-3.5 w-3.5" />}
          >
            Quick Add
          </Button>
        </div>
      </div>

      {/* Info Container */}
      <div className="flex flex-1 flex-col p-4 justify-between">
        <div>
          {/* Seller / Store name */}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
            <Link
              href={`/stores/${product.seller?.slug || "store"}`}
              onClick={(e) => e.stopPropagation()}
              className="truncate hover:text-secondary transition-colors font-medium max-w-[140px]"
            >
              {product.seller?.storeName || "Verified Vendor"}
            </Link>
            {product.rating > 0 && (
              <div className="flex items-center gap-1 font-semibold text-amber-500">
                <Star className="h-3 w-3 fill-current" />
                <span>{product.rating.toFixed(1)}</span>
                <span className="text-muted-foreground font-normal">
                  ({product.reviewCount})
                </span>
              </div>
            )}
          </div>

          {/* Product Title */}
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-semibold text-sm text-primary hover:text-secondary transition-colors line-clamp-2 leading-snug">
              {product.title}
            </h3>
          </Link>
        </div>

        {/* Pricing & Stock */}
        <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-extrabold text-primary">
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-[11px] text-muted-foreground line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>

          <span
            className={`text-[11px] font-semibold ${
              product.stock > 0 ? "text-accent" : "text-destructive"
            }`}
          >
            {product.stock > 0 ? "In Stock" : "Sold Out"}
          </span>
        </div>
      </div>
    </div>
  );
}
