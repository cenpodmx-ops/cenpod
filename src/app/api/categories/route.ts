import { NextResponse } from "next/server";
import { shopifyGetCollections } from "@/lib/shopify";
import { demoCategories } from "@/lib/demo-data";

export async function GET() {
  try {
    // Try Shopify first, fall back to demo data
    try {
      const categories = await shopifyGetCollections();

      return NextResponse.json(categories, {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      });
    } catch (shopifyError) {
      console.warn(
        "Shopify unavailable, using demo categories:",
        shopifyError instanceof Error ? shopifyError.message : shopifyError
      );

      // Fall back to demo categories
      return NextResponse.json(demoCategories, {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      });
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Error fetching categories" },
      { status: 500 }
    );
  }
}
