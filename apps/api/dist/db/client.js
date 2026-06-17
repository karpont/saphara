import { PrismaClient } from "@prisma/client";
/** Tekil Prisma client (hot-reload'da coklu baglanti onler). */
const globalForPrisma = globalThis;
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production")
    globalForPrisma.prisma = prisma;
