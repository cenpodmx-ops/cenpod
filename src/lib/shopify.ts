import type { Product, Category } from "@/types";

// ============================================================
// Shopify API Client for CENPOD
// Supports TWO authentication methods:
//
// 1. Dev Dashboard (RECOMMENDED): Client ID + Client Secret
//    → Uses client credentials grant to get access tokens
//    → Follows https://shopify.dev/docs/apps/build/dev-dashboard/get-api-access-tokens
//
// 2. Legacy Storefront API: Storefront Access Token
//    → Direct token in X-Shopify-Storefront-Access-Token header
//    → For older custom apps created in Shopify Admin
//
// Falls back to demo data when neither is configured.
// ============================================================

// ── Environment variables ──────────────────────────────────────

const SHOPIFY_SHOP = process.env.SHOPIFY_SHOP || process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "";
const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CLIENT_ID || "";
const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET || "";
const SHOPIFY_STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN || process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN || "";

const ADMIN_API_VERSION = "2025-01";
const STOREFRONT_API_VERSION = "2025-01";

// ── Auth mode detection ────────────────────────────────────────

type AuthMode = "client-credentials" | "storefront-token" | "none";

function getAuthMode(): AuthMode {
  if (SHOPIFY_SHOP && SHOPIFY_CLIENT_ID && SHOPIFY_CLIENT_SECRET) {
    return "client-credentials";
  }
  if (SHOPIFY_SHOP && SHOPIFY_STOREFRONT_TOKEN) {
    return "storefront-token";
  }
  return "none";
}

// ── Token caching for client credentials grant ────────────────

interface CachedToken {
  accessToken: string;
  scope: string;
  expiresAt: number; // Unix timestamp in ms
}

let tokenCache: CachedToken | null = null;

/**
 * Get an Admin API access token using the client credentials grant.
 * Tokens are cached and auto-refreshed 5 minutes before expiration.
 * Follows the pattern from:
 * https://shopify.dev/docs/apps/build/dev-dashboard/get-api-access-tokens
 */
async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 5-minute buffer)
  if (tokenCache && tokenCache.expiresAt > Date.now() + 5 * 60 * 1000) {
    return tokenCache.accessToken;
  }

  const shopDomain = SHOPIFY_SHOP.includes(".myshopify.com")
    ? SHOPIFY_SHOP
    : `${SHOPIFY_SHOP}.myshopify.com`;

  const tokenUrl = `https://${shopDomain}/admin/oauth/access_token`;

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: SHOPIFY_CLIENT_ID,
      client_secret: SHOPIFY_CLIENT_SECRET,
      grant_type: "client_credentials",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Shopify token request failed (${response.status}): ${errorText}`
    );
  }

  const data = await response.json();

  if (!data.access_token) {
    throw new Error("No access_token in Shopify response");
  }

  // Cache the token (expires_in is in seconds, typically 86399 = ~24h)
  tokenCache = {
    accessToken: data.access_token,
    scope: data.scope || "",
    expiresAt: Date.now() + (data.expires_in || 86400) * 1000,
  };

  console.log(
    `[Shopify] Got access token via client credentials grant. Scope: ${data.scope}. Expires in: ${Math.round(data.expires_in / 3600)}h`
  );

  return tokenCache.accessToken;
}

// ── Storefront Access Token discovery via Admin REST API ───────

let storefrontTokenCache: string | null = null;

/**
 * Use the Admin REST API to find (or create) a Storefront API access token.
 * This is needed for product browsing and cart/checkout operations via the Storefront API.
 *
 * Note: The GraphQL Admin API removed storefrontAccessTokens queries in 2025-01,
 * so we use the REST API instead.
 */
async function getStorefrontAccessToken(): Promise<string> {
  if (storefrontTokenCache) return storefrontTokenCache;

  const accessToken = await getAccessToken();
  const shopDomain = SHOPIFY_SHOP.includes(".myshopify.com")
    ? SHOPIFY_SHOP
    : `${SHOPIFY_SHOP}.myshopify.com`;

  // List existing Storefront Access Tokens via REST API
  const listUrl = `https://${shopDomain}/admin/api/${ADMIN_API_VERSION}/storefront_access_tokens.json`;

  const listResponse = await fetch(listUrl, {
    method: "GET",
    headers: {
      "X-Shopify-Access-Token": accessToken,
    },
  });

  if (!listResponse.ok) {
    throw new Error(`Admin REST API error listing tokens: ${listResponse.status}`);
  }

  const listData = await listResponse.json();
  const tokens: { id: number; access_token: string; title: string }[] =
    listData.storefront_access_tokens || [];

  // Use the first available token
  if (tokens.length > 0) {
    storefrontTokenCache = tokens[0].access_token;
    console.log(`[Shopify] Found existing Storefront Access Token: "${tokens[0].title}"`);
    return storefrontTokenCache!;
  }

  // No token exists, create one via REST API
  const createUrl = `https://${shopDomain}/admin/api/${ADMIN_API_VERSION}/storefront_access_tokens.json`;

  const createResponse = await fetch(createUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify({
      storefront_access_token: {
        title: "CENPOD Headless Storefront",
      },
    }),
  });

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    throw new Error(`Admin REST API error creating token (${createResponse.status}): ${errorText}`);
  }

  const createData = await createResponse.json();
  storefrontTokenCache = createData.storefront_access_token.access_token;
  console.log("[Shopify] Created new Storefront Access Token: 'CENPOD Headless Storefront'");
  return storefrontTokenCache!;
}

