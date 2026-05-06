# Task 2 - Shopify Storefront API Client & API Routes Update

## Agent: full-stack-developer

## Task: Build Shopify Storefront API client and update API routes

## Work Log

1. Read worklog.md and project state — understood existing Prisma/SQLite setup, types, and API routes
2. Created `/src/lib/shopify.ts` — full Shopify Storefront API client with:
   - GraphQL fetch helper with error handling
   - Reusable query fragments (IMAGE, VARIANT, PRODUCT)
   - `shopifyGetProducts()` — products with filtering, sorting, pagination
   - `shopifyGetProductByHandle()` — single product by handle/slug
   - `shopifyGetCollections()` — collections mapped to categories
   - `shopifySearchProducts()` — search by query string
   - `shopifyCreateCheckout()` — create checkout session
   - `shopifyGetCheckout()` — get checkout status
   - Complete Shopify → Product/Category type mapping
3. Created `/.env.local` with placeholder Shopify env vars
4. Updated `/src/app/api/products/route.ts` — GET uses Shopify, POST kept with Prisma
5. Updated `/src/app/api/categories/route.ts` — uses shopifyGetCollections()
6. Updated `/src/app/api/products/[slug]/route.ts` — GET uses Shopify, PUT/DELETE kept with Prisma
7. Updated `/src/app/api/search/route.ts` — uses shopifySearchProducts()
8. Created `/src/app/api/checkout/route.ts` — POST (create) + GET (status)
9. Updated `next.config.ts` — added cdn.shopify.com and *.myshopify.com to images.remotePatterns
10. All lint checks pass

## Key Decisions

- Admin write operations (POST/PUT/DELETE) retained with Prisma since admin product management stays local
- Price filtering done client-side after fetching since Shopify Storefront API doesn't support price range filters
- Cache-Control headers added (s-maxage=60, stale-while-revalidate=120) for ISR-like behavior
- API response format kept identical so frontend requires zero changes
- Sort mappings: featured→BEST_SELLING, price-asc→PRICE ASC, price-desc→PRICE DESC, name→TITLE_ASC, newest→CREATED_AT_DESC, rating→BEST_SELLING
