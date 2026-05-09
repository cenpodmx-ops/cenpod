import { NextResponse } from "next/server";
import { shopifyGetProductByHandle } from "@/lib/shopify";
import { db } from "@/lib/db";
import { getDemoProductBySlug } from "@/lib/demo-data";
import { requireAdmin } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Try Shopify first, fall back to demo data
    try {
      const product = await shopifyGetProductByHandle(slug);

      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(product, {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      });
    } catch (shopifyError) {
      console.warn(
        "Shopify unavailable, using demo data for product:",
        shopifyError instanceof Error ? shopifyError.message : shopifyError
      );

      // Fall back to demo data
      const demoProduct = getDemoProductBySlug(slug);

      if (!demoProduct) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(demoProduct, {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      });
    }
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Error fetching product" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "No autorizado — se requiere rol de administrador" }, { status: 403 });
    }

    const { slug } = await params;
    const body = await request.json();

    const product = await db.product.update({
      where: { slug },
      data: body,
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Error updating product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "No autorizado — se requiere rol de administrador" }, { status: 403 });
    }

    const { slug } = await params;
    await db.product.delete({ where: { slug } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Error deleting product" },
      { status: 500 }
    );
  }
}
