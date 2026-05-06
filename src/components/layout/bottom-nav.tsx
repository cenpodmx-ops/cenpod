"use client";

import { useNavigationStore } from "@/store/navigation";
import { useCartStore } from "@/store/cart";
import {
  Home,
  LayoutGrid,
  Search,
  ShoppingCart,
  User,
} from "lucide-react";

const tabs = [
  { label: "Inicio", view: "home" as const, icon: Home },
  { label: "Categorías", view: "catalog" as const, icon: LayoutGrid },
  { label: "Buscar", view: "search" as const, icon: Search },
  { label: "Carrito", view: "cart" as const, icon: ShoppingCart },
  { label: "Cuenta", view: "account" as const, icon: User },
];

export function BottomNav() {
  const { currentView, navigate } = useNavigationStore();
  const { getItemCount } = useCartStore();
  const itemCount = getItemCount();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#1e1e1e] border-t border-border md:hidden">
      <div
        className="flex items-center justify-around h-16"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {tabs.map((tab) => {
          const isActive =
            tab.view === "home"
              ? currentView === "home"
              : tab.view === "catalog"
              ? currentView === "catalog"
              : tab.view === "cart"
              ? currentView === "cart" || currentView === "checkout"
              : tab.view === "account"
              ? currentView.startsWith("account")
              : tab.view === "search"
              ? currentView === "search"
              : false;

          return (
            <button
              key={tab.label}
              onClick={() => {
                if (tab.view === "cart") {
                  useCartStore.getState().openCart();
                } else if (tab.view === "search") {
                  // Focus search
                  document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
                } else {
                  navigate(tab.view);
                }
              }}
              className="flex flex-col items-center justify-center gap-0.5 w-full h-full relative"
              aria-label={tab.label}
            >
              <div className="relative">
                <tab.icon
                  className={`h-[22px] w-[22px] transition-colors ${
                    isActive ? "text-navy" : "text-gray-400"
                  }`}
                />
                {tab.view === "cart" && itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive ? "text-navy" : "text-gray-400"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
