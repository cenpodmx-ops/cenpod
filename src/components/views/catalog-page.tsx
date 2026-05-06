"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigationStore } from "@/store/navigation";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import {
  Product,
  Category,
  formatPrice,
  parseImages,
  getDiscountPercentage,
  getVariantId,
} from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  SlidersHorizontal,
  Star,
  Plus,
  Heart,
  X,
  ChevronLeft,
  ChevronRight,
  Cross,
  ShoppingBag,
} from "lucide-react";

// ─── Gradient map ──────────────────────────────────────────────────────────
const categoryGradient: Record<string, string> = {
  instrumentos: "from-slate-700 to-slate-500",
  insumos: "from-sky-700 to-sky-500",
  equipamiento: "from-teal-700 to-teal-500",
  "cuidado-pies": "from-rose-700 to-rose-500",
};

const categoryNames: Record<string, string> = {
  instrumentos: "Instrumentos",
  insumos: "Insumos",
  equipamiento: "Equipamiento",
  "cuidado-pies": "Cuidado de Pies",
};

const SORT_OPTIONS = [
  { value: "featured", label: "Destacados" },
  { value: "price-asc", label: "Precio: menor a mayor" },
  { value: "price-desc", label: "Precio: mayor a menor" },
  { value: "name", label: "Nombre" },
  { value: "newest", label: "Más nuevos" },
  { value: "rating", label: "Mejor valorados" },
];

const USAGE_OPTIONS = [
  { value: "profesional", label: "Profesional" },
  { value: "general", label: "General" },
];

// ─── Star Rating ───────────────────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3 h-3 ${
            star <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-gray-200 text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

