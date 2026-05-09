import { create } from "zustand";
import { signIn, signOut } from "next-auth/react";

interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  image: string | null;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthActions {
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  login: (
    email: string,
    password: string
  ) => Promise<{ ok: boolean; error?: string }>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState & AuthActions>()((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) =>
    set({ user, isAuthenticated: !!user, isLoading: false }),

  setLoading: (isLoading) => set({ isLoading }),

  login: async (email, password) => {
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
      if (result?.error) {
        return { ok: false, error: "Email o contraseña incorrectos" };
      }
      if (result?.ok) {
        return { ok: true };
      }
      return { ok: false, error: "Error desconocido" };
    } catch {
      return { ok: false, error: "Error de conexión" };
    }
  },

  register: async (name, email, password) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { ok: false, error: data.error || "Error al registrarse" };
      }

      // After registration, sign in via NextAuth
      return get().login(email, password);
    } catch {
      return { ok: false, error: "Error de conexión" };
    }
  },

  logout: async () => {
    try {
      await signOut({ redirect: false });
    } catch {}
    set({ user: null, isAuthenticated: false });
  },
}));
