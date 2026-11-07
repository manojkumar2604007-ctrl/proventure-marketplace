"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Review } from "@/types";
import { Star, ShieldCheck, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { useUIStore } from "@/store/ui-store";

interface ReviewSectionProps {
  productId: string;
  reviews: Review[];
  rating: number;
  reviewCount: number;
}

export function ReviewSection({
  reviews: initialReviews,
  rating,
  reviewCount,
}: ReviewSectionProps) {
  const { addToast } = useUIStore();
  const [reviewsList, setReviewsList] = useState<Review[]>(initialReviews);
  const [showAddForm, setShowAddForm] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTitle.trim() || !reviewComment.trim()) {
      addToast({
        title: "Incomplete Review",
        description: "Please fill out a title and comment.",
        type: "error",
      });
      return;
    }

    const newRev: Review = {
      id: `rev_${Date.now()}`,
      productId: "current",
      customerId: "usr_curr",
      customer: {
        name: "You (Verified Buyer)",
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
      },
      rating: userRating,
      title: reviewTitle,
      comment: reviewComment,
      verifiedPurchase: true,
      createdAt: new Date().toISOString(),
    };

    setReviewsList([newRev, ...reviewsList]);
    setReviewTitle("");
    setReviewComment("");
    setShowAddForm(false);

    addToast({
      title: "Review Published",
      description: "Thank you for contributing your honest verified feedback!",
      type: "success",
    });
  };

  return (
    <div className="space-y-8">
      {/* Overview & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border bg-card">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <span className="text-4xl font-black text-foreground">
              {rating.toFixed(1)}
            </span>
            <div className="flex items-center justify-center gap-1 text-amber-500 mt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-4 w-4 ${
                    s <= Math.round(rating) ? "fill-current" : "text-muted"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground mt-1 block">
              Based on {reviewCount} reviews
            </span>
          </div>

          <div className="hidden sm:block h-12 w-px bg-border" />

          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>100% Verified Purchases</span>
            </div>
            <p>Every review is authenticated from confirmed delivery accounts.</p>
          </div>
        </div>

        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          variant="outline"
          className="rounded-xl text-xs font-semibold"
        >
          {showAddForm ? "Cancel" : "Write a Customer Review"}
        </Button>
      </div>

      {/* Review Submission Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmitReview}
          className="p-6 rounded-2xl border bg-muted/30 space-y-4"
        >
          <h4 className="font-bold text-sm text-foreground">Write Your Review</h4>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Rating
            </label>
            <div className="flex items-center gap-1 text-amber-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setUserRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= userRating ? "fill-current" : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Headline
            </label>
            <input
              type="text"
              placeholder="e.g. Outstanding craftsmanship and acoustics!"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border bg-background"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Comments
            </label>
            <textarea
              rows={3}
              placeholder="Share details about performance, build quality, and delivery..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border bg-background"
            />
          </div>

          <Button type="submit" size="sm" className="rounded-xl text-xs">
            Submit Verified Review
          </Button>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviewsList.map((rev) => (
          <div key={rev.id} className="p-5 rounded-2xl border bg-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative h-9 w-9 rounded-full overflow-hidden bg-muted border">
                  {rev.customer?.image ? (
                    <Image
                      src={rev.customer.image}
                      alt={rev.customer.name || "Customer"}
                      fill
                      sizes="36px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center font-bold text-xs bg-primary/10 text-primary">
                      {rev.customer?.name?.charAt(0) || "C"}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-foreground">
                      {rev.customer?.name || "Verified Customer"}
                    </span>
                    {rev.verifiedPurchase && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-full">
                        <ShieldCheck className="h-2.5 w-2.5" /> Verified Purchase
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {formatDate(rev.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-0.5 text-amber-500">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`h-3.5 w-3.5 ${
                      s <= rev.rating ? "fill-current" : "text-muted"
                    }`}
                  />
                ))}
              </div>
            </div>

            {rev.title && (
              <h5 className="font-semibold text-xs text-foreground">
                {rev.title}
              </h5>
            )}

            <p className="text-xs text-muted-foreground leading-relaxed">
              {rev.comment}
            </p>

            {rev.sellerResponse && (
              <div className="p-3 rounded-xl bg-muted/50 border-l-2 border-primary text-xs space-y-1">
                <span className="font-bold text-foreground block">
                  Response from Seller:
                </span>
                <p className="text-muted-foreground leading-relaxed">
                  {rev.sellerResponse}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