// ─── Product Card ──────────────────────────────────────────────────────────
function ProductCard({
  product,
  index,
}: {
  product: Product;
  index: number;
}) {
  const { navigate } = useNavigationStore();
  const { addItem } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();
  const categorySlug = product.category?.slug || "instrumentos";
  const gradient = categoryGradient[categorySlug] || "from-slate-700 to-slate-500";
  const images = parseImages(product.images);
  const discount = getDiscountPercentage(product.price, product.comparePrice);
  const [imgError, setImgError] = useState(false);
  const showPlaceholder = images.length === 0 || imgError;
  const wishlisted = isInWishlist(product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      className="group flex flex-col rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden hover:-translate-y-1"
    >
      {/* Image area */}
      <div
        className="relative aspect-square cursor-pointer overflow-hidden"
        onClick={() =>
          navigate("product", { selectedProductSlug: product.slug })
        }
      >
        {showPlaceholder ? (
          <div
            className={`h-full w-full bg-gradient-to-br ${gradient} flex items-center justify-center`}
          >
            <Cross className="w-12 h-12 text-white/30" />
          </div>
        ) : (
          <img
            src={images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        )}

        {/* Category badge overlay */}
        {product.category && (
          <span className="absolute top-2 left-2 bg-navy text-white text-[10px] font-medium px-2 py-0.5 rounded-md">
            {product.category.name}
          </span>
        )}

        {/* Discount badge */}
        {discount && (
          <Badge className="absolute top-2 right-10 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md border-0 hover:bg-red-500">
            -{discount}%
          </Badge>
        )}

        {/* Wishlist button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleItem(product.id);
          }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-white hover:scale-110"
          aria-label={
            wishlisted
              ? `Quitar ${product.name} de favoritos`
              : `Agregar ${product.name} a favoritos`
          }
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              wishlisted
                ? "fill-red-500 text-red-500"
                : "text-gray-400 hover:text-red-400"
            }`}
          />
        </button>
      </div>

      {/* Info area */}
      <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
        <h3
          className="text-[13px] sm:text-sm font-semibold text-navy leading-tight line-clamp-2 cursor-pointer hover:text-navy-400 transition-colors min-h-[2.5em]"
          onClick={() =>
            navigate("product", { selectedProductSlug: product.slug })
          }
        >
          {product.name}
        </h3>

        <StarRating rating={product.rating} />

        <div className="mt-auto flex items-end justify-between pt-2">
          <div className="flex flex-col">
            {product.comparePrice && product.comparePrice > product.price ? (
              <>
                <span className="text-[11px] text-gray-400 line-through">
                  {formatPrice(product.comparePrice)}
                </span>
                <span className="text-sm sm:text-base font-bold text-navy">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="text-sm sm:text-base font-bold text-navy">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <Button
            size="sm"
            className="h-8 w-8 rounded-lg bg-navy p-0 text-white hover:bg-navy-light transition-colors"
            onClick={() =>
              addItem({
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                comparePrice: product.comparePrice || undefined,
                image: images[0] || "",
                maxStock: product.stock,
                quantity: 1,
                variantId: getVariantId(product),
              })
            }
            aria-label={`Agregar ${product.name} al carrito`}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Skeleton Card ─────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="flex flex-col rounded-xl border border-gray-100 bg-white overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-4 w-3/4 rounded" />
        <Skeleton className="h-3 w-1/2 rounded" />
        <Skeleton className="h-5 w-1/3 rounded" />
      </div>
    </div>
  );
}

// ─── Filter Sidebar Content ────────────────────────────────────────────────
function FilterSidebar({
  categories,
  filters,
  setFilters,
  resetFilters,
  onClose,
}: {
  categories: Category[];
  filters: NavigationFilters;
  setFilters: (f: Partial<NavigationFilters>) => void;
  resetFilters: () => void;
  onClose?: () => void;
}) {
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.q) count++;
    if (filters.category.length > 0) count += filters.category.length;
    if (filters.usage.length > 0) count += filters.usage.length;
    if (filters.minPrice > 0 || filters.maxPrice < 20000) count++;
    return count;
  }, [filters]);

  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-bold text-navy">
          Filtros
          {hasActiveFilters && (
            <Badge className="ml-2 bg-navy text-white text-[10px] border-0 hover:bg-navy">
              {activeFilterCount}
            </Badge>
          )}
        </h2>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-xs text-gray-500 hover:text-navy transition-colors underline"
          >
            Limpiar todo
          </button>
        )}
      </div>

      {/* Search */}
      <div>
        <label className="text-xs font-semibold text-gray-dark uppercase tracking-wide mb-2 block">
          Buscar
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Nombre, SKU..."
            value={filters.q}
            onChange={(e) => setFilters({ q: e.target.value })}
            className="pl-9 h-9 text-sm border-gray-200 rounded-lg"
          />
        </div>
      </div>

      {/* Categories */}
      <div>
        <label className="text-xs font-semibold text-gray-dark uppercase tracking-wide mb-3 block">
          Categorías
        </label>
        <div className="flex flex-col gap-2.5">
          {categories.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <Checkbox
                checked={filters.category.includes(cat.slug)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setFilters({
                      category: [...filters.category, cat.slug],
                    });
                  } else {
                    setFilters({
                      category: filters.category.filter(
                        (c) => c !== cat.slug
                      ),
                    });
                  }
                }}
                className="data-[state=checked]:bg-navy data-[state=checked]:border-navy"
              />
              <span className="text-sm text-gray-700 group-hover:text-navy transition-colors">
                {cat.name}
              </span>
              {cat.productCount !== undefined && (
                <span className="text-xs text-gray-400 ml-auto">
                  ({cat.productCount})
                </span>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Usage */}
      <div>
        <label className="text-xs font-semibold text-gray-dark uppercase tracking-wide mb-3 block">
          Uso
        </label>
        <div className="flex flex-col gap-2.5">
          {USAGE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <Checkbox
                checked={filters.usage.includes(opt.value)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setFilters({ usage: [...filters.usage, opt.value] });
                  } else {
                    setFilters({
                      usage: filters.usage.filter((u) => u !== opt.value),
                    });
                  }
                }}
                className="data-[state=checked]:bg-navy data-[state=checked]:border-navy"
              />
              <span className="text-sm text-gray-700 group-hover:text-navy transition-colors">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="text-xs font-semibold text-gray-dark uppercase tracking-wide mb-3 block">
          Precio
        </label>
        <Slider
          value={[filters.minPrice, filters.maxPrice]}
          min={0}
          max={20000}
          step={100}
          onValueChange={(value) =>
            setFilters({ minPrice: value[0], maxPrice: value[1] })
          }
          className="mt-2"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500">
            {formatPrice(filters.minPrice)}
          </span>
          <span className="text-xs text-gray-500">
            {formatPrice(filters.maxPrice)}
          </span>
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="text-xs font-semibold text-gray-dark uppercase tracking-wide mb-2 block">
          Ordenar por
        </label>
        <Select
          value={filters.sort}
          onValueChange={(value) => setFilters({ sort: value })}
        >
          <SelectTrigger className="w-full h-9 text-sm border-gray-200 rounded-lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Apply button (mobile) */}
      {onClose && (
        <Button
          onClick={onClose}
          className="w-full h-11 bg-navy text-white font-semibold rounded-xl hover:bg-navy-light transition-colors"
        >
          Ver resultados
        </Button>
      )}
    </div>
  );
}

