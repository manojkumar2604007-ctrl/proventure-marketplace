import { MOCK_ORDERS } from "@/lib/db/mock-data";
import type {
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  OrderStatusHistoryItem,
  ShippingAddress,
} from "@/types";
import { generateOrderNumber, formatPrice, formatDate } from "@/lib/utils";
import { prisma } from "@/lib/db/prisma";
import {
  sendOrderConfirmationEmail,
  sendPaymentConfirmationEmail,
  sendShippingNotificationEmail,
  sendRefundNotificationEmail,
} from "./email.service";
import { NotificationService } from "./notification.service";
import { NotificationType } from "@prisma/client";

// State Machine Definition for Valid Order Status Transitions
export const VALID_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "PROCESSING", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "RETURN_REQUESTED", "CANCELLED"],
  DELIVERED: ["RETURN_REQUESTED"],
  RETURN_REQUESTED: ["RETURNED", "DELIVERED", "REFUNDED"],
  RETURNED: ["REFUNDED"],
  CANCELLED: [],
  REFUNDED: [],
};

export interface OrderInvoiceData {
  invoiceNumber: string;
  orderNumber: string;
  invoiceDate: string;
  orderDate: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    shippingAddress: string;
  };
  sellers: Array<{
    sellerId: string;
    sellerName: string;
    items: Array<{
      title: string;
      variantName?: string | null;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
  }>;
  financials: {
    subtotal: number;
    shippingFee: number;
    discount: number;
    taxableAmount: number;
    cgst: number;
    sgst: number;
    totalGst: number;
    grandTotal: number;
  };
  payment: {
    status: string;
    method: string;
    transactionId?: string | null;
  };
}

// Seed initial status history for mock orders
function initializeMockOrders(): Order[] {
  return MOCK_ORDERS.map((order) => {
    const history: OrderStatusHistoryItem[] = [
      {
        id: `hist_${order.id}_1`,
        orderId: order.id,
        previousStatus: null,
        newStatus: "PENDING",
        changedBy: "SYSTEM",
        changedByName: "Checkout System",
        changedByRole: "SYSTEM",
        description: "Order placed and payment authorized.",
        timestamp: order.createdAt,
      },
    ];

    if (order.status === "CONFIRMED" || order.status === "PROCESSING" || order.status === "SHIPPED" || order.status === "DELIVERED") {
      history.push({
        id: `hist_${order.id}_2`,
        orderId: order.id,
        previousStatus: "PENDING",
        newStatus: "CONFIRMED",
        changedBy: "seller_technexus",
        changedByName: "Merchant Dispatch Desk",
        changedByRole: "SELLER",
        description: "Order accepted by merchant. Inventory allocated.",
        timestamp: new Date(new Date(order.createdAt).getTime() + 15 * 60000).toISOString(),
      });
    }

    if (order.status === "PROCESSING" || order.status === "SHIPPED" || order.status === "DELIVERED") {
      history.push({
        id: `hist_${order.id}_3`,
        orderId: order.id,
        previousStatus: "CONFIRMED",
        newStatus: "PROCESSING",
        changedBy: "seller_technexus",
        changedByName: "Fulfillment Center",
        changedByRole: "SELLER",
        description: "Items packed, barcoded, and awaiting courier pickup.",
        timestamp: new Date(new Date(order.createdAt).getTime() + 45 * 60000).toISOString(),
      });
    }

    if (order.status === "SHIPPED" || order.status === "DELIVERED") {
      history.push({
        id: `hist_${order.id}_4`,
        orderId: order.id,
        previousStatus: "PROCESSING",
        newStatus: "SHIPPED",
        changedBy: "seller_technexus",
        changedByName: "BlueDart Logistics Hub",
        changedByRole: "SELLER",
        description: `Shipment handed over to courier. AWB: ${order.items[0]?.trackingNumber || "TRK-984712"}`,
        timestamp: new Date(new Date(order.createdAt).getTime() + 3 * 3600000).toISOString(),
      });
    }

    if (order.status === "DELIVERED") {
      history.push({
        id: `hist_${order.id}_5`,
        orderId: order.id,
        previousStatus: "SHIPPED",
        newStatus: "DELIVERED",
        changedBy: "SYSTEM",
        changedByName: "Delivery Courier Partner",
        changedByRole: "SYSTEM",
        description: "Package delivered to customer destination. OTP confirmed.",
        timestamp: new Date(new Date(order.createdAt).getTime() + 24 * 3600000).toISOString(),
      });
    }

    return {
      ...order,
      statusHistory: history,
      refundStatus: order.status === "REFUNDED" ? "PROCESSED" : "NONE",
      refundAmount: order.status === "REFUNDED" ? order.total : null,
    };
  });
}

