import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, requireAdmin } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const order = await db.order.findUnique({
      where: { id },
      include: { items: true, user: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Customer can only see their own orders
    if (user.role !== "admin" && order.userId !== user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json({ error: "Error fetching order" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Only admins can update orders
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "No autorizado — se requiere rol de administrador" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const existingOrder = await db.order.findUnique({ where: { id } });
    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const existingTimeline = JSON.parse(existingOrder.timeline || "[]");
    const newTimelineEntry = {
      status: body.status || existingOrder.status,
      date: new Date().toISOString(),
      note: body.note || `Estado actualizado a ${body.status}`,
    };

    const updateData: Record<string, unknown> = {
      timeline: JSON.stringify([...existingTimeline, newTimelineEntry]),
    };

    if (body.status) updateData.status = body.status;
    if (body.trackingNumber) updateData.trackingNumber = body.trackingNumber;
    if (body.shippingMethod) updateData.shippingMethod = body.shippingMethod;
    if (body.paymentId) updateData.paymentId = body.paymentId;
    if (body.status === "processing") updateData.paidAt = new Date().toISOString();
    if (body.status === "shipped") updateData.shippedAt = new Date().toISOString();
    if (body.status === "delivered") updateData.deliveredAt = new Date().toISOString();

    const order = await db.order.update({
      where: { id },
      data: updateData,
      include: { items: true },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Error updating order" }, { status: 500 });
  }
}
