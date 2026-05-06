"use client";

import { useState, useEffect, useCallback } from "react";
import { useNavigationStore } from "@/store/navigation";
import { formatPrice, ORDER_STATUS_MAP, type Order } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  ArrowLeft,
  ShoppingCart,
  Eye,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Loader2,
  ExternalLink,
  MapPin,
} from "lucide-react";

type StatusFilter = "all" | "pending" | "processing" | "shipped" | "delivered";

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Pendientes" },
  { value: "processing", label: "En proceso" },
  { value: "shipped", label: "Enviados" },
  { value: "delivered", label: "Entregados" },
];

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

interface TimelineEntry {
  status: string;
  date: string;
  note: string;
}

function parseTimeline(timelineJson: string): TimelineEntry[] {
  try {
    return JSON.parse(timelineJson);
  } catch {
    return [];
  }
}

interface ShippingAddress {
  fullName?: string;
  street?: string;
  neighborhood?: string;
  postalCode?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
}

function parseShippingAddress(
  addressJson: string | null
): ShippingAddress | null {
  if (!addressJson) return null;
  try {
    return JSON.parse(addressJson);
  } catch {
    return null;
  }
}

const TIMELINE_STEPS = [
  { key: "pending", label: "Pendiente", icon: Clock },
  { key: "processing", label: "Procesando", icon: Package },
  { key: "shipped", label: "Enviado", icon: Truck },
  { key: "delivered", label: "Entregado", icon: CheckCircle2 },
];

