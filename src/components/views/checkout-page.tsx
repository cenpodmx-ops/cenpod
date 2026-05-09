"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Truck,
  CreditCard,
  MapPin,
  Lock,
  Shield,
  Package,
  CheckCircle2,
  ShoppingBag,
  ArrowRight,
  AlertTriangle,
  X,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useNavigationStore } from "@/store/navigation";
import { formatPrice } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

/* ──────────────────────── CP Lookup ──────────────────────── */

const CP_LOOKUP: Record<string, { ciudad: string; estado: string }> = {
  "06600": { ciudad: "Ciudad de México", estado: "CDMX" },
  "11520": { ciudad: "Ciudad de México", estado: "CDMX" },
  "03810": { ciudad: "Ciudad de México", estado: "CDMX" },
  "44100": { ciudad: "Guadalajara", estado: "Jalisco" },
  "44600": { ciudad: "Guadalajara", estado: "Jalisco" },
  "64000": { ciudad: "Monterrey", estado: "Nuevo León" },
  "66220": { ciudad: "San Pedro Garza García", estado: "Nuevo León" },
  "77000": { ciudad: "Chetumal", estado: "Quintana Roo" },
  "77500": { ciudad: "Cancún", estado: "Quintana Roo" },
  "91000": { ciudad: "Xalapa", estado: "Veracruz" },
  "94300": { ciudad: "Córdoba", estado: "Veracruz" },
  "36000": { ciudad: "Guanajuato", estado: "Guanajuato" },
  "37000": { ciudad: "León", estado: "Guanajuato" },
  "80000": { ciudad: "Culiacán", estado: "Sinaloa" },
  "23000": { ciudad: "La Paz", estado: "Baja California Sur" },
  "20000": { ciudad: "Aguascalientes", estado: "Aguascalientes" },
  "50000": { ciudad: "Toluca", estado: "Estado de México" },
  "53000": { ciudad: "Naucalpan", estado: "Estado de México" },
  "76000": { ciudad: "Querétaro", estado: "Querétaro" },
  "86000": { ciudad: "Villahermosa", estado: "Tabasco" },
};

/* ──────────────────────── Shipping Methods ──────────────────────── */

interface ShippingMethod {
  id: string;
  name: string;
  price: number;
  days: string;
  icon: string;
}

const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: "estafeta",
    name: "Estafeta",
    price: 120,
    days: "3-5 días hábiles",
    icon: "📦",
  },
  {
    id: "fedex",
    name: "Fedex Express",
    price: 150,
    days: "2-3 días hábiles",
    icon: "🚀",
  },
  {
    id: "dhl",
    name: "DHL Express",
    price: 180,
    days: "1-2 días hábiles",
    icon: "✈️",
  },
];

/* ──────────────────────── Zod Schemas ──────────────────────── */

