import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Ensure we use the Neon PostgreSQL URL, not the system DATABASE_URL (which may point to SQLite)
const NEON_URL = 'postgresql://neondb_owner:npg_uH2OXVe4FUTQ@ep-orange-night-apw408au.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require';

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL?.startsWith('postgresql://')
          ? process.env.DATABASE_URL
          : NEON_URL,
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
