import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { products: { where: { status: "active" } } },
        },
      },
    });

    const categoriesWithCount = categories.map((cat) => ({
      ...cat,
      productCount: cat._count.products,
    }));

    return NextResponse.json(categoriesWithCount);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Error fetching categories" },
      { status: 500 }
    );
  }
}
