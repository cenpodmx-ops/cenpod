"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Clock,
  Heart,
  ShoppingBag,
  User,
  LogOut,
  ChevronRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  Loader2,
} from "lucide-react";
import { useNavigationStore } from "@/store/navigation";
import { useWishlistStore } from "@/store/wishlist";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { formatPrice, ORDER_STATUS_MAP, Order } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

/* ════════════════════════ Status Badge ════════════════════════ */

function StatusBadge({ status }: { status: string }) {
  const config = ORDER_STATUS_MAP[status] || {
    label: status,
    color: "text-gray-700",
    bgColor: "bg-gray-50",
  };
  return (
    <Badge
      variant="outline"
      className={`${config.bgColor} ${config.color} border-0 text-xs font-medium`}
    >
      {config.label}
    </Badge>
  );
}

/* ════════════════════════ Login / Register Form ════════════════════════ */

function AuthForm() {
  const { login, register } = useAuthStore();
  const [authTab, setAuthTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirm, setRegisterConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      setError("Por favor completa todos los campos");
      return;
    }
    setLoading(true);
    setError("");
    const result = await login(loginEmail, loginPassword);
    if (!result.ok) {
      setError(result.error || "Error al iniciar sesión");
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!registerName || !registerEmail || !registerPassword || !registerConfirm) {
      setError("Por favor completa todos los campos");
      return;
    }
    if (registerPassword !== registerConfirm) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (registerPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setLoading(true);
    setError("");
    const result = await register(registerName, registerEmail, registerPassword);
    if (!result.ok) {
      setError(result.error || "Error al registrarse");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-bg px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-navy">
            <User className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-navy">
            Mi cuenta
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Inicia sesión para ver tus pedidos y más
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <Tabs value={authTab} onValueChange={(v) => { setAuthTab(v); setError(""); }}>
            <TabsList className="mb-6 w-full bg-gray-bg">
              <TabsTrigger value="login" className="flex-1">
                Iniciar sesión
              </TabsTrigger>
              <TabsTrigger value="register" className="flex-1">
                Crear cuenta
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleLogin();
                }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="login-email" className="text-sm font-medium text-gray-700">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="h-11 rounded-lg border-gray-200 pl-10 focus:border-navy focus:ring-navy/20"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="login-password" className="text-sm font-medium text-gray-700">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="h-11 rounded-lg border-gray-200 pl-10 pr-10 focus:border-navy focus:ring-navy/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {error && authTab === "login" && (
                  <p className="text-sm text-red-500">{error}</p>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-xl bg-navy text-white hover:bg-navy-light disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Iniciar sesión
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleRegister();
                }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="reg-name" className="text-sm font-medium text-gray-700">
                    Nombre completo
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="reg-name"
                      type="text"
                      placeholder="Juan Pérez"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      className="h-11 rounded-lg border-gray-200 pl-10 focus:border-navy focus:ring-navy/20"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-email" className="text-sm font-medium text-gray-700">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className="h-11 rounded-lg border-gray-200 pl-10 focus:border-navy focus:ring-navy/20"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-password" className="text-sm font-medium text-gray-700">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="h-11 rounded-lg border-gray-200 pl-10 pr-10 focus:border-navy focus:ring-navy/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-confirm" className="text-sm font-medium text-gray-700">
                    Confirmar contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="reg-confirm"
                      type={showPassword ? "text" : "password"}
                      placeholder="Repite tu contraseña"
                      value={registerConfirm}
                      onChange={(e) => setRegisterConfirm(e.target.value)}
                      className="h-11 rounded-lg border-gray-200 pl-10 focus:border-navy focus:ring-navy/20"
                    />
                  </div>
                </div>

                {error && authTab === "register" && (
                  <p className="text-sm text-red-500">{error}</p>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-xl bg-navy text-white hover:bg-navy-light disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="mr-2 h-4 w-4" />
                  )}
                  Crear cuenta
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
}

/* ════════════════════════ Dashboard ════════════════════════ */

