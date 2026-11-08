"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, ShieldCheck, Trash2, Edit2, CheckCircle2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useUIStore } from "@/store/ui-store";

interface CustomerReviewItem {
  id: string;
  productId: string;
  productTitle: string;
  productSlug: string;
  productImage: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verifiedPurchase: boolean;
}

export default function CustomerReviewsPage() {
  const { addToast } = useUIStore();
  const [reviews, setReviews] = useState<CustomerReviewItem[]>([
    {
      id: "rev_1",
      productId: "prod-1",
      productTitle: "AuraWave Pro Spatial ANC Studio Headphones",
      productSlug: "aurawave-pro-spatial-anc-headphones",
      productImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80",
      rating: 5,
      title: "Phenomenal soundstage and build quality",
      comment:
        "The titanium drivers deliver unmatched clarity and instrument separation. Passive noise isolation paired with ANC makes this my daily driver for both studio editing and flights.",
      date: "Nov 02, 2026",
      verifiedPurchase: true,
    },
    {
      id: "rev_2",
      productId: "prod-2",
      productTitle: "Handcrafted Full-Grain Vegetable Tanned Leather Briefcase",
      productSlug: "handcrafted-full-grain-leather-briefcase",
      productImage: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&auto=format&fit=crop&q=80",
      rating: 5,
      title: "Artisanal excellence that will last decades",
      comment:
        "The leather aroma and brass hardware speak for themselves. Fits my 16-inch laptop with room to spare. True luxury craft from the vendor.",
      date: "Oct 28, 2026",
      verifiedPurchase: true,
    },
  ]);

  const handleDeleteReview = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    addToast({
      title: "Review Removed",
      description: "Your product review has been deleted.",
      type: "default",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <h1 className="heading-1">My Product Reviews</h1>
          <p className="subheading mt-1">
            Ratings and authentic feedback you have shared with the ProVenture buyer community.
          </p>
        </div>
        <span className="text-xs font-semibold text-muted-foreground">
          {reviews.length} Verified Reviews Contributed
        </span>
      </div>

      {reviews.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="h-7 w-7 text-secondary" />}
          title="No Reviews Written Yet"
          description="Once your orders arrive, return here or go to the product page to leave verified feedback and assist other shoppers."
          actionLabel="View Delivered Orders"
          actionHref="/customer/orders"
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="rounded-2xl border border-border/80 bg-card p-6 shadow-subtle hover:shadow-card transition-all space-y-4"
            >
              {/* Product Info Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-border/80 shrink-0 bg-surface">
                    <Image
                      src={rev.productImage}
                      alt={rev.productTitle}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <Link
                      href={`/products/${rev.productSlug}`}
                      className="font-bold text-sm text-primary hover:text-secondary transition-colors line-clamp-1"
                    >
                      {rev.productTitle}
                    </Link>
                    <span className="text-[11px] text-muted-foreground">
                      Reviewed on {rev.date}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {rev.verifiedPurchase && (
                    <Badge variant="success" size="sm" dot>
                      Verified Purchase
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDeleteReview(rev.id)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Delete review"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Rating & Content */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < rev.rating ? "fill-current" : "text-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <h4 className="font-bold text-sm text-foreground">{rev.title}</h4>
                </div>

                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                  {rev.comment}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
