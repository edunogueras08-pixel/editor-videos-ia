/**
 * Singleton de Prisma Client (Prisma 7 + better-sqlite3 adapter)
 * Evita abrir múltiples conexiones en desarrollo con hot-reload
 */
import { PrismaClient } from '@/app/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  // Extraer la ruta de fichero de DATABASE_URL (formato: "file:./prisma/dev.db")
  const rawUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db'
  const relativePath = rawUrl.replace(/^file:/, '')
  const absolutePath = path.resolve(process.cwd(), relativePath)

  const adapter = new PrismaBetterSqlite3({ url: absolutePath })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