function Dashboard() {
  const { user, logout } = useAuthStore();
  const { navigate } = useNavigationStore();
  const { items: wishlistItems } = useWishlistStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const userName = user?.name || user?.email?.split("@")[0] || "Usuario";

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders?limit=3");
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const totalOrders = orders.length;
  const lastOrderDays =
    orders.length > 0
      ? Math.floor(
          (Date.now() - new Date(orders[0].createdAt).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : null;

  const metrics = [
    {
      icon: Package,
      label: "Total de pedidos",
      value: totalOrders.toString(),
      color: "text-navy",
      bg: "bg-navy-50",
    },
    {
      icon: Clock,
      label: "Último pedido",
      value: lastOrderDays !== null ? `Hace ${lastOrderDays} días` : "Sin pedidos",
      color: "text-amber-700",
      bg: "bg-amber-50",
    },
    {
      icon: Heart,
      label: "Lista de deseos",
      value: wishlistItems.length.toString(),
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("home");
  };

  const quickActions = [
    {
      icon: Package,
      label: "Mis pedidos",
      onClick: () => navigate("account-orders"),
      color: "text-navy",
      bg: "bg-navy-50",
    },
    {
      icon: Heart,
      label: "Lista de deseos",
      onClick: () => navigate("account-wishlist"),
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      icon: User,
      label: "Mis datos",
      onClick: () => {},
      color: "text-amber-700",
      bg: "bg-amber-50",
    },
    {
      icon: LogOut,
      label: "Cerrar sesión",
      onClick: handleLogout,
      color: "text-gray-600",
      bg: "bg-gray-100",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-bg pb-8">
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-4"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-navy text-xl font-bold text-white">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-navy">
              Hola, {userName}
            </h1>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </motion.div>

        {/* Metric Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {metrics.map((metric, i) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl bg-white p-5 shadow-sm"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${metric.bg}`}
                  >
                    <Icon className={`h-5 w-5 ${metric.color}`} />
                  </div>
                  <span className="text-sm text-gray-500">{metric.label}</span>
                </div>
                <p className={`font-heading text-2xl font-bold ${metric.color}`}>
                  {metric.value}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                onClick={action.onClick}
                className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${action.bg}`}
                >
                  <Icon className={`h-5 w-5 ${action.color}`} />
                </div>
                <span className="text-sm font-medium text-navy">
                  {action.label}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Recent Orders Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-white p-6 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold text-navy">
              Pedidos recientes
            </h2>
            {orders.length > 0 && (
              <button
                onClick={() => navigate("account-orders")}
                className="flex items-center gap-1 text-sm font-medium text-navy transition-colors hover:text-navy-light"
              >
                Ver todos
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 skeleton-shimmer rounded-xl"
                />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="py-8 text-center">
              <ShoppingBag className="mx-auto mb-3 h-12 w-12 text-gray-300" />
              <p className="text-sm text-gray-500">
                Aún no tienes pedidos
              </p>
              <Button
                onClick={() => navigate("catalog")}
                variant="outline"
                className="mt-3 rounded-xl border-navy text-navy hover:bg-navy-50"
              >
                Explorar productos
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <button
                  key={order.id}
                  onClick={() =>
                    navigate("account-order-detail", {
                      selectedOrderId: order.id,
                    })
                  }
                  className="flex w-full items-center gap-4 rounded-xl border border-gray-100 p-3 text-left transition-all hover:border-navy-100 hover:bg-navy-50/50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-bg">
                    <Package className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-navy">
                        {order.orderNumber}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="text-xs text-gray-500">
                      {order.items.length} producto{order.items.length !== 1 ? "s" : ""} &middot;{" "}
                      {formatPrice(order.total)}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

/* ════════════════════════ MAIN COMPONENT ════════════════════════ */

export default function AccountPage() {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-bg">
        <div className="animate-spin h-8 w-8 border-2 border-navy border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <AuthForm />;
  }

  return <Dashboard />;
}
