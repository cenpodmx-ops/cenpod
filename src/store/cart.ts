import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  image: string;
  quantity: number;
  variant?: string;
  variantId?: string; // Shopify variant ID for checkout
  maxStock: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  shopifyCartId: string | null;
}

interface CartActions {
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  incrementQuantity: (id: string) => void;
  decrementQuantity: (id: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
  getShippingProgress: () => {
    current: number;
    target: number;
    remaining: number;
    freeShipping: boolean;
  };
  setShopifyCartId: (id: string | null) => void;
  syncWithShopify: () => Promise<void>;
}

const FREE_SHIPPING_THRESHOLD = 1000;

export const useCartStore = create<CartState & CartActions>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      shopifyCartId: null,

      addItem: (item) => {
        const items = get().items;
        const existingItem = items.find(
          (i) => i.id === item.id && i.variant === item.variant
        );

        if (existingItem) {
          const newQuantity = Math.min(
            existingItem.quantity + (item.quantity || 1),
            item.maxStock
          );
          set({
            items: items.map((i) =>
              i.id === item.id && i.variant === item.variant
                ? { ...i, quantity: newQuantity }
                : i
            ),
          });
        } else {
          set({
            items: [...items, { ...item, quantity: item.quantity || 1 }],
          });
        }
        // Invalidate Shopify cart when items change
        set({ shopifyCartId: null });
        get().openCart();
      },

      removeItem: (id) => {
        set({
          items: get().items.filter((i) => i.id !== id),
          shopifyCartId: null,
        });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, quantity: Math.min(quantity, i.maxStock) } : i
          ),
          shopifyCartId: null,
        });
      },

      incrementQuantity: (id) => {
        const item = get().items.find((i) => i.id === id);
        if (item) {
          get().updateQuantity(id, item.quantity + 1);
        }
      },

      decrementQuantity: (id) => {
        const item = get().items.find((i) => i.id === id);
        if (item && item.quantity > 1) {
          get().updateQuantity(id, item.quantity - 1);
        }
      },

      clearCart: () => set({ items: [], shopifyCartId: null }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getShippingProgress: () => {
        const subtotal = get().getSubtotal();
        return {
          current: subtotal,
          target: FREE_SHIPPING_THRESHOLD,
          remaining: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal),
          freeShipping: subtotal >= FREE_SHIPPING_THRESHOLD,
        };
      },

      setShopifyCartId: (id) => set({ shopifyCartId: id }),

      syncWithShopify: async () => {
        const { items, shopifyCartId } = get();

        const lineItems = items
          .filter((item) => item.variantId)
          .map((item) => ({
            variantId: item.variantId!,
            quantity: item.quantity,
          }));

        if (lineItems.length === 0) return;

        try {
          // If we have an existing Shopify cart, verify it's still valid
          if (shopifyCartId) {
            const res = await fetch(
              `/api/checkout?cartId=${encodeURIComponent(shopifyCartId)}`
            );
            if (res.ok) {
              // Cart still exists, no need to create a new one
              return;
            }
          }

          // Create a new Shopify cart
          const res = await fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lineItems }),
          });
          if (res.ok) {
            const data = await res.json();
            set({ shopifyCartId: data.id });
          }
        } catch (error) {
          console.error("Shopify cart sync error:", error);
        }
      },
    }),
    {
      name: "cenpod-cart",
      partialize: (state) => ({
        items: state.items,
        shopifyCartId: state.shopifyCartId,
      }),
    }
  )
);
