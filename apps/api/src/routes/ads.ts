import type { FastifyInstance } from "fastify";

/**
 * Reklam route'ları artık ads-analytics.ts dosyasında.
 * Bu dosya geriye dönük uyumluluk için boş bırakıldı.
 */
export async function registerAdRoutes(_app: FastifyInstance) {
  // ads-analytics.ts tüm /ads/* route'larını kapsar
}
