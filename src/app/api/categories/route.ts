import { NextResponse } from "next/server";
import { shopifyGetCollections } from "@/lib/shopify";

export async function GET() {
  try {
    const categories = await shopifyGetCollections();

    return NextResponse.json(categories, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("Error fetching categories from Shopify:", error);
    return NextResponse.json(
      { error: "Error fetching categories" },
      { status: 500 }
    );
  }
}
