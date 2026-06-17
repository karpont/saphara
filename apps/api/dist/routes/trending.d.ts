import type { FastifyInstance } from "fastify";
export declare function registerTrendingRoutes(app: FastifyInstance): Promise<void>;
/** Gonderi metnindeki hashtag'leri DB'ye kaydeder. */
export declare function upsertHashtags(text: string, postId: string): Promise<void>;