// ── GraphQL fetch helpers ──────────────────────────────────────

interface GraphQLResponse<T> {
  data?: T;
  errors?: { message: string; extensions?: Record<string, unknown> }[];
}

/**
 * Fetch from the Shopify Admin API using client credentials grant.
 */
async function adminFetch<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const accessToken = await getAccessToken();
  const shopDomain = SHOPIFY_SHOP.includes(".myshopify.com")
    ? SHOPIFY_SHOP
    : `${SHOPIFY_SHOP}.myshopify.com`;

  const endpoint = `https://${shopDomain}/admin/api/${ADMIN_API_VERSION}/graphql.json`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Shopify Admin API error: ${response.status} ${response.statusText}`);
  }

  const json: GraphQLResponse<T> = await response.json();

  if (json.errors && json.errors.length > 0) {
    const messages = json.errors.map((e) => e.message).join(", ");
    throw new Error(`Shopify Admin GraphQL errors: ${messages}`);
  }

  return json.data as T;
}

/**
 * Fetch from the Shopify Storefront API.
 * Works with both auth modes:
 * - client-credentials: automatically discovers/creates a Storefront Access Token
 * - storefront-token: uses the directly provided token
 */
async function storefrontFetch<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const shopDomain = SHOPIFY_SHOP.includes(".myshopify.com")
    ? SHOPIFY_SHOP
    : `${SHOPIFY_SHOP}.myshopify.com`;

  let token: string;

  if (getAuthMode() === "client-credentials") {
    // Get Storefront token via Admin API
    token = await getStorefrontAccessToken();
  } else {
    token = SHOPIFY_STOREFRONT_TOKEN;
  }

  const endpoint = `https://${shopDomain}/api/${STOREFRONT_API_VERSION}/graphql.json`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Shopify Storefront API error: ${response.status} ${response.statusText}`);
  }

  const json: GraphQLResponse<T> = await response.json();

  if (json.errors && json.errors.length > 0) {
    const messages = json.errors.map((e) => e.message).join(", ");
    throw new Error(`Shopify Storefront GraphQL errors: ${messages}`);
  }

  return json.data as T;
}

// ── Types for Shopify API responses ────────────────────────────

interface ShopifyImage {
  id: string;
  url: string;
  altText: string | null;
  width: number;
  height: number;
}

interface ShopifyPriceV2 {
  amount: string;
  currencyCode: string;
}

