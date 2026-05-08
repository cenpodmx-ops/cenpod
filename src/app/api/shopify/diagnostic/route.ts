import { NextResponse } from "next/server";

export async function GET() {
  const SHOPIFY_SHOP = process.env.SHOPIFY_SHOP || "";
  const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CLIENT_ID || "";
  const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET || "";
  const SHOPIFY_STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN || "";

  const shopDomain = SHOPIFY_SHOP.includes(".myshopify.com")
    ? SHOPIFY_SHOP
    : `${SHOPIFY_SHOP}.myshopify.com`;

  const steps: { step: string; status: string; detail: string; data?: unknown }[] = [];

  // Step 1: Check env vars
  steps.push({
    step: "1. Environment Variables",
    status: SHOPIFY_SHOP && SHOPIFY_CLIENT_ID && SHOPIFY_CLIENT_SECRET ? "✅ OK" : "❌ MISSING",
    detail: `SHOPIFY_SHOP=${SHOPIFY_SHOP ? "✓" : "✗"} CLIENT_ID=${SHOPIFY_CLIENT_ID ? "✓" : "✗"} CLIENT_SECRET=${SHOPIFY_CLIENT_SECRET ? "✓" : "✗"} STOREFRONT_TOKEN=${SHOPIFY_STOREFRONT_TOKEN ? "✓" : "✗"}`,
    data: { shop: shopDomain, clientIdLength: SHOPIFY_CLIENT_ID.length, secretLength: SHOPIFY_CLIENT_SECRET.length },
  });

  // Step 2: Try client credentials grant
  try {
    const tokenUrl = `https://${shopDomain}/admin/oauth/access_token`;
    steps.push({ step: "2a. Request Admin Token", status: "⏳ Trying...", detail: `POST ${tokenUrl}` });

    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: SHOPIFY_CLIENT_ID,
        client_secret: SHOPIFY_CLIENT_SECRET,
        grant_type: "client_credentials",
      }),
    });

    const tokenText = await tokenResponse.text();

    if (!tokenResponse.ok) {
      steps[steps.length - 1] = {
        step: "2a. Request Admin Token",
        status: `❌ HTTP ${tokenResponse.status}`,
        detail: tokenText.substring(0, 500),
      };
    } else {
      const tokenData = JSON.parse(tokenText);
      const hasAccessToken = !!tokenData.access_token;
      steps[steps.length - 1] = {
        step: "2a. Request Admin Token",
        status: hasAccessToken ? "✅ OK" : "❌ No access_token",
        detail: `Got token. Scope: ${tokenData.scope || "none"}. Expires in: ${tokenData.expires_in || "unknown"}s`,
        data: { scope: tokenData.scope, expires_in: tokenData.expires_in, hasToken: hasAccessToken },
      };

      if (hasAccessToken) {
        const adminToken = tokenData.access_token;

        // Step 3: Try listing storefront access tokens via Admin REST API
        const listUrl = `https://${shopDomain}/admin/api/2025-01/storefront_access_tokens.json`;
        try {
          const listResponse = await fetch(listUrl, {
            method: "GET",
            headers: { "X-Shopify-Access-Token": adminToken },
          });
          const listText = await listResponse.text();

          if (!listResponse.ok) {
            steps.push({
              step: "3a. List Storefront Tokens",
              status: `❌ HTTP ${listResponse.status}`,
              detail: listText.substring(0, 500),
            });
          } else {
            const listData = JSON.parse(listText);
            const tokens: { id: number; access_token: string; title: string }[] =
              listData.storefront_access_tokens || [];
            steps.push({
              step: "3a. List Storefront Tokens",
              status: "✅ OK",
              detail: `Found ${tokens.length} storefront token(s)`,
              data: tokens.map(t => ({ id: t.id, title: t.title, tokenPreview: t.access_token.substring(0, 8) + "..." })),
            });

            if (tokens.length > 0) {
              const sfToken = tokens[0].access_token;

              // Step 4: Try Storefront API with the token
              const sfEndpoint = `https://${shopDomain}/api/2025-01/graphql.json`;
              try {
                const sfResponse = await fetch(sfEndpoint, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "X-Shopify-Storefront-Access-Token": sfToken,
                  },
                  body: JSON.stringify({
                    query: `{ products(first: 3) { edges { node { id title handle } } } }`,
                  }),
                });
                const sfText = await sfResponse.text();

                if (!sfResponse.ok) {
                  steps.push({
                    step: "4. Storefront API Query",
                    status: `❌ HTTP ${sfResponse.status}`,
                    detail: sfText.substring(0, 500),
                  });
                } else {
                  const sfData = JSON.parse(sfText);
                  if (sfData.errors) {
                    steps.push({
                      step: "4. Storefront API Query",
                      status: "❌ GraphQL Errors",
                      detail: sfData.errors.map((e: { message: string }) => e.message).join("; "),
                    });
                  } else {
                    const productCount = sfData.data?.products?.edges?.length || 0;
                    steps.push({
                      step: "4. Storefront API Query",
                      status: "✅ OK",
                      detail: `Found ${productCount} product(s)`,
                      data: sfData.data?.products?.edges?.map((e: { node: { id: string; title: string; handle: string } }) => ({
                        id: e.node.id,
                        title: e.node.title,
                        handle: e.node.handle,
                      })),
                    });
                  }
                }
              } catch (sfErr) {
                steps.push({
                  step: "4. Storefront API Query",
                  status: "❌ Network Error",
                  detail: sfErr instanceof Error ? sfErr.message : String(sfErr),
                });
              }
            } else {
              // Try creating a storefront token
              const createUrl = `https://${shopDomain}/admin/api/2025-01/storefront_access_tokens.json`;
              try {
                const createResponse = await fetch(createUrl, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "X-Shopify-Access-Token": adminToken,
                  },
                  body: JSON.stringify({
                    storefront_access_token: { title: "CENPOD Headless Storefront" },
                  }),
                });
                const createText = await createResponse.text();

                if (!createResponse.ok) {
                  steps.push({
                    step: "3b. Create Storefront Token",
                    status: `❌ HTTP ${createResponse.status}`,
                    detail: createText.substring(0, 500),
                  });
                } else {
                  const createData = JSON.parse(createText);
                  steps.push({
                    step: "3b. Create Storefront Token",
                    status: "✅ OK",
                    detail: "Created new storefront token",
                    data: { title: createData.storefront_access_token?.title },
                  });
                }
              } catch (createErr) {
                steps.push({
                  step: "3b. Create Storefront Token",
                  status: "❌ Error",
                  detail: createErr instanceof Error ? createErr.message : String(createErr),
                });
              }
            }
          }
        } catch (listErr) {
          steps.push({
            step: "3a. List Storefront Tokens",
            status: "❌ Error",
            detail: listErr instanceof Error ? listErr.message : String(listErr),
          });
        }

        // Step 5: Try Admin API directly
        const adminEndpoint = `https://${shopDomain}/admin/api/2025-01/graphql.json`;
        try {
          const adminResponse = await fetch(adminEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Shopify-Access-Token": adminToken,
            },
            body: JSON.stringify({
              query: `{ products(first: 3) { edges { node { id title handle } } } }`,
            }),
          });
          const adminText = await adminResponse.text();

          if (!adminResponse.ok) {
            steps.push({
              step: "5. Admin API Query",
              status: `❌ HTTP ${adminResponse.status}`,
              detail: adminText.substring(0, 500),
            });
          } else {
            const adminData = JSON.parse(adminText);
            if (adminData.errors) {
              steps.push({
                step: "5. Admin API Query",
                status: "❌ GraphQL Errors",
                detail: adminData.errors.map((e: { message: string }) => e.message).join("; "),
              });
            } else {
              const productCount = adminData.data?.products?.edges?.length || 0;
              steps.push({
                step: "5. Admin API Query",
                status: "✅ OK",
                detail: `Found ${productCount} product(s)`,
                data: adminData.data?.products?.edges?.map((e: { node: { id: string; title: string; handle: string } }) => ({
                  id: e.node.id,
                  title: e.node.title,
                  handle: e.node.handle,
                })),
              });
            }
          }
        } catch (adminErr) {
          steps.push({
            step: "5. Admin API Query",
            status: "❌ Error",
            detail: adminErr instanceof Error ? adminErr.message : String(adminErr),
          });
        }
      }
    }
  } catch (err) {
    steps.push({
      step: "2a. Request Admin Token",
      status: "❌ Network Error",
      detail: err instanceof Error ? err.message : String(err),
    });
  }

  return NextResponse.json({ shop: shopDomain, steps });
}
