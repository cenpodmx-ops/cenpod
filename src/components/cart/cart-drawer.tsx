"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Trash2, AlertTriangle } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useNavigationStore } from "@/store/navigation";
import { formatPrice } from "@/types";

const GRADIENT_COLORS = [
  "from-navy-50 to-blue-light",
  "from-blue-light to-navy-50",
  "from-navy-100 to-navy-50",
  "from-navy-50 to-navy-100",
  "from-gray-bg to-blue-light",
  "from-blue-light to-gray-bg",
];

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    incrementQuantity,
    decrementQuantity,
    getSubtotal,
    getItemCount,
    getShippingProgress,
    clearCart,
  } = useCartStore();

  const { navigate } = useNavigationStore();

  const subtotal = getSubtotal();
  const itemCount = getItemCount();
  const shippingProgress = getShippingProgress();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);
  const getCheckoutUrl = useCartStore((s) => s.getCheckoutUrl);

  const handleCheckout = async () => {
    setCartError(null);
    // Check if we have items with Shopify variant IDs
    const hasShopifyItems = items.some((item) => item.variantId);

    if (!hasShopifyItems) {
      // No Shopify variant IDs, go to local checkout as fallback
      closeCart();
      navigate("checkout");
      return;
    }

    try {
      setIsCheckingOut(true);

      // Use the cart store's getCheckoutUrl which handles cart sync
      const checkoutUrl = await getCheckoutUrl();

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        // Fallback to local checkout
        closeCart();
        navigate("checkout");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setCartError(
        error instanceof Error
          ? error.message
          : "Error al procesar. Intenta ir al checkout manualmente."
      );
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleExploreProducts = () => {
    closeCart();
    navigate("catalog");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-[rgba(10,49,67,0.4)] backdrop-blur-sm"
            onClick={closeCart}
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 z-50 h-screen bg-white dark:bg-[#1e1e1e] shadow-2xl flex flex-col"
            style={{ width: "min(400px, 100vw)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-heading font-semibold text-navy dark:text-white">
                  Mi carrito
                </h2>
                {itemCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-navy text-white text-[11px] font-semibold">
                    {itemCount}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="p-1.5 rounded-lg hover:bg-gray-bg dark:hover:bg-white/10 transition-colors"
                aria-label="Cerrar carrito"
              >
                <X className="w-5 h-5 text-gray-dark dark:text-gray-300" />
              </button>
            </div>

            {/* Cart Content */}
            {items.length === 0 ? (
              /* Empty State */
              <div className="flex-1 flex flex-col items-center justify-center px-6">
                <div className="w-20 h-20 rounded-full bg-gray-bg dark:bg-white/10 flex items-center justify-center mb-5">
                  <ShoppingBag className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-base font-heading font-medium text-navy dark:text-white mb-2">
                  Tu carrito est\u00e1 vac\u00edo
                </p>
                <p className="text-sm text-muted-foreground mb-6 text-center">
                  Agrega productos a tu carrito para comenzar
                </p>
                <button
                  onClick={handleExploreProducts}
                  className="bg-navy hover:bg-navy-light text-white font-medium text-sm px-6 py-3 rounded-xl transition-colors"
                >
                  Explorar productos
                </button>
              </div>
            ) : (
              <>
                {/* Cart Items List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-3" style={{ maxHeight: "calc(100vh - 280px)" }}>
                  <div className="space-y-0">
                    {items.map((item, index) => (
                      <div key={item.id}>
                        <div className="flex gap-3 py-4">
                          {/* Product Image */}
                          <div
                            className={`w-16 h-16 rounded-lg bg-gradient-to-br ${GRADIENT_COLORS[index % GRADIENT_COLORS.length]} flex-shrink-0 flex items-center justify-center overflow-hidden`}
                          >
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <ShoppingBag className="w-6 h-6 text-navy-200" />
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-[13px] font-medium text-navy dark:text-white truncate">
                                  {item.name}
                                </p>
                                {item.variant && (
                                  <p className="text-[12px] text-muted-foreground mt-0.5 truncate">
                                    {item.variant}
                                  </p>
                                )}
                              </div>
                              {/* Remove Button */}
                              <button
                                onClick={() => removeItem(item.id)}
                                className="p-1 rounded-md hover:bg-gray-bg dark:hover:bg-white/10 transition-colors flex-shrink-0"
                                aria-label={`Eliminar ${item.name}`}
                              >
                                <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                              </button>
                            </div>

                            {/* Price & Quantity */}
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-[14px] font-semibold text-navy dark:text-white">
                                {formatPrice(item.price * item.quantity)}
                              </p>

                              {/* Quantity Controls */}
                              <div className="flex items-center gap-0 border border-border rounded-lg overflow-hidden">
                                <button
                                  onClick={() => decrementQuantity(item.id)}
                                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-bg dark:hover:bg-white/10 transition-colors"
                                  aria-label="Reducir cantidad"
                                >
                                  <Minus className="w-3 h-3 text-navy dark:text-white" />
                                </button>
                                <span className="w-8 h-8 flex items-center justify-center text-[13px] font-medium text-navy dark:text-white border-x border-border">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => incrementQuantity(item.id)}
                                  disabled={item.quantity >= item.maxStock}
                                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-bg dark:hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                  aria-label="Aumentar cantidad"
                                >
                                  <Plus className="w-3 h-3 text-navy dark:text-white" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Separator */}
                        {index < items.length - 1 && (
                          <div className="border-b border-border" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Free Shipping Progress */}
                <div className="px-5 py-3 border-t border-border">
                  {shippingProgress.freeShipping ? (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <span className="text-base">{"\ud83c\udf89"}</span>
                      <span className="text-sm font-medium">
                        {"\u00a1Env\u00edo gratis!"}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5">
                        Faltan{" "}
                        <span className="font-semibold text-navy dark:text-white">
                          {formatPrice(shippingProgress.remaining)}
                        </span>{" "}
                        para env\u00edo gratis
                      </p>
                      <div className="w-full h-2 bg-gray-bg dark:bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-navy rounded-full"
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.min(
                              (shippingProgress.current / shippingProgress.target) * 100,
                              100
                            )}%`,
                          }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-5 py-4 border-t border-border bg-white dark:bg-[#1e1e1e]">
                  {/* Subtotal */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-muted-foreground">Subtotal</span>
                    <span className="text-base font-heading font-semibold text-navy dark:text-white">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  {/* Error message */}
                  {cartError && (
                    <div className="mb-3 rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-red-700">{cartError}</p>
                      </div>
                      <button
                        onClick={() => setCartError(null)}
                        className="p-0.5 rounded hover:bg-red-100 transition-colors"
                        aria-label="Cerrar error"
                      >
                        <X className="h-3 w-3 text-red-400" />
                      </button>
                    </div>
                  )}

                  {/* Checkout Button */}
                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="w-full h-12 bg-navy hover:bg-navy-light text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isCheckingOut ? "Procesando..." : "Ir al checkout"}
                  </button>

                  {/* Continue Shopping */}
                  <button
                    onClick={closeCart}
                    className="w-full mt-2.5 text-sm text-navy dark:text-navy-200 hover:underline text-center py-1 transition-colors"
                  >
                    Seguir comprando
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
