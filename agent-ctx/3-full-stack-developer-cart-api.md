# Task 3: Update Shopify Client to Cart API

## Agent: full-stack-developer

## Task
Update Shopify client to use Cart API instead of deprecated Checkout API

## Changes Made

### /src/lib/shopify.ts
- Changed API_VERSION from "2025-01" to "2024-10"
- Replaced `ShopifyCheckout` interface with `ShopifyCart` + `ShopifyCartLineItem` interfaces
- Replaced `shopifyCreateCheckout()` → `shopifyCreateCart()` using `cartCreate` mutation
- Replaced `shopifyGetCheckout()` → `shopifyGetCart()` using `cart` query
- POST response shape preserved: `{ id: string, webUrl: string }` where webUrl = checkoutUrl

### /src/app/api/checkout/route.ts
- Updated imports to use `shopifyCreateCart` and `shopifyGetCart`
- POST handler uses `shopifyCreateCart()` 
- GET handler uses `shopifyGetCart()` with `cartId` param (and `checkoutId` as legacy alias)

## Backward Compatibility
- Frontend `checkout-page.tsx` uses `checkout.id` and `checkout.webUrl` — unchanged
- No frontend modifications required
