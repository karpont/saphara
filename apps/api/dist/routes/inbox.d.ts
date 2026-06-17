import type { FastifyInstance } from "fastify";
export declare function registerInboxRoutes(app: FastifyInstance): Promise<void>;
export declare function notify(userId: string, kind: string, text: string): Promise<void>;
