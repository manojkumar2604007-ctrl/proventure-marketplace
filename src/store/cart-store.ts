import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CartItem } from "@/types";

export interface AppliedCoupon {
  code: string;
  discountPercent?: number;
  discountAmount?: number;
}

interface CartStore {
  items: CartItem[];
  coupon: AppliedCoupon | null;
  deliveryMethod: "standard" | "express";
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string, discountPercent?: number, discountAmount?: number) => void;
  removeCoupon: () => void;
  setDeliveryMethod: (method: "standard" | "express") => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getShippingFee: () => number;
  getDiscount: () => number;
  getTax: () => number;
  getTotal: () => number;
  getGroupedBySeller: () => Record<string, { sellerName: string; items: CartItem[] }>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      deliveryMethod: "standard",

      addItem: (item, quantity = 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex((i) => i.id === item.id);
          if (existingIndex > -1) {
            const updated = [...state.items];
            const newQty = Math.min(
              updated[existingIndex].quantity + quantity,
              item.stock
            );
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: newQty,
            };
            return { items: updated };
          }
          return {
            items: [...state.items, { ...item, quantity: Math.min(quantity, item.stock) }],
          };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity: Math.min(quantity, item.stock) } : item
          ),
        }));
      },

      clearCart: () => set({ items: [], coupon: null }),

      applyCoupon: (code, discountPercent, discountAmount) => {
        set({
          coupon: {
            code: code.toUpperCase(),
            discountPercent,
            discountAmount,
          },
        });
      },

      removeCoupon: () => set({ coupon: null }),

      setDeliveryMethod: (method) => set({ deliveryMethod: method }),

      getTotalItems: () => {
        return get().items.reduce((acc, item) => acc + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      },

      getShippingFee: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        const method = get().deliveryMethod;
        const baseShipping = subtotal >= 2999 ? 0 : 149;
        return method === "express" ? baseShipping + 199 : baseShipping;
      },

      getDiscount: () => {
        const subtotal = get().getSubtotal();
        const coupon = get().coupon;
        if (!coupon || subtotal === 0) return 0;

        if (coupon.discountAmount) {
          return Math.min(coupon.discountAmount, subtotal);
        }
        if (coupon.discountPercent) {
          return Math.round((subtotal * coupon.discountPercent) / 100);
        }
        return 0;
      },

      getTax: () => {
        const subtotal = get().getSubtotal();
        const discount = get().getDiscount();
        const taxable = Math.max(0, subtotal - discount);
        // Standard 18% GST component (inclusive/calculated)
        return Math.round(taxable * 0.18);
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const shipping = get().getShippingFee();
        const discount = get().getDiscount();
        // Grand Total: Subtotal - Discount + Shipping
        return Math.max(0, subtotal + shipping - discount);
      },

      getGroupedBySeller: () => {
        const items = get().items;
        return items.reduce((acc, item) => {
          if (!acc[item.sellerId]) {
            acc[item.sellerId] = {
              sellerName: item.sellerName || "Verified Merchant",
              items: [],
            };
          }
          acc[item.sellerId].items.push(item);
          return acc;
        }, {} as Record<string, { sellerName: string; items: CartItem[] }>);
      },
    }),
    {
      name: "proventure-cart-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
