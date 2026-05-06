export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  content: string | null;
  price: number;
  comparePrice: number | null;
  costPrice: number | null;
  sku: string | null;
  barcode: string | null;
  stock: number;
  lowStock: number;
  images: string;
  categoryId: string | null;
  tags: string;
  rating: number;
  reviewCount: number;
  usage: string;
  status: string;
  featured: boolean;
  professional: boolean;
  variants: string;
  weight: number | null;
  dimensions: string | null;
  createdAt: string;
  updatedAt: string;
  category?: Category;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  icon: string | null;
  order: number;
  productCount?: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string | null;
  status: string;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  shippingMethod: string | null;
  trackingNumber: string | null;
  shippingAddress: string | null;
  billingAddress: string | null;
  paymentMethod: string | null;
  paymentId: string | null;
  paidAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  notes: string | null;
  timeline: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  user?: User;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string | null;
  name: string;
  image: string | null;
  price: number;
  quantity: number;
  variant: string | null;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string;
  phone: string | null;
  provider: string;
  createdAt: string;
  updatedAt: string;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function parseImages(imagesJson: string): string[] {
  try {
    return JSON.parse(imagesJson);
  } catch {
    return [];
  }
}

export function parseTags(tagsJson: string): string[] {
  try {
    return JSON.parse(tagsJson);
  } catch {
    return [];
  }
}

export function getDiscountPercentage(
  price: number,
  comparePrice: number | null
): number | null {
  if (!comparePrice || comparePrice <= price) return null;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}

export const ORDER_STATUS_MAP: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  pending: {
    label: "Pendiente",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
  },
  processing: {
    label: "Procesando",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
  },
  shipped: {
    label: "Enviado",
    color: "text-navy",
    bgColor: "bg-navy-50",
  },
  delivered: {
    label: "Entregado",
    color: "text-green-700",
    bgColor: "bg-green-50",
  },
  cancelled: {
    label: "Cancelado",
    color: "text-red-700",
    bgColor: "bg-red-50",
  },
};