const shippingSchema = z.object({
  fullName: z.string().min(3, "Nombre completo es requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Teléfono debe tener al menos 10 dígitos"),
  street: z.string().min(3, "Calle y número es requerido"),
  neighborhood: z.string().min(2, "Colonia es requerida"),
  postalCode: z.string().regex(/^\d{5}$/, "Código postal debe tener 5 dígitos"),
  city: z.string().min(2, "Ciudad es requerida"),
  state: z.string().min(2, "Estado es requerido"),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

const paymentSchema = z.object({
  cardNumber: z
    .string()
    .min(16, "Número de tarjeta inválido")
    .max(19, "Número de tarjeta inválido"),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Formato MM/AA"),
  cvv: z.string().regex(/^\d{3,4}$/, "CVV inválido"),
  cardHolder: z.string().min(3, "Nombre del titular es requerido"),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

/* ──────────────────────── Confetti ──────────────────────── */

function Confetti() {
  const colors = ["#0a3143", "#8ec9e0", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444", "#ec4899"];
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 4 + Math.random() * 8,
    rotation: Math.random() * 360,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.left}%`,
            top: "-20px",
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            transform: `rotate(${p.rotation}deg)`,
            animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
            opacity: 0,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

/* ──────────────────────── Stepper ──────────────────────── */

const STEPS = [
  { id: 1, label: "Datos de envío", icon: MapPin },
  { id: 2, label: "Método de envío", icon: Truck },
  { id: 3, label: "Pago", icon: CreditCard },
];

function CheckoutStepper({
  currentStep,
  onStepClick,
}: {
  currentStep: number;
  onStepClick: (step: number) => void;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-center">
        {STEPS.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex items-center">
              {/* Step circle + label */}
              <button
                type="button"
                onClick={() => isCompleted && onStepClick(step.id)}
                className={`flex flex-col items-center gap-1.5 ${
                  isCompleted ? "cursor-pointer" : "cursor-default"
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    isCompleted
                      ? "border-navy bg-navy text-white"
                      : isCurrent
                      ? "border-navy bg-navy text-white shadow-lg shadow-navy/25"
                      : "border-gray-300 bg-white text-gray-400"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <span
                  className={`text-xs font-medium transition-colors ${
                    isCurrent
                      ? "text-navy"
                      : isCompleted
                      ? "text-navy"
                      : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </button>

              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div
                  className={`mx-3 h-0.5 w-16 sm:w-24 transition-colors duration-300 sm:mx-6 ${
                    currentStep > step.id ? "bg-navy" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ──────────────────────── Card Preview ──────────────────────── */

function CardPreview({
  cardNumber,
  expiry,
  cardHolder,
}: {
  cardNumber: string;
  expiry: string;
  cardHolder: string;
}) {
  const displayNumber = cardNumber
    ? cardNumber.replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim()
    : "•••• •••• •••• ••••";
  const displayExpiry = expiry || "MM/AA";
  const displayHolder = cardHolder ? cardHolder.toUpperCase() : "NOMBRE DEL TITULAR";

  return (
    <div className="relative mx-auto h-44 w-full max-w-sm overflow-hidden rounded-2xl bg-gradient-to-br from-navy to-navy-light p-6 text-white shadow-xl">
      {/* Decorative circles */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5" />
      <div className="absolute -right-4 top-12 h-20 w-20 rounded-full bg-white/5" />

      {/* Chip */}
      <div className="mb-6 h-10 w-14 rounded-md bg-gradient-to-br from-amber-200 to-amber-300 shadow-inner" />

      {/* Number */}
      <p className="mb-4 font-mono text-lg tracking-widest">{displayNumber}</p>

      {/* Bottom row */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-white/60">Titular</p>
          <p className="text-sm font-medium tracking-wide">{displayHolder}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-white/60">Expira</p>
          <p className="text-sm font-medium">{displayExpiry}</p>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────── Order Summary Sidebar ──────────────────────── */

function OrderSummarySidebar({
  selectedShipping,
  shippingCost,
}: {
  selectedShipping: string;
  shippingCost: number;
}) {
  const { items, getSubtotal } = useCartStore();
  const subtotal = getSubtotal();
  const freeShipping = subtotal >= 1000;
  const finalShippingCost = freeShipping ? 0 : shippingCost;
  const total = subtotal + finalShippingCost;

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h3 className="font-heading mb-4 text-lg font-bold text-navy">
        Resumen del pedido
      </h3>

      {/* Items list */}
      <div className="max-h-72 space-y-3 overflow-y-auto custom-scrollbar">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            {/* Image placeholder */}
            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-bg">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Package className="h-5 w-5 text-gray-400" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-navy">{item.name}</p>
              <p className="text-xs text-gray-500">Cant: {item.quantity}</p>
            </div>
            <p className="flex-shrink-0 text-sm font-semibold text-navy">
              {formatPrice(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      <Separator className="my-4" />

      {/* Totals */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Subtotal</span>
          <span className="font-medium text-navy">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Envío</span>
          {freeShipping ? (
            <span className="font-medium text-green-600">Gratis</span>
          ) : selectedShipping ? (
            <span className="font-medium text-navy">{formatPrice(finalShippingCost)}</span>
          ) : (
            <span className="text-gray-400">--</span>
          )}
        </div>
        {freeShipping && (
          <div className="flex items-center gap-1.5">
            <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">
              🎉 Envío gratis
            </Badge>
          </div>
        )}
      </div>

      <Separator className="my-4" />

      <div className="flex justify-between">
        <span className="font-heading text-lg font-bold text-navy">Total</span>
        <span className="font-heading text-xl font-bold text-navy">
          {formatPrice(total)}
        </span>
      </div>

      {/* Secure payment badge */}
      <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-gray-bg px-4 py-3">
        <Shield className="h-4 w-4 text-navy" />
        <span className="text-xs font-medium text-navy">
          Pago seguro y encriptado
        </span>
        <Lock className="h-3 w-3 text-navy/60" />
      </div>
    </div>
  );
}

/* ════════════════════════ MAIN COMPONENT ════════════════════════ */

export default function CheckoutPage() {
  const { items, getSubtotal, clearCart } = useCartStore();
  const { navigate } = useNavigationStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [selectedShipping, setSelectedShipping] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderData, setOrderData] = useState<{
    orderNumber: string;
    total: number;
    shippingMethod: string;
    estimatedDelivery: string;
  } | null>(null);

  const subtotal = getSubtotal();
  const freeShipping = subtotal >= 1000;
  const shippingMethod = SHIPPING_METHODS.find((m) => m.id === selectedShipping);
  const shippingCost = freeShipping ? 0 : (shippingMethod?.price ?? 0);

  // Redirect to home if cart is empty and no order confirmed
  useEffect(() => {
    if (items.length === 0 && !orderConfirmed) {
      navigate("home");
    }
  }, [items.length, orderConfirmed, navigate]);

  /* ──── Step 1: Shipping Form ──── */
  const shippingForm = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      street: "",
      neighborhood: "",
      postalCode: "",
      city: "",
      state: "",
    },
  });

  // Auto-fill city/state on postal code change
  const postalCodeValue = shippingForm.watch("postalCode");
  useEffect(() => {
    if (postalCodeValue && /^\d{5}$/.test(postalCodeValue)) {
      const lookup = CP_LOOKUP[postalCodeValue];
      if (lookup) {
        shippingForm.setValue("city", lookup.ciudad, { shouldValidate: true });
        shippingForm.setValue("state", lookup.estado, { shouldValidate: true });
      }
    }
  }, [postalCodeValue, shippingForm]);

  const onShippingSubmit = (data: ShippingFormData) => {
    setDirection(1);
    setCurrentStep(2);
  };

  /* ──── Step 3: Payment Form ──── */
  const paymentForm = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardNumber: "",
      expiry: "",
      cvv: "",
      cardHolder: "",
    },
  });

  // Format card number with spaces
  const cardNumberValue = paymentForm.watch("cardNumber");
  const expiryValue = paymentForm.watch("expiry");
  const cardHolderValue = paymentForm.watch("cardHolder");

  const handleCardNumberChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
      const formatted = raw.replace(/(.{4})/g, "$1 ").trim();
      paymentForm.setValue("cardNumber", formatted, { shouldValidate: true });
    },
    [paymentForm]
  );

  const handleExpiryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let raw = e.target.value.replace(/\D/g, "").slice(0, 4);
      if (raw.length >= 3) {
        raw = raw.slice(0, 2) + "/" + raw.slice(2);
      }
      paymentForm.setValue("expiry", raw, { shouldValidate: true });
    },
    [paymentForm]
  );

  const handleCvvChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
      paymentForm.setValue("cvv", raw, { shouldValidate: true });
    },
    [paymentForm]
  );

  /* ──── Confirm Order ──── */
  const onPaymentSubmit = async () => {
    setIsSubmitting(true);
    setCheckoutError(null);
    try {
      // Re-read items from store
      const freshItems = useCartStore.getState().items;

      // Always create local order (Shopify redirect disabled while store is in coming-soon mode)
      const finalShippingCost = freeShipping ? 0 : (shippingMethod?.price ?? 0);
      const total = subtotal + finalShippingCost;
      const shippingData = shippingForm.getValues();

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subtotal,
          shipping: finalShippingCost,
          discount: 0,
          total,
          shippingMethod: shippingMethod?.name || selectedShipping,
          shippingAddress: {
            fullName: shippingData.fullName,
            email: shippingData.email,
            phone: shippingData.phone,
            street: shippingData.street,
            neighborhood: shippingData.neighborhood,
            postalCode: shippingData.postalCode,
            city: shippingData.city,
            state: shippingData.state,
          },
          paymentMethod: "local",
          items: freshItems.map((item) => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            productId: item.id,
            variant: item.variant || null,
          })),
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Error al crear el pedido");
      }
      const order = await response.json();

      setOrderData({
        orderNumber: order.orderNumber,
        total,
        shippingMethod: shippingMethod?.name || selectedShipping,
        estimatedDelivery: shippingMethod?.days || "3-5 días hábiles",
      });
      setOrderConfirmed(true);
      // Clear cart after successful order
      clearCart();
    } catch (error) {
      console.error("Order error:", error);
      setCheckoutError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error inesperado. Intenta de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ──── Navigation helpers ──── */
  const goToStep = (step: number) => {
    setDirection(step > currentStep ? 1 : -1);
    setCurrentStep(step);
  };

  const goBack = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep(currentStep - 1);
    }
  };

  /* ──── Animation variants ──── */
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  /* ════════════════════════ ORDER CONFIRMED ════════════════════════ */
  if (orderConfirmed && orderData) {
    return (
      <>
        <Confetti />
        <div className="min-h-screen bg-gray-bg px-4 py-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="mx-auto max-w-lg rounded-2xl bg-white p-8 text-center shadow-lg"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50"
            >
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </motion.div>

            <h2 className="font-heading mb-2 text-2xl font-bold text-navy">
              ¡Pedido confirmado!
            </h2>
            <p className="mb-6 text-gray-500">
              Tu pedido ha sido procesado exitosamente
            </p>

            <div className="mb-6 rounded-xl bg-gray-bg p-4 text-left">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Número de pedido</span>
                  <span className="font-mono text-sm font-bold text-navy">
                    {orderData.orderNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Total</span>
                  <span className="text-sm font-bold text-navy">
                    {formatPrice(orderData.total)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Envío</span>
                  <span className="text-sm text-navy">{orderData.shippingMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Entrega estimada</span>
                  <span className="text-sm text-navy">
                    {orderData.estimatedDelivery}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={() => {
                  clearCart();
                  navigate("home");
                }}
                className="h-12 rounded-xl bg-navy text-white hover:bg-navy-light"
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Volver a la tienda
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("account-orders")}
                className="h-12 rounded-xl border-navy text-navy hover:bg-navy-50"
              >
                Ver mis pedidos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  /* ════════════════════════ CHECKOUT FLOW ════════════════════════ */
  return (
    <div className="min-h-screen bg-gray-bg">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("home")}
            className="mb-4 flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-navy"
          >
            <ChevronLeft className="h-4 w-4" />
            Volver a la tienda
          </button>
          <h1 className="font-heading text-2xl font-bold text-navy sm:text-3xl">
            Checkout
          </h1>
        </div>

        {/* Stepper */}
        <CheckoutStepper currentStep={currentStep} onStepClick={goToStep} />

        {/* Main layout: 2 columns */}
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left column: Form */}
          <div className="flex-1 lg:max-w-[60%]">
            <AnimatePresence mode="wait" custom={direction}>
              {/* ──── STEP 1: Shipping Info ──── */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="rounded-2xl bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-50">
                        <MapPin className="h-5 w-5 text-navy" />
                      </div>
                      <div>
                        <h2 className="font-heading text-lg font-bold text-navy">
                          Datos de envío
                        </h2>
                        <p className="text-sm text-gray-500">
                          Ingresa tu dirección de entrega
                        </p>
                      </div>
                    </div>

                    <form
                      onSubmit={shippingForm.handleSubmit(onShippingSubmit)}
                      className="space-y-4"
                    >
                      {/* Full name */}
                      <div className="space-y-1.5">
                        <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                          Nombre completo
                        </Label>
                        <Input
                          id="fullName"
                          placeholder="Juan Pérez García"
                          className="h-11 rounded-lg border-gray-200 focus:border-navy focus:ring-navy/20"
                          {...shippingForm.register("fullName")}
                        />
                        {shippingForm.formState.errors.fullName && (
                          <p className="text-xs text-red-500">
                            {shippingForm.formState.errors.fullName.message}
                          </p>
                        )}
                      </div>

                      {/* Email & Phone */}
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                            Email
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="correo@ejemplo.com"
                            className="h-11 rounded-lg border-gray-200 focus:border-navy focus:ring-navy/20"
                            {...shippingForm.register("email")}
                          />
                          {shippingForm.formState.errors.email && (
                            <p className="text-xs text-red-500">
                              {shippingForm.formState.errors.email.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                            Teléfono
                          </Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="55 1234 5678"
                            className="h-11 rounded-lg border-gray-200 focus:border-navy focus:ring-navy/20"
                            {...shippingForm.register("phone")}
                          />
                          {shippingForm.formState.errors.phone && (
                            <p className="text-xs text-red-500">
                              {shippingForm.formState.errors.phone.message}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Street */}
                      <div className="space-y-1.5">
                        <Label htmlFor="street" className="text-sm font-medium text-gray-700">
                          Calle y número
                        </Label>
                        <Input
                          id="street"
                          placeholder="Av. Reforma 123"
                          className="h-11 rounded-lg border-gray-200 focus:border-navy focus:ring-navy/20"
                          {...shippingForm.register("street")}
                        />
                        {shippingForm.formState.errors.street && (
                          <p className="text-xs text-red-500">
                            {shippingForm.formState.errors.street.message}
                          </p>
                        )}
                      </div>

                      {/* Neighborhood */}
                      <div className="space-y-1.5">
                        <Label htmlFor="neighborhood" className="text-sm font-medium text-gray-700">
                          Colonia
                        </Label>
                        <Input
                          id="neighborhood"
                          placeholder="Centro"
                          className="h-11 rounded-lg border-gray-200 focus:border-navy focus:ring-navy/20"
                          {...shippingForm.register("neighborhood")}
                        />
                        {shippingForm.formState.errors.neighborhood && (
                          <p className="text-xs text-red-500">
                            {shippingForm.formState.errors.neighborhood.message}
                          </p>
                        )}
                      </div>

                      {/* Postal Code, City, State */}
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="postalCode" className="text-sm font-medium text-gray-700">
                            Código Postal
                          </Label>
                          <Input
                            id="postalCode"
                            placeholder="06600"
                            maxLength={5}
                            className="h-11 rounded-lg border-gray-200 focus:border-navy focus:ring-navy/20"
                            {...shippingForm.register("postalCode")}
                          />
                          {shippingForm.formState.errors.postalCode && (
                            <p className="text-xs text-red-500">
                              {shippingForm.formState.errors.postalCode.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                            Ciudad
                          </Label>
                          <Input
                            id="city"
                            placeholder="Ciudad de México"
                            className="h-11 rounded-lg border-gray-200 focus:border-navy focus:ring-navy/20"
                            {...shippingForm.register("city")}
                          />
                          {shippingForm.formState.errors.city && (
                            <p className="text-xs text-red-500">
                              {shippingForm.formState.errors.city.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="state" className="text-sm font-medium text-gray-700">
                            Estado
                          </Label>
                          <Input
                            id="state"
                            placeholder="CDMX"
                            className="h-11 rounded-lg border-gray-200 focus:border-navy focus:ring-navy/20"
                            {...shippingForm.register("state")}
                          />
                          {shippingForm.formState.errors.state && (
                            <p className="text-xs text-red-500">
                              {shippingForm.formState.errors.state.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="pt-4">
                        <Button
                          type="submit"
                          className="h-12 w-full rounded-xl bg-navy text-white hover:bg-navy-light"
                        >
                          Continuar
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}

              {/* ──── STEP 2: Shipping Method ──── */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="rounded-2xl bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-50">
                        <Truck className="h-5 w-5 text-navy" />
                      </div>
                      <div>
                        <h2 className="font-heading text-lg font-bold text-navy">
                          Método de envío
                        </h2>
                        <p className="text-sm text-gray-500">
                          Selecciona cómo quieres recibir tu pedido
                        </p>
                      </div>
                    </div>

                    {freeShipping && (
                      <div className="mb-4 flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3">
                        <span className="text-lg">🎉</span>
                        <span className="text-sm font-medium text-green-700">
                          ¡Envío gratis en pedidos mayores a $1,000!
                        </span>
                      </div>
                    )}

                    <RadioGroup
                      value={selectedShipping}
                      onValueChange={setSelectedShipping}
                      className="space-y-3"
                    >
                      {SHIPPING_METHODS.map((method) => (
                        <label
                          key={method.id}
                          className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all ${
                            selectedShipping === method.id
                              ? "border-navy bg-navy-50"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <RadioGroupItem value={method.id} id={method.id} />
                          <span className="text-2xl">{method.icon}</span>
                          <div className="flex-1">
                            <p className="font-medium text-navy">{method.name}</p>
                            <p className="text-sm text-gray-500">{method.days}</p>
                          </div>
                          <div className="text-right">
                            {freeShipping ? (
                              <div className="flex flex-col items-end">
                                <span className="text-sm text-gray-400 line-through">
                                  {formatPrice(method.price)}
                                </span>
                                <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                                  Gratis
                                </Badge>
                              </div>
                            ) : (
                              <span className="text-lg font-bold text-navy">
                                {formatPrice(method.price)}
                              </span>
                            )}
                          </div>
                        </label>
                      ))}
                    </RadioGroup>

                    <div className="mt-6 flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={goBack}
                        className="h-12 rounded-xl border-gray-300 text-gray-600 hover:bg-gray-50"
                      >
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Regresar
                      </Button>
                      <Button
                        type="button"
                        disabled={!selectedShipping}
                        onClick={() => goToStep(3)}
                        className="h-12 flex-1 rounded-xl bg-navy text-white hover:bg-navy-light disabled:opacity-50"
                      >
                        Continuar
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ──── STEP 3: Payment via Shopify ──── */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="rounded-2xl bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-50">
                        <CreditCard className="h-5 w-5 text-navy" />
                      </div>
                      <div>
                        <h2 className="font-heading text-lg font-bold text-navy">
                          Pago seguro
                        </h2>
                        <p className="text-sm text-gray-500">
                          Serás redirigido al checkout seguro de Shopify
                        </p>
                      </div>
                    </div>

                    {/* Shopify checkout info */}
                    <div className="rounded-xl bg-blue-light p-5 mb-6">
                      <div className="flex items-start gap-3">
                        <Shield className="h-6 w-6 text-navy shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-heading text-base font-bold text-navy mb-1">
                            Checkout seguro con Shopify
                          </h3>
                          <p className="text-sm text-gray-dark leading-relaxed">
                            Al continuar, serás redirigido a la pasarela de pago segura de Shopify. 
                            Tu información de pago está protegida con encriptación de nivel bancario.
                          </p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <Badge className="bg-white text-navy text-xs border border-gray-200 hover:bg-white">
                              🔒 SSL Encriptado
                            </Badge>
                            <Badge className="bg-white text-navy text-xs border border-gray-200 hover:bg-white">
                              💳 Tarjeta / OXXO / Transferencia
                            </Badge>
                            <Badge className="bg-white text-navy text-xs border border-gray-200 hover:bg-white">
                              🇲🇽 Pagos en MXN
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order summary review */}
                    <div className="rounded-xl border border-gray-200 p-4 mb-6">
                      <h4 className="text-sm font-semibold text-navy mb-3">Resumen de tu pedido</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Productos ({items.length})</span>
                          <span className="font-medium text-navy">{formatPrice(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Envío ({shippingMethod?.name || "Sin seleccionar"})</span>
                          <span className="font-medium text-navy">
                            {freeShipping ? "Gratis" : shippingMethod ? formatPrice(shippingCost) : "--"}
                          </span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between text-base">
                          <span className="font-bold text-navy">Total</span>
                          <span className="font-bold text-navy">{formatPrice(subtotal + (freeShipping ? 0 : shippingCost))}</span>
                        </div>
                      </div>
                    </div>

                    {/* Error message */}
                    {checkoutError && (
                      <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-red-800">Error al procesar el pago</p>
                          <p className="text-sm text-red-600 mt-0.5">{checkoutError}</p>
                        </div>
                        <button
                          onClick={() => setCheckoutError(null)}
                          className="ml-auto p-1 rounded-md hover:bg-red-100 transition-colors"
                          aria-label="Cerrar error"
                        >
                          <X className="h-4 w-4 text-red-400" />
                        </button>
                      </div>
                    )}

                    <div className="mt-6 flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={goBack}
                        className="h-12 rounded-xl border-gray-300 text-gray-600 hover:bg-gray-50"
                      >
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Regresar
                      </Button>
                      <Button
                        type="button"
                        disabled={isSubmitting}
                        onClick={onPaymentSubmit}
                        className="h-12 flex-1 rounded-xl bg-navy text-white hover:bg-navy-light disabled:opacity-70"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <svg
                              className="h-4 w-4 animate-spin"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                              />
                            </svg>
                            Procesando...
                          </span>
                        ) : (
                          <>
                            <Lock className="mr-2 h-4 w-4" />
                            Proceder al pago seguro
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right column: Order Summary */}
          <div className="lg:w-[40%]">
            <div className="lg:sticky lg:top-8">
              <OrderSummarySidebar
                selectedShipping={selectedShipping}
                shippingCost={shippingCost}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
