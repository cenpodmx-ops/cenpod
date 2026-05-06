export type ViewType =
  | "home"
  | "catalog"
  | "product"
  | "cart"
  | "checkout"
  | "account"
  | "account-orders"
  | "account-order-detail"
  | "account-wishlist"
  | "admin"
  | "admin-products"
  | "admin-orders"
  | "admin-dashboard"
  | "search";

interface NavigationState {
  currentView: ViewType;
  selectedProductId: string | null;
  selectedProductSlug: string | null;
  selectedOrderId: string | null;
  catalogFilters: {
    q: string;
    category: string[];
    usage: string[];
    minPrice: number;
    maxPrice: number;
    sort: string;
  };
  previousView: ViewType | null;
}

interface NavigationActions {
  navigate: (view: ViewType, params?: Partial<NavigationState>) => void;
  goBack: () => void;
  setFilters: (filters: Partial<NavigationState["catalogFilters"]>) => void;
  resetFilters: () => void;
}

const defaultFilters: NavigationState["catalogFilters"] = {
  q: "",
  category: [],
  usage: [],
  minPrice: 0,
  maxPrice: 20000,
  sort: "featured",
};

import { create } from "zustand";

export const useNavigationStore = create<NavigationState & NavigationActions>(
  (set, get) => ({
    currentView: "home",
    selectedProductId: null,
    selectedProductSlug: null,
    selectedOrderId: null,
    catalogFilters: { ...defaultFilters },
    previousView: null,

    navigate: (view, params = {}) => {
      const prev = get().currentView;
      set({
        previousView: prev,
        currentView: view,
        ...params,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },

    goBack: () => {
      const prev = get().previousView;
      if (prev) {
        set({ currentView: prev, previousView: null });
      } else {
        set({ currentView: "home" });
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    },

    setFilters: (filters) => {
      set((state) => ({
        catalogFilters: { ...state.catalogFilters, ...filters },
      }));
    },

    resetFilters: () => {
      set({ catalogFilters: { ...defaultFilters } });
    },
  })
);
