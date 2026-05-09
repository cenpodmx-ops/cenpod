import { NextResponse } from "next/server";
import {
  shopifyCreateCart,
  shopifyGetCart,
  shopifyCartLinesAdd,
  shopifyCartLinesUpdate,
  shopifyCartLinesRemove,
} from "@/lib/shopify";

interface CartLineItem {
  variantId: string;
  quantity: number;
}

/**
 * POST /api/cart
 * Create a new Shopify Cart or add items to an existing one.
 *
 * Body: {
 *   action: "create" | "add" | "update" | "remove" | "sync",
 *   cartId?: string,
 *   lineItems?: { variantId: string; quantity: number }[],
 *   lines?: { id: string; quantity: number }[],
 *   lineIds?: string[],
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, cartId, lineItems, lines, lineIds } = body;

    switch (action) {
      case "create": {
        if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
          return NextResponse.json(
            { error: "lineItems is required for create action" },
            { status: 400 }
          );
        }
        const cart = await shopifyCreateCart(lineItems);
        return NextResponse.json(cart, { status: 201 });
      }

      case "add": {
        if (!cartId || !lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
          return NextResponse.json(
            { error: "cartId and lineItems are required for add action" },
            { status: 400 }
          );
        }
        const result = await shopifyCartLinesAdd(cartId, lineItems);
        return NextResponse.json(result);
      }

      case "update": {
        if (!cartId || !lines || !Array.isArray(lines) || lines.length === 0) {
          return NextResponse.json(
            { error: "cartId and lines are required for update action" },
            { status: 400 }
          );
        }
        const result = await shopifyCartLinesUpdate(cartId, lines);
        return NextResponse.json(result);
      }

      case "remove": {
        if (!cartId || !lineIds || !Array.isArray(lineIds) || lineIds.length === 0) {
          return NextResponse.json(
            { error: "cartId and lineIds are required for remove action" },
            { status: 400 }
          );
        }
        const result = await shopifyCartLinesRemove(cartId, lineIds);
        return NextResponse.json(result);
      }

      case "sync": {
        // Full sync: create or replace the Shopify cart with all local items
        if (!lineItems || !Array.isArray(lineItems)) {
          return NextResponse.json(
            { error: "lineItems is required for sync action" },
            { status: 400 }
          );
        }

        // If there are no items, just return empty
        if (lineItems.length === 0) {
          return NextResponse.json({ id: null, webUrl: null });
        }

        // If we have an existing cart, try to verify it first
        if (cartId) {
          try {
            const existingCart = await shopifyGetCart(cartId);
            // Cart still exists — return it (client will decide if it matches)
            return NextResponse.json(existingCart);
          } catch {
            // Cart expired or not found, create a new one
          }
        }

        // Create a new cart with all items
        const cart = await shopifyCreateCart(lineItems);
        return NextResponse.json(cart, { status: 201 });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}. Valid actions: create, add, update, remove, sync` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in cart API:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error processing cart operation" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cart?cartId=xxx
 * Get the status of a Shopify Cart.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cartId = searchParams.get("cartId");

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
