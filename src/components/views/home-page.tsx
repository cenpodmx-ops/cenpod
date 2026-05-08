"use client";

import { useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useNavigationStore } from "@/store/navigation";
import { useCartStore } from "@/store/cart";
import { Product, Category, formatPrice, parseImages, getDiscountPercentage, getVariantId } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Truck,
  ShieldCheck,
  Headset,
  Lock,
  ChevronRight,
  Star,
  Plus,
  Stethoscope,
  Heart,
  Cross,
  Activity,
  ArrowRight,
  Mail,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

// ─── Gradient map for product image placeholders ─────────────────────────────
const categoryGradient: Record<string, string> = {
  instrumentos: "from-slate-700 to-slate-500",
  insumos: "from-sky-700 to-sky-500",
  equipamiento: "from-teal-700 to-teal-500",
  "cuidado-pies": "from-rose-700 to-rose-500",
};

const categoryBgGradient: Record<string, string> = {
  instrumentos: "from-[#0a3143] to-[#1a5a7a]",
  insumos: "from-[#1a5a7a] to-[#2a7a9a]",
  equipamiento: "from-[#2a7a9a] to-[#3a9aba]",
  "cuidado-pies": "from-[#3a9aba] to-[#8ec9e0]",
};

const categoryNames: Record<string, string> = {
  instrumentos: "Instrumentos",
  insumos: "Insumos",
  equipamiento: "Equipamiento",
  "cuidado-pies": "Cuidado de Pies",
};

// ─── Category icon for overlay cards ──────────────────────────────────────────
function CategoryIcon({ slug }: { slug: string }) {
  const iconClass = "w-8 h-8 text-white/80";
  switch (slug) {
    case "instrumentos":
      return <Cross className={iconClass} />;
    case "insumos":
      return <Heart className={iconClass} />;
    case "equipamiento":
      return <Activity className={iconClass} />;
    case "cuidado-pies":
      return <Sparkles className={iconClass} />;
    default:
      return <Stethoscope className={iconClass} />;
  }
}

