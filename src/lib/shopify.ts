import type { Product, Category } from "@/types";

// ============================================================
// Shopify Storefront API Client for CENPOD
// ============================================================

const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "";
const SHOPIFY_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN || "";
const API_VERSION = "2024-10";
const ENDPOINT = `https://${SHOPIFY_DOMAIN}/api/${API_VERSION}/graphql.json`;

// ── Types for Shopify API responses ──────────────────────────

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
    totalCount: number;
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

interface GraphQLResponse<T> {
  data?: T;
  errors?: { message: string; extensions?: Record<string, unknown> }[];
}

// ── Shopify sort keys mapping ────────────────────────────────

type ShopifySortKey =
  | "BEST_SELLING"
  | "PRICE"
  | "TITLE"
  | "CREATED_AT"
  | "COLLECTION_DEFAULT"
  | "RELEVANCE";

type ShopifySortDirection = "ASC" | "DESC";

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

// ── Core GraphQL fetch helper ────────────────────────────────

async function shopifyFetch<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  if (!SHOPIFY_DOMAIN || !SHOPIFY_TOKEN) {
    throw new Error(
      "Shopify configuration missing. Set NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN and NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN in .env.local"
    );
  }

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
  }

  const json: GraphQLResponse<T> = await response.json();

  if (json.errors && json.errors.length > 0) {
    const messages = json.errors.map((e) => e.message).join(", ");
    throw new Error(`Shopify GraphQL errors: ${messages}`);
  }

  return json.data as T;
}

// ── GraphQL query fragments ──────────────────────────────────

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

// ── Mapper: Shopify product → our Product type ───────────────

function mapShopifyProduct(sp: ShopifyProduct): Product {
  const firstVariant = sp.variants.edges[0]?.node;
  const images = sp.images.edges.map((edge) => edge.node.url);
  const collections = sp.collections.edges.map((edge) => edge.node);

  // Derive category from first collection
  const primaryCollection = collections[0] || null;

  // Derive flags from tags
  const isProfessional = sp.tags.some(
    (t) => t.toLowerCase() === "professional"
  );
  const isFeatured = sp.tags.some(
    (t) => t.toLowerCase() === "featured"
  );

  // Derive usage from tags
  let usage = "general";
  if (isProfessional) {
    usage = "professional";
  }

  // Build variants JSON
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

// ── Mapper: Shopify collection → our Category type ───────────

function mapShopifyCollection(sc: ShopifyCollection, index: number): Category {
  return {
    id: sc.id,
    name: sc.title,
    slug: sc.handle,
    description: sc.description || null,
    image: sc.image?.url || null,
    icon: null,
    order: index,
    productCount: sc.products.totalCount,
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
 * Fetch products from Shopify Storefront API with filtering, sorting, and pagination.
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
    // Query products within a specific collection
    const collectionQuery = `
      query CollectionProducts($handle: String!, $first: Int!, $after: String, $sortKey: ProductCollectionSortKeys!, $reverse: Boolean!, $query: String) {
        collection(handle: $handle) {
          products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse, query: $query) {
            totalCount
            pageInfo { hasNextPage hasPreviousPage endCursor startCursor }
            edges { cursor node { ${PRODUCT_FRAGMENT} } }
          }
        }
      }
    `;

    // Build product query string for tag filtering within collection
    const queryStringParts: string[] = [];
    if (query) queryStringParts.push(query);
    allTags.forEach((tag) => queryStringParts.push(`tag:${tag}`));
    const queryString = queryStringParts.length > 0 ? queryStringParts.join(" AND ") : undefined;

    // For collection queries, we need to handle pagination differently
    // Fetch enough products for the current page plus filtering
    const fetchLimit = Math.min(limit * 3, 250);

    const data = await shopifyFetch<{
      collection: {
        products: {
          totalCount: number;
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

    // Client-side price filtering (Shopify doesn't support price filter in Storefront API)
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
        totalCount
        pageInfo { hasNextPage hasPreviousPage endCursor startCursor }
        edges { cursor node { ${PRODUCT_FRAGMENT} } }
      }
    }
  `;

  // Build Shopify query string
  const queryStringParts: string[] = [];
  if (query) queryStringParts.push(query);
  allTags.forEach((tag) => queryStringParts.push(`tag:${tag}`));
  const queryString = queryStringParts.length > 0 ? queryStringParts.join(" AND ") : undefined;

  // Fetch enough to allow for client-side price filtering
  const fetchLimit = Math.min(limit * 3, 250);

  const data = await shopifyFetch<{
    products: {
      totalCount: number;
      edges: { cursor: string; node: ShopifyProduct }[];
    };
  }>(productsQuery, {
    first: fetchLimit,
    sortKey,
    reverse,
    query: queryString,
  });

  let products = data.products.edges.map((e) => mapShopifyProduct(e.node));

  // Client-side price filtering
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

  const data = await shopifyFetch<{
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
            products(first: 1) { totalCount }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch<{
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
        totalCount
        edges {
          node { ${PRODUCT_FRAGMENT} }
        }
      }
    }
  `;

  const data = await shopifyFetch<{
    products: {
      totalCount: number;
      edges: { node: ShopifyProduct }[];
    };
  }>(query, { query: q, first: limit });

  const products = data.products.edges.map((e) => mapShopifyProduct(e.node));

  return {
    products,
    total: data.products.totalCount,
  };
}

/**
 * Create a Shopify Cart with line items.
 * Uses the modern Cart API instead of the deprecated Checkout API.
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

  // Map lineItems to the CartLineInput format
  const cartLines = lineItems.map((item) => ({
    merchandiseId: item.variantId,
    quantity: item.quantity,
  }));

  const data = await shopifyFetch<{
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
 * Uses the modern Cart API instead of the deprecated Checkout API.
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

  const data = await shopifyFetch<{
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
 * Get products by collection handle (convenience function for category pages).
 */
export async function shopifyGetProductsByCollection(
  collectionHandle: string,
  params: Omit<GetProductsParams, "collectionHandle"> = {}
): Promise<GetProductsResult> {
  return shopifyGetProducts({ ...params, collectionHandle });
}
