import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import { generateOrderNumber } from "@/lib/utils";

export interface CreateOrderInput {
  userId: string;
  items: Array<{
    productId: string;
    variantId?: string;
    storeId: string;
    title: string;
    price: number;
    quantity: number;
    commissionRate?: number;
  }>;
  subtotal: number;
  shippingFee: number;
  tax?: number;
  discount: number;
  total: number;
  shippingAddress: any;
  billingAddress?: any;
  couponId?: string;
  paymentMethod: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  ipAddress?: string;
}

export const dbTransactionService = {
  /**
   * Creates an order within a strict atomic database transaction.
   * Atomically decrements inventory to prevent overselling.
   * Records audit logs and emits customer notifications.
   */
  async createOrderWithAtomicInventory(input: CreateOrderInput) {
    return await prisma.$transaction(async (tx) => {
      // 0. Idempotency Check: Prevent duplicate payment processing
      if (input.razorpayPaymentId) {
        const existingPayment = await tx.payment.findFirst({
          where: { razorpayPaymentId: input.razorpayPaymentId },
        });
        if (existingPayment) {
          throw new Error("Duplicate payment transaction detected. Order cannot be duplicated.");
        }
      }

      // 1. Validate & Atomically decrement inventory for all items
      for (const item of input.items) {
        // Find specific inventory record for store + product + variant
        const inventory = await tx.inventory.findFirst({
          where: {
            storeId: item.storeId,
            productId: item.productId,
            variantId: item.variantId || null,
          },
        });

        if (inventory) {
          if (inventory.quantity < item.quantity) {
            throw new Error(
              `Insufficient stock for "${item.title}". Requested: ${item.quantity}, Available: ${inventory.quantity}`
            );
          }

          // Atomic decrement to prevent race conditions & overselling
          await tx.inventory.update({
            where: { id: inventory.id },
            data: {
              quantity: { decrement: item.quantity },
              reserved: { increment: item.quantity },
            },
          });
        }
      }

      // 2. Create Order Header
      const isCod = input.paymentMethod?.toUpperCase() === "COD";
      const initialPaymentStatus = isCod ? "PENDING" : "PAID";
      const orderNumber = generateOrderNumber();
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: input.userId,
          status: "PROCESSING",
          paymentStatus: initialPaymentStatus,
          subtotal: new Prisma.Decimal(input.subtotal.toFixed(2)),
          shippingFee: new Prisma.Decimal(input.shippingFee.toFixed(2)),
          tax: new Prisma.Decimal((input.tax ?? 0).toFixed(2)),
          discount: new Prisma.Decimal(input.discount.toFixed(2)),
          total: new Prisma.Decimal(input.total.toFixed(2)),
          couponId: input.couponId || null,
          shippingAddress: input.shippingAddress,
          billingAddress: input.billingAddress || null,
        },
      });

      // 3. Create Order Line Items with Commission Splits
      for (const item of input.items) {
        const rate = item.commissionRate ?? 10.0;
        const lineTotal = item.price * item.quantity;
        const commAmount = (lineTotal * rate) / 100;
        const payoutAmount = lineTotal - commAmount;

        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            variantId: item.variantId || null,
            storeId: item.storeId,
            title: item.title,
            price: new Prisma.Decimal(item.price.toFixed(2)),
            quantity: item.quantity,
            total: new Prisma.Decimal(lineTotal.toFixed(2)),
            commissionRate: new Prisma.Decimal(rate.toFixed(2)),
            commissionAmount: new Prisma.Decimal(commAmount.toFixed(2)),
            sellerPayoutAmount: new Prisma.Decimal(payoutAmount.toFixed(2)),
            fulfillmentStatus: "CONFIRMED",
            carrier: "BlueDart Express",
          },
        });

        // Update Store cumulative sales
        await tx.store.update({
          where: { id: item.storeId },
          data: {
            totalSales: { increment: new Prisma.Decimal(lineTotal.toFixed(2)) },
          },
        });
      }

      // 4. Create Payment Record
      await tx.payment.create({
        data: {
          orderId: order.id,
          amount: new Prisma.Decimal(input.total.toFixed(2)),
          currency: "INR",
          status: initialPaymentStatus,
          method: input.paymentMethod,
          razorpayOrderId: input.razorpayOrderId || null,
          razorpayPaymentId: input.razorpayPaymentId || null,
          razorpaySignature: input.razorpaySignature || null,
          paidAt: isCod ? null : new Date(),
        },
      });

      // 5. Update Coupon usage if applied
      if (input.couponId) {
        await tx.coupon.update({
          where: { id: input.couponId },
          data: {
            usedCount: { increment: 1 },
          },
        });
      }

      // 6. Security Audit Log
      await tx.auditLog.create({
        data: {
          userId: input.userId,
          action: "ORDER_CREATED",
          entityType: "Order",
          entityId: order.id,
          newData: {
            orderNumber,
            total: input.total,
            itemCount: input.items.length,
          },
          ipAddress: input.ipAddress || "127.0.0.1",
        },
      });

      // 7. Notification
      await tx.notification.create({
        data: {
          userId: input.userId,
          title: "Order Placed Successfully",
          message: `Your order #${orderNumber} for ₹${input.total} has been confirmed.`,
          type: "ORDER_UPDATE",
          data: { orderId: order.id, orderNumber },
        },
      });

      return order;
    });
  },

  /**
   * Submits a customer review while strictly enforcing single-review constraint.
   */
  async submitVerifiedReview(input: {
    userId: string;
    productId: string;
    orderItemId: string;
    rating: number;
    title?: string;
    comment: string;
  }) {
    return await prisma.$transaction(async (tx) => {
      // Check if user already reviewed this order item
      const existing = await tx.review.findUnique({
        where: { orderItemId: input.orderItemId },
      });

      if (existing) {
        throw new Error("A review has already been submitted for this order item.");
      }

      const review = await tx.review.create({
        data: {
          userId: input.userId,
          productId: input.productId,
          orderItemId: input.orderItemId,
          rating: input.rating,
          title: input.title || null,
          comment: input.comment,
          verifiedPurchase: true,
        },
      });

      // Recalculate average product rating
      const reviews = await tx.review.findMany({
        where: { productId: input.productId },
        select: { rating: true },
      });

      const avgRating =
        reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

      await tx.product.update({
        where: { id: input.productId },
        data: {
          rating: new Prisma.Decimal(avgRating.toFixed(2)),
          reviewCount: reviews.length,
        },
      });

      return review;
    });
  },
};
