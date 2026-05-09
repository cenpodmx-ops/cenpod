import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Use NEON_DATABASE_URL as primary, then DATABASE_URL if it's PostgreSQL,
// falling back to the .env.local/.env value (which should be Neon PostgreSQL).
// This handles the case where the system DATABASE_URL points to SQLite.
function getDatabaseUrl(): string {
  const neonUrl = process.env.NEON_DATABASE_URL;
  if (neonUrl) return neonUrl;

  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && dbUrl.startsWith('postgresql://')) return dbUrl;

  // Last resort: try NEXT_PUBLIC_NEON_DATABASE_URL (set in .env.local)
  const publicNeonUrl = process.env.NEXT_PUBLIC_NEON_DATABASE_URL;
  if (publicNeonUrl) return publicNeonUrl;

  throw new Error('No valid PostgreSQL DATABASE_URL found. Set NEON_DATABASE_URL or DATABASE_URL to a PostgreSQL connection string.');
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
