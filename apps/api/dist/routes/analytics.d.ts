import type { FastifyInstance } from "fastify";
/**
 * Creator analitik API — gerçek veritabanı verisi.
 * GET /analytics/me → kendi profilime ait son 30 günlük istatistikler.
 */
export declare function registerAnalyticsRoutes(app: FastifyInstance): Promise<void>;
