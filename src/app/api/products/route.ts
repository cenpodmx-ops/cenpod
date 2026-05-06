import { NextResponse } from "next/server";
import { shopifyGetProducts } from "@/lib/shopify";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    const usage = searchParams.get("usage") || "";
    const minPrice = parseInt(searchParams.get("minPrice") || "0");
    const maxPrice = parseInt(searchParams.get("maxPrice") || "20000");
    const sort = searchParams.get("sort") || "featured";
    const featured = searchParams.get("featured") === "true";
    const professional = searchParams.get("professional") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    // Build tag filters from usage and flags
    const tags: string[] = [];
    if (featured) tags.push("featured");
    if (professional) tags.push("professional");
    if (usage) {
      usage.split(",").forEach((u) => {
        if (u.trim()) tags.push(u.trim());
      });
    }

    // Use the first category handle if filtering by category
    const collectionHandle = category ? category.split(",")[0] : undefined;

    const result = await shopifyGetProducts({
      query: q || undefined,
      collectionHandle,
      sort,
      tags: tags.length > 0 ? tags : undefined,
      page,
      limit,
      featured,
      professional,
      minPrice,
      maxPrice,
    });

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("Error fetching products from Shopify:", error);
    return NextResponse.json(
      { error: "Error fetching products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const product = await db.product.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        content: body.content,
        price: body.price,
        comparePrice: body.comparePrice,
        sku: body.sku,
        stock: body.stock,
        images: JSON.stringify(body.images || []),
        categoryId: body.categoryId,
        tags: JSON.stringify(body.tags || []),
        usage: body.usage || "general",
        featured: body.featured || false,
        professional: body.professional || false,
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Error creating product" },
      { status: 500 }
    );
  }
}
