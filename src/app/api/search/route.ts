import { NextResponse } from "next/server";
import { shopifySearchProducts } from "@/lib/shopify";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";

    if (!q || q.length < 2) {
      return NextResponse.json({ products: [], total: 0 });
    }

    const result = await shopifySearchProducts(q, 10);

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("Error searching products on Shopify:", error);
    return NextResponse.json({ error: "Error searching" }, { status: 500 });
  }
}
