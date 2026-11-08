"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/form-fields";
import { Modal } from "@/components/ui/modal";
import { useUIStore } from "@/store/ui-store";
import {
  Star,
  MessageSquare,
  CheckCircle2,
  Reply,
  ShieldCheck,
  CornerDownRight,
} from "lucide-react";

interface ReviewItem {
  id: string;
  productTitle: string;
  productImage: string;
  customerName: string;
  rating: number;
  date: string;
  comment: string;
  sellerReply?: string;
}

const MOCK_REVIEWS: ReviewItem[] = [
  {
    id: "rev_1",
    productTitle: "ProVent Ergonomic Aluminum Laptop Stand",
    productImage: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=200",
    customerName: "Priya Sharma",
    rating: 5,
    date: "12 Oct 2026",
    comment:
      "Outstanding build quality! The CNC machined aluminum matches my space gray MacBook flawlessly. Incredibly rigid with zero wobble even when typing vigorously.",
    sellerReply:
      "Thank you so much Priya! We engineer every riser with aerospace-grade tolerances. Delighted to hear it fits your workspace setup perfectly.",
  },
  {
    id: "rev_2",
    productTitle: "Aura Spatial Wireless Headphones",
    productImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200",
    customerName: "Rahul Verma",
    rating: 5,
    date: "18 Oct 2026",
    comment:
      "ANC is on par with premium flagship competitors. Fast delivery by Delhivery took less than 48 hours to Mumbai.",
  },
  {
    id: "rev_3",
    productTitle: "UltraGlide Magnetic Desk Mat",
    productImage: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200",
    customerName: "Ananya Iyer",
    rating: 4,
    date: "25 Oct 2026",
    comment:
      "Very smooth glide and high-density stitching. Would love to see additional neutral colors like Oatmeal or Sage in the future catalog.",
  },
];

export default function SellerReviewsPage() {
  const { addToast } = useUIStore();
  const [reviews, setReviews] = useState<ReviewItem[]>(MOCK_REVIEWS);
  const [replyCandidate, setReplyCandidate] = useState<ReviewItem | null>(null);
  const [replyText, setReplyText] = useState("");

  const handleOpenReplyModal = (rev: ReviewItem) => {
    setReplyCandidate(rev);
    setReplyText(rev.sellerReply || "");
  };

  const handleSaveReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyCandidate) return;

    setReviews(
      reviews.map((r) =>
        r.id === replyCandidate.id ? { ...r, sellerReply: replyText } : r
      )
    );

    addToast({
      title: "Reply Published",
      description: "Your official merchant response is now visible beneath the buyer's review.",
      type: "success",
    });

    setReplyCandidate(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">
          Customer Product Reviews & Feedback
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Public reviews authored by verified buyers for your catalog items. Post merchant replies directly.
        </p>
      </div>

      {/* Aggregate Rating Banner */}
      <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="text-center sm:text-left">
            <span className="text-4xl font-black text-foreground">4.9</span>
            <div className="flex items-center gap-1 text-yellow-500 mt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <span className="text-xs text-muted-foreground mt-0.5 block">
              Based on 142 verified buyer reviews
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-700 bg-emerald-500/5 font-semibold">
            Top 1% Marketplace Merchant Score
          </Badge>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="p-6 rounded-2xl border border-border/80 bg-card shadow-sm space-y-4"
          >
            {/* Top row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-surface border border-border/60 overflow-hidden relative shrink-0">
                  <Image src={rev.productImage} alt={rev.productTitle} fill className="object-cover" />
                </div>
                <div>
                  <span className="font-bold text-foreground text-xs block">
                    {rev.productTitle}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex text-yellow-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-3 w-3 ${
                            s <= rev.rating ? "fill-current" : "text-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      by <strong className="text-foreground">{rev.customerName}</strong> • {rev.date}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="success" className="text-[10px] gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified Buyer
                </Badge>
              </div>
            </div>

            {/* Comment */}
            <p className="text-xs text-foreground leading-relaxed">
              "{rev.comment}"
            </p>

            {/* Seller Response Thread */}
            {rev.sellerReply ? (
              <div className="p-3.5 rounded-xl bg-surface/70 border border-border/60 text-xs space-y-1 ml-4 sm:ml-8 relative">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary flex items-center gap-1.5 text-[11px]">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Official Response from TechNexus Innovations
                  </span>
                  <button
                    onClick={() => handleOpenReplyModal(rev)}
                    className="text-[10px] text-muted-foreground hover:text-foreground font-semibold"
                  >
                    Edit Reply
                  </button>
                </div>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  {rev.sellerReply}
                </p>
              </div>
            ) : (
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenReplyModal(rev)}
                  className="text-xs gap-1.5 h-8 font-bold"
                >
                  <Reply className="h-3.5 w-3.5" />
                  <span>Reply to Customer</span>
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Reply Modal */}
      <Modal
        isOpen={Boolean(replyCandidate)}
        onClose={() => setReplyCandidate(null)}
        title="Post Merchant Reply"
      >
        <form onSubmit={handleSaveReply} className="space-y-4">
          <div className="p-3 rounded-xl bg-surface/80 border border-border/60 text-xs">
            <span className="font-bold text-foreground block">
              {replyCandidate?.productTitle}
            </span>
            <p className="text-muted-foreground italic mt-1">
              "{replyCandidate?.comment}"
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Your Public Response
            </label>
            <Textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Thank the customer or address technical guidance politely..."
              rows={4}
              className="text-xs"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setReplyCandidate(null)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="font-bold">
              Submit Reply
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
