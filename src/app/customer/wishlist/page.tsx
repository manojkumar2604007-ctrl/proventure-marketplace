"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useWishlistStore } from "@/store/wishlist-store";
import { useCartStore } from "@/store/cart-store";
import { useUIStore } from "@/store/ui-store";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";

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
      description: `${product.title} transferred to your shopping cart.`,
      type: "success",
    });

    openCart();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            Saved Wishlist
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {items.length} {items.length === 1 ? "saved item" : "saved items"}
          </p>
        </div>

        {items.length > 0 && (
          <button
            onClick={clearWishlist}
            className="text-xs text-rose-500 hover:underline font-semibold"
          >
            Clear All
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 border rounded-2xl bg-card p-8 space-y-4">
          <div className="h-16 w-16 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-500 flex items-center justify-center mx-auto">
            <Heart className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            Your wishlist is empty
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Explore the marketplace catalog and tap the heart icon on any product to save it for later.
          </p>
          <Link href="/products">
            <Button size="sm" className="text-xs">
              Explore Products
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((prod) => {
            const primaryImg =
              prod.images?.find((img) => img.isPrimary)?.url ||
              prod.images?.[0]?.url ||
              "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80";

            return (
              <div
                key={prod.id}
                className="border rounded-2xl bg-card overflow-hidden shadow-sm flex flex-col justify-between"
              >
                <div className="relative aspect-video w-full bg-muted">
                  <Image
                    src={primaryImg}
                    alt={prod.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                  <button
                    onClick={() => removeItem(prod.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 hover:bg-background text-rose-500 shadow-sm"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="font-bold text-xs text-foreground line-clamp-1">
                      {prod.title}
                    </h4>
                    <span className="text-sm font-black text-foreground block mt-1">
                      {formatPrice(prod.price)}
                    </span>
                  </div>

                  <Button
                    onClick={() => handleMoveToCart(prod)}
                    size="sm"
                    className="w-full text-xs font-semibold gap-1.5 rounded-xl"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span>Move to Cart</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
