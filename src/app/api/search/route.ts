import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";

    if (!q || q.length < 2) {
      return NextResponse.json({ products: [], total: 0 });
    }

    const products = await db.product.findMany({
      where: {
        status: "active",
        OR: [
          { name: { contains: q } },
          { description: { contains: q } },
          { sku: { contains: q } },
        ],
      },
      include: { category: true },
      take: 10,
      orderBy: { rating: "desc" },
    });

    return NextResponse.json({ products, total: products.length });
  } catch (error) {
    console.error("Error searching products:", error);
    return NextResponse.json({ error: "Error searching" }, { status: 500 });
  }
}
