"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Heart,
  ShoppingCart,
  X,
  Package,
  Loader2,
} from "lucide-react";
import { useNavigationStore } from "@/store/navigation";
import { useWishlistStore } from "@/store/wishlist";
import { useCartStore } from "@/store/cart";
import { formatPrice, Product, parseImages } from "@/types";
import { Button } from "@/components/ui/button";

/* ════════════════════════ Wishlist Card ════════════════════════ */

const CARD_GRADIENTS = [
  "from-navy-100 to-blue-light",
  "from-amber-50 to-amber-100",
  "from-rose-50 to-rose-100",
  "from-green-50 to-green-100",
  "from-purple-50 to-purple-100",
  "from-cyan-50 to-cyan-100",
];

function WishlistCard({
  product,
  index,
  onRemove,
  onAddToCart,
}: {
  product: Product;
  index: number;
  onRemove: () => void;
  onAddToCart: () => void;
}) {
  const images = parseImages(product.images);
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ delay: index * 0.05 }}
      className="group relative overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
    >
      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-gray-400 shadow-sm transition-colors hover:bg-red-50 hover:text-red-500"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {/* Image */}
      <div
        className="relative cursor-pointer overflow-hidden"
        onClick={() =>
          useNavigationStore
            .getState()
            .navigate("product", { selectedProductSlug: product.slug })
        }
      >
        <div className="aspect-square">
          {images[0] ? (
            <img
              src={images[0]}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div
              className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradient}`}
            >
              <Package className="h-12 w-12 text-white/60" />
            </div>
          )}
        </div>
        {/* Wishlist indicator */}
        <div className="absolute bottom-2 left-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm">
          <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3
          className="mb-1 line-clamp-2 cursor-pointer text-sm font-medium text-navy transition-colors hover:text-navy-light"
          onClick={() =>
            useNavigationStore
              .getState()
              .navigate("product", { selectedProductSlug: product.slug })
          }
        >
          {product.name}
        </h3>
        <div className="mb-3 flex items-baseline gap-2">
          <span className="font-heading text-lg font-bold text-navy">
            {formatPrice(product.price)}
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>
        <Button
          onClick={onAddToCart}
          className="h-10 w-full rounded-xl bg-navy text-white hover:bg-navy-light"
          size="sm"
          disabled={product.stock === 0}
        >
          <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
          {product.stock === 0 ? "Agotado" : "Agregar al carrito"}
        </Button>
      </div>
    </motion.div>
  );
}

/* ════════════════════════ MAIN COMPONENT ════════════════════════ */

export default function AccountWishlistPage() {
  const { navigate } = useNavigationStore();
  const { items: wishlistItems, removeItem: removeWishlistItem } =
    useWishlistStore();
  const { addItem } = useCartStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWishlistProducts() {
      if (wishlistItems.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch("/api/products?limit=100");
        if (res.ok) {
          const data = await res.json();
          const allProducts: Product[] = data.products || [];
          const wishlistProducts = allProducts.filter((p: Product) =>
            wishlistItems.includes(p.id)
          );
          setProducts(wishlistProducts);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchWishlistProducts();
  }, [wishlistItems]);

  const handleAddToCart = (product: Product) => {
    const images = parseImages(product.images);
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      comparePrice: product.comparePrice || undefined,
      image: images[0] || "",
      maxStock: product.stock,
    });
  };

  return (
    <div className="min-h-screen bg-gray-bg pb-8">
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate("account")}
            className="mb-3 flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-navy"
          >
            <ChevronLeft className="h-4 w-4" />
            Mi cuenta
          </button>
          <h1 className="font-heading text-2xl font-bold text-navy sm:text-3xl">
            Mi lista de deseos
          </h1>
          {!loading && products.length > 0 && (
            <p className="mt-1 text-sm text-gray-500">
              {products.length} producto{products.length !== 1 ? "s" : ""} guardado
              {products.length !== 1 ? "s" : ""}
            </p>
          )}
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="overflow-hidden rounded-2xl">
                <div className="aspect-square skeleton-shimmer" />
                <div className="bg-white p-4">
                  <div className="mb-2 h-4 w-3/4 skeleton-shimmer rounded" />
                  <div className="mb-3 h-6 w-1/2 skeleton-shimmer rounded" />
                  <div className="h-10 skeleton-shimmer rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center rounded-2xl bg-white px-6 py-16 shadow-sm"
          >
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-rose-50">
              <Heart className="h-10 w-10 text-rose-300" />
            </div>
            <h2 className="font-heading mb-2 text-xl font-bold text-navy">
              Tu lista de deseos está vacía
            </h2>
            <p className="mb-6 text-center text-sm text-gray-500">
              Guarda los productos que te gustan para encontrarlos fácilmente
            </p>
            <Button
              onClick={() => navigate("catalog")}
              className="rounded-xl bg-navy text-white hover:bg-navy-light"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Explorar productos
            </Button>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {products.map((product, i) => (
                <WishlistCard
                  key={product.id}
                  product={product}
                  index={i}
                  onRemove={() => removeWishlistItem(product.id)}
                  onAddToCart={() => handleAddToCart(product)}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
