import { NextResponse } from "next/server";
import { testShopifyConnection, isShopifyConfigured, getShopifyAuthMode } from "@/lib/shopify";

export async function GET() {
  try {
    // Quick check without making API calls
    if (!isShopifyConfigured()) {
      return NextResponse.json({
        connected: false,
        authMode: "none",
        message: "No Shopify credentials configured. Using demo data.",
      });
    }

    // Full connection test
    const result = await testShopifyConnection();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        connected: false,
        authMode: getShopifyAuthMode(),
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
