import { NextResponse } from "next/server";
import {
  shopifyCreateCheckout,
  shopifyGetCheckout,
} from "@/lib/shopify";

interface CheckoutLineItem {
  variantId: string;
  quantity: number;
}

/**
 * POST /api/checkout
 * Create a Shopify checkout session from cart items.
 *
 * Body: { lineItems: { variantId: string; quantity: number }[] }
 * Response: { id: string; webUrl: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { lineItems } = body as { lineItems: CheckoutLineItem[] };

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

    const checkout = await shopifyCreateCheckout(lineItems);

    return NextResponse.json(checkout, { status: 201 });
  } catch (error) {
    console.error("Error creating Shopify checkout:", error);
    return NextResponse.json(
      { error: "Error creating checkout" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/checkout?checkoutId=xxx
 * Get the status of a Shopify checkout session.
 *
 * Query params: checkoutId (required)
 * Response: { id, webUrl, ready, requiresShipping, subtotal, totalTax, totalPrice, currency, lineItems }
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const checkoutId = searchParams.get("checkoutId");

    if (!checkoutId) {
      return NextResponse.json(
        { error: "checkoutId query parameter is required" },
        { status: 400 }
      );
    }

    const checkout = await shopifyGetCheckout(checkoutId);

    return NextResponse.json(checkout);
  } catch (error) {
    console.error("Error fetching Shopify checkout:", error);
    return NextResponse.json(
      { error: "Error fetching checkout" },
      { status: 500 }
    );
  }
}