interface ShopifyVariant {
  id: string;
  title: string;
  sku: string | null;
  priceV2: ShopifyPriceV2;
  compareAtPriceV2: ShopifyPriceV2 | null;
  quantityAvailable: number | null;
  weight: number | null;
  weightUnit: string;
  availableForSale: boolean;
  selectedOptions: { name: string; value: string }[];
}

interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  tags: string[];
  productType: string;
  vendor: string;
  createdAt: string;
  updatedAt: string;
  featuredImage: ShopifyImage | null;
  images: {
    edges: { node: ShopifyImage }[];
  };
  variants: {
    edges: { node: ShopifyVariant }[];
  };
  collections: {
    edges: {
      node: {
        id: string;
        handle: string;
        title: string;
      };
    }[];
  };
}

interface ShopifyCollection {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: ShopifyImage | null;
  products: {
    edges: { node: { id: string } }[];
  };
}

interface ShopifyCartLineItem {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    priceV2: ShopifyPriceV2;
  };
}

interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalAmount: ShopifyPriceV2;
  lines: {
    edges: {
      node: ShopifyCartLineItem;
    }[];
  };
}

// ── Shopify sort keys mapping ─────────────────────────────────

type ShopifySortKey =
  | "BEST_SELLING"
  | "PRICE"
  | "TITLE"
  | "CREATED_AT"
  | "COLLECTION_DEFAULT"
  | "RELEVANCE";

interface SortMapping {
  key: ShopifySortKey;
  reverse: boolean;
}

function mapSortToShopify(sort: string): SortMapping {
  switch (sort) {
    case "price-asc":
      return { key: "PRICE", reverse: false };
    case "price-desc":
      return { key: "PRICE", reverse: true };
    case "name":
      return { key: "TITLE", reverse: false };
    case "newest":
      return { key: "CREATED_AT", reverse: true };
    case "rating":
      return { key: "BEST_SELLING", reverse: true };
    case "featured":
    default:
      return { key: "BEST_SELLING", reverse: false };
  }
}

// ── GraphQL query fragments ────────────────────────────────────

const IMAGE_FRAGMENT = `
  id
  url
  altText
  width
  height
`;

const VARIANT_FRAGMENT = `
  id
  title
  sku
  priceV2 { amount currencyCode }
  compareAtPriceV2 { amount currencyCode }
  quantityAvailable
  weight
  weightUnit
  availableForSale
  selectedOptions { name value }
`;

const PRODUCT_FRAGMENT = `
  id
  handle
  title
  description
  descriptionHtml
  tags
  productType
  vendor
  createdAt
  updatedAt
  featuredImage { ${IMAGE_FRAGMENT} }
  images(first: 20) { edges { node { ${IMAGE_FRAGMENT} } } }
  variants(first: 20) { edges { node { ${VARIANT_FRAGMENT} } } }
  collections(first: 5) { edges { node { id handle title } } }
`;

// ── Mapper: Shopify product → our Product type ────────────────

function mapShopifyProduct(sp: ShopifyProduct): Product {
  const firstVariant = sp.variants.edges[0]?.node;
  const images = sp.images.edges.map((edge) => edge.node.url);
  const collections = sp.collections.edges.map((edge) => edge.node);

  const primaryCollection = collections[0] || null;

  const isProfessional = sp.tags.some(
    (t) => t.toLowerCase() === "professional"
  );
  const isFeatured = sp.tags.some(
    (t) => t.toLowerCase() === "featured"
  );

  let usage = "general";
  if (isProfessional) {
    usage = "professional";
  }

  const variants = sp.variants.edges.map((edge) => ({
    id: edge.node.id,
    title: edge.node.title,
    price: parseFloat(edge.node.priceV2.amount),
    compareAtPrice: edge.node.compareAtPriceV2
      ? parseFloat(edge.node.compareAtPriceV2.amount)
      : null,
    sku: edge.node.sku,
    available: edge.node.availableForSale,
    options: edge.node.selectedOptions,
  }));

  return {
    id: sp.id,
    name: sp.title,
    slug: sp.handle,
    description: sp.description || null,
    content: sp.descriptionHtml || null,
    price: firstVariant ? parseFloat(firstVariant.priceV2.amount) : 0,
    comparePrice: firstVariant?.compareAtPriceV2
      ? parseFloat(firstVariant.compareAtPriceV2.amount)
      : null,
    costPrice: null,
    sku: firstVariant?.sku || null,
    barcode: null,
    stock: firstVariant?.quantityAvailable ?? 0,
    lowStock: 5,
    images: JSON.stringify(images),
    categoryId: primaryCollection?.id || null,
    tags: JSON.stringify(sp.tags),
    rating: 0,
    reviewCount: 0,
    usage,
    status: "active",
    featured: isFeatured,
    professional: isProfessional,
    variants: JSON.stringify(variants),
    weight: firstVariant?.weight ?? null,
    dimensions: null,
    createdAt: sp.createdAt,
    updatedAt: sp.updatedAt,
    category: primaryCollection
      ? {
          id: primaryCollection.id,
          name: primaryCollection.title,
          slug: primaryCollection.handle,
          description: null,
          image: null,
          icon: null,
          order: 0,
        }
      : undefined,
  };
}