// ─── Star Rating Component ────────────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3.5 h-3.5 ${
            star <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-gray-200 text-gray-200"
          }`}
        />
      ))}
      <span className="ml-1 text-xs text-gray-dark">({rating.toFixed(1)})</span>
    </div>
  );
}

// ─── Product Card Component ───────────────────────────────────────────────────
function ProductCard({ product, index }: { product: Product; index: number }) {
  const { navigate } = useNavigationStore();
  const { addItem } = useCartStore();
  const categorySlug = product.category?.slug || "instrumentos";
  const gradient = categoryGradient[categorySlug] || "from-slate-700 to-slate-500";
  const images = parseImages(product.images);
  const discount = getDiscountPercentage(product.price, product.comparePrice);
  const [imgError, setImgError] = useState(false);
  const showPlaceholder = images.length === 0 || imgError;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group flex flex-col rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
    >
      {/* Image area */}
      <div
        className="relative aspect-square cursor-pointer overflow-hidden"
        onClick={() => navigate("product", { selectedProductSlug: product.slug })}
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

        {/* Discount badge */}
        {discount && (
          <Badge className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md border-0 hover:bg-red-500">
            -{discount}%
          </Badge>
        )}

        {/* Category badge */}
        {product.category && (
          <Badge className="absolute top-2 right-2 bg-navy text-white text-[10px] px-2 py-0.5 rounded-md border-0 hover:bg-navy">
            {product.category.name}
          </Badge>
        )}
      </div>

      {/* Info area */}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3
          className="text-sm font-semibold text-navy leading-tight line-clamp-2 cursor-pointer hover:text-navy-400 transition-colors"
          onClick={() => navigate("product", { selectedProductSlug: product.slug })}
        >
          {product.name}
        </h3>

        <StarRating rating={product.rating} />

        <div className="mt-auto flex items-end justify-between pt-2">
          <div className="flex flex-col">
            {product.comparePrice && product.comparePrice > product.price ? (
              <>
                <span className="text-xs text-gray-400 line-through">
                  {formatPrice(product.comparePrice)}
                </span>
                <span className="text-base font-bold text-navy">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="text-base font-bold text-navy">
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

// ─── Main Home Page Component ─────────────────────────────────────────────────
export default function HomePage() {
  const { navigate } = useNavigationStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/products?featured=true&limit=8"),
        ]);
        const catData = await catRes.json();
        const prodData = await prodRes.json();
        setCategories(Array.isArray(catData) ? catData : []);

        // If no featured products found, try fetching all products
        let prods = prodData.products || [];
        if (prods.length === 0) {
          const allRes = await fetch("/api/products?limit=8&sort=newest");
          const allData = await allRes.json();
          prods = allData.products || [];
        }
        setProducts(prods);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* ─── 1. HERO SECTION ──────────────────────────────────────────── */}
      <section className="relative bg-navy flex items-center justify-center overflow-hidden h-[100svh] md:h-[90vh]">
        {/* Hero background image */}
        <div className="absolute inset-0">
          <img
            src="/images/hero-banner.png"
            alt="Consultorio de podología profesional"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/80 to-navy/60" />
        </div>

        {/* Decorative background shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-navy-200/5 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -left-32 w-72 h-72 bg-navy-200/5 rounded-full blur-2xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-navy-200/8 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="font-heading text-white leading-tight mb-6"
            style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
          >
            Productos de podología profesional
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-navy-200 text-lg md:text-xl max-w-2xl mx-auto mb-10"
          >
            Todo lo que necesitas para tu consultorio. Instrumentos, insumos y
            equipamiento de la más alta calidad.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              onClick={() => navigate("catalog")}
              className="h-12 px-8 bg-white text-navy font-semibold text-base rounded-lg hover:bg-gray-50 transition-colors"
            >
              Ver productos
              <ChevronRight className="ml-1 w-5 h-5" />
            </Button>
            <Button
              onClick={() =>
                navigate("catalog", {
                  catalogFilters: {
                    q: "",
                    category: [],
                    usage: ["professional"],
                    minPrice: 0,
                    maxPrice: 20000,
                    sort: "featured",
                  },
                })
              }
              variant="outline"
              className="h-12 px-8 border-white/30 text-white font-semibold text-base rounded-lg bg-transparent hover:bg-white/10 hover:text-white transition-colors"
            >
              Para profesionales
            </Button>
          </motion.div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* ─── 2. TRUST BAR ──────────────────────────────────────────────── */}
      <section className="bg-white border-b border-blue-light">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
            {[
              {
                icon: <Truck className="w-5 h-5 text-navy" />,
                label: "Envío gratis +$500",
              },
              {
                icon: <ShieldCheck className="w-5 h-5 text-navy" />,
                label: "Productos certificados",
              },
              {
                icon: <Headset className="w-5 h-5 text-navy" />,
                label: "Atención experta",
              },
              {
                icon: <Lock className="w-5 h-5 text-navy" />,
                label: "Pago seguro",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2"
              >
                {item.icon}
                <span className="text-[13px] text-gray-dark font-medium">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3. CATEGORIES GRID ────────────────────────────────────────── */}
      <CategoriesSection categories={categories} navigate={navigate} />

      {/* ─── 4. FEATURED PRODUCTS ──────────────────────────────────────── */}
      <FeaturedProductsSection products={products} loading={loading} />

      {/* ─── 5. PROFESSIONAL SECTION ───────────────────────────────────── */}
      <ProfessionalSection navigate={navigate} />

      {/* ─── 6. NEWSLETTER / CTA ───────────────────────────────────────── */}
      <section className="bg-blue-light">
        <div className="max-w-2xl mx-auto px-6 py-16 md:py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Mail className="w-10 h-10 text-navy mx-auto mb-4" />
            <h2 className="font-heading text-2xl md:text-3xl text-navy font-bold mb-3">
              Recibe ofertas exclusivas
            </h2>
            <p className="text-gray-dark mb-8 text-sm md:text-base">
              Suscríbete a nuestro boletín y recibe descuentos especiales,
              novedades y consejos profesionales directamente en tu correo.
            </p>

            {subscribed ? (
              <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
                <CheckCircle2 className="w-5 h-5" />
                <span>¡Gracias por suscribirte!</span>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (email) setSubscribed(true);
                }}
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              >
                <Input
                  type="email"
                  placeholder="Tu correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 bg-white border-gray-200 rounded-lg text-sm flex-1"
                />
                <Button
                  type="submit"
                  className="h-11 px-6 bg-navy text-white font-semibold rounded-lg hover:bg-navy-light transition-colors"
                >
                  Suscribirme
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}

// ─── Categories Section ────────────────────────────────────────────────────────
function CategoriesSection({
  categories,
  navigate,
}: {
  categories: Category[];
  navigate: (view: "catalog", params?: Record<string, unknown>) => void;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Use real categories or fallback to defaults
  const displayCategories =
    categories.length > 0
      ? categories
      : [
          { id: "1", name: "Instrumentos", slug: "instrumentos", order: 0 },
          { id: "2", name: "Insumos", slug: "insumos", order: 1 },
          { id: "3", name: "Equipamiento", slug: "equipamiento", order: 2 },
          { id: "4", name: "Cuidado de Pies", slug: "cuidado-pies", order: 3 },
        ];

  return (
    <section className="bg-white py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="font-heading text-2xl md:text-3xl text-navy font-bold mb-2">
            Explora por categoría
          </h2>
          <p className="text-gray-dark text-sm md:text-base">
            Encuentra todo lo que necesitas organizado por tipo de producto
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {displayCategories.map((cat, i) => {
            const slug = cat.slug;
            const gradient = categoryBgGradient[slug] || "from-[#0a3143] to-[#1a5a7a]";

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative aspect-[3/4] md:aspect-square rounded-xl overflow-hidden cursor-pointer"
                onClick={() =>
                  navigate("catalog", {
                    catalogFilters: {
                      q: "",
                      category: [slug],
                      usage: [],
                      minPrice: 0,
                      maxPrice: 20000,
                      sort: "featured",
                    },
                  })
                }
              >
                {/* Gradient background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${gradient} transition-all duration-300`}
                />

                {/* Decorative icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-30 transition-opacity duration-300">
                  <CategoryIcon slug={slug} />
                </div>

                {/* Navy overlay */}
                <div className="absolute inset-0 bg-navy/70 group-hover:bg-navy/50 transition-colors duration-300" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                  <CategoryIcon slug={slug} />
                  <h3 className="font-heading text-lg md:text-xl font-bold mt-3 text-center">
                    {categoryNames[slug] || cat.name}
                  </h3>

                  {/* Hover button */}
                  <div className="mt-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <span className="inline-flex items-center gap-1 text-sm font-medium bg-white text-navy px-4 py-2 rounded-lg">
                      Ver productos
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Featured Products Section ─────────────────────────────────────────────────
function FeaturedProductsSection({
  products,
  loading,
}: {
  products: Product[];
  loading: boolean;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="bg-gray-bg py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="font-heading text-2xl md:text-3xl text-navy font-bold mb-2">
            Los más elegidos
          </h2>
          <p className="text-gray-dark text-sm md:text-base">
            Los productos favoritos de nuestros clientes profesionales
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-gray-100 bg-white overflow-hidden"
              >
                <div className="aspect-square skeleton-shimmer" />
                <div className="p-4 space-y-2">
                  <div className="h-4 skeleton-shimmer rounded w-3/4" />
                  <div className="h-3 skeleton-shimmer rounded w-1/2" />
                  <div className="h-5 skeleton-shimmer rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Professional Section ──────────────────────────────────────────────────────
function ProfessionalSection({
  navigate,
}: {
  navigate: (view: "catalog", params?: Record<string, unknown>) => void;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const benefits = [
    "Instrumentos de grado quirúrgico con certificación",
    "Equipamiento diseñado para uso clínico intensivo",
    "Insumos con normas de sanitización internacionales",
    "Asesoría técnica especializada para tu consultorio",
  ];

  return (
    <section className="bg-navy py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <Badge className="bg-navy-200/20 text-navy-200 border-0 mb-4 text-xs font-medium px-3 py-1 rounded-full">
              Uso clínico
            </Badge>

            <h2 className="font-heading text-3xl md:text-4xl text-white font-bold mb-4 leading-tight">
              Equipamiento profesional para tu consultorio
            </h2>

            <p className="text-navy-200 mb-8 text-sm md:text-base leading-relaxed">
              Nuestra línea profesional está diseñada específicamente para
              podólogos que exigen la máxima calidad y durabilidad en cada
              instrumento y equipo.
            </p>

            <ul className="space-y-3 mb-8">
              {benefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-navy-200 mt-0.5 shrink-0" />
                  <span className="text-navy-200 text-sm">{benefit}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={() =>
                navigate("catalog", {
                  catalogFilters: {
                    q: "",
                    category: [],
                    usage: ["professional"],
                    minPrice: 0,
                    maxPrice: 20000,
                    sort: "featured",
                  },
                })
              }
              className="h-11 px-8 bg-white text-navy font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Ver línea profesional
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>

          {/* Right image placeholder */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-[4/3] rounded-2xl overflow-hidden flex items-center justify-center">
              <img
                src="/images/professional-line.png"
                alt="Línea profesional de instrumentos CENPOD"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Decorative accent */}
            <div className="absolute -bottom-3 -right-3 w-24 h-24 bg-navy-200/10 rounded-2xl -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