let localOrders: Order[] = initializeMockOrders();
const recordedPaymentIds = new Set<string>();

export const orderService = {
  isPaymentRecorded(paymentId: string): boolean {
    return recordedPaymentIds.has(paymentId);
  },

  recordPaymentId(paymentId: string): void {
    recordedPaymentIds.add(paymentId);
  },

  /**
   * State Machine Guard: Validates that a status transition is permitted.
   */
  isValidStatusTransition(current: OrderStatus, target: OrderStatus): boolean {
    if (current === target) return true;
    const allowed = VALID_ORDER_TRANSITIONS[current] || [];
    return allowed.includes(target);
  },

  /**
   * Security Guard: Validates actor role authorization for state transitions.
   * Customers CANNOT mark orders as DELIVERED or SHIPPED.
   */
  validateStatusTransition(
    current: OrderStatus,
    target: OrderStatus,
    actorRole: "CUSTOMER" | "SELLER" | "ADMIN" | string
  ): { valid: boolean; error?: string } {
    if (current === target) return { valid: true };

    const allowed = VALID_ORDER_TRANSITIONS[current] || [];
    if (!allowed.includes(target)) {
      return {
        valid: false,
        error: `Invalid status transition from ${current} to ${target}. Permitted transitions: ${
          allowed.length ? allowed.join(", ") : "None (Terminal State)"
        }.`,
      };
    }

    // Role-specific constraints
    if (actorRole === "CUSTOMER") {
      if (
        target === "DELIVERED" ||
        target === "SHIPPED" ||
        target === "PROCESSING" ||
        target === "CONFIRMED" ||
        target === "RETURNED"
      ) {
        return {
          valid: false,
          error: `Access Denied: Customers are not authorized to mark orders as ${target}.`,
        };
      }
    }

    return { valid: true };
  },

  /**
   * Ownership Guard: Validates whether a user is authorized to access an order.
   */
  async verifyOrderOwnership(
    orderIdOrNumber: string,
    userId: string,
    userRole: string,
    sellerProfileId?: string
  ): Promise<{ authorized: boolean; order?: Order; error?: string }> {
    const order = await this.getOrderById(orderIdOrNumber);
    if (!order) {
      return { authorized: false, error: "Order not found." };
    }

    // ADMIN can access all orders
    if (userRole === "ADMIN") {
      return { authorized: true, order };
    }

    // CUSTOMER can only access their own orders
    if (userRole === "CUSTOMER") {
      if (order.customerId !== userId && order.customer?.id !== userId) {
        return {
          authorized: false,
          error: "Access Denied: You are not authorized to view or manage this order.",
        };
      }
      return { authorized: true, order };
    }

    // SELLER can only access orders containing items from their store
    if (userRole === "SELLER") {
      const targetSeller = sellerProfileId || userId;
      const hasSellerItems = order.items.some(
        (item) => item.sellerId === targetSeller || item.seller?.id === targetSeller
      );
      if (!hasSellerItems) {
        return {
          authorized: false,
          error: "Access Denied: This order does not contain merchandise from your store.",
        };
      }
      return { authorized: true, order };
    }

    return { authorized: false, error: "Unauthorized role." };
  },

  /**
   * Records an immutable entry into the Order Status History ledger.
   */
  async recordStatusHistory(
    orderId: string,
    item: {
      orderItemId?: string | null;
      previousStatus: OrderStatus | null;
      newStatus: OrderStatus;
      changedBy: string;
      changedByName?: string;
      changedByRole?: string;
      description?: string;
    }
  ): Promise<OrderStatusHistoryItem> {
    const historyItem: OrderStatusHistoryItem = {
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      orderId,
      orderItemId: item.orderItemId || null,
      previousStatus: item.previousStatus,
      newStatus: item.newStatus,
      changedBy: item.changedBy,
      changedByName: item.changedByName || "Operator",
      changedByRole: item.changedByRole || "SYSTEM",
      description: item.description || `Order status updated to ${item.newStatus}`,
      timestamp: new Date().toISOString(),
    };

    // Update in-memory order
    const orderIndex = localOrders.findIndex((o) => o.id === orderId || o.orderNumber === orderId);
    if (orderIndex > -1) {
      if (!localOrders[orderIndex].statusHistory) {
        localOrders[orderIndex].statusHistory = [];
      }
      localOrders[orderIndex].statusHistory!.push(historyItem);
    }

    // Attempt Neon DB persistence
    try {
      if (process.env.DATABASE_URL && process.env.NEXT_PUBLIC_USE_MOCK_FALLBACK !== "true") {
        await prisma.orderStatusHistory.create({
          data: {
            orderId,
            orderItemId: item.orderItemId || null,
            previousStatus: item.previousStatus as any,
            newStatus: item.newStatus as any,
            changedBy: item.changedBy,
            changedByName: item.changedByName || "Operator",
            changedByRole: item.changedByRole || "SYSTEM",
            description: item.description || null,
          },
        });
      }
    } catch (err) {
      console.warn("DB OrderStatusHistory record fallback:", err);
    }

    return historyItem;
  },

  async getAllOrders(): Promise<Order[]> {
    return localOrders;
  },

  async getCustomerOrders(customerId: string): Promise<Order[]> {
    return localOrders.filter((o) => o.customerId === customerId || o.customer?.id === customerId);
  },

  async getSellerOrders(sellerId: string): Promise<Order[]> {
    return localOrders.filter((order) =>
      order.items.some((item) => item.sellerId === sellerId || item.seller?.id === sellerId)
    );
  },

  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    return localOrders.find((o) => o.orderNumber === orderNumber) || null;
  },

  async getOrderById(id: string): Promise<Order | null> {
    // Try Neon DB if connected
    try {
      if (process.env.DATABASE_URL && process.env.NEXT_PUBLIC_USE_MOCK_FALLBACK !== "true") {
        const dbOrder = await prisma.order.findFirst({
          where: { OR: [{ id }, { orderNumber: id }] },
          include: {
            items: { include: { store: true, product: true } },
            payment: true,
            user: true,
            statusHistory: { orderBy: { createdAt: "asc" } },
          },
        });

        if (dbOrder) {
          return {
            id: dbOrder.id,
            orderNumber: dbOrder.orderNumber,
            customerId: dbOrder.userId,
            customer: {
              id: dbOrder.userId,
              name: dbOrder.user?.name || "Customer",
              email: dbOrder.user?.email || "customer@example.com",
            },
            status: dbOrder.status as OrderStatus,
            paymentStatus: dbOrder.paymentStatus as PaymentStatus,
            subtotal: Number(dbOrder.subtotal),
            shippingFee: Number(dbOrder.shippingFee),
            tax: Number(dbOrder.tax),
            discount: Number(dbOrder.discount),
            total: Number(dbOrder.total),
            shippingAddress: dbOrder.shippingAddress as any,
            items: dbOrder.items.map((it) => ({
              id: it.id,
              orderId: it.orderId,
              productId: it.productId,
              sellerId: it.storeId,
              title: it.title,
              price: Number(it.price),
              quantity: it.quantity,
              total: Number(it.total),
              variantName: it.variantName,
              fulfillmentStatus: it.fulfillmentStatus as OrderStatus,
              trackingNumber: it.trackingNumber,
              carrier: it.carrier,
            })),
            statusHistory: (dbOrder.statusHistory || []).map((sh) => ({
              id: sh.id,
              orderId: sh.orderId,
              orderItemId: sh.orderItemId,
              previousStatus: sh.previousStatus as any,
              newStatus: sh.newStatus as any,
              changedBy: sh.changedBy,
              changedByName: sh.changedByName,
              changedByRole: sh.changedByRole,
              description: sh.description,
              timestamp: sh.createdAt.toISOString(),
            })),
            createdAt: dbOrder.createdAt.toISOString(),
            updatedAt: dbOrder.updatedAt.toISOString(),
          };
        }
      }
    } catch {
      // Fallback
    }

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

    const initialStatus: OrderStatus =
      data.paymentStatus === "PAID" || data.paymentMethod?.toUpperCase().includes("COD")
        ? "CONFIRMED"
        : "PENDING";

    const initialHistory: OrderStatusHistoryItem = {
      id: `hist_${orderId}_0`,
      orderId,
      previousStatus: null,
      newStatus: initialStatus,
      changedBy: data.customerId,
      changedByName: data.customerName || "Customer",
      changedByRole: "CUSTOMER",
      description: `Order #${orderNumber} created via ${data.paymentMethod || "Online Payment"}.`,
      timestamp: new Date().toISOString(),
    };

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      customerId: data.customerId,
      customer: {
        id: data.customerId,
        name: data.customerName || "Valued Customer",
        email: data.customerEmail || "customer@example.com",
      },
      status: initialStatus,
      paymentStatus: (data.paymentStatus as any) || (data.paymentMethod === "COD" ? "PENDING" : "PAID"),
      subtotal: data.subtotal,
      shippingFee: data.shippingFee,
      tax: data.tax || 0,
      discount: data.discount,
      total: data.total,
      shippingAddress: data.shippingAddress,
      items: orderItems,
      statusHistory: [initialHistory],
      refundStatus: "NONE",
      refundAmount: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localOrders.unshift(newOrder);
    return newOrder;
  },

  /**
   * Updates Order Status with strict State Machine validation and audit logging.
   */
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    actor?: { id: string; name?: string; role: string },
    description?: string
  ): Promise<Order | null> {
    const index = localOrders.findIndex((o) => o.id === orderId || o.orderNumber === orderId);
    if (index === -1) return null;

    const currentOrder = localOrders[index];
    const effectiveActor = actor || { id: "SYSTEM", name: "Automation System", role: "SYSTEM" };

    // Validate Transition
    const check = this.validateStatusTransition(currentOrder.status, status, effectiveActor.role);
    if (!check.valid) {
      throw new Error(check.error || "Invalid status transition.");
    }

    const previousStatus = currentOrder.status;
    localOrders[index].status = status;
    localOrders[index].updatedAt = new Date().toISOString();

    // Record History
    await this.recordStatusHistory(currentOrder.id, {
      previousStatus,
      newStatus: status,
      changedBy: effectiveActor.id,
      changedByName: effectiveActor.name,
      changedByRole: effectiveActor.role,
      description: description || `Order transitioned from ${previousStatus} to ${status}.`,
    });

    // Background transactional email & in-app notification
    try {
      const customerEmail = (currentOrder as any).customerEmail || (currentOrder as any).email || "customer@example.com";
      const customerName = currentOrder.shippingAddress?.fullName || "Customer";
      const targetUserId = currentOrder.customerId || (currentOrder as any).userId || "usr_customer_1";

      if (status === "SHIPPED") {
        const carrierName = (currentOrder as any).carrier || currentOrder.items[0]?.carrier || "Blue Dart Express";
        const awb = (currentOrder as any).trackingNumber || currentOrder.items[0]?.trackingNumber || `AWB-${Math.floor(100000000 + Math.random() * 900000000)}`;

        sendShippingNotificationEmail(
          customerEmail,
          {
            name: customerName,
            orderNumber: currentOrder.orderNumber,
            carrier: carrierName,
            trackingNumber: awb,
            estimatedDelivery: "In 3-5 business days",
            trackingUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/customer/orders/${currentOrder.id}`,
            items: currentOrder.items.map((i) => ({ title: i.title, quantity: i.quantity })),
          },
          true
        );

        NotificationService.createNotification({
          userId: targetUserId,
          title: `Shipment Dispatched: #${currentOrder.orderNumber}`,
          message: `Your package is on its way via ${carrierName} (AWB: ${awb}).`,
          type: NotificationType.ORDER_UPDATE,
          data: { orderId: currentOrder.id, trackingNumber: awb, carrier: carrierName },
        });
      } else if (status === "REFUNDED") {
        const refundRef = `rfnd_${Date.now()}`;

        sendRefundNotificationEmail(
          customerEmail,
          {
            name: customerName,
            orderNumber: currentOrder.orderNumber,
            refundAmount: currentOrder.total,
            refundId: refundRef,
            reason: description || "Order return or cancellation refund processed.",
            timeline: "5 to 7 banking business days",
          },
          true
        );

        NotificationService.createNotification({
          userId: targetUserId,
          title: `Refund Processed: ₹${currentOrder.total.toLocaleString("en-IN")}`,
          message: `Refund ${refundRef} issued for #${currentOrder.orderNumber}. Credited to original source.`,
          type: NotificationType.PAYMENT,
          data: { orderId: currentOrder.id, refundAmount: currentOrder.total },
        });
      }
    } catch (notifErr) {
      console.warn("Non-critical background notification failed:", notifErr);
    }

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
          const prev = localOrders[index].status;
          localOrders[index].status = "CONFIRMED";
          await this.recordStatusHistory(localOrders[index].id, {
            previousStatus: prev,
            newStatus: "CONFIRMED",
            changedBy: "SYSTEM",
            changedByName: "Razorpay Webhook",
            changedByRole: "SYSTEM",
            description: "Payment confirmed. Order moved to Confirmed.",
          });

          // Non-blocking customer email confirmation and in-app alert
          try {
            const ord = localOrders[index];
            const customerEmail = (ord as any).customerEmail || (ord as any).email || "customer@example.com";
            const customerName = ord.shippingAddress?.fullName || "Customer";

            sendOrderConfirmationEmail(
              customerEmail,
              {
                name: customerName,
                orderId: ord.id,
                orderNumber: ord.orderNumber,
                items: ord.items.map((i) => ({
                  title: i.title,
                  quantity: i.quantity,
                  price: i.price,
                  sellerName: (i as any).storeName || "Vendor",
                })),
                subtotal: ord.subtotal,
                tax: ord.tax,
                shipping: (ord as any).shipping ?? ord.shippingFee ?? 0,
                total: ord.total,
                shippingAddress: {
                  fullName: ord.shippingAddress.fullName,
                  street: ord.shippingAddress.street,
                  city: ord.shippingAddress.city,
                  state: ord.shippingAddress.state,
                  postalCode: ord.shippingAddress.postalCode,
                },
                trackingUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/customer/orders/${ord.id}`,
              },
              true
            );

            sendPaymentConfirmationEmail(
              customerEmail,
              {
                name: customerName,
                orderNumber: ord.orderNumber,
                paymentId: paymentDetails?.razorpayPaymentId || `pay_${Date.now()}`,
                paymentMethod: paymentDetails?.method || "Razorpay Online",
                amount: ord.total,
                date: new Date().toLocaleString("en-IN"),
                invoiceUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/customer/orders/${ord.id}`,
              },
              true
            );

            NotificationService.createNotification({
              userId: ord.customerId || (ord as any).userId || "usr_customer_1",
              title: `Order Confirmed: #${ord.orderNumber}`,
              message: `Your payment of ₹${ord.total.toLocaleString("en-IN")} was verified. Merchant notified.`,
              type: NotificationType.ORDER_UPDATE,
              data: { orderId: ord.id, orderNumber: ord.orderNumber },
            });
          } catch (notifErr) {
            console.warn("Non-critical order confirmation notification failed:", notifErr);
          }
        }
      } else if (paymentStatus === "FAILED") {
        localOrders[index].status = "CANCELLED";
      } else if (paymentStatus === "REFUNDED") {
        localOrders[index].status = "REFUNDED";
        localOrders[index].refundStatus = "PROCESSED";
        localOrders[index].refundAmount = localOrders[index].total;
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

  /**
   * Seller Action: Update fulfillment status and tracking for a specific seller item.
   * Enforces seller item ownership.
   */
  async updateItemFulfillmentStatus(
    orderId: string,
    itemId: string,
    status: OrderStatus,
    trackingNumber?: string,
    carrier?: string,
    actor?: { id: string; name?: string; role: string; sellerProfileId?: string }
  ): Promise<Order | null> {
    const orderIndex = localOrders.findIndex((o) => o.id === orderId || o.orderNumber === orderId);
    if (orderIndex === -1) return null;

    const order = localOrders[orderIndex];
    const itemIndex = order.items.findIndex((i) => i.id === itemId);
    if (itemIndex === -1) {
      throw new Error(`Item ${itemId} not found in order ${orderId}.`);
    }

    const item = order.items[itemIndex];
    const effectiveActor = actor || { id: "seller", name: "Merchant", role: "SELLER" };

    // Validate Seller Item Ownership
    if (effectiveActor.role === "SELLER") {
      const sellerId = effectiveActor.sellerProfileId || effectiveActor.id;
      if (item.sellerId !== sellerId && item.seller?.id !== sellerId) {
        throw new Error("Access Denied: You cannot update items belonging to another merchant.");
      }
    }

    // Validate Transition for Item
    const check = this.validateStatusTransition(item.fulfillmentStatus, status, effectiveActor.role);
    if (!check.valid) {
      throw new Error(check.error);
    }

    const prevItemStatus = item.fulfillmentStatus;
    order.items[itemIndex].fulfillmentStatus = status;
    if (trackingNumber) order.items[itemIndex].trackingNumber = trackingNumber;
    if (carrier) order.items[itemIndex].carrier = carrier;

    // Record Item History
    await this.recordStatusHistory(order.id, {
      orderItemId: item.id,
      previousStatus: prevItemStatus,
      newStatus: status,
      changedBy: effectiveActor.id,
      changedByName: effectiveActor.name,
      changedByRole: effectiveActor.role,
      description: `Item "${item.title}" marked as ${status}.${
        trackingNumber ? ` Tracking: ${trackingNumber} (${carrier || "Courier"})` : ""
      }`,
    });

    // Re-evaluate Parent Order Status
    const allStatuses = order.items.map((i) => i.fulfillmentStatus);
    const prevOrderStatus = order.status;
    let nextOrderStatus = order.status;

    if (allStatuses.every((s) => s === "DELIVERED")) {
      nextOrderStatus = "DELIVERED";
    } else if (allStatuses.some((s) => s === "SHIPPED") || allStatuses.every((s) => s === "SHIPPED")) {
      nextOrderStatus = "SHIPPED";
    } else if (allStatuses.some((s) => s === "PROCESSING" || s === "CONFIRMED")) {
      nextOrderStatus = "PROCESSING";
    }

    if (nextOrderStatus !== prevOrderStatus) {
      order.status = nextOrderStatus;
      await this.recordStatusHistory(order.id, {
        previousStatus: prevOrderStatus,
        newStatus: nextOrderStatus,
        changedBy: effectiveActor.id,
        changedByName: effectiveActor.name,
        changedByRole: effectiveActor.role,
        description: `Order automatically updated to ${nextOrderStatus} following item dispatch updates.`,
      });
    }

    order.updatedAt = new Date().toISOString();
    return order;
  },

  /**
   * Customer / Seller / Admin: Request or process order cancellation.
   */
  async requestCancellation(
    orderId: string,
    reason?: string,
    actor?: { id: string; name?: string; role: string }
  ): Promise<{ success: boolean; order?: Order; message: string }> {
    const order = localOrders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) return { success: false, message: "Order not found." };

    if (order.status === "DELIVERED" || order.status === "SHIPPED") {
      return {
        success: false,
        message: "Order has already been dispatched or delivered. Cancellation is no longer possible; please request a return instead.",
      };
    }

    if (order.status === "CANCELLED" || order.status === "REFUNDED") {
      return { success: false, message: "Order is already cancelled or refunded." };
    }

    const effectiveActor = actor || { id: order.customerId, name: "Customer", role: "CUSTOMER" };
    const prevStatus = order.status;

    order.status = "CANCELLED";
    order.cancellationReason = reason || "Customer requested cancellation before dispatch.";

    // If already paid, trigger refund workflow
    if (order.paymentStatus === "PAID") {
      order.paymentStatus = "REFUNDED";
      order.refundStatus = "PROCESSED";
      order.refundAmount = order.total;
    }

    order.items.forEach((item) => {
      item.fulfillmentStatus = "CANCELLED";
    });

    order.updatedAt = new Date().toISOString();

    // Record Status History
    await this.recordStatusHistory(order.id, {
      previousStatus: prevStatus,
      newStatus: "CANCELLED",
      changedBy: effectiveActor.id,
      changedByName: effectiveActor.name,
      changedByRole: effectiveActor.role,
      description: `Cancellation confirmed. Reason: ${order.cancellationReason}. ${
        order.refundStatus === "PROCESSED" ? `Refund of ₹${order.total.toLocaleString("en-IN")} credited to original payment source.` : ""
      }`,
    });

    return {
      success: true,
      order,
      message:
        order.refundStatus === "PROCESSED"
          ? `Order #${order.orderNumber} cancelled successfully. Full refund of ₹${order.total.toLocaleString("en-IN")} initiated.`
          : `Order #${order.orderNumber} cancelled successfully.`,
    };
  },

  /**
   * Customer: Request return for delivered order.
   */
  async requestReturn(
    orderId: string,
    reason?: string,
    actor?: { id: string; name?: string; role: string }
  ): Promise<{ success: boolean; order?: Order; message: string }> {
    const order = localOrders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) return { success: false, message: "Order not found." };

    if (order.status !== "DELIVERED") {
      return {
        success: false,
        message: `Returns can only be requested for delivered orders. Current status: ${order.status}`,
      };
    }

    const effectiveActor = actor || { id: order.customerId, name: "Customer", role: "CUSTOMER" };
    const prevStatus = order.status;

    order.status = "RETURN_REQUESTED";
    order.returnReason = reason || "Product return requested within 7-day return policy.";
    order.refundStatus = "REQUESTED";
    order.refundAmount = order.total;
    order.updatedAt = new Date().toISOString();

    await this.recordStatusHistory(order.id, {
      previousStatus: prevStatus,
      newStatus: "RETURN_REQUESTED",
      changedBy: effectiveActor.id,
      changedByName: effectiveActor.name,
      changedByRole: effectiveActor.role,
      description: `Return requested by customer. Reason: ${order.returnReason}`,
    });

    return {
      success: true,
      order,
      message: "Return request submitted. The seller will review and approve pickup within 24-48 business hours.",
    };
  },

  /**
   * Seller / Admin: Resolve return request.
   */
  async resolveReturn(
    orderId: string,
    approved: boolean,
    actor: { id: string; name?: string; role: string },
    resolutionNotes?: string
  ): Promise<{ success: boolean; order?: Order; message: string }> {
    const order = localOrders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) return { success: false, message: "Order not found." };

    if (order.status !== "RETURN_REQUESTED") {
      return {
        success: false,
        message: `Order is not in return requested state. Current: ${order.status}`,
      };
    }

    const prevStatus = order.status;
    if (approved) {
      order.status = "RETURNED";
      order.paymentStatus = "REFUNDED";
      order.refundStatus = "PROCESSED";
      order.refundAmount = order.total;

      await this.recordStatusHistory(order.id, {
        previousStatus: prevStatus,
        newStatus: "RETURNED",
        changedBy: actor.id,
        changedByName: actor.name,
        changedByRole: actor.role,
        description: `Return approved by ${actor.name || actor.role}. Courier pickup scheduled. Refund of ₹${order.total.toLocaleString("en-IN")} credited.`,
      });

      return {
        success: true,
        order,
        message: `Return approved. Refund of ₹${order.total.toLocaleString("en-IN")} credited.`,
      };
    } else {
      order.status = "DELIVERED";
      order.refundStatus = "REJECTED";

      await this.recordStatusHistory(order.id, {
        previousStatus: prevStatus,
        newStatus: "DELIVERED",
        changedBy: actor.id,
        changedByName: actor.name,
        changedByRole: actor.role,
        description: `Return rejected by ${actor.name || actor.role}. Notes: ${resolutionNotes || "Condition does not satisfy return policy."}`,
      });

      return {
        success: true,
        order,
        message: "Return request was rejected. Order marked as Delivered.",
      };
    }
  },

  /**
   * Generates comprehensive structured invoice data.
   */
  async generateInvoiceData(orderId: string): Promise<OrderInvoiceData | null> {
    const order = await this.getOrderById(orderId);
    if (!order) return null;

    // Group items by seller
    const sellersMap = new Map<string, { sellerId: string; sellerName: string; items: any[] }>();
    for (const item of order.items) {
      const sId = item.sellerId || "store_default";
      const sName = item.seller?.storeName || (item.title.includes("Audio") ? "SoundCraft Pro" : "TechNexus Electronics");
      if (!sellersMap.has(sId)) {
        sellersMap.set(sId, { sellerId: sId, sellerName: sName, items: [] });
      }
      sellersMap.get(sId)!.items.push({
        title: item.title,
        variantName: item.variantName,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.total,
      });
    }

    const subtotal = order.subtotal;
    const discount = order.discount;
    const taxableAmount = Math.max(0, subtotal - discount);
    const totalGst = Math.round(taxableAmount * 0.18);
    const cgst = Math.round(totalGst / 2);
    const sgst = Math.round(totalGst / 2);

    return {
      invoiceNumber: `INV-${order.orderNumber.replace(/[^0-9]/g, "").substring(0, 8)}`,
      orderNumber: order.orderNumber,
      invoiceDate: formatDate(new Date().toISOString()),
      orderDate: formatDate(order.createdAt),
      customer: {
        id: order.customerId,
        name: order.shippingAddress.fullName || order.customer?.name || "Customer",
        email: order.customer?.email || "customer@example.com",
        phone: order.shippingAddress.phone,
        shippingAddress: `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}, ${order.shippingAddress.country || "India"}`,
      },
      sellers: Array.from(sellersMap.values()),
      financials: {
        subtotal,
        shippingFee: order.shippingFee,
        discount,
        taxableAmount,
        cgst,
        sgst,
        totalGst,
        grandTotal: order.total,
      },
      payment: {
        status: order.paymentStatus,
        method: order.paymentStatus === "PAID" ? "Razorpay Unified Gateway (Cards / UPI / NetBanking)" : "Cash on Delivery (COD)",
        transactionId: `TXN-${order.orderNumber}`,
      },
    };
  },
};
