import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: { items: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.order.count({ where }),
    ]);

    return NextResponse.json({ orders, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Error fetching orders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderNumber = `CEN-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 4).toUpperCase()}`;

    const order = await db.order.create({
      data: {
        orderNumber,
        userId: body.userId || null,
        subtotal: body.subtotal,
        shipping: body.shipping || 0,
        discount: body.discount || 0,
        total: body.total,
        shippingMethod: body.shippingMethod || null,
        shippingAddress: body.shippingAddress ? JSON.stringify(body.shippingAddress) : null,
        billingAddress: body.billingAddress ? JSON.stringify(body.billingAddress) : null,
        paymentMethod: body.paymentMethod || null,
        notes: body.notes || null,
        timeline: JSON.stringify([
          { status: "pending", date: new Date().toISOString(), note: "Pedido creado" },
        ]),
        items: {
          create: body.items.map((item: { name: string; price: number; quantity: number; image?: string; productId?: string; variant?: string }) => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image || null,
            productId: item.productId || null,
            variant: item.variant || null,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Error creating order" }, { status: 500 });
  }
}
