"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigationStore } from "@/store/navigation";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import {
  Product,
  formatPrice,
  parseImages,
  parseTags,
  getDiscountPercentage,
} from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Star,
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  ChevronRight,
  ChevronLeft,
  Cross,
  Package,
  Tag,
  Layers,
  ShieldCheck,
  Truck,
  RefreshCw,
} from "lucide-react";

// ─── Gradient map ──────────────────────────────────────────────────────────
const categoryGradient: Record<string, string> = {
  instrumentos: "from-slate-700 to-slate-500",
  insumos: "from-sky-700 to-sky-500",
  equipamiento: "from-teal-700 to-teal-500",
  "cuidado-pies": "from-rose-700 to-rose-500",
};

// ─── Star Rating ───────────────────────────────────────────────────────────
function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= Math.round(rating)
                ? "fill-amber-400 text-amber-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
      </div>
      <span className="text-sm text-gray-500">
        {rating.toFixed(1)} ({count} reseña{count !== 1 ? "s" : ""})
      </span>
    </div>
  );
}

// ─── Stock Indicator ───────────────────────────────────────────────────────
function StockIndicator({ stock }: { stock: number }) {
  if (stock === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600">
        <span className="w-2 h-2 rounded-full bg-red-500" />
        Agotado
      </span>
    );
  }
  if (stock <= 5) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        Pocas unidades
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600">
      <span className="w-2 h-2 rounded-full bg-green-500" />
      En stock
    </span>
  );
}

