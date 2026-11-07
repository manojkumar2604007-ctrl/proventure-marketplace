"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, ShoppingBag, Heart } from "lucide-react";
import { Product } from "@/types";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { useUIStore } from "@/store/ui-store";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
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
      description: `${product.title} has been placed in your cart.`,
      type: "success",
    });

    openCart();
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
    addToast({
      title: isWishlisted ? "Removed from Wishlist" : "Added to Wishlist",
      description: product.title,
      type: "default",
    });
  };

  return (
    <div className="group relative flex flex-col rounded-2xl border bg-card overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/30">
        <Link href={`/products/${product.slug}`} className="block h-full w-full">
          <Image
            src={primaryImage}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {discountPercent > 0 && (
            <Badge variant="destructive" className="font-bold text-[11px] px-2 shadow-sm">
              Save {discountPercent}%
            </Badge>
          )}
          {product.featured && (
            <Badge variant="default" className="font-semibold text-[11px] px-2 shadow-sm bg-indigo-600">
              Featured
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-200 z-10 ${
            isWishlisted
              ? "bg-rose-500 text-white shadow-md"
              : "bg-white/80 dark:bg-black/60 text-muted-foreground hover:text-rose-500 hover:bg-white"
          }`}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
        </button>

        {/* Quick Add Button overlay on hover */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-foreground text-background text-xs font-semibold shadow-lg hover:opacity-95 transition-all"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Quick Add</span>
          </button>
        </div>
      </div>

      {/* Info Container */}
      <div className="flex flex-1 flex-col p-4 justify-between">
        <div>
          {/* Seller / Store name */}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
            <span className="truncate hover:text-primary transition-colors font-medium">
              {product.seller?.storeName || "Verified Vendor"}
            </span>
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
            <h3 className="font-semibold text-sm text-foreground line-clamp-2 hover:text-primary transition-colors leading-snug">
              {product.title}
            </h3>
          </Link>
        </div>

        {/* Pricing & Stock */}
        <div className="mt-3 pt-3 border-t flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-extrabold text-foreground">
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>

          <span
            className={`text-[11px] font-medium ${
              product.stock > 0 ? "text-emerald-600" : "text-rose-500"
            }`}
          >
            {product.stock > 0 ? "In Stock" : "Sold Out"}
          </span>
        </div>
      </div>
    </div>
  );
}
