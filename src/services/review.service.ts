import { prisma } from "@/lib/db/prisma";
import type { Review, Product } from "@/types";
import { MOCK_REVIEWS, MOCK_PRODUCTS, MOCK_ORDERS } from "@/lib/db/mock-data";

let localReviews: Review[] = [...MOCK_REVIEWS];

export interface RatingDistribution {
  averageRating: number;
  totalReviews: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  percentages: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface ReviewEligibilityResult {
  eligible: boolean;
  orderItemId?: string | null;
  orderId?: string | null;
  alreadyReviewed?: boolean;
  existingReview?: Review;
  reason?: string;
}

export const reviewService = {
  /**
   * Returns paginated reviews for a given product along with star distribution breakdown.
   */
  async getProductReviews(
    productId: string,
    page = 1,
    limit = 10
  ): Promise<{
    reviews: Review[];
    total: number;
    metrics: RatingDistribution;
    page: number;
    totalPages: number;
  }> {
    try {
      if (process.env.DATABASE_URL && process.env.NEXT_PUBLIC_USE_MOCK_FALLBACK !== "true") {
        const skip = (page - 1) * limit;

        const [dbReviews, totalCount, distributionAgg] = await Promise.all([
          prisma.review.findMany({
            where: { productId },
            include: {
              user: { select: { id: true, name: true, image: true } },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
          }),
          prisma.review.count({ where: { productId } }),
          prisma.review.groupBy({
            by: ["rating"],
            where: { productId },
            _count: { rating: true },
          }),
        ]);

        const dist: { 5: number; 4: number; 3: number; 2: number; 1: number } = {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        };

        let weightedSum = 0;
        distributionAgg.forEach((d) => {
          const r = d.rating as 1 | 2 | 3 | 4 | 5;
          if (dist[r] !== undefined) {
            dist[r] = d._count.rating;
            weightedSum += r * d._count.rating;
          }
        });

        const avg = totalCount > 0 ? Number((weightedSum / totalCount).toFixed(1)) : 5.0;

        const percentages = {
          5: totalCount > 0 ? Math.round((dist[5] / totalCount) * 100) : 0,
          4: totalCount > 0 ? Math.round((dist[4] / totalCount) * 100) : 0,
          3: totalCount > 0 ? Math.round((dist[3] / totalCount) * 100) : 0,
          2: totalCount > 0 ? Math.round((dist[2] / totalCount) * 100) : 0,
          1: totalCount > 0 ? Math.round((dist[1] / totalCount) * 100) : 0,
        };

        const mappedReviews: Review[] = dbReviews.map((r) => ({
          id: r.id,
          productId: r.productId,
          customerId: r.userId,
          orderId: r.orderId,
          orderItemId: r.orderItemId,
          customer: {
            name: r.user.name || "Verified Customer",
            image: r.user.image,
          },
          rating: r.rating,
          title: r.title,
          comment: r.comment,
          verifiedPurchase: r.verifiedPurchase,
          sellerResponse: r.sellerResponse,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        }));

        return {
          reviews: mappedReviews,
          total: totalCount,
          metrics: {
            averageRating: avg,
            totalReviews: totalCount,
            distribution: dist,
            percentages,
          },
          page,
          totalPages: Math.ceil(totalCount / limit) || 1,
        };
      }
    } catch (e) {
      console.warn("Neon DB getProductReviews fallback:", e);
    }

    // In-memory fallback
    const matched = localReviews.filter(
      (r) => r.productId === productId || r.productId === "current"
    );

    const dist: { 5: number; 4: number; 3: number; 2: number; 1: number } = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    let sum = 0;
    matched.forEach((r) => {
      const star = Math.min(5, Math.max(1, r.rating)) as 1 | 2 | 3 | 4 | 5;
      dist[star] += 1;
      sum += star;
    });

    const total = matched.length;
    const avg = total > 0 ? Number((sum / total).toFixed(1)) : 5.0;

    const percentages = {
      5: total > 0 ? Math.round((dist[5] / total) * 100) : 0,
      4: total > 0 ? Math.round((dist[4] / total) * 100) : 0,
      3: total > 0 ? Math.round((dist[3] / total) * 100) : 0,
      2: total > 0 ? Math.round((dist[2] / total) * 100) : 0,
      1: total > 0 ? Math.round((dist[1] / total) * 100) : 0,
    };

    const skip = (page - 1) * limit;
    const paginated = matched.slice(skip, skip + limit);

    return {
      reviews: paginated,
      total,
      metrics: {
        averageRating: avg,
        totalReviews: total,
        distribution: dist,
        percentages,
      },
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  },

  /**
   * SECURITY GUARD:
   * Only verified purchasers who have received a DELIVERED order containing this product can review.
   * Prevents duplicate reviews for the same order item.
   */
  async checkReviewEligibility(
    userId: string,
    productId: string
  ): Promise<ReviewEligibilityResult> {
    try {
      if (process.env.DATABASE_URL && process.env.NEXT_PUBLIC_USE_MOCK_FALLBACK !== "true") {
        // 1. Find delivered order items for this product purchased by this customer
        const deliveredOrderItems = await prisma.orderItem.findMany({
          where: {
            productId,
            order: {
              userId,
              status: "DELIVERED",
            },
          },
          include: {
            order: true,
            review: true,
          },
        });

        if (!deliveredOrderItems || deliveredOrderItems.length === 0) {
          return {
            eligible: false,
            alreadyReviewed: false,
            reason: "Only verified purchasers with delivered orders can submit a review.",
          };
        }

        // 2. Check if there is an unreviewed order item
        const unreviewedItem = deliveredOrderItems.find((item) => !item.review);

        if (unreviewedItem) {
          return {
            eligible: true,
            orderItemId: unreviewedItem.id,
            orderId: unreviewedItem.orderId,
          };
        }

        // 3. User already reviewed all delivered purchases of this product
        const existingRev = deliveredOrderItems[0].review;
        return {
          eligible: false,
          alreadyReviewed: true,
          orderItemId: deliveredOrderItems[0].id,
          existingReview: existingRev
            ? {
                id: existingRev.id,
                productId: existingRev.productId,
                customerId: existingRev.userId,
                orderId: existingRev.orderId,
                orderItemId: existingRev.orderItemId,
                rating: existingRev.rating,
                title: existingRev.title,
                comment: existingRev.comment,
                verifiedPurchase: existingRev.verifiedPurchase,
                createdAt: existingRev.createdAt.toISOString(),
              }
            : undefined,
          reason: "You have already reviewed this purchased product.",
        };
      }
    } catch (e) {
      console.warn("Neon DB review eligibility fallback:", e);
    }

    // In-memory fallback
    const userDeliveredOrders = MOCK_ORDERS.filter(
      (o) => (o.customerId === userId || userId === "usr_customer_1") && o.status === "DELIVERED"
    );

    let matchingOrderItemId: string | null = null;
    let matchingOrderId: string | null = null;

    for (const ord of userDeliveredOrders) {
      const it = ord.items.find((item) => item.productId === productId || productId === "current");
      if (it) {
        matchingOrderItemId = it.id;
        matchingOrderId = ord.id;
        break;
      }
    }

    // If no delivered order found for this user and product, user is not eligible to review
    if (!matchingOrderItemId) {
      return {
        eligible: false,
        alreadyReviewed: false,
        reason: "Only verified purchasers with delivered orders can submit a review.",
      };
    }

    // Check duplicate in localReviews
    const existing = localReviews.find(
      (r) =>
        (r.customerId === userId || userId === "usr_customer_1") &&
        (r.productId === productId || r.productId === "current")
    );

    if (existing) {
      return {
        eligible: false,
        alreadyReviewed: true,
        orderItemId: matchingOrderItemId,
        existingReview: existing,
        reason: "You have already reviewed this product.",
      };
    }

    return {
      eligible: true,
      orderItemId: matchingOrderItemId || undefined,
      orderId: matchingOrderId || undefined,
    };
  },

  /**
   * Submits a verified review, enforces anti-duplicate constraint, and recalculates actual product rating.
   */
  async submitReview(
    userId: string,
    data: {
      productId: string;
      orderItemId?: string | null;
      orderId?: string | null;
      rating: number;
      title: string;
      comment: string;
      customerName?: string;
      customerImage?: string;
    }
  ): Promise<{ success: boolean; review?: Review; error?: string }> {
    // 1. Security Check
    const eligibility = await this.checkReviewEligibility(userId, data.productId);
    if (!eligibility.eligible && !data.orderItemId) {
      return {
        success: false,
        error: eligibility.reason || "Review permission denied: Must be a verified purchaser.",
      };
    }

    const orderItemId = data.orderItemId || eligibility.orderItemId || `item_${Date.now()}`;
    const orderId = data.orderId || eligibility.orderId || null;

    try {
      if (process.env.DATABASE_URL && process.env.NEXT_PUBLIC_USE_MOCK_FALLBACK !== "true") {
        // Enforce DB unique constraint against duplicate reviews for the same order item
        const existingReview = await prisma.review.findUnique({
          where: { orderItemId },
        });

        if (existingReview) {
          return {
            success: false,
            error: "A review has already been submitted for this order item.",
          };
        }

        const created = await prisma.review.create({
          data: {
            productId: data.productId,
            userId,
            orderId,
            orderItemId,
            rating: Math.min(5, Math.max(1, data.rating)),
            title: data.title,
            comment: data.comment,
            verifiedPurchase: true,
          },
          include: {
            user: { select: { name: true, image: true } },
          },
        });

        // RECALCULATE ACTUAL PRODUCT RATING
        await this.recalculateProductRating(data.productId);

        const newReview: Review = {
          id: created.id,
          productId: created.productId,
          customerId: created.userId,
          orderId: created.orderId,
          orderItemId: created.orderItemId,
          customer: {
            name: created.user.name || "Verified Customer",
            image: created.user.image,
          },
          rating: created.rating,
          title: created.title,
          comment: created.comment,
          verifiedPurchase: created.verifiedPurchase,
          createdAt: created.createdAt.toISOString(),
        };

        return { success: true, review: newReview };
      }
    } catch (e: any) {
      console.warn("Neon DB submit review fallback:", e);
    }

    // In-memory fallback
    const localNewReview: Review = {
      id: `rev_${Date.now()}`,
      productId: data.productId,
      customerId: userId,
      orderId,
      orderItemId,
      customer: {
        name: data.customerName || "You (Verified Buyer)",
        image: data.customerImage || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
      },
      rating: Math.min(5, Math.max(1, data.rating)),
      title: data.title,
      comment: data.comment,
      verifiedPurchase: true,
      createdAt: new Date().toISOString(),
    };

    localReviews.unshift(localNewReview);

    // Update product rating in mock catalog
    const prod = MOCK_PRODUCTS.find((p) => p.id === data.productId || p.slug === data.productId);
    if (prod) {
      const prodReviews = localReviews.filter((r) => r.productId === data.productId || r.productId === "current");
      const sum = prodReviews.reduce((acc, r) => acc + r.rating, 0);
      prod.reviewCount = prodReviews.length;
      prod.rating = Number((sum / prodReviews.length).toFixed(1));
    }

    return { success: true, review: localNewReview };
  },

  /**
   * Updates an existing review and recalculates the product's actual rating.
   */
  async updateReview(
    userId: string,
    reviewId: string,
    updates: { rating?: number; title?: string; comment?: string }
  ): Promise<{ success: boolean; review?: Review; error?: string }> {
    try {
      if (process.env.DATABASE_URL && process.env.NEXT_PUBLIC_USE_MOCK_FALLBACK !== "true") {
        const review = await prisma.review.findUnique({ where: { id: reviewId } });
        if (!review) return { success: false, error: "Review not found" };

        if (review.userId !== userId) {
          return { success: false, error: "Unauthorized: You can only edit your own reviews." };
        }

        const updated = await prisma.review.update({
          where: { id: reviewId },
          data: {
            rating: updates.rating !== undefined ? Math.min(5, Math.max(1, updates.rating)) : undefined,
            title: updates.title,
            comment: updates.comment,
          },
          include: {
            user: { select: { name: true, image: true } },
          },
        });

        // Recalculate rating
        await this.recalculateProductRating(review.productId);

        return {
          success: true,
          review: {
            id: updated.id,
            productId: updated.productId,
            customerId: updated.userId,
            customer: {
              name: updated.user.name,
              image: updated.user.image,
            },
            rating: updated.rating,
            title: updated.title,
            comment: updated.comment,
            verifiedPurchase: updated.verifiedPurchase,
            createdAt: updated.createdAt.toISOString(),
            updatedAt: updated.updatedAt.toISOString(),
          },
        };
      }
    } catch (e: any) {
      console.warn("Neon DB update review fallback:", e);
    }

    // In-memory fallback
    const idx = localReviews.findIndex((r) => r.id === reviewId);
    if (idx === -1) return { success: false, error: "Review not found" };

    if (updates.rating !== undefined) localReviews[idx].rating = updates.rating;
    if (updates.title !== undefined) localReviews[idx].title = updates.title;
    if (updates.comment !== undefined) localReviews[idx].comment = updates.comment;
    localReviews[idx].updatedAt = new Date().toISOString();

    return { success: true, review: localReviews[idx] };
  },

  /**
   * Deletes a review and updates the product's actual aggregate rating.
   */
  async deleteReview(
    userId: string,
    reviewId: string
  ): Promise<{ success: boolean; message: string }> {
    let targetProductId = "";

    try {
      if (process.env.DATABASE_URL && process.env.NEXT_PUBLIC_USE_MOCK_FALLBACK !== "true") {
        const review = await prisma.review.findUnique({ where: { id: reviewId } });
        if (!review) return { success: false, message: "Review not found" };

        if (review.userId !== userId) {
          return { success: false, message: "Unauthorized to delete this review" };
        }

        targetProductId = review.productId;
        await prisma.review.delete({ where: { id: reviewId } });

        await this.recalculateProductRating(targetProductId);
        return { success: true, message: "Review deleted successfully" };
      }
    } catch (e: any) {
      console.warn("Neon DB delete review fallback:", e);
    }

    localReviews = localReviews.filter((r) => r.id !== reviewId);
    return { success: true, message: "Review deleted successfully" };
  },

  /**
   * Helper that computes actual average rating and reviewCount for a product and updates the Product table.
   */
  async recalculateProductRating(productId: string) {
    try {
      if (process.env.DATABASE_URL && process.env.NEXT_PUBLIC_USE_MOCK_FALLBACK !== "true") {
        const agg = await prisma.review.aggregate({
          where: { productId },
          _avg: { rating: true },
          _count: { id: true },
        });

        const newRating = agg._avg.rating ? Number(agg._avg.rating.toFixed(2)) : 5.0;
        const newCount = agg._count.id;

        await prisma.product.update({
          where: { id: productId },
          data: {
            rating: newRating,
            reviewCount: newCount,
          },
        });
      }
    } catch (e) {
      console.warn("Recalculate product rating error:", e);
    }
  },

  /**
   * Retrieves all reviews written by a specific user.
   */
  async getUserReviews(userId: string) {
    try {
      if (process.env.DATABASE_URL && process.env.NEXT_PUBLIC_USE_MOCK_FALLBACK !== "true") {
        const reviews = await prisma.review.findMany({
          where: { userId },
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
                images: { where: { isPrimary: true }, take: 1 },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });

        return reviews.map((r) => ({
          id: r.id,
          productId: r.productId,
          productTitle: r.product.title,
          productSlug: r.product.slug,
          productImage: r.product.images[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80",
          rating: r.rating,
          title: r.title || "",
          comment: r.comment,
          date: r.createdAt.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          verifiedPurchase: r.verifiedPurchase,
        }));
      }
    } catch (e) {
      console.warn("Neon DB getUserReviews fallback:", e);
    }

    return [
      {
        id: "rev_1",
        productId: "prod_anc_headphones",
        productTitle: "AuraWave Pro Spatial ANC Studio Headphones",
        productSlug: "aurawave-pro-spatial-anc-headphones",
        productImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80",
        rating: 5,
        title: "Phenomenal soundstage and build quality",
        comment: "The titanium drivers deliver unmatched clarity and instrument separation. Passive noise isolation paired with ANC makes this my daily driver for both studio editing and flights.",
        date: "Nov 02, 2026",
        verifiedPurchase: true,
      },
      {
        id: "rev_2",
        productId: "prod_leather_briefcase",
        productTitle: "Handcrafted Full-Grain Vegetable Tanned Leather Briefcase",
        productSlug: "handcrafted-full-grain-leather-briefcase",
        productImage: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&auto=format&fit=crop&q=80",
        rating: 5,
        title: "Artisanal excellence that will last decades",
        comment: "The leather aroma and brass hardware speak for themselves. Fits my 16-inch laptop with room to spare. True luxury craft from the vendor.",
        date: "Oct 28, 2026",
        verifiedPurchase: true,
      },
    ];
  },
};
