import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

/**
 * GET /api/setup/admin
 * Check if the admin user exists in the database.
 * No authentication required — only returns a boolean.
 */
export async function GET() {
  try {
    const admin = await db.user.findUnique({
      where: { email: "admin@cenpod.mx" },
      select: { id: true },
    });

    return NextResponse.json({ exists: !!admin });
  } catch (error) {
    console.error("Admin check error:", error);
    return NextResponse.json(
      { error: "Error checking admin user" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/setup/admin
 * Create or update the admin user in the database.
 * Requires a secret that matches NEXTAUTH_SECRET for security.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { secret } = body;

    // Verify the secret matches NEXTAUTH_SECRET
    if (!secret || secret !== process.env.NEXTAUTH_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized: invalid or missing secret" },
        { status: 401 }
      );
    }

    // Hash the admin password with 12 salt rounds
    const hashedPassword = await bcrypt.hash("cenpod2024", 12);

    // Upsert the admin user
    const user = await db.user.upsert({
      where: { email: "admin@cenpod.mx" },
      update: {
        name: "Admin CENPOD",
        password: hashedPassword,
        role: "admin",
        provider: "credentials",
      },
      create: {
        email: "admin@cenpod.mx",
        name: "Admin CENPOD",
        password: hashedPassword,
        role: "admin",
        provider: "credentials",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return NextResponse.json({
      message: "Admin user seeded successfully",
      user,
    });
  } catch (error) {
    console.error("Admin seed error:", error);
    return NextResponse.json(
      { error: "Error seeding admin user" },
      { status: 500 }
    );
  }
}
