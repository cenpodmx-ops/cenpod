import { NextResponse } from "next/server";
import { shopifySearchProducts } from "@/lib/shopify";
import { searchDemoProducts } from "@/lib/demo-data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";

    if (!q || q.length < 2) {
      return NextResponse.json({ products: [], total: 0 });
    }

    // Try Shopify first, fall back to demo data
    try {
      const result = await shopifySearchProducts(q, 10);

      return NextResponse.json(result, {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      });
    } catch (shopifyError) {
      console.warn(
        "Shopify unavailable, using demo search:",
        shopifyError instanceof Error ? shopifyError.message : shopifyError
      );

      // Fall back to demo data search
      const demoResult = searchDemoProducts(q, 10);

      return NextResponse.json(demoResult, {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      });
    }
  } catch (error) {
    console.error("Error searching products:", error);
    return NextResponse.json({ error: "Error searching" }, { status: 500 });
  }
}
