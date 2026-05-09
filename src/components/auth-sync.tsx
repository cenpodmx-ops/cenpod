"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAuthStore } from "@/store/auth";
import { useCartStore } from "@/store/cart";

export function AuthSync() {
  const { data: session, status } = useSession();
  const { setUser, setLoading } = useAuthStore();
  const syncWithShopify = useCartStore((s) => s.syncWithShopify);

  useEffect(() => {
    if (status === "loading") {
      setLoading(true);
    } else if (status === "authenticated" && session?.user) {
      setUser({
        id: session.user.id,
        email: session.user.email,
        name: session.user.name ?? null,
        role: session.user.role,
        image: session.user.image ?? null,
      });
      // Sync cart with Shopify when user authenticates
      syncWithShopify();
    } else {
      setUser(null);
    }
  }, [session, status, setUser, setLoading, syncWithShopify]);

  return null;
}