// ── Mapper: Shopify collection → our Category type ────────────

function mapShopifyCollection(sc: ShopifyCollection, index: number): Category {
  return {
    id: sc.id,
    name: sc.title,
    slug: sc.handle,
    description: sc.description || null,
    image: sc.image?.url || null,
    icon: null,
    order: index,
    productCount: sc.products.edges.length,
  };
}

// ============================================================
// Public API functions
// ============================================================

interface GetProductsParams {
  query?: string;
  collectionHandle?: string;
  sort?: string;
  tags?: string[];
  page?: number;
  limit?: number;
  featured?: boolean;
  professional?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

interface GetProductsResult {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Check if Shopify is configured and available.
 */
export function isShopifyConfigured(): boolean {
  return getAuthMode() !== "none";
}

/**
 * Get the current auth mode for debugging/display.
 */
export function getShopifyAuthMode(): string {
  return getAuthMode();
}

/**
 * Test the Shopify connection and return diagnostic info.
 */
export async function testShopifyConnection(): Promise<{
  connected: boolean;
  authMode: string;
  shop?: string;
  error?: string;
  tokenScope?: string;
}> {
  const mode = getAuthMode();

  if (mode === "none") {
    return {
      connected: false,
      authMode: "none",
      error: "No Shopify credentials configured. Set SHOPIFY_SHOP + SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET (Dev Dashboard) or SHOPIFY_SHOP + SHOPIFY_STOREFRONT_TOKEN (legacy).",
    };
  }

  try {
    if (mode === "client-credentials") {
      const token = await getAccessToken();
      const shopDomain = SHOPIFY_SHOP.includes(".myshopify.com")
        ? SHOPIFY_SHOP
        : `${SHOPIFY_SHOP}.myshopify.com`;

      // Test with a simple products query via Admin API
      await adminFetch<{
        products: { edges: { node: { id: string } }[] };
      }>(`
        query {
          products(first: 1) {
            edges { node { id } }
          }
        }
      `);

      return {
        connected: true,
        authMode: "client-credentials",
        shop: shopDomain,
        tokenScope: tokenCache?.scope,
      };
    }

    // Legacy storefront token mode
    const shopDomain = SHOPIFY_SHOP.includes(".myshopify.com")
      ? SHOPIFY_SHOP
      : `${SHOPIFY_SHOP}.myshopify.com`;

    await storefrontFetch<{
      products: { edges: { node: { id: string } }[] };
    }>(`
      query {
        products(first: 1) {
          edges { node { id } }
        }
      }
    `);

    return {
      connected: true,
      authMode: "storefront-token",
      shop: shopDomain,
    };
  } catch (error) {
    return {
      connected: false,
      authMode: mode,
      shop: SHOPIFY_SHOP,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Fetch products from Shopify with filtering, sorting, and pagination.
 * Uses the Storefront API for product browsing (works with both auth modes).
 */
export async function shopifyGetProducts(
  params: GetProductsParams = {}
): Promise<GetProductsResult> {
  const {
    query = "",
    collectionHandle = "",
    sort = "featured",
    tags = [],
    page = 1,
    limit = 12,
    featured = false,
    professional = false,
    minPrice = 0,
    maxPrice = 999999,
  } = params;

  const { key: sortKey, reverse } = mapSortToShopify(sort);
  const skip = (page - 1) * limit;

  // Build tag filter
  const allTags = [...tags];
  if (featured) allTags.push("featured");
  if (professional) allTags.push("professional");

  if (collectionHandle) {
    const collectionQuery = `
      query CollectionProducts($handle: String!, $first: Int!, $after: String, $sortKey: ProductCollectionSortKeys!, $reverse: Boolean!, $query: String) {
        collection(handle: $handle) {
          products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse, query: $query) {
            pageInfo { hasNextPage hasPreviousPage endCursor startCursor }
            edges { cursor node { ${PRODUCT_FRAGMENT} } }
          }
        }
      }
    `;

    const queryStringParts: string[] = [];
    if (query) queryStringParts.push(query);
    allTags.forEach((tag) => queryStringParts.push(`tag:${tag}`));
    const queryString = queryStringParts.length > 0 ? queryStringParts.join(" AND ") : undefined;

    const fetchLimit = Math.min(limit * 3, 250);

    const data = await storefrontFetch<{
      collection: {
        products: {
          edges: { cursor: string; node: ShopifyProduct }[];
        };
      } | null;
    }>(collectionQuery, {
      handle: collectionHandle,
      first: fetchLimit,
      sortKey,
      reverse,
      query: queryString,
    });

    if (!data?.collection) {
      return { products: [], total: 0, page, totalPages: 0 };
    }

    let products = data.collection.products.edges.map((e) =>
      mapShopifyProduct(e.node)
    );

    if (minPrice > 0 || maxPrice < 999999) {
      products = products.filter(
        (p) => p.price >= minPrice && p.price <= maxPrice
      );
    }

    const total = products.length;
    const paged = products.slice(skip, skip + limit);

    return {
      products: paged,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Query all products (or filtered by search/tags)
  const productsQuery = `
    query Products($first: Int!, $after: String, $sortKey: ProductSortKeys!, $reverse: Boolean!, $query: String) {
      products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse, query: $query) {
        pageInfo { hasNextPage hasPreviousPage endCursor startCursor }
        edges { cursor node { ${PRODUCT_FRAGMENT} } }
      }
    }
  `;

  const queryStringParts: string[] = [];
  if (query) queryStringParts.push(query);
  allTags.forEach((tag) => queryStringParts.push(`tag:${tag}`));
  const queryString = queryStringParts.length > 0 ? queryStringParts.join(" AND ") : undefined;

  const fetchLimit = Math.min(limit * 3, 250);

  const data = await storefrontFetch<{
    products: {
      edges: { cursor: string; node: ShopifyProduct }[];
    };
  }>(productsQuery, {
    first: fetchLimit,
    sortKey,
    reverse,
    query: queryString,
  });

  let products = data.products.edges.map((e) => mapShopifyProduct(e.node));

  if (minPrice > 0 || maxPrice < 999999) {
    products = products.filter(
      (p) => p.price >= minPrice && p.price <= maxPrice
    );
  }

  const total = products.length;
  const paged = products.slice(skip, skip + limit);

  return {
    products: paged,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a single product by its handle (slug).
 */
export async function shopifyGetProductByHandle(
  handle: string
): Promise<Product | null> {
  const query = `
    query ProductByHandle($handle: String!) {
      product(handle: $handle) {
        ${PRODUCT_FRAGMENT}
      }
    }
  `;

  const data = await storefrontFetch<{
    product: ShopifyProduct | null;
  }>(query, { handle });

  if (!data?.product) return null;

  return mapShopifyProduct(data.product);
}

/**
 * Get all collections (mapped to categories).
 */
export async function shopifyGetCollections(): Promise<Category[]> {
  const query = `
    query Collections($first: Int!) {
      collections(first: $first) {
        edges {
          node {
            id
            handle
            title
            description
            image { ${IMAGE_FRAGMENT} }
            products(first: 1) { edges { node { id } } }
          }
        }
      }
    }
  `;

  const data = await storefrontFetch<{
    collections: {
      edges: { node: ShopifyCollection }[];
    };
  }>(query, { first: 50 });

  return data.collections.edges.map((edge, index) =>
    mapShopifyCollection(edge.node, index)
  );
}

/**
 * Search products by query string.
 */
export async function shopifySearchProducts(
  q: string,
  limit: number = 10
): Promise<{ products: Product[]; total: number }> {
  if (!q || q.length < 2) {
    return { products: [], total: 0 };
  }

  const query = `
    query SearchProducts($query: String!, $first: Int!) {
      products(first: $first, query: $query, sortKey: RELEVANCE) {
        edges {
          node { ${PRODUCT_FRAGMENT} }
        }
      }
    }
  `;

  const data = await storefrontFetch<{
    products: {
      edges: { node: ShopifyProduct }[];
    };
  }>(query, { query: q, first: limit });

  const products = data.products.edges.map((e) => mapShopifyProduct(e.node));

  return {
    products,
    total: products.length,
  };
}

/**
 * Create a Shopify Cart with line items.
 */
export async function shopifyCreateCart(
  lineItems: { variantId: string; quantity: number }[]
): Promise<{
  id: string;
  webUrl: string;
}> {
  const mutation = `
    mutation CartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart {
          id
          checkoutUrl
          totalAmount { amount currencyCode }
          lines(first: 50) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    priceV2 { amount currencyCode }
                  }
                }
              }
            }
          }
        }
        userErrors {
          code
          field
          message
        }
      }
    }
  `;

  const cartLines = lineItems.map((item) => ({
    merchandiseId: item.variantId,
    quantity: item.quantity,
  }));

  const data = await storefrontFetch<{
    cartCreate: {
      cart: ShopifyCart | null;
      userErrors: { code: string; field: string[]; message: string }[];
    };
  }>(mutation, {
    input: { lines: cartLines },
  });

  if (data.cartCreate.userErrors.length > 0) {
    const messages = data.cartCreate.userErrors
      .map((e) => e.message)
      .join(", ");
    throw new Error(`Cart creation errors: ${messages}`);
  }

  const cart = data.cartCreate.cart;
  if (!cart) {
    throw new Error("Failed to create cart: no cart returned");
  }

  return {
    id: cart.id,
    webUrl: cart.checkoutUrl,
  };
}

/**
 * Get cart status by ID.
 */
export async function shopifyGetCart(
  cartId: string
): Promise<{
  id: string;
  webUrl: string;
  totalAmount: number;
  currency: string;
  lineItems: {
    id: string;
    title: string;
    quantity: number;
    price: number;
    variantId: string;
  }[];
}> {
  const query = `
    query Cart($id: ID!) {
      cart(id: $id) {
        id
        checkoutUrl
        totalAmount { amount currencyCode }
        lines(first: 50) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  priceV2 { amount currencyCode }
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await storefrontFetch<{
    cart: ShopifyCart | null;
  }>(query, { id: cartId });

  const cart = data.cart;
  if (!cart) {
    throw new Error("Cart not found");
  }

  return {
    id: cart.id,
    webUrl: cart.checkoutUrl,
    totalAmount: parseFloat(cart.totalAmount.amount),
    currency: cart.totalAmount.currencyCode,
    lineItems: cart.lines.edges.map((edge) => ({
      id: edge.node.id,
      title: edge.node.merchandise.title,
      quantity: edge.node.quantity,
      price: parseFloat(edge.node.merchandise.priceV2.amount),
      variantId: edge.node.merchandise.id,
    })),
  };
}

/**
 * Get products by collection handle (convenience function).
 */
export async function shopifyGetProductsByCollection(
  collectionHandle: string,
  params: Omit<GetProductsParams, "collectionHandle"> = {}
): Promise<GetProductsResult> {
  return shopifyGetProducts({ ...params, collectionHandle });
}