// ─── Quantity Selector ─────────────────────────────────────────────────────
function QuantitySelector({
  quantity,
  maxStock,
  onQuantityChange,
}: {
  quantity: number;
  maxStock: number;
  onQuantityChange: (q: number) => void;
}) {
  return (
    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden w-fit">
      <button
        onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
        disabled={quantity <= 1}
        className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-navy hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Disminuir cantidad"
      >
        <Minus className="w-4 h-4" />
      </button>
      <span className="w-12 h-10 flex items-center justify-center text-sm font-semibold text-navy border-x border-gray-200">
        {quantity}
      </span>
      <button
        onClick={() => onQuantityChange(Math.min(maxStock, quantity + 1))}
        disabled={quantity >= maxStock}
        className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-navy hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Aumentar cantidad"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Small Product Card (for Related Products) ─────────────────────────────
function SmallProductCard({ product }: { product: Product }) {
  const { navigate } = useNavigationStore();
  const { addItem } = useCartStore();
  const categorySlug = product.category?.slug || "instrumentos";
  const gradient = categoryGradient[categorySlug] || "from-slate-700 to-slate-500";
  const images = parseImages(product.images);
  const discount = getDiscountPercentage(product.price, product.comparePrice);
  const [imgError, setImgError] = useState(false);
  const showPlaceholder = images.length === 0 || imgError;

  return (
    <div
      className="group flex flex-col rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer min-w-[160px] sm:min-w-[180px] shrink-0"
      onClick={() =>
        navigate("product", { selectedProductSlug: product.slug })
      }
    >
      <div className="relative aspect-square overflow-hidden">
        {showPlaceholder ? (
          <div
            className={`h-full w-full bg-gradient-to-br ${gradient} flex items-center justify-center`}
          >
            <Cross className="w-8 h-8 text-white/30" />
          </div>
        ) : (
          <img
            src={images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        )}
        {discount && (
          <Badge className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md border-0 hover:bg-red-500">
            -{discount}%
          </Badge>
        )}
      </div>
      <div className="p-3">
        <h4 className="text-xs font-semibold text-navy line-clamp-2 leading-tight">
          {product.name}
        </h4>
        <div className="mt-1.5 flex items-end justify-between">
          <span className="text-sm font-bold text-navy">
            {formatPrice(product.price)}
          </span>
          <Button
            size="sm"
            className="h-7 w-7 rounded-lg bg-navy p-0 text-white hover:bg-navy-light"
            onClick={(e) => {
              e.stopPropagation();
              addItem({
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                comparePrice: product.comparePrice || undefined,
                image: images[0] || "",
                maxStock: product.stock,
                quantity: 1,
              });
            }}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Sanitize HTML ─────────────────────────────────────────────────────────
function sanitizeHtml(html: string): string {
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
}

// ─── Main Product Detail Page ──────────────────────────────────────────────
export default function ProductDetailPage() {
  const { selectedProductSlug, navigate } = useNavigationStore();
  const { addItem } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [fetchedSlug, setFetchedSlug] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Derive loading from whether we're fetching a new product
  const loading = selectedProductSlug !== fetchedSlug;

  // Fetch product data when slug changes
  useEffect(() => {
    if (!selectedProductSlug) return;

    let cancelled = false;

    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${selectedProductSlug}`);
        if (!res.ok) throw new Error("Product not found");
        const data = await res.json();
        if (cancelled) return;
        setProduct(data);
        setFetchedSlug(selectedProductSlug);
        setSelectedImage(0);
        setQuantity(1);

        // Fetch related products from same category
        if (data.categoryId) {
          try {
            const relRes = await fetch(
              `/api/products?category=${data.category?.slug || ""}&limit=5&sort=featured`
            );
            const relData = await relRes.json();
            if (cancelled) return;
            const related = (relData.products || []).filter(
              (p: Product) => p.id !== data.id
            );
            setRelatedProducts(related.slice(0, 4));
          } catch {
            // Ignore related products fetch error
          }
        }
      } catch (err) {
        if (cancelled) return;
        console.error("Error fetching product:", err);
        setProduct(null);
        setFetchedSlug(selectedProductSlug);
      }
    }

    fetchProduct();
    return () => { cancelled = true; };
  }, [selectedProductSlug]);

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    const images = parseImages(product.images);
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      comparePrice: product.comparePrice || undefined,
      image: images[0] || "",
      maxStock: product.stock,
      quantity,
    });
  }, [product, quantity, addItem]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <div className="flex flex-col gap-4">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-8 w-3/4 rounded" />
              <Skeleton className="h-5 w-24 rounded" />
              <Skeleton className="h-10 w-40 rounded" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not found
  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="font-heading text-xl font-bold text-navy mb-2">
            Producto no encontrado
          </h2>
          <p className="text-sm text-gray-dark mb-4">
            El producto que buscas no existe o fue removido
          </p>
          <Button
            onClick={() => navigate("catalog")}
            className="bg-navy text-white hover:bg-navy-light"
          >
            Ver catálogo
          </Button>
        </div>
      </div>
    );
  }

  const images = parseImages(product.images);
  const tags = parseTags(product.tags);
  const discount = getDiscountPercentage(product.price, product.comparePrice);
  const categorySlug = product.category?.slug || "instrumentos";
  const gradient = categoryGradient[categorySlug] || "from-slate-700 to-slate-500";
  const wishlisted = isInWishlist(product.id);

  // Generate gradient thumbnails for missing images
  const displayImages =
    images.length > 0
      ? images
      : Array.from({ length: 4 }, (_, i) => `gradient-${i}`);

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Breadcrumb */}
        <div className="border-b border-gray-100 bg-gray-bg/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <nav className="flex items-center gap-1.5 text-xs text-gray-500">
              <button
                onClick={() => navigate("home")}
                className="hover:text-navy transition-colors"
              >
                Inicio
              </button>
              <ChevronRight className="w-3 h-3" />
              <button
                onClick={() => navigate("catalog")}
                className="hover:text-navy transition-colors"
              >
                Catálogo
              </button>
              {product.category && (
                <>
                  <ChevronRight className="w-3 h-3" />
                  <button
                    onClick={() =>
                      navigate("catalog", {
                        catalogFilters: {
                          q: "",
                          category: [product.category!.slug],
                          usage: [],
                          minPrice: 0,
                          maxPrice: 20000,
                          sort: "featured",
                        },
                      })
                    }
                    className="hover:text-navy transition-colors"
                  >
                    {product.category.name}
                  </button>
                </>
              )}
              <ChevronRight className="w-3 h-3" />
              <span className="text-navy font-medium truncate">
                {product.name}
              </span>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* ─── Gallery (Left Column) ─────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Main Image */}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-bg border border-gray-100">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    {images.length === 0 ||
                    selectedImage >= images.length ? (
                      <div
                        className={`h-full w-full bg-gradient-to-br ${gradient} flex items-center justify-center`}
                      >
                        <Cross className="w-20 h-20 text-white/30" />
                      </div>
                    ) : (
                      <img
                        src={images[selectedImage]}
                        alt={`${product.name} - imagen ${selectedImage + 1}`}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Discount badge */}
                {discount && (
                  <Badge className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg border-0 hover:bg-red-500">
                    -{discount}%
                  </Badge>
                )}
              </div>

              {/* Thumbnails */}
              <div className="flex gap-2 mt-3 overflow-x-auto pb-2 custom-scrollbar">
                {displayImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === i
                        ? "border-navy shadow-sm"
                        : "border-gray-100 hover:border-gray-300"
                    }`}
                  >
                    {img.startsWith("gradient-") ? (
                      <div
                        className={`h-full w-full bg-gradient-to-br ${gradient} flex items-center justify-center`}
                      >
                        <Cross className="w-6 h-6 text-white/30" />
                      </div>
                    ) : (
                      <img
                        src={img}
                        alt={`${product.name} - miniatura ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* ─── Info (Right Column) ────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col"
            >
              {/* Product name */}
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-navy leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="mt-2">
                <StarRating rating={product.rating} count={product.reviewCount} />
              </div>

              {/* Price section */}
              <div className="mt-4 flex items-end gap-3">
                <span className="text-3xl font-bold text-navy">
                  {formatPrice(product.price)}
                </span>
                {product.comparePrice && product.comparePrice > product.price && (
                  <>
                    <span className="text-lg text-gray-400 line-through">
                      {formatPrice(product.comparePrice)}
                    </span>
                    <Badge className="bg-red-50 text-red-600 border-0 text-xs font-bold px-2 py-0.5 rounded-md hover:bg-red-50">
                      Ahorra {discount}%
                    </Badge>
                  </>
                )}
              </div>

              {/* Stock indicator */}
              <div className="mt-3">
                <StockIndicator stock={product.stock} />
              </div>

              {/* Short description */}
              {product.description && (
                <p className="mt-4 text-sm text-gray-dark leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Quantity + Add to Cart */}
              <div className="mt-6 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-dark">
                    Cantidad:
                  </span>
                  <QuantitySelector
                    quantity={quantity}
                    maxStock={Math.max(product.stock, 1)}
                    onQuantityChange={setQuantity}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="flex-1 h-[52px] bg-navy hover:bg-navy-light text-white font-semibold rounded-xl transition-colors text-base gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {product.stock === 0
                      ? "Agotado"
                      : "Agregar al carrito"}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => toggleItem(product.id)}
                    className={`h-[52px] w-[52px] p-0 rounded-xl border-2 transition-all ${
                      wishlisted
                        ? "border-red-200 bg-red-50 hover:bg-red-100"
                        : "border-gray-200 hover:border-red-200 hover:bg-red-50"
                    }`}
                    aria-label={
                      wishlisted
                        ? "Quitar de favoritos"
                        : "Agregar a favoritos"
                    }
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        wishlisted
                          ? "fill-red-500 text-red-500"
                          : "text-gray-400"
                      }`}
                    />
                  </Button>
                </div>
              </div>

              {/* Trust badges */}
              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-gray-bg text-center">
                  <ShieldCheck className="w-5 h-5 text-navy" />
                  <span className="text-[10px] sm:text-xs text-gray-dark font-medium leading-tight">
                    Producto certificado
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-gray-bg text-center">
                  <Truck className="w-5 h-5 text-navy" />
                  <span className="text-[10px] sm:text-xs text-gray-dark font-medium leading-tight">
                    Envío gratis +$500
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-gray-bg text-center">
                  <RefreshCw className="w-5 h-5 text-navy" />
                  <span className="text-[10px] sm:text-xs text-gray-dark font-medium leading-tight">
                    Devolución fácil
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ─── Tabs Section ──────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 sm:mt-14"
          >
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="w-full sm:w-auto bg-gray-bg h-auto p-1 rounded-xl">
                <TabsTrigger
                  value="description"
                  className="rounded-lg px-4 sm:px-6 py-2.5 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Descripción
                </TabsTrigger>
                <TabsTrigger
                  value="specifications"
                  className="rounded-lg px-4 sm:px-6 py-2.5 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Especificaciones
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="rounded-lg px-4 sm:px-6 py-2.5 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Reseñas
                </TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="mt-6">
                <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-6">
                  {product.content ? (
                    <div
                      className="prose prose-sm max-w-none text-gray-dark prose-headings:font-heading prose-headings:text-navy prose-a:text-navy prose-a:no-underline hover:prose-a:underline"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeHtml(product.content),
                      }}
                    />
                  ) : (
                    <p className="text-sm text-gray-dark">
                      {product.description ||
                        "No hay descripción detallada disponible para este producto."}
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="specifications" className="mt-6">
                <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {product.sku && (
                      <div className="flex items-start gap-3 p-3 bg-gray-bg rounded-lg">
                        <Package className="w-5 h-5 text-navy shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">
                            SKU
                          </p>
                          <p className="text-sm text-navy font-semibold">
                            {product.sku}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3 p-3 bg-gray-bg rounded-lg">
                      <Layers className="w-5 h-5 text-navy shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">
                          Stock disponible
                        </p>
                        <p className="text-sm text-navy font-semibold">
                          {product.stock} unidades
                        </p>
                      </div>
                    </div>

                    {product.category && (
                      <div className="flex items-start gap-3 p-3 bg-gray-bg rounded-lg">
                        <Cross className="w-5 h-5 text-navy shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">
                            Categoría
                          </p>
                          <p className="text-sm text-navy font-semibold">
                            {product.category.name}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3 p-3 bg-gray-bg rounded-lg">
                      <ShieldCheck className="w-5 h-5 text-navy shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">
                          Uso
                        </p>
                        <p className="text-sm text-navy font-semibold capitalize">
                          {product.usage}
                        </p>
                      </div>
                    </div>

                    {product.weight && (
                      <div className="flex items-start gap-3 p-3 bg-gray-bg rounded-lg">
                        <Package className="w-5 h-5 text-navy shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">
                            Peso
                          </p>
                          <p className="text-sm text-navy font-semibold">
                            {product.weight} kg
                          </p>
                        </div>
                      </div>
                    )}

                    {product.dimensions && (
                      <div className="flex items-start gap-3 p-3 bg-gray-bg rounded-lg">
                        <Package className="w-5 h-5 text-navy shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">
                            Dimensiones
                          </p>
                          <p className="text-sm text-navy font-semibold">
                            {product.dimensions}
                          </p>
                        </div>
                      </div>
                    )}

                    {tags.length > 0 && (
                      <div className="flex items-start gap-3 p-3 bg-gray-bg rounded-lg sm:col-span-2">
                        <Tag className="w-5 h-5 text-navy shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium mb-1.5">
                            Etiquetas
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="bg-blue-light text-navy text-xs border-0 hover:bg-navy-100"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <div className="bg-white border border-gray-100 rounded-xl p-6 sm:p-8 text-center">
                  <Star className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <h3 className="font-heading text-lg font-semibold text-navy mb-1">
                    Reseñas
                  </h3>
                  <p className="text-sm text-gray-dark">
                    Próximamente podrás ver y dejar reseñas de los productos.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* ─── Related Products ─────────────────────────────────────── */}
          {relatedProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-10 sm:mt-14"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-xl font-bold text-navy">
                  Productos relacionados
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-navy hover:text-navy-light"
                  onClick={() =>
                    navigate("catalog", {
                      catalogFilters: {
                        q: "",
                        category: product.category?.slug
                          ? [product.category.slug]
                          : [],
                        usage: [],
                        minPrice: 0,
                        maxPrice: 20000,
                        sort: "featured",
                      },
                    })
                  }
                >
                  Ver más
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 custom-scrollbar">
                {relatedProducts.map((p) => (
                  <SmallProductCard key={p.id} product={p} />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ─── JSON-LD Structured Data ──────────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.description || "",
            brand: { "@type": "Brand", name: "CENPOD" },
            image: images.length > 0 ? images[0] : undefined,
            offers: {
              "@type": "Offer",
              price: product.price,
              priceCurrency: "MXN",
              availability:
                product.stock > 0
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
            },
          }),
        }}
      />
    </>
  );
}
