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
  shopifyCheckoutUrl: string | null;
  isSyncing: boolean;
  lastSyncAt: number | null;
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
  getCheckoutUrl: () => Promise<string>;
  refreshVariantIds: () => Promise<number>; // Returns number of updated items
}

const FREE_SHIPPING_THRESHOLD = 1000;

// Debounce timer for Shopify sync
let syncTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Schedule a debounced Shopify cart sync.
 * Waits 1.5 seconds after the last cart change before syncing.
 */
function scheduleShopifySync(syncFn: () => Promise<void>) {
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => {
    syncFn().catch((err) => console.error("Shopify sync error:", err));
  }, 1500);
}

export const useCartStore = create<CartState & CartActions>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      shopifyCartId: null,
      shopifyCheckoutUrl: null,
      isSyncing: false,
      lastSyncAt: null,

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
            // Invalidate Shopify cart checkout URL (cart ID is still valid for updates)
            shopifyCheckoutUrl: null,
          });
        } else {
          set({
            items: [...items, { ...item, quantity: item.quantity || 1 }],
            shopifyCheckoutUrl: null,
          });
        }
        get().openCart();
        // Schedule background Shopify sync
        scheduleShopifySync(() => get().syncWithShopify());
      },

      removeItem: (id) => {
        set({
          items: get().items.filter((i) => i.id !== id),
          shopifyCheckoutUrl: null,
        });
        scheduleShopifySync(() => get().syncWithShopify());
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
          shopifyCheckoutUrl: null,
        });
        scheduleShopifySync(() => get().syncWithShopify());
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

      clearCart: () => {
        set({
          items: [],
          shopifyCartId: null,
          shopifyCheckoutUrl: null,
        });
        if (syncTimeout) clearTimeout(syncTimeout);
      },
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

        // No items with variant IDs — nothing to sync
        if (lineItems.length === 0) {
          set({ shopifyCartId: null, shopifyCheckoutUrl: null, isSyncing: false });
          return;
        }

        set({ isSyncing: true });

        try {
          // If we have an existing cart, try to verify it
          if (shopifyCartId) {
            try {
              const verifyRes = await fetch(
                `/api/cart?cartId=${encodeURIComponent(shopifyCartId)}`
              );
              if (verifyRes.ok) {
                const cartData = await verifyRes.json();
                // Cart exists — update checkout URL
                set({
                  shopifyCheckoutUrl: cartData.webUrl,
                  isSyncing: false,
                  lastSyncAt: Date.now(),
                });
                return;
              }
            } catch {
              // Cart expired or not found, will create new one below
            }
          }

          // Create a new Shopify cart with all items
          const res = await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "create", lineItems }),
          });

          if (res.ok) {
            const data = await res.json();
            set({
              shopifyCartId: data.id,
              shopifyCheckoutUrl: data.webUrl,
              lastSyncAt: Date.now(),
            });
          }
        } catch (error) {
          console.error("Shopify cart sync error:", error);
        } finally {
          set({ isSyncing: false });
        }
      },

      /**
       * Refresh variant IDs for all cart items by fetching latest product data.
       * Returns the number of items that were updated.
       */
      refreshVariantIds: async () => {
        const { items } = get();
        let updatedCount = 0;
        const updatedItems = [...items];

        // Fetch latest variant IDs for each product
        for (let i = 0; i < updatedItems.length; i++) {
          const item = updatedItems[i];
          try {
            const res = await fetch(`/api/products/${item.slug}`);
            if (res.ok) {
              const product = await res.json();
              try {
                const variants = JSON.parse(product.variants || "[]");
                const latestVariantId = variants[0]?.id;
                if (latestVariantId && latestVariantId !== item.variantId) {
                  updatedItems[i] = {
                    ...item,
                    variantId: latestVariantId,
                    price: product.price !== item.price ? product.price : item.price,
                    name: product.name || item.name,
                    image: (JSON.parse(product.images || "[]")[0]) || item.image,
                    maxStock: product.stock !== undefined ? product.stock : item.maxStock,
                  };
                  updatedCount++;
                }
              } catch {
                // Failed to parse variants, skip
              }
            }
          } catch {
            // Failed to fetch product, skip
          }
        }

        if (updatedCount > 0) {
          set({
            items: updatedItems,
            shopifyCartId: null, // Invalidate since variants changed
            shopifyCheckoutUrl: null,
          });
        }

        return updatedCount;
      },

      getCheckoutUrl: async () => {
        // Always refresh variant IDs before checkout to ensure they're current
        await get().refreshVariantIds();

        const { items, shopifyCartId, shopifyCheckoutUrl } = get();

        const lineItems = items
          .filter((item) => item.variantId)
          .map((item) => ({
            variantId: item.variantId!,
            quantity: item.quantity,
          }));

        if (lineItems.length === 0) {
          throw new Error("No hay productos en el carrito con variantes de Shopify");
        }

        // If we have a valid checkout URL, use it directly
        if (shopifyCheckoutUrl) {
          return shopifyCheckoutUrl;
        }

        // If we have a Shopify cart ID, try to get its checkout URL
        if (shopifyCartId) {
          try {
            const res = await fetch(
              `/api/cart?cartId=${encodeURIComponent(shopifyCartId)}`
            );
            if (res.ok) {
              const data = await res.json();
              set({ shopifyCheckoutUrl: data.webUrl });
              return data.webUrl;
            }
          } catch {
            // Cart expired, create new one below
          }
        }

        // No valid Shopify cart — create one with all items
        // If it fails, try once more after refreshing variant IDs
        let res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "create", lineItems }),
        });

        if (!res.ok) {
          // First attempt failed — refresh variant IDs and retry once
          const updated = await get().refreshVariantIds();
          if (updated > 0) {
            // Rebuild line items with fresh variant IDs
            const freshLineItems = get().items
              .filter((item) => item.variantId)
              .map((item) => ({
                variantId: item.variantId!,
                quantity: item.quantity,
              }));

            if (freshLineItems.length === 0) {
              throw new Error("No se pudieron obtener las variantes de los productos. Intenta vaciar el carrito y agregar los productos de nuevo.");
            }

            res = await fetch("/api/cart", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "create", lineItems: freshLineItems }),
            });
          }

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            const msg = errData.error || "Error al crear el carrito de Shopify";
            throw new Error(msg);
          }
        }

        const data = await res.json();
        set({
          shopifyCartId: data.id,
          shopifyCheckoutUrl: data.webUrl,
          lastSyncAt: Date.now(),
        });
        return data.webUrl;
      },
    }),
    {
      name: "cenpod-cart",
      partialize: (state) => ({
        items: state.items,
        shopifyCartId: state.shopifyCartId,
        shopifyCheckoutUrl: state.shopifyCheckoutUrl,
      }),
    }
  )
);
