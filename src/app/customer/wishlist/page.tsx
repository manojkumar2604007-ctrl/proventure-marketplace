"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useWishlistStore } from "@/store/wishlist-store";
import { useCartStore } from "@/store/cart-store";
import { useUIStore } from "@/store/ui-store";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Heart, ShoppingBag, Trash2, ArrowRight, CheckCircle2 } from "lucide-react";

export default function CustomerWishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const addItem = useCartStore((state) => state.addItem);
  const { addToast, openCart } = useUIStore();

  const handleMoveToCart = (product: any) => {
    const primaryImg =
      product.images?.find((img: any) => img.isPrimary)?.url ||
      product.images?.[0]?.url ||
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80";

    addItem({
      id: `${product.id}_default`,
      productId: product.id,
      title: product.title,
      price: product.price,
      comparePrice: product.comparePrice,
      image: primaryImg,
      sellerId: product.sellerId,
      sellerName: product.seller?.storeName || "Verified Vendor",
      stock: product.stock,
    });

    removeItem(product.id);

    addToast({
      title: "Moved to Cart",
      description: `${product.title} has been moved to your shopping bag.`,
      type: "success",
    });

    openCart();
  };

  const handleMoveAllToCart = () => {
    items.forEach((product) => {
      const primaryImg =
        product.images?.find((img: any) => img.isPrimary)?.url ||
        product.images?.[0]?.url ||
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80";

      addItem({
        id: `${product.id}_default`,
        productId: product.id,
        title: product.title,
        price: product.price,
        comparePrice: product.comparePrice,
        image: primaryImg,
        sellerId: product.sellerId,
        sellerName: product.seller?.storeName || "Verified Vendor",
        stock: product.stock,
      });
    });

    clearWishlist();

    addToast({
      title: "All Items Moved to Cart",
      description: "All wishlist items are now ready for checkout.",
      type: "success",
    });

    openCart();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <h1 className="heading-1">Saved Wishlist</h1>
          <p className="subheading mt-1">
            {items.length} {items.length === 1 ? "saved item" : "saved items"} • Save items to track price drops or buy later
          </p>
        </div>

        {items.length > 0 && (
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleMoveAllToCart}
              className="text-xs font-semibold gap-1.5"
              leftIcon={<ShoppingBag className="h-3.5 w-3.5" />}
            >
              Move All to Cart
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearWishlist}
              className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            >
              Clear All
            </Button>
          </div>
        )}
      </div>

      {/* Wishlist Items Grid */}
      {items.length === 0 ? (
        <EmptyState
          icon={<Heart className="h-7 w-7 text-rose-500" />}
          title="Your Wishlist is Empty"
          description="Explore our curated multi-vendor catalog and click the heart icon on any product to save it here for later."
          actionLabel="Explore Marketplace Catalog"
          actionHref="/products"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((prod) => {
            const primaryImg =
              prod.images?.find((img: any) => img.isPrimary)?.url ||
              prod.images?.[0]?.url ||
              "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80";

            return (
              <div
                key={prod.id}
                className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-subtle hover:shadow-card transition-all flex flex-col justify-between"
              >
                <div className="relative aspect-video w-full bg-surface">
                  <Link href={`/products/${prod.slug}`} className="block h-full w-full">
                    <Image
                      src={primaryImg}
                      alt={prod.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 300px"
                      className="object-cover"
                    />
                  </Link>

                  <button
                    onClick={() => removeItem(prod.id)}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/90 text-rose-500 hover:bg-white shadow-subtle transition-transform active:scale-95"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-medium text-muted-foreground block truncate">
                      {prod.seller?.storeName || "Verified Vendor"}
                    </span>
                    <Link href={`/products/${prod.slug}`}>
                      <h3 className="font-bold text-sm text-primary hover:text-secondary transition-colors line-clamp-2 mt-0.5">
                        {prod.title}
                      </h3>
                    </Link>
                  </div>

                  <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                    <div>
                      <span className="text-base font-extrabold text-primary">
                        {formatPrice(prod.price)}
                      </span>
                      {prod.comparePrice && prod.comparePrice > prod.price && (
                        <span className="text-xs text-muted-foreground line-through ml-2">
                          {formatPrice(prod.comparePrice)}
                        </span>
                      )}
                    </div>

                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleMoveToCart(prod)}
                      className="text-xs font-semibold gap-1.5"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                      <span>Move to Cart</span>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
