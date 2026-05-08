"use client";

import { useNavigationStore } from "@/store/navigation";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  Sun,
  Moon,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

interface ShopifyStatus {
  connected: boolean;
  authMode: string;
  message?: string;
  shop?: string;
  error?: string;
}

export function Header() {
  const { navigate, currentView } = useNavigationStore();
  const { getItemCount, openCart } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [shopifyStatus, setShopifyStatus] = useState<ShopifyStatus | null>(null);
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const searchRef = useRef<HTMLInputElement>(null);
  const itemCount = getItemCount();

  // Check Shopify connection status
  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch("/api/shopify/status");
        const data = await res.json();
        if (!cancelled) setShopifyStatus(data);
      } catch {
        if (!cancelled) setShopifyStatus({ connected: false, authMode: "none", message: "Could not check status" });
      }
    };
    check();
    const interval = setInterval(check, 5 * 60 * 1000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate("catalog", {
        catalogFilters: {
          q: searchQuery.trim(),
          category: [],
          usage: [],
          minPrice: 0,
          maxPrice: 20000,
          sort: "featured",
        },
      });
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const navLinks = [
    { label: "Inicio", view: "home" as const },
    { label: "Productos", view: "catalog" as const },
    { label: "Profesional", view: "catalog" as const, params: { catalogFilters: { q: "", category: [], usage: ["profesional"], minPrice: 0, maxPrice: 20000, sort: "featured" } } },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 dark:bg-[#121212]/95 backdrop-blur-md shadow-sm"
            : "bg-white dark:bg-[#121212]"
        }`}
      >
        {/* Top bar - promo with Shopify status */}
        <div className="bg-navy text-white text-xs py-1.5 flex items-center justify-center gap-2">
          <p>Envío gratis en compras mayores a $500 MXN · Equipo profesional para podólogos</p>
          <span className="hidden sm:inline-flex items-center gap-1 ml-2 px-1.5 py-0.5 rounded-full bg-white/10">
            {shopifyStatus?.connected ? (
              <><Wifi className="h-3 w-3 text-green-400" /><span className="text-green-300">Shopify</span></>
            ) : (
              <><WifiOff className="h-3 w-3 text-amber-400" /><span className="text-amber-300">Demo</span></>
            )}
          </span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => navigate("home")}
              className="flex items-center gap-2 shrink-0"
            >
              <img
                src="/images/logo-navy.png"
                alt="CENPOD logo"
                className="h-10 w-auto dark:hidden"
              />
              <img
                src="/images/logo-white.png"
                alt="CENPOD logo"
                className="h-10 w-auto hidden dark:block"
              />
              <div className="hidden sm:block">
                <h1 className="text-navy dark:text-white font-heading font-bold text-xl leading-tight">
                  CENPOD
                </h1>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  CENTRO PODOLÓGICO
                </p>
              </div>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() =>
                    navigate(link.view, link.params as never)
                  }
                  className={`text-sm font-medium transition-colors hover:text-navy dark:hover:text-navy-200 ${
                    currentView === link.view
                      ? "text-navy dark:text-navy-200"
                      : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(true)}
                className="text-muted-foreground hover:text-navy"
                aria-label="Buscar"
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Theme toggle */}
              {mounted && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="text-muted-foreground hover:text-navy hidden sm:flex"
                  aria-label="Cambiar tema"
                >
                  {theme === "dark" ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
              )}

              {/* Wishlist */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("account-wishlist")}
                className="text-muted-foreground hover:text-navy relative hidden sm:flex"
                aria-label="Lista de deseos"
              >
                <Heart className="h-5 w-5" />
                {wishlistItems.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-red-500 text-white text-[10px] border-0">
                    {wishlistItems.length}
                  </Badge>
                )}
              </Button>

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                onClick={openCart}
                className="text-muted-foreground hover:text-navy relative"
                aria-label="Carrito"
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-navy text-white text-[10px] border-0">
                    {itemCount}
                  </Badge>
                )}
              </Button>

              {/* Account */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("account")}
                className="text-muted-foreground hover:text-navy hidden sm:flex"
                aria-label="Mi cuenta"
              >
                <User className="h-5 w-5" />
              </Button>

              {/* Mobile menu */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-muted-foreground hover:text-navy md:hidden"
                aria-label="Menú"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="bg-white dark:bg-[#1e1e1e] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleSearch} className="flex items-center p-4 gap-3">
                <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar productos de podología..."
                  className="flex-1 bg-transparent text-lg outline-none placeholder:text-muted-foreground"
                  autoFocus
                />
                <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-xs bg-gray-bg dark:bg-[#2a2a2a] rounded text-muted-foreground">
                  ESC
                </kbd>
              </form>
              <div className="border-t border-border px-4 py-6">
                <p className="text-sm text-muted-foreground mb-3">Búsquedas populares</p>
                <div className="flex flex-wrap gap-2">
                  {["Pinza", "Micromotor", "Crema urea", "Guantes nitrilo", "Fresas"].map(
                    (term) => (
                      <button
                        key={term}
                        onClick={() => {
                          setSearchQuery(term);
                          navigate("catalog", {
                            catalogFilters: {
                              q: term,
                              category: [],
                              usage: [],
                              minPrice: 0,
                              maxPrice: 20000,
                              sort: "featured",
                            },
                          });
                          setSearchOpen(false);
                          setSearchQuery("");
                        }}
                        className="px-3 py-1.5 bg-gray-bg dark:bg-[#2a2a2a] rounded-full text-sm hover:bg-navy-50 dark:hover:bg-navy-dark transition-colors"
                      >
                        {term}
                      </button>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-[104px] left-0 right-0 z-50 bg-white dark:bg-[#121212] border-b border-border shadow-lg md:hidden"
          >
            <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => {
                    navigate(link.view, link.params as never);
                    setMobileMenuOpen(false);
                  }}
                  className="text-left px-4 py-3 rounded-lg hover:bg-gray-bg dark:hover:bg-[#1e1e1e] text-sm font-medium transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <hr className="my-2 border-border" />
              <button
                onClick={() => {
                  navigate("account");
                  setMobileMenuOpen(false);
                }}
                className="text-left px-4 py-3 rounded-lg hover:bg-gray-bg dark:hover:bg-[#1e1e1e] text-sm font-medium transition-colors"
              >
                Mi Cuenta
              </button>
              <button
                onClick={() => {
                  navigate("account-wishlist");
                  setMobileMenuOpen(false);
                }}
                className="text-left px-4 py-3 rounded-lg hover:bg-gray-bg dark:hover:bg-[#1e1e1e] text-sm font-medium transition-colors"
              >
                Lista de Deseos
              </button>
              {mounted && (
                <button
                  onClick={() => {
                    setTheme(theme === "dark" ? "light" : "dark");
                    setMobileMenuOpen(false);
                  }}
                  className="text-left px-4 py-3 rounded-lg hover:bg-gray-bg dark:hover:bg-[#1e1e1e] text-sm font-medium transition-colors"
                >
                  {theme === "dark" ? "Modo Claro" : "Modo Oscuro"}
                </button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
