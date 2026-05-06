import { NextResponse } from "next/server";
import {
  shopifyCreateCart,
  shopifyGetCart,
} from "@/lib/shopify";

interface CartLineItem {
  variantId: string;
  quantity: number;
}

/**
 * POST /api/checkout
 * Create a Shopify Cart from cart items and return the checkout URL.
 *
 * Body: { lineItems: { variantId: string; quantity: number }[] }
 * Response: { id: string; webUrl: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { lineItems } = body as { lineItems: CartLineItem[] };

    if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
      return NextResponse.json(
        { error: "lineItems is required and must be a non-empty array" },
        { status: 400 }
      );
    }

    // Validate each line item
    for (const item of lineItems) {
      if (!item.variantId || typeof item.quantity !== "number" || item.quantity < 1) {
        return NextResponse.json(
          { error: "Each lineItem must have a valid variantId and quantity >= 1" },
          { status: 400 }
        );
      }
    }

    const cart = await shopifyCreateCart(lineItems);

    return NextResponse.json(cart, { status: 201 });
  } catch (error) {
    console.error("Error creating Shopify cart:", error);
    return NextResponse.json(
      { error: "Error creating cart" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/checkout?cartId=xxx
 * Get the status of a Shopify Cart.
 *
 * Query params: cartId (required), checkoutId (legacy alias for cartId)
 * Response: { id, webUrl, totalAmount, currency, lineItems }
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cartId = searchParams.get("cartId") || searchParams.get("checkoutId");

    if (!cartId) {
      return NextResponse.json(
        { error: "cartId query parameter is required" },
        { status: 400 }
      );
    }

    const cart = await shopifyGetCart(cartId);

    return NextResponse.json(cart);
  } catch (error) {
    console.error("Error fetching Shopify cart:", error);
    return NextResponse.json(
      { error: "Error fetching cart" },
      { status: 500 }
    );
  }
}
