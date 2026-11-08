import { MOCK_ORDERS } from "@/lib/db/mock-data";
import { Order, OrderItem, OrderStatus, PaymentStatus, ShippingAddress } from "@/types";
import { generateOrderNumber } from "@/lib/utils";
import { prisma } from "@/lib/db/prisma";

let localOrders: Order[] = [...MOCK_ORDERS];
const recordedPaymentIds = new Set<string>();

export const orderService = {
  isPaymentRecorded(paymentId: string): boolean {
    return recordedPaymentIds.has(paymentId);
  },

  recordPaymentId(paymentId: string): void {
    recordedPaymentIds.add(paymentId);
  },

  async getAllOrders(): Promise<Order[]> {
    return localOrders;
  },

  async getCustomerOrders(customerId: string): Promise<Order[]> {
    return localOrders.filter((o) => o.customerId === customerId || o.customer?.id === customerId);
  },

  async getSellerOrders(sellerId: string): Promise<Order[]> {
    return localOrders.filter((order) =>
      order.items.some((item) => item.sellerId === sellerId)
    );
  },

  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    return localOrders.find((o) => o.orderNumber === orderNumber) || null;
  },

  async getOrderById(id: string): Promise<Order | null> {
    return localOrders.find((o) => o.id === id || o.orderNumber === id) || null;
  },

  async createOrder(data: {
    customerId: string;
    customerName?: string;
    customerEmail?: string;
    items: Array<{
      productId: string;
      sellerId: string;
      title: string;
      price: number;
      quantity: number;
      variantName?: string;
      carrier?: string;
      trackingNumber?: string;
      fulfillmentStatus?: OrderStatus;
    }>;
    subtotal: number;
    shippingFee: number;
    tax?: number;
    discount: number;
    total: number;
    shippingAddress: ShippingAddress;
    paymentMethod?: string;
    paymentStatus?: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
    razorpayPaymentId?: string;
  }): Promise<Order> {
    if (data.razorpayPaymentId) {
      if (orderService.isPaymentRecorded(data.razorpayPaymentId)) {
        throw new Error("Duplicate payment transaction detected. Order cannot be duplicated.");
      }
      orderService.recordPaymentId(data.razorpayPaymentId);
    }

    const orderId = `ord_${Date.now()}`;
    const orderNumber = generateOrderNumber();

    const orderItems: OrderItem[] = data.items.map((item, idx) => ({
      id: `item_${orderId}_${idx}`,
      orderId,
      productId: item.productId,
      sellerId: item.sellerId,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      total: item.price * item.quantity,
      variantName: item.variantName || null,
      fulfillmentStatus: item.fulfillmentStatus || "CONFIRMED",
      trackingNumber:
        item.trackingNumber ||
        `TRK-EXP-${Math.floor(10000 + Math.random() * 90000)}`,
      carrier: item.carrier || "BlueDart Express",
    }));

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      customerId: data.customerId,
      customer: {
        id: data.customerId,
        name: data.customerName || "Valued Customer",
        email: data.customerEmail || "customer@example.com",
      },
      status: "PROCESSING",
      paymentStatus: (data.paymentStatus as any) || (data.paymentMethod === "COD" ? "PENDING" : "PAID"),
      subtotal: data.subtotal,
      shippingFee: data.shippingFee,
      tax: data.tax || 0,
      discount: data.discount,
      total: data.total,
      shippingAddress: data.shippingAddress,
      items: orderItems,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localOrders.unshift(newOrder);
    return newOrder;
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order | null> {
    const index = localOrders.findIndex((o) => o.id === orderId || o.orderNumber === orderId);
    if (index === -1) return null;
    localOrders[index].status = status;
    localOrders[index].updatedAt = new Date().toISOString();
    return localOrders[index];
  },

  async updatePaymentStatus(
    orderIdOrNumber: string,
    paymentStatus: PaymentStatus,
    paymentDetails?: {
      razorpayOrderId?: string;
      razorpayPaymentId?: string;
      razorpaySignature?: string;
      method?: string;
    }
  ): Promise<Order | null> {
    const index = localOrders.findIndex(
      (o) => o.id === orderIdOrNumber || o.orderNumber === orderIdOrNumber
    );

    let updatedOrder: Order | null = null;
    if (index > -1) {
      localOrders[index].paymentStatus = paymentStatus;

      // Ensure payment status and order status are managed separately with business logic
      if (paymentStatus === "PAID") {
        if (localOrders[index].status === "PENDING") {
          localOrders[index].status = "CONFIRMED";
        }
      } else if (paymentStatus === "FAILED") {
        localOrders[index].status = "CANCELLED";
      } else if (paymentStatus === "REFUNDED") {
        localOrders[index].status = "REFUNDED";
      }

      localOrders[index].updatedAt = new Date().toISOString();
      updatedOrder = localOrders[index];
    }

    // Attempt Neon PostgreSQL persistence
    try {
      if (process.env.DATABASE_URL && process.env.NEXT_PUBLIC_USE_MOCK_FALLBACK !== "true") {
        const dbOrder = await prisma.order.findFirst({
          where: {
            OR: [{ id: orderIdOrNumber }, { orderNumber: orderIdOrNumber }],
          },
        });

        if (dbOrder) {
          let newOrderStatus = dbOrder.status;
          if (paymentStatus === "PAID" && dbOrder.status === "PENDING") {
            newOrderStatus = "CONFIRMED";
          } else if (paymentStatus === "FAILED") {
            newOrderStatus = "CANCELLED";
          } else if (paymentStatus === "REFUNDED") {
            newOrderStatus = "REFUNDED";
          }

          await prisma.order.update({
            where: { id: dbOrder.id },
            data: {
              paymentStatus: paymentStatus as any,
              status: newOrderStatus as any,
            },
          });

          if (paymentDetails?.razorpayPaymentId) {
            await prisma.payment.upsert({
              where: { orderId: dbOrder.id },
              update: {
                status: paymentStatus as any,
                razorpayOrderId: paymentDetails.razorpayOrderId || undefined,
                razorpayPaymentId: paymentDetails.razorpayPaymentId,
                razorpaySignature: paymentDetails.razorpaySignature || undefined,
                paidAt: paymentStatus === "PAID" ? new Date() : undefined,
              },
              create: {
                orderId: dbOrder.id,
                amount: dbOrder.total,
                currency: "INR",
                status: paymentStatus as any,
                method: paymentDetails.method || "RAZORPAY",
                razorpayOrderId: paymentDetails.razorpayOrderId || undefined,
                razorpayPaymentId: paymentDetails.razorpayPaymentId,
                razorpaySignature: paymentDetails.razorpaySignature || undefined,
                paidAt: paymentStatus === "PAID" ? new Date() : undefined,
              },
            });
          }
        }
      }
    } catch (err) {
      console.warn("DB payment status update fallback:", err);
    }

    return updatedOrder;
  },

  async updateItemFulfillmentStatus(
    orderId: string,
    itemId: string,
    status: OrderStatus,
    trackingNumber?: string
  ): Promise<Order | null> {
    const orderIndex = localOrders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) return null;

    const itemIndex = localOrders[orderIndex].items.findIndex((i) => i.id === itemId);
    if (itemIndex > -1) {
      localOrders[orderIndex].items[itemIndex].fulfillmentStatus = status;
      if (trackingNumber) {
        localOrders[orderIndex].items[itemIndex].trackingNumber = trackingNumber;
      }
    }

    localOrders[orderIndex].updatedAt = new Date().toISOString();
    return localOrders[orderIndex];
  },

  async requestCancellation(orderId: string, reason?: string): Promise<{ success: boolean; order?: Order; message: string }> {
    const order = localOrders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) return { success: false, message: "Order not found" };

    if (order.status === "DELIVERED" || order.status === "SHIPPED") {
      return { success: false, message: "Order is already in transit or delivered. Please request a return instead." };
    }

    if (typeof window !== "undefined") {
      try {
        await fetch(`/api/customer/orders/${encodeURIComponent(orderId)}/cancel`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason }),
        });
      } catch {
        // Continue with local update
      }
    }

    order.status = "CANCELLED";
    order.updatedAt = new Date().toISOString();
    return { success: true, order, message: "Cancellation request processed successfully. Refund will be credited within 3-5 business days." };
  },

  async requestReturn(orderId: string, reason?: string): Promise<{ success: boolean; order?: Order; message: string }> {
    const order = localOrders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) return { success: false, message: "Order not found" };

    if (order.status !== "DELIVERED") {
      return { success: false, message: "Returns can only be requested for delivered orders." };
    }

    if (typeof window !== "undefined") {
      try {
        await fetch(`/api/customer/orders/${encodeURIComponent(orderId)}/return`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason }),
        });
      } catch {
        // Continue with local update
      }
    }

    order.status = "REFUNDED";
    order.updatedAt = new Date().toISOString();
    return { success: true, order, message: "Return request accepted. Courier pickup scheduled within 48 hours." };
  },
};
