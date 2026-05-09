"use client";

import { useNavigationStore } from "@/store/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomNav } from "@/components/layout/bottom-nav";
import { CartDrawer } from "@/components/cart/cart-drawer";
import HomePage from "@/components/views/home-page";
import CatalogPage from "@/components/views/catalog-page";
import ProductDetailPage from "@/components/views/product-detail-page";
import CheckoutPage from "@/components/views/checkout-page";
import AccountPage from "@/components/views/account-page";
import AccountOrdersPage from "@/components/views/account-orders-page";
import AccountOrderDetailPage from "@/components/views/account-order-detail-page";
import AccountWishlistPage from "@/components/views/account-wishlist-page";
import AdminPage from "@/components/views/admin-page";
import AdminProductsPage from "@/components/views/admin-products-page";
import AdminOrdersPage from "@/components/views/admin-orders-page";
import { AdminGuard } from "@/components/admin-guard";

export default function Home() {
  const { currentView } = useNavigationStore();

  const isCheckout = currentView === "checkout";
  const isAdmin = currentView.startsWith("admin");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className={`flex-1 ${!isCheckout ? "pt-[112px]" : "pt-0"} ${isAdmin ? "" : "pb-safe md:pb-0"}`}>
        {currentView === "home" && <HomePage />}
        {currentView === "catalog" && <CatalogPage />}
        {currentView === "product" && <ProductDetailPage />}
        {currentView === "checkout" && <CheckoutPage />}
        {currentView === "account" && <AccountPage />}
        {currentView === "account-orders" && <AccountOrdersPage />}
        {currentView === "account-order-detail" && <AccountOrderDetailPage />}
        {currentView === "account-wishlist" && <AccountWishlistPage />}
        {currentView === "admin" && <AdminGuard><AdminPage /></AdminGuard>}
        {currentView === "admin-products" && <AdminGuard><AdminProductsPage /></AdminGuard>}
        {currentView === "admin-orders" && <AdminGuard><AdminOrdersPage /></AdminGuard>}
      </main>

      {!isCheckout && !isAdmin && <Footer />}
      {!isCheckout && <BottomNav />}
      <CartDrawer />
    </div>
  );
}
