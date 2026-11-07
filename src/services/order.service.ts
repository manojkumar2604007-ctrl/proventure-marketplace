import { MOCK_ORDERS } from "@/lib/db/mock-data";
import { Order, OrderItem, OrderStatus, ShippingAddress } from "@/types";
import { generateOrderNumber } from "@/lib/utils";

let localOrders: Order[] = [...MOCK_ORDERS];

export const orderService = {
  async getAllOrders(): Promise<Order[]> {
    return localOrders;
  },

  async getCustomerOrders(customerId: string): Promise<Order[]> {
    return localOrders.filter((o) => o.customerId === customerId);
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
    return localOrders.find((o) => o.id === id) || null;
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
    }>;
    subtotal: number;
    shippingFee: number;
    discount: number;
    total: number;
    shippingAddress: ShippingAddress;
    paymentMethod?: string;
  }): Promise<Order> {
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
      fulfillmentStatus: "CONFIRMED",
      trackingNumber: `TRK-EXP-${Math.floor(10000 + Math.random() * 90000)}`,
      carrier: "Express Cargo",
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
      paymentStatus: "PAID",
      subtotal: data.subtotal,
      shippingFee: data.shippingFee,
      tax: 0,
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
    const index = localOrders.findIndex((o) => o.id === orderId);
    if (index === -1) return null;
    localOrders[index].status = status;
    localOrders[index].updatedAt = new Date().toISOString();
    return localOrders[index];
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
};
