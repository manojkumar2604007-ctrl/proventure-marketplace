import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CartItem } from "@/types";

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getShippingFee: () => number;
  getDiscount: () => number;
  getTotal: () => number;
  getGroupedBySeller: () => Record<string, { sellerName: string; items: CartItem[] }>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

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

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((acc, item) => acc + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      },

      getShippingFee: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        return subtotal >= 2000 ? 0 : 150; // Free shipping over ₹2000
      },

      getDiscount: () => {
        const subtotal = get().getSubtotal();
        return subtotal >= 5000 ? Math.round(subtotal * 0.05) : 0; // 5% discount over ₹5000
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const shipping = get().getShippingFee();
        const discount = get().getDiscount();
        return Math.max(0, subtotal + shipping - discount);
      },

      getGroupedBySeller: () => {
        const items = get().items;
        return items.reduce((acc, item) => {
          if (!acc[item.sellerId]) {
            acc[item.sellerId] = {
              sellerName: item.sellerName,
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
