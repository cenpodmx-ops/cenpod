"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ChevronLeft,
  Package,
  MapPin,
  Truck,
  ExternalLink,
  ShoppingCart,
  FileText,
  CheckCircle2,
  Clock,
  Loader2,
  CircleDot,
  CircleCheck,
  CircleX,
  Ban,
} from "lucide-react";
import { useNavigationStore } from "@/store/navigation";
import { useCartStore } from "@/store/cart";
import {
  formatPrice,
  ORDER_STATUS_MAP,
  Order,
  OrderItem,
  parseImages,
} from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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

/* ════════════════════════ Timeline Icons ════════════════════════ */

const STATUS_ICONS: Record<string, typeof Clock> = {
  pending: Clock,
  processing: Loader2,
  shipped: Truck,
  delivered: CheckCircle2,
  cancelled: Ban,
};

const STATUS_ORDER = ["pending", "processing", "shipped", "delivered"];

/* ════════════════════════ Timeline ════════════════════════ */

interface TimelineEntry {
  status: string;
  date: string;
  note?: string;
}

function OrderTimeline({
  timeline,
  currentStatus,
}: {
  timeline: TimelineEntry[];
  currentStatus: string;
}) {
  const isCancelled = currentStatus === "cancelled";

  const displaySteps = isCancelled
    ? [
        { status: "pending", label: "Pendiente" },
        { status: "cancelled", label: "Cancelado" },
      ]
    : STATUS_ORDER.map((s) => ({
        status: s,
        label: ORDER_STATUS_MAP[s]?.label || s,
      }));

  const currentIdx = displaySteps.findIndex((s) => s.status === currentStatus);
  const isPastStep = (status: string) => {
    const idx = displaySteps.findIndex((s) => s.status === status);
    if (isCancelled) return status === "pending";
    return idx <= currentIdx;
  };

  const getTimelineDate = (status: string) => {
    const entry = timeline.find((t) => t.status === status);
    return entry?.date;
  };

  return (
    <div className="space-y-0">
      {displaySteps.map((step, i) => {
        const past = isPastStep(step.status);
        const isCurrent = step.status === currentStatus;
        const date = getTimelineDate(step.status);
        const Icon = STATUS_ICONS[step.status] || CircleDot;
        const isLast = i === displaySteps.length - 1;

        return (
          <div key={step.status} className="relative flex gap-4">
            {/* Line + Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                  isCurrent
                    ? "border-navy bg-navy text-white shadow-lg shadow-navy/25"
                    : past
                    ? "border-navy bg-navy-50 text-navy"
                    : "border-gray-200 bg-white text-gray-300"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    step.status === "processing" && isCurrent
                      ? "animate-spin"
                      : ""
                  }`}
                />
              </div>
              {!isLast && (
                <div
                  className={`h-8 w-0.5 ${
                    past && displaySteps[i + 1] && isPastStep(displaySteps[i + 1].status)
                      ? "bg-navy"
                      : past
                      ? "bg-navy/30"
                      : "bg-gray-200"
                  }`}
                />
              )}
            </div>

            {/* Label */}
            <div className="pb-6 pt-1">
              <p
                className={`text-sm font-semibold ${
                  isCurrent
                    ? "text-navy"
                    : past
                    ? "text-navy/70"
                    : "text-gray-400"
                }`}
              >
                {step.label}
              </p>
              {date && (
                <p className="text-xs text-gray-400">
                  {format(new Date(date), "d MMM yyyy, HH:mm", {
                    locale: es,
                  })}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ════════════════════════ Product Row ════════════════════════ */

function ProductRow({ item }: { item: OrderItem }) {
  const images = item.image ? parseImages(item.image) : [];
  const gradients = [
    "from-navy-100 to-blue-light",
    "from-amber-50 to-amber-100",
    "from-rose-50 to-rose-100",
    "from-green-50 to-green-100",
  ];

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
        {images[0] ? (
          <img
            src={images[0]}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-bg to-gray-100">
            <Package className="h-5 w-5 text-gray-300" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-navy">{item.name}</p>
        {item.variant && (
          <p className="text-xs text-gray-400">{item.variant}</p>
        )}
        <p className="text-xs text-gray-500">
          {formatPrice(item.price)} × {item.quantity}
        </p>
      </div>
      <p className="flex-shrink-0 text-sm font-semibold text-navy">
        {formatPrice(item.price * item.quantity)}
      </p>
    </div>
  );
}

/* ════════════════════════ MAIN COMPONENT ════════════════════════ */

export default function AccountOrderDetailPage() {
  const { navigate, selectedOrderId } = useNavigationStore();
  const { addItem } = useCartStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      if (!selectedOrderId) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/orders/${selectedOrderId}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [selectedOrderId]);

  const handleReorder = () => {
    if (!order) return;
    order.items.forEach((item) => {
      addItem({
        id: item.productId || item.id,
        name: item.name,
        slug: item.name.toLowerCase().replace(/\s+/g, "-"),
        price: item.price,
        image: item.image || "",
        maxStock: 99,
        variant: item.variant || undefined,
        quantity: item.quantity,
      });
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-bg">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-bg px-4">
        <Package className="mb-4 h-16 w-16 text-gray-300" />
        <h2 className="font-heading mb-2 text-xl font-bold text-navy">
          Pedido no encontrado
        </h2>
        <Button
          onClick={() => navigate("account-orders")}
          className="rounded-xl bg-navy text-white hover:bg-navy-light"
        >
          Volver a pedidos
        </Button>
      </div>
    );
  }

  let shippingAddress: Record<string, string> | null = null;
  try {
    shippingAddress = order.shippingAddress
      ? JSON.parse(order.shippingAddress)
      : null;
  } catch {
    shippingAddress = null;
  }

  let timeline: TimelineEntry[] = [];
  try {
    timeline = order.timeline ? JSON.parse(order.timeline) : [];
  } catch {
    timeline = [];
  }

  return (
    <div className="min-h-screen bg-gray-bg pb-8">
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate("account-orders")}
            className="mb-3 flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-navy"
          >
            <ChevronLeft className="h-4 w-4" />
            Mis pedidos
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-2xl font-bold text-navy sm:text-3xl">
              Pedido {order.orderNumber}
            </h1>
            <StatusBadge status={order.status} />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column: Timeline + Products */}
          <div className="space-y-6 lg:col-span-2">
            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl bg-white p-6 shadow-sm"
            >
              <h2 className="font-heading mb-4 text-lg font-bold text-navy">
                Seguimiento del pedido
              </h2>
              <OrderTimeline
                timeline={timeline}
                currentStatus={order.status}
              />
            </motion.div>

            {/* Products */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl bg-white p-6 shadow-sm"
            >
              <h2 className="font-heading mb-4 text-lg font-bold text-navy">
                Productos ({order.items.length})
              </h2>
              <div className="divide-y divide-gray-50">
                {order.items.map((item) => (
                  <ProductRow key={item.id} item={item} />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Order Info + Totals */}
          <div className="space-y-6">
            {/* Shipping Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-2xl bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-navy" />
                <h2 className="font-heading text-lg font-bold text-navy">
                  Dirección de envío
                </h2>
              </div>
              {shippingAddress ? (
                <div className="space-y-1 text-sm text-gray-600">
                  <p className="font-medium text-navy">
                    {shippingAddress.fullName}
                  </p>
                  <p>{shippingAddress.street}</p>
                  <p>
                    {shippingAddress.neighborhood}, {shippingAddress.postalCode}
                  </p>
                  <p>
                    {shippingAddress.city}, {shippingAddress.state}
                  </p>
                  {shippingAddress.phone && (
                    <p className="text-gray-400">{shippingAddress.phone}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400">
                  Sin dirección registrada
                </p>
              )}
            </motion.div>

            {/* Tracking */}
            {(order.trackingNumber || order.shippingMethod) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex items-center gap-2">
                  <Truck className="h-4 w-4 text-navy" />
                  <h2 className="font-heading text-lg font-bold text-navy">
                    Envío
                  </h2>
                </div>
                <div className="space-y-3">
                  {order.shippingMethod && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Método</span>
                      <span className="text-sm font-medium text-navy">
                        {order.shippingMethod}
                      </span>
                    </div>
                  )}
                  {order.trackingNumber && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Guía</span>
                      <a
                        href="#"
                        className="flex items-center gap-1 text-sm font-medium text-navy transition-colors hover:text-navy-light"
                      >
                        {order.trackingNumber}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Order Totals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="rounded-2xl bg-white p-6 shadow-sm"
            >
              <h2 className="font-heading mb-4 text-lg font-bold text-navy">
                Resumen
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-navy">
                    {formatPrice(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Envío</span>
                  <span className="font-medium text-navy">
                    {order.shipping === 0 ? "Gratis" : formatPrice(order.shipping)}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Descuento</span>
                    <span className="font-medium text-green-600">
                      -{formatPrice(order.discount)}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between">
                  <span className="font-heading text-lg font-bold text-navy">
                    Total
                  </span>
                  <span className="font-heading text-xl font-bold text-navy">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              <Button
                onClick={handleReorder}
                className="h-12 w-full rounded-xl bg-navy text-white hover:bg-navy-light"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Volver a comprar
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  alert("Próximamente: Descarga de factura");
                }}
                className="h-12 w-full rounded-xl border-navy text-navy hover:bg-navy-50"
              >
                <FileText className="mr-2 h-4 w-4" />
                Descargar factura
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
