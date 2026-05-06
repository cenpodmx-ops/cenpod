"use client";

import { useState, useEffect, useCallback } from "react";
import { useNavigationStore } from "@/store/navigation";
import { formatPrice, ORDER_STATUS_MAP, type Product, type Order } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ArrowLeft,
  DollarSign,
  Users,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type AdminView = "dashboard" | "products" | "orders";

// Mock revenue data for last 30 days
const generateMockRevenue = () => {
  const data = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayLabel = `${date.getDate()}/${date.getMonth() + 1}`;
    data.push({
      date: dayLabel,
      revenue: Math.floor(Math.random() * 8000) + 500,
    });
  }
  return data;
};

function StatusBadge({ status }: { status: string }) {
  const config = ORDER_STATUS_MAP[status] || {
    label: status,
    color: "text-gray-700",
    bgColor: "bg-gray-50",
  };
  return (
    <Badge
      variant="outline"
      className={`${config.bgColor} ${config.color} border-0 text-xs`}
    >
      {config.label}
    </Badge>
  );
}

export default function AdminPage() {
  const { navigate } = useNavigationStore();
  const [activeView, setActiveView] = useState<AdminView>("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [revenueData] = useState(generateMockRevenue);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [productsRes, ordersRes] = await Promise.all([
        fetch("/api/products?limit=100&status=all"),
        fetch("/api/orders?limit=100"),
      ]);
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData.products || []);
      }
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders || []);
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const lowStockProducts = products.filter((p) => p.stock < 5).length;
  const todayRevenue = 0; // placeholder
  const newCustomers = 0; // placeholder

  const lastOrders = orders.slice(0, 5);

  // Top products by stock (or by some metric)
  const topProducts = [...products]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  const sidebarItems = [
    {
      id: "dashboard" as AdminView,
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    { id: "products" as AdminView, label: "Productos", icon: Package },
    { id: "orders" as AdminView, label: "Pedidos", icon: ShoppingCart },
  ];

  const handleSidebarNav = (view: AdminView) => {
    if (view === "products") {
      navigate("admin-products");
    } else if (view === "orders") {
      navigate("admin-orders");
    } else {
      setActiveView(view);
    }
  };

  const metrics = [
    {
      title: "Ingresos hoy",
      value: formatPrice(todayRevenue),
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Pedidos pendientes",
      value: pendingOrders.toString(),
      icon: ShoppingCart,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      title: "Productos bajo stock",
      value: lowStockProducts.toString(),
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Clientes nuevos",
      value: newCustomers.toString(),
      icon: Users,
      color: "text-navy",
      bgColor: "bg-navy-50",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-bg">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-[240px] bg-navy text-white shrink-0">
        <div className="p-6 border-b border-white/10">
          <h1 className="font-heading text-xl font-bold tracking-tight">
            CENPOD Admin
          </h1>
          <p className="text-navy-200 text-xs mt-1">Panel de administración</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSidebarNav(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeView === item.id
                  ? "bg-white/15 text-white"
                  : "text-navy-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon className="size-4" />
              {item.label}
            </button>
          ))}
          <div className="pt-4 border-t border-white/10 mt-4">
            <button
              onClick={() => navigate("home")}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-navy-200 hover:bg-white/10 hover:text-white transition-colors"
            >
              <ArrowLeft className="size-4" />
              Volver a la tienda
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        {/* Mobile Top Tabs */}
        <div className="md:hidden bg-navy text-white">
          <div className="p-4">
            <h1 className="font-heading text-lg font-bold">CENPOD Admin</h1>
          </div>
          <div className="flex overflow-x-auto border-t border-white/10">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSidebarNav(item.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeView === item.id
                    ? "border-white text-white"
                    : "border-transparent text-navy-200 hover:text-white"
                }`}
              >
                <item.icon className="size-3.5" />
                {item.label}
              </button>
            ))}
            <button
              onClick={() => navigate("home")}
              className="flex items-center gap-2 px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 border-transparent text-navy-200 hover:text-white transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              Tienda
            </button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-border">
          <div>
            <h2 className="font-heading text-xl font-semibold text-navy">
              Dashboard
            </h2>
            <p className="text-sm text-muted-foreground">
              Resumen general de la tienda
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("home")}
            className="text-navy border-navy/20 hover:bg-navy-50"
          >
            <ArrowLeft className="size-4 mr-2" />
            Volver a la tienda
          </Button>
        </div>

        <div className="p-4 md:p-8 space-y-6">
          {/* Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric) => (
              <Card key={metric.title} className="border-0 shadow-sm">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-xl ${metric.bgColor}`}
                    >
                      <metric.icon className={`size-5 ${metric.color}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground truncate">
                        {metric.title}
                      </p>
                      <p className="font-heading text-xl md:text-2xl font-bold text-navy">
                        {metric.value}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Revenue Chart */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="font-heading text-navy flex items-center gap-2">
                <TrendingUp className="size-5 text-navy" />
                Ingresos - Últimos 30 días
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="animate-pulse text-muted-foreground">
                    Cargando gráfico...
                  </div>
                </div>
              ) : (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: "#6b7280" }}
                        tickLine={false}
                        interval={4}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#6b7280" }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value: number) =>
                          `$${(value / 1000).toFixed(0)}k`
                        }
                      />
                      <Tooltip
                        formatter={(value: number) => [
                          formatPrice(value),
                          "Ingresos",
                        ]}
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#0a3143"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: "#0a3143" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tables Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Last 5 Orders */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-heading text-navy text-base">
                    Últimos pedidos
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-navy hover:text-navy-light hover:bg-navy-50"
                    onClick={() => navigate("admin-orders")}
                  >
                    Ver todos
                    <ChevronRight className="size-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-10 rounded bg-gray-bg animate-pulse"
                      />
                    ))}
                  </div>
                ) : lastOrders.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No hay pedidos aún
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs"># Pedido</TableHead>
                        <TableHead className="text-xs">Estado</TableHead>
                        <TableHead className="text-xs text-right">
                          Total
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lastOrders.map((order) => (
                        <TableRow
                          key={order.id}
                          className="cursor-pointer hover:bg-navy-50/50"
                          onClick={() =>
                            navigate("admin-orders", {
                              selectedOrderId: order.id,
                            })
                          }
                        >
                          <TableCell className="font-mono text-xs">
                            {order.orderNumber}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={order.status} />
                          </TableCell>
                          <TableCell className="text-right font-semibold text-xs">
                            {formatPrice(order.total)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-heading text-navy text-base">
                    Productos destacados
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-navy hover:text-navy-light hover:bg-navy-50"
                    onClick={() => navigate("admin-products")}
                  >
                    Ver todos
                    <ChevronRight className="size-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-10 rounded bg-gray-bg animate-pulse"
                      />
                    ))}
                  </div>
                ) : topProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No hay productos aún
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Producto</TableHead>
                        <TableHead className="text-xs">Stock</TableHead>
                        <TableHead className="text-xs text-right">
                          Precio
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topProducts.map((product) => (
                        <TableRow
                          key={product.id}
                          className="cursor-pointer hover:bg-navy-50/50"
                          onClick={() =>
                            navigate("product", {
                              selectedProductSlug: product.slug,
                            })
                          }
                        >
                          <TableCell className="text-xs font-medium max-w-[180px] truncate">
                            {product.name}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-xs border-0 ${
                                product.stock > 5
                                  ? "bg-green-50 text-green-700"
                                  : product.stock > 0
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-red-50 text-red-700"
                              }`}
                            >
                              {product.stock}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-xs">
                            {formatPrice(product.price)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
