"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Package,
  ShoppingBag,
  Eye,
} from "lucide-react";
import { useNavigationStore } from "@/store/navigation";
import { formatPrice, ORDER_STATUS_MAP, Order, parseImages } from "@/types";
import { Button } from "@/components/ui/button";
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

/* ════════════════════════ Product Thumbnails ════════════════════════ */

function ProductThumbnails({ items }: { items: Order["items"] }) {
  const maxShow = 3;
  const extra = items.length - maxShow;
  const displayItems = items.slice(0, maxShow);

  const gradients = [
    "from-navy-100 to-blue-light",
    "from-amber-50 to-amber-100",
    "from-rose-50 to-rose-100",
    "from-green-50 to-green-100",
    "from-purple-50 to-purple-100",
    "from-cyan-50 to-cyan-100",
  ];

  return (
    <div className="flex items-center -space-x-2">
      {displayItems.map((item, i) => {
        const images = item.image ? parseImages(item.image) : [];
        return (
          <div
            key={item.id}
            className="relative h-9 w-9 overflow-hidden rounded-lg border-2 border-white shadow-sm"
          >
            {images[0] ? (
              <img
                src={images[0]}
                alt={item.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradients[i % gradients.length]}`}
              >
                <Package className="h-3.5 w-3.5 text-gray-400" />
              </div>
            )}
          </div>
        );
      })}
      {extra > 0 && (
        <div className="relative z-10 flex h-9 w-9 items-center justify-center rounded-lg border-2 border-white bg-gray-100 text-xs font-semibold text-gray-600 shadow-sm">
          +{extra}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════ MAIN COMPONENT ════════════════════════ */

export default function AccountOrdersPage() {
  const { navigate } = useNavigationStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      try {
        const res = await fetch(`/api/orders?page=${page}&limit=${limit}`);
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
          setTotalPages(data.totalPages || 1);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [page]);

  return (
    <div className="min-h-screen bg-gray-bg pb-8">
      <div className="mx-auto max-w-5xl px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate("account")}
            className="mb-3 flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-navy"
          >
            <ChevronLeft className="h-4 w-4" />
            Mi cuenta
          </button>
          <h1 className="font-heading text-2xl font-bold text-navy sm:text-3xl">
            Mis pedidos
          </h1>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-24 skeleton-shimmer rounded-2xl"
              />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center rounded-2xl bg-white px-6 py-16 shadow-sm"
          >
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-bg">
              <ShoppingBag className="h-10 w-10 text-gray-300" />
            </div>
            <h2 className="font-heading mb-2 text-xl font-bold text-navy">
              No tienes pedidos aún
            </h2>
            <p className="mb-6 text-center text-sm text-gray-500">
              Cuando realices tu primera compra, aparecerá aquí
            </p>
            <Button
              onClick={() => navigate("catalog")}
              className="rounded-xl bg-navy text-white hover:bg-navy-light"
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Explorar productos
            </Button>
          </motion.div>
        ) : (
          <>
            {/* Desktop Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="hidden overflow-hidden rounded-2xl bg-white shadow-sm md:block"
            >
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-bg/50">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      # Pedido
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Fecha
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Productos
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Total
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500" />
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, i) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-gray-50 transition-colors last:border-0 hover:bg-navy-50/30"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-semibold text-navy">
                          {order.orderNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {format(
                          new Date(order.createdAt),
                          "d MMM yyyy",
                          { locale: es }
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <ProductThumbnails items={order.items} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-semibold text-navy">
                          {formatPrice(order.total)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            navigate("account-order-detail", {
                              selectedOrderId: order.id,
                            })
                          }
                          className="rounded-lg text-navy hover:bg-navy-50"
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          Ver
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>

            {/* Mobile Cards */}
            <div className="space-y-3 md:hidden">
              {orders.map((order, i) => (
                <motion.button
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() =>
                    navigate("account-order-detail", {
                      selectedOrderId: order.id,
                    })
                  }
                  className="w-full rounded-2xl bg-white p-4 text-left shadow-sm transition-all hover:shadow-md"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-mono text-sm font-semibold text-navy">
                      {order.orderNumber}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ProductThumbnails items={order.items} />
                      <div>
                        <p className="text-xs text-gray-500">
                          {format(
                            new Date(order.createdAt),
                            "d MMM yyyy",
                            { locale: es }
                          )}
                        </p>
                        <p className="text-xs text-gray-400">
                          {order.items.length} producto{order.items.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-navy">
                        {formatPrice(order.total)}
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="rounded-lg border-gray-200 text-gray-600 hover:bg-navy-50 hover:text-navy disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <span className="px-4 text-sm text-gray-500">
                  Página {page} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="rounded-lg border-gray-200 text-gray-600 hover:bg-navy-50 hover:text-navy disabled:opacity-50"
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
