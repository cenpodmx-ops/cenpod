import { NextResponse } from "next/server";
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

    const statusParam = searchParams.get("status") || "";
    const where: Record<string, unknown> = {};

    // If status=all, show all products (for admin); otherwise default to active only
    if (statusParam !== "all") {
      where.status = "active";
    }

    if (q) {
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
        { sku: { contains: q } },
      ];
    }

    if (category) {
      const categories = category.split(",");
      where.category = {
        slug: { in: categories },
      };
    }

    if (usage) {
      where.usage = { in: usage.split(",") };
    }

    if (featured) {
      where.featured = true;
    }

    if (professional) {
      where.professional = true;
    }

    where.price = { gte: minPrice, lte: maxPrice };

    let orderBy: Record<string, string> = {};
    switch (sort) {
      case "price-asc":
        orderBy = { price: "asc" };
        break;
      case "price-desc":
        orderBy = { price: "desc" };
        break;
      case "name":
        orderBy = { name: "asc" };
        break;
      case "newest":
        orderBy = { createdAt: "desc" };
        break;
      case "rating":
        orderBy = { rating: "desc" };
        break;
      default:
        orderBy = { featured: "desc" };
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: { category: true },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching products:", error);
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