export default function AdminOrdersPage() {
  const { navigate, selectedOrderId } = useNavigationStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: "20",
        page: page.toString(),
      });
      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }
      const res = await fetch(`/api/orders?${params}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  const fetchOrderDetail = useCallback(async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedOrder(data);
        setDetailOpen(true);
      }
    } catch (error) {
      console.error("Error fetching order detail:", error);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Auto-open detail if selectedOrderId is set
  useEffect(() => {
    if (selectedOrderId) {
      fetchOrderDetail(selectedOrderId);
    }
  }, [selectedOrderId, fetchOrderDetail]);

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setDetailOpen(true);
    setTrackingNumber("");
  };

  const updateOrderStatus = async (
    orderId: string,
    status: string,
    tracking?: string
  ) => {
    setUpdatingStatus(true);
    try {
      const body: Record<string, string> = { status };
      if (tracking) body.trackingNumber = tracking;
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedOrder(updated);
        await fetchOrders();
      }
    } catch (error) {
      console.error("Error updating order:", error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getAddress = (order: Order): ShippingAddress | null => {
    return parseShippingAddress(order.shippingAddress);
  };

  const getTimelineIndex = (status: string): number => {
    return TIMELINE_STEPS.findIndex((s) => s.key === status);
  };

  return (
    <div className="flex min-h-screen bg-gray-bg">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-[240px] bg-navy text-white shrink-0">
        <div className="p-6 border-b border-white/10">
          <h1 className="font-heading text-xl font-bold tracking-tight">
            CENPOD Admin
          </h1>
          <p className="text-navy-200 text-xs mt-1">Panel de administración</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => navigate("admin")}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-navy-200 hover:bg-white/10 hover:text-white transition-colors"
          >
            <ArrowLeft className="size-4" />
            Dashboard
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium bg-white/15 text-white">
            <ShoppingCart className="size-4" />
            Pedidos
          </button>
        </nav>
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => navigate("home")}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-navy-200 hover:bg-white/10 hover:text-white transition-colors"
          >
            <ArrowLeft className="size-4" />
            Volver a la tienda
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        {/* Mobile Header */}
        <div className="md:hidden bg-navy text-white p-4 flex items-center gap-3">
          <button
            onClick={() => navigate("admin")}
            className="p-1 hover:bg-white/10 rounded"
          >
            <ArrowLeft className="size-5" />
          </button>
          <h1 className="font-heading text-lg font-bold">Pedidos</h1>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-border">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("admin")}
              className="text-navy hover:bg-navy-50"
            >
              <ArrowLeft className="size-4 mr-1" />
              Dashboard
            </Button>
            <div className="h-5 w-px bg-border" />
            <h2 className="font-heading text-xl font-semibold text-navy">
              Pedidos
            </h2>
          </div>
        </div>

        <div className="p-4 md:p-8 space-y-4">
          {/* Status Filter Tabs */}
          <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm overflow-x-auto">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => {
                  setStatusFilter(filter.value);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  statusFilter === filter.value
                    ? "bg-navy text-white shadow-sm"
                    : "text-muted-foreground hover:text-navy hover:bg-navy-50"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Orders Table */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-12 rounded bg-gray-bg animate-pulse"
                    />
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <ShoppingCart className="size-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-sm">
                    No hay pedidos
                    {statusFilter !== "all"
                      ? ` con estado "${ORDER_STATUS_MAP[statusFilter]?.label || statusFilter}"`
                      : ""}
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead># Pedido</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Productos</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead className="text-right">
                            Acciones
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow
                            key={order.id}
                            className="cursor-pointer hover:bg-navy-50/30"
                            onClick={() => openOrderDetail(order)}
                          >
                            <TableCell className="font-mono text-xs">
                              {order.orderNumber}
                            </TableCell>
                            <TableCell className="text-sm">
                              {order.user?.name || (
                                <span className="text-muted-foreground">
                                  Cliente
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString(
                                "es-MX",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </TableCell>
                            <TableCell className="text-sm">
                              {order.items.length} producto
                              {order.items.length !== 1 ? "s" : ""}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={order.status} />
                            </TableCell>
                            <TableCell className="font-semibold text-sm">
                              {formatPrice(order.total)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-navy hover:bg-navy-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openOrderDetail(order);
                                }}
                              >
                                <Eye className="size-3.5 mr-1" />
                                Ver
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden divide-y divide-border">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="p-4 hover:bg-navy-50/30 transition-colors cursor-pointer"
                        onClick={() => openOrderDetail(order)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-mono text-xs text-navy">
                              {order.orderNumber}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {new Date(order.createdAt).toLocaleDateString(
                                "es-MX",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </p>
                          </div>
                          <StatusBadge status={order.status} />
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {order.items.length} producto
                            {order.items.length !== 1 ? "s" : ""}
                          </span>
                          <span className="font-semibold text-sm text-navy">
                            {formatPrice(order.total)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Pagination */}
              {!loading && totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="text-navy border-navy/20"
                  >
                    Anterior
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Página {page} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="text-navy border-navy/20"
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Order Detail Slide-over */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedOrder && (
            <>
              <SheetHeader className="border-b pb-4">
                <div className="flex items-center gap-3">
                  <SheetTitle className="font-heading text-navy">
                    Pedido {selectedOrder.orderNumber}
                  </SheetTitle>
                  <StatusBadge status={selectedOrder.status} />
                </div>
              </SheetHeader>

              <div className="space-y-6 px-4 pb-6 pt-2">
                {/* Customer Info */}
                <section>
                  <h3 className="font-heading text-sm font-semibold text-navy mb-3 flex items-center gap-2">
                    <MapPin className="size-4" />
                    Información del cliente
                  </h3>
                  {(() => {
                    const addr = getAddress(selectedOrder);
                    return addr ? (
                      <div className="bg-gray-bg rounded-xl p-4 text-sm space-y-1">
                        {addr.fullName && (
                          <p className="font-medium text-navy">
                            {addr.fullName}
                          </p>
                        )}
                        {addr.street && (
                          <p className="text-muted-foreground">
                            {addr.street}
                          </p>
                        )}
                        {addr.neighborhood && (
                          <p className="text-muted-foreground">
                            {addr.neighborhood}
                          </p>
                        )}
                        {(addr.city || addr.state) && (
                          <p className="text-muted-foreground">
                            {[addr.city, addr.state].filter(Boolean).join(", ")}{" "}
                            {addr.postalCode}
                          </p>
                        )}
                        {addr.phone && (
                          <p className="text-muted-foreground">
                            Tel: {addr.phone}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Sin información de envío
                      </p>
                    );
                  })()}
                </section>

                {/* Products List */}
                <section>
                  <h3 className="font-heading text-sm font-semibold text-navy mb-3">
                    Productos
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 bg-gray-bg rounded-xl p-3"
                      >
                        <div className="size-12 rounded-lg bg-gradient-to-br from-navy-50 to-blue-light flex items-center justify-center shrink-0">
                          <Package className="size-5 text-navy/30" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-navy truncate">
                            {item.name}
                          </p>
                          {item.variant && (
                            <p className="text-xs text-muted-foreground">
                              {item.variant}
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-navy">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatPrice(item.price)} × {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Order Timeline */}
                <section>
                  <h3 className="font-heading text-sm font-semibold text-navy mb-3">
                    Timeline del pedido
                  </h3>
                  <div className="relative">
                    {(() => {
                      const currentIndex = getTimelineIndex(
                        selectedOrder.status
                      );
                      const timeline = parseTimeline(selectedOrder.timeline);

                      return (
                        <div className="space-y-0">
                          {TIMELINE_STEPS.map((step, idx) => {
                            const isCompleted = idx <= currentIndex;
                            const isCurrent = idx === currentIndex;
                            const timelineEntry = timeline.find(
                              (t) => t.status === step.key
                            );

                            return (
                              <div key={step.key} className="flex gap-3">
                                {/* Icon + Connector */}
                                <div className="flex flex-col items-center">
                                  <div
                                    className={`size-8 rounded-full flex items-center justify-center shrink-0 ${
                                      isCompleted
                                        ? isCurrent
                                          ? "bg-navy text-white shadow-md"
                                          : "bg-navy-50 text-navy"
                                        : "bg-gray-100 text-gray-400 border border-gray-200"
                                    }`}
                                  >
                                    {isCurrent &&
                                    selectedOrder.status ===
                                      "processing" ? (
                                      <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                      <step.icon className="size-4" />
                                    )}
                                  </div>
                                  {idx < TIMELINE_STEPS.length - 1 && (
                                    <div
                                      className={`w-0.5 h-8 ${
                                        idx < currentIndex
                                          ? "bg-navy"
                                          : "bg-gray-200"
                                      }`}
                                    />
                                  )}
                                </div>

                                {/* Label + Date */}
                                <div className="pb-6">
                                  <p
                                    className={`text-sm font-medium ${
                                      isCompleted
                                        ? "text-navy"
                                        : "text-muted-foreground"
                                    }`}
                                  >
                                    {step.label}
                                  </p>
                                  {timelineEntry && (
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(
                                        timelineEntry.date
                                      ).toLocaleDateString("es-MX", {
                                        day: "numeric",
                                        month: "short",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </section>

                {/* Status Actions */}
                <section>
                  <h3 className="font-heading text-sm font-semibold text-navy mb-3">
                    Acciones
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.status === "pending" && (
                      <Button
                        onClick={() =>
                          updateOrderStatus(selectedOrder.id, "processing")
                        }
                        className="w-full bg-navy hover:bg-navy-light text-white"
                        disabled={updatingStatus}
                      >
                        {updatingStatus ? (
                          <Loader2 className="size-4 mr-2 animate-spin" />
                        ) : (
                          <Package className="size-4 mr-2" />
                        )}
                        Marcar como procesando
                      </Button>
                    )}

                    {selectedOrder.status === "processing" && (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label
                            htmlFor="tracking"
                            className="text-sm font-medium"
                          >
                            Número de guío
                          </Label>
                          <Input
                            id="tracking"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            placeholder="Ej: 1234567890"
                          />
                        </div>
                        <Button
                          onClick={() =>
                            updateOrderStatus(
                              selectedOrder.id,
                              "shipped",
                              trackingNumber || undefined
                            )
                          }
                          className="w-full bg-navy hover:bg-navy-light text-white"
                          disabled={updatingStatus}
                        >
                          {updatingStatus ? (
                            <Loader2 className="size-4 mr-2 animate-spin" />
                          ) : (
                            <Truck className="size-4 mr-2" />
                          )}
                          Marcar como enviado
                        </Button>
                      </div>
                    )}

                    {selectedOrder.status === "shipped" && (
                      <div className="space-y-3">
                        {selectedOrder.trackingNumber && (
                          <div className="bg-blue-light rounded-xl p-3 flex items-center gap-2">
                            <Truck className="size-4 text-navy" />
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Guía de rastreo
                              </p>
                              <p className="text-sm font-mono font-semibold text-navy">
                                {selectedOrder.trackingNumber}
                              </p>
                            </div>
                          </div>
                        )}
                        <Button
                          onClick={() =>
                            updateOrderStatus(selectedOrder.id, "delivered")
                          }
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                          disabled={updatingStatus}
                        >
                          {updatingStatus ? (
                            <Loader2 className="size-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle2 className="size-4 mr-2" />
                          )}
                          Marcar como entregado
                        </Button>
                      </div>
                    )}

                    {selectedOrder.status === "delivered" && (
                      <div className="bg-green-50 rounded-xl p-4 text-center">
                        <CheckCircle2 className="size-8 text-green-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-green-700">
                          Pedido entregado
                        </p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Tracking Info */}
                {selectedOrder.trackingNumber &&
                  selectedOrder.status !== "shipped" && (
                    <section>
                      <div className="bg-blue-light rounded-xl p-3 flex items-center gap-3">
                        <ExternalLink className="size-4 text-navy" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Guía de rastreo
                          </p>
                          <p className="text-sm font-mono font-semibold text-navy">
                            {selectedOrder.trackingNumber}
                          </p>
                        </div>
                      </div>
                    </section>
                  )}

                {/* Order Totals */}
                <section>
                  <h3 className="font-heading text-sm font-semibold text-navy mb-3">
                    Resumen
                  </h3>
                  <div className="bg-gray-bg rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">
                        {formatPrice(selectedOrder.subtotal)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Envío</span>
                      <span className="font-medium">
                        {selectedOrder.shipping === 0
                          ? "Gratis"
                          : formatPrice(selectedOrder.shipping)}
                      </span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Descuento</span>
                        <span className="font-medium text-green-600">
                          -{formatPrice(selectedOrder.discount)}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-border pt-2 flex items-center justify-between">
                      <span className="font-heading font-semibold text-navy">
                        Total
                      </span>
                      <span className="font-heading text-lg font-bold text-navy">
                        {formatPrice(selectedOrder.total)}
                      </span>
                    </div>
                  </div>
                </section>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
