import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

/**
 * GET /api/admin/metrics
 * Admin-only dashboard metrics.
 * Requires authenticated admin user.
 */
export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: "No autorizado — se requiere rol de administrador" },
        { status: 403 }
      );
    }

    // Get various metrics in parallel
    const [
      totalOrders,
      pendingOrders,
      totalProducts,
      lowStockProducts,
      totalRevenue,
      recentOrders,
      totalCustomers,
    ] = await Promise.all([
      db.order.count(),
      db.order.count({ where: { status: "pending" } }),
      db.product.count({ where: { status: "active" } }),
      db.product.count({
        where: {
          status: "active",
          stock: { lte: 5 },
        },
      }),
      db.order.aggregate({
        _sum: { total: true },
        where: { status: { in: ["processing", "shipped", "delivered"] } },
      }),
      db.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { items: true },
      }),
      db.user.count({ where: { role: "customer" } }),
    ]);

    // Calculate today's revenue
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayRevenue = await db.order.aggregate({
      _sum: { total: true },
      where: {
        status: { in: ["processing", "shipped", "delivered"] },
        createdAt: { gte: todayStart },
      },
    });

    // Revenue by day for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const ordersLast30Days = await db.order.findMany({
      where: {
        status: { in: ["processing", "shipped", "delivered"] },
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        createdAt: true,
        total: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Group revenue by day
    const revenueByDay: Record<string, number> = {};
    for (const order of ordersLast30Days) {
      const dayKey = order.createdAt.toISOString().split("T")[0];
      revenueByDay[dayKey] = (revenueByDay[dayKey] || 0) + order.total;
    }

    // Fill in missing days with 0
    const revenueChart = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayKey = date.toISOString().split("T")[0];
      const dayLabel = `${date.getDate()}/${date.getMonth() + 1}`;
      revenueChart.push({
        date: dayLabel,
        revenue: revenueByDay[dayKey] || 0,
      });
    }

    return NextResponse.json({
      metrics: {
        todayRevenue: todayRevenue._sum.total || 0,
        totalRevenue: totalRevenue._sum.total || 0,
        totalOrders,
        pendingOrders,
        totalProducts,
        lowStockProducts,
        totalCustomers,
      },
      revenueChart,
      recentOrders,
    });
  } catch (error) {
    console.error("Error fetching admin metrics:", error);
    return NextResponse.json(
      { error: "Error fetching metrics" },
      { status: 500 }
    );
  }
}
