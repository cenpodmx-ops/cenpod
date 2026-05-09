"use client";

import { useAuthStore } from "@/store/auth";
import { useNavigationStore } from "@/store/navigation";
import { useEffect } from "react";
import { ShieldAlert, Loader2 } from "lucide-react";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const { navigate } = useNavigationStore();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "admin")) {
      navigate("home");
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <ShieldAlert className="h-16 w-16 text-red-400" />
        <p className="text-lg font-heading font-bold text-navy">
          Acceso restringido
        </p>
        <p className="text-sm text-gray-500">
          No tienes permisos para acceder a esta sección
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