// ─── Active Filter Chips ───────────────────────────────────────────────────
function ActiveFilterChips({
  filters,
  setFilters,
  categories,
}: {
  filters: NavigationFilters;
  setFilters: (f: Partial<NavigationFilters>) => void;
  categories: Category[];
}) {
  const chips: { key: string; label: string; onRemove: () => void }[] = [];

  if (filters.q) {
    chips.push({
      key: "q",
      label: `"${filters.q}"`,
      onRemove: () => setFilters({ q: "" }),
    });
  }

  filters.category.forEach((slug) => {
    const cat = categories.find((c) => c.slug === slug);
    chips.push({
      key: `cat-${slug}`,
      label: cat?.name || categoryNames[slug] || slug,
      onRemove: () =>
        setFilters({ category: filters.category.filter((c) => c !== slug) }),
    });
  });

  filters.usage.forEach((u) => {
    const label = USAGE_OPTIONS.find((o) => o.value === u)?.label || u;
    chips.push({
      key: `usage-${u}`,
      label,
      onRemove: () =>
        setFilters({ usage: filters.usage.filter((x) => x !== u) }),
    });
  });

  if (filters.minPrice > 0 || filters.maxPrice < 20000) {
    chips.push({
      key: "price",
      label: `${formatPrice(filters.minPrice)} – ${formatPrice(filters.maxPrice)}`,
      onRemove: () => setFilters({ minPrice: 0, maxPrice: 20000 }),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <AnimatePresence>
        {chips.map((chip) => (
          <motion.div
            key={chip.key}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <Badge
              variant="secondary"
              className="flex items-center gap-1.5 px-3 py-1 bg-blue-light text-navy text-xs font-medium rounded-lg hover:bg-navy-100 transition-colors cursor-pointer"
              onClick={chip.onRemove}
            >
              {chip.label}
              <X className="w-3 h-3" />
            </Badge>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Types ─────────────────────────────────────────────────────────────────
interface NavigationFilters {
  q: string;
  category: string[];
  usage: string[];
  minPrice: number;
  maxPrice: number;
  sort: string;
}

// ─── Main Catalog Page ────────────────────────────────────────────────────
export default function CatalogPage() {
  const {
    catalogFilters,
    setFilters,
    resetFilters,
    navigate,
  } = useNavigationStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [debouncedQ, setDebouncedQ] = useState(catalogFilters.q);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQ(catalogFilters.q);
    }, 300);
    return () => clearTimeout(timer);
  }, [catalogFilters.q]);

  // Fetch categories once
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  // Fetch products when filters change
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedQ) params.set("q", debouncedQ);
      if (catalogFilters.category.length > 0)
        params.set("category", catalogFilters.category.join(","));
      if (catalogFilters.usage.length > 0)
        params.set("usage", catalogFilters.usage.join(","));
      params.set("minPrice", String(catalogFilters.minPrice));
      params.set("maxPrice", String(catalogFilters.maxPrice));
      params.set("sort", catalogFilters.sort);
      params.set("page", String(page));
      params.set("limit", "12");

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      setProducts(data.products || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }, [
    debouncedQ,
    catalogFilters.category,
    catalogFilters.usage,
    catalogFilters.minPrice,
    catalogFilters.maxPrice,
    catalogFilters.sort,
    page,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [
    debouncedQ,
    catalogFilters.category,
    catalogFilters.usage,
    catalogFilters.minPrice,
    catalogFilters.maxPrice,
    catalogFilters.sort,
  ]);

  const handleSetFilters = useCallback(
    (newFilters: Partial<NavigationFilters>) => {
      setFilters(newFilters);
    },
    [setFilters]
  );

  return (
    <div className="min-h-screen bg-gray-bg">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("home")}
              className="text-navy hover:text-navy-light"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Inicio
            </Button>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-navy mt-2">
            Catálogo
          </h1>
          <p className="text-sm text-gray-dark mt-1">
            Mostrando{" "}
            <span className="font-semibold text-navy">{total}</span>{" "}
            producto{total !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Mobile filter button + Sort */}
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-gray-200"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filtros
                {(() => {
                  let c = 0;
                  if (catalogFilters.category.length) c += catalogFilters.category.length;
                  if (catalogFilters.usage.length) c += catalogFilters.usage.length;
                  if (catalogFilters.minPrice > 0 || catalogFilters.maxPrice < 20000) c++;
                  return c > 0 ? (
                    <Badge className="bg-navy text-white text-[10px] border-0 h-5 w-5 p-0 flex items-center justify-center rounded-full hover:bg-navy">
                      {c}
                    </Badge>
                  ) : null;
                })()}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0 overflow-y-auto">
              <SheetHeader className="sr-only">
                <SheetTitle>Filtros</SheetTitle>
              </SheetHeader>
              <FilterSidebar
                categories={categories}
                filters={catalogFilters}
                setFilters={handleSetFilters}
                resetFilters={resetFilters}
                onClose={() => setSheetOpen(false)}
              />
            </SheetContent>
          </Sheet>

          <Select
            value={catalogFilters.sort}
            onValueChange={(value) => setFilters({ sort: value })}
          >
            <SelectTrigger className="w-[180px] h-9 text-xs border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-[260px] shrink-0">
            <div className="sticky top-4 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <FilterSidebar
                categories={categories}
                filters={catalogFilters}
                setFilters={handleSetFilters}
                resetFilters={resetFilters}
              />
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {/* Active filter chips */}
            <ActiveFilterChips
              filters={catalogFilters}
              setFilters={handleSetFilters}
              categories={categories}
            />

            {/* Product Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mt-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="font-heading text-lg font-semibold text-navy mb-2">
                  No se encontraron productos
                </h3>
                <p className="text-sm text-gray-dark mb-4">
                  Intenta ajustar los filtros para encontrar lo que buscas
                </p>
                <Button
                  onClick={resetFilters}
                  variant="outline"
                  className="border-navy text-navy hover:bg-navy hover:text-white"
                >
                  Limpiar filtros
                </Button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mt-4">
                {products.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={i}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8 pb-8">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-9 w-9 p-0 border-gray-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    // Show first, last, current, and neighbors
                    return (
                      p === 1 ||
                      p === totalPages ||
                      Math.abs(p - page) <= 1
                    );
                  })
                  .map((p, i, arr) => (
                    <span key={p} className="contents">
                      {i > 0 && arr[i - 1] !== p - 1 && (
                        <span className="text-gray-400 px-1">...</span>
                      )}
                      <Button
                        variant={page === p ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(p)}
                        className={`h-9 w-9 p-0 ${
                          page === p
                            ? "bg-navy text-white hover:bg-navy-light"
                            : "border-gray-200 text-gray-600 hover:border-navy hover:text-navy"
                        }`}
                      >
                        {p}
                      </Button>
                    </span>
                  ))}

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="h-9 w-9 p-0 border-gray-200"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>

                <span className="text-xs text-gray-500 ml-2">
                  Página {page} de {totalPages}
                </span>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
