"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Review } from "@/types";
import {
  Star,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { useUIStore } from "@/store/ui-store";
import { reviewService, RatingDistribution, ReviewEligibilityResult } from "@/services/review.service";

interface ReviewSectionProps {
  productId: string;
  reviews: Review[];
  rating: number;
  reviewCount: number;
}

export function ReviewSection({
  productId,
  reviews: initialReviews,
  rating: initialRating,
  reviewCount: initialReviewCount,
}: ReviewSectionProps) {
  const { addToast } = useUIStore();
  const [reviewsList, setReviewsList] = useState<Review[]>(initialReviews);
  const [currentRating, setCurrentRating] = useState(initialRating);
  const [currentReviewCount, setCurrentReviewCount] = useState(initialReviewCount);
  const [distribution, setDistribution] = useState<RatingDistribution["distribution"]>({
    5: Math.round(initialReviewCount * 0.75),
    4: Math.round(initialReviewCount * 0.18),
    3: Math.round(initialReviewCount * 0.05),
    2: Math.round(initialReviewCount * 0.01),
    1: Math.round(initialReviewCount * 0.01),
  });

  // Filter & Pagination
  const [selectedStarFilter, setSelectedStarFilter] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Eligibility & Form State
  const [eligibility, setEligibility] = useState<ReviewEligibilityResult | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [userRating, setUserRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check verified purchaser eligibility on mount
  useEffect(() => {
    async function checkEligibility() {
      const res = await reviewService.checkReviewEligibility("usr_customer_1", productId);
      setEligibility(res);
      if (res.alreadyReviewed && res.existingReview) {
        setEditingReviewId(res.existingReview.id);
      }
    }
    checkEligibility();
  }, [productId]);

  // Load reviews from API/service
  useEffect(() => {
    async function loadReviews() {
      setLoading(true);
      const res = await reviewService.getProductReviews(productId, currentPage, 6);
      if (res.reviews.length > 0) {
        setReviewsList(res.reviews);
        setDistribution(res.metrics.distribution);
        setCurrentRating(res.metrics.averageRating);
        setCurrentReviewCount(res.metrics.totalReviews);
      }
      setLoading(false);
    }
    loadReviews();
  }, [productId, currentPage]);

  const handleOpenEdit = (rev: Review) => {
    setUserRating(rev.rating);
    setReviewTitle(rev.title || "");
    setReviewComment(rev.comment);
    setIsEditing(true);
    setEditingReviewId(rev.id);
    setShowForm(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTitle.trim() || !reviewComment.trim()) {
      addToast({
        title: "Incomplete Review",
        description: "Please specify both a review headline and detailed comments.",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);

    if (isEditing && editingReviewId) {
      // Edit existing review
      const res = await reviewService.updateReview("usr_customer_1", editingReviewId, {
        rating: userRating,
        title: reviewTitle,
        comment: reviewComment,
      });

      setIsSubmitting(false);

      if (res.success && res.review) {
        setReviewsList(reviewsList.map((r) => (r.id === editingReviewId ? res.review! : r)));
        setShowForm(false);
        setIsEditing(false);
        addToast({
          title: "Review Updated",
          description: "Your verified review has been successfully modified.",
          type: "success",
        });
      } else {
        addToast({
          title: "Update Failed",
          description: res.error || "Could not update review.",
          type: "error",
        });
      }
    } else {
      // Submit new verified review
      const res = await reviewService.submitReview("usr_customer_1", {
        productId,
        orderItemId: eligibility?.orderItemId || undefined,
        orderId: eligibility?.orderId || undefined,
        rating: userRating,
        title: reviewTitle,
        comment: reviewComment,
      });

      setIsSubmitting(false);

      if (res.success && res.review) {
        setReviewsList([res.review, ...reviewsList]);
        setCurrentReviewCount((prev) => prev + 1);
        setShowForm(false);
        setEligibility({
          eligible: false,
          alreadyReviewed: true,
          existingReview: res.review,
          reason: "You have reviewed this product.",
        });
        addToast({
          title: "Verified Review Published",
          description: "Thank you for sharing your feedback with the ProVenture community!",
          type: "success",
        });
      } else {
        addToast({
          title: "Review Rejected",
          description: res.error || "Only verified purchasers may review this product.",
          type: "error",
        });
      }
    }
  };

  const filteredReviews = selectedStarFilter
    ? reviewsList.filter((r) => r.rating === selectedStarFilter)
    : reviewsList;

  const totalStarCount = Object.values(distribution).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-8">
      {/* Overview & Rating Metrics Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 p-6 sm:p-8 rounded-3xl border border-border/80 bg-card shadow-subtle">
        {/* Rating Large Counter */}
        <div className="flex items-center gap-6">
          <div className="text-center sm:text-left">
            <span className="text-5xl font-black text-foreground tracking-tight font-mono">
              {currentRating.toFixed(1)}
            </span>
            <div className="flex items-center justify-center sm:justify-start gap-1 text-amber-500 mt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-4 w-4 ${
                    s <= Math.round(currentRating) ? "fill-current" : "text-muted"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground mt-1.5 block">
              Calculated from {currentReviewCount} authentic reviews
            </span>
          </div>

          <div className="hidden sm:block h-16 w-px bg-border/80" />

          {/* 5-Star Breakdown Progress Bars */}
          <div className="hidden sm:block space-y-1.5 min-w-[200px] text-xs">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = distribution[star as 1 | 2 | 3 | 4 | 5] || 0;
              const pct = Math.round((count / totalStarCount) * 100);
              const isSelected = selectedStarFilter === star;

              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setSelectedStarFilter(isSelected ? null : star)}
                  className={`w-full flex items-center gap-2 group hover:text-primary transition-colors ${
                    isSelected ? "font-bold text-primary" : "text-muted-foreground"
                  }`}
                >
                  <span className="w-6 text-right font-mono">{star}★</span>
                  <div className="flex-1 h-2 rounded-full bg-surface overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        isSelected ? "bg-primary" : "bg-amber-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right font-mono text-[11px]">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Verified Purchase Gate & Action Button */}
        <div className="flex flex-col items-start sm:items-end gap-3">
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full font-semibold">
            <ShieldCheck className="h-4 w-4" />
            <span>100% Verified Buyer Protection</span>
          </div>

          {eligibility?.eligible ? (
            <Button
              onClick={() => {
                setIsEditing(false);
                setReviewTitle("");
                setReviewComment("");
                setUserRating(5);
                setShowForm(!showForm);
              }}
              variant="default"
              className="rounded-xl text-xs font-bold gap-1.5 shadow-subtle"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Write a Customer Review</span>
            </Button>
          ) : eligibility?.alreadyReviewed ? (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-500/30">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> You Reviewed This Product
              </Badge>
              {eligibility.existingReview && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenEdit(eligibility.existingReview!)}
                  className="text-xs gap-1 font-semibold"
                >
                  <Edit2 className="h-3 w-3" />
                  <span>Edit Review</span>
                </Button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-muted-foreground p-2 rounded-xl bg-surface/50 border border-border/60">
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Only verified purchasers with delivered orders can review</span>
            </div>
          )}
        </div>
      </div>

      {/* Review Submission & Edit Modal/Inline Form */}
      {showForm && (
        <form
          onSubmit={handleSubmitReview}
          className="p-6 rounded-3xl border border-secondary/40 bg-surface/40 shadow-card space-y-4 animate-in fade-in-0 duration-200"
        >
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>{isEditing ? "Edit Your Verified Review" : "Submit Verified Buyer Review"}</span>
            </h4>
            <span className="text-[11px] text-muted-foreground">
              Anti-duplicate verified purchase check active
            </span>
          </div>

          {/* Star selector */}
          <div>
            <label className="text-xs font-bold text-foreground block mb-1.5">
              Overall Rating *
            </label>
            <div className="flex items-center gap-1.5 text-amber-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setUserRating(star)}
                  className="p-1 hover:scale-115 transition-transform"
                >
                  <Star
                    className={`h-7 w-7 ${
                      star <= userRating ? "fill-amber-500 text-amber-500" : "text-border"
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-foreground ml-2 font-mono">
                {userRating} / 5 Stars
              </span>
            </div>
          </div>

          {/* Headline */}
          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              Review Headline *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Outstanding craftsmanship, rich audio clarity, and fast dispatch!"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-border/80 bg-background focus:outline-none focus:ring-1 focus:ring-primary font-medium"
            />
          </div>

          {/* Comments */}
          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              Detailed Feedback *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Share details regarding build quality, packaging, performance, ergonomics, or customer support..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-border/80 bg-background focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setShowForm(false);
                setIsEditing(false);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="font-bold text-xs"
            >
              {isSubmitting
                ? "Verifying & Saving..."
                : isEditing
                ? "Update Review"
                : "Publish Verified Review"}
            </Button>
          </div>
        </form>
      )}

      {/* Filter Active Pill */}
      {selectedStarFilter && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Filtering by:</span>
          <Badge variant="outline" className="gap-1 font-bold">
            {selectedStarFilter} Stars Only
            <button
              onClick={() => setSelectedStarFilter(null)}
              className="text-muted-foreground hover:text-foreground ml-1"
            >
              ×
            </button>
          </Badge>
          <button
            onClick={() => setSelectedStarFilter(null)}
            className="text-primary hover:underline font-semibold"
          >
            Show All
          </button>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="p-8 text-center border border-border/80 rounded-2xl bg-card text-muted-foreground text-xs space-y-1">
            <p className="font-bold text-foreground">No reviews match the selected filter.</p>
            <p>Try clearing the star rating filter to view all customer reviews.</p>
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-2xl border border-border/80 bg-card space-y-3 shadow-subtle hover:border-border transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 rounded-full overflow-hidden bg-surface border border-border/80">
                    {rev.customer?.image ? (
                      <Image
                        src={rev.customer.image}
                        alt={rev.customer.name || "Customer"}
                        fill
                        sizes="40px"
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
                      <span className="font-bold text-xs text-foreground">
                        {rev.customer?.name || "Verified Customer"}
                      </span>
                      {rev.verifiedPurchase && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <ShieldCheck className="h-2.5 w-2.5" /> Verified Purchase
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      Reviewed on {formatDate(rev.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-amber-500">
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
                <h5 className="font-bold text-sm text-foreground pt-1">
                  {rev.title}
                </h5>
              )}

              <p className="text-xs text-muted-foreground leading-relaxed">
                {rev.comment}
              </p>

              {rev.sellerResponse && (
                <div className="p-3.5 rounded-xl bg-surface/80 border-l-2 border-primary text-xs space-y-1 mt-2">
                  <span className="font-bold text-foreground block">
                    Response from Verified Seller:
                  </span>
                  <p className="text-muted-foreground leading-relaxed text-[11px]">
                    {rev.sellerResponse}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
