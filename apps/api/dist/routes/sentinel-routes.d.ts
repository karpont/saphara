import type { FastifyInstance } from "fastify";
export declare function isIPBlocked(ip: string): boolean;
export declare function registerSentinelRoutes(app: FastifyInstance): Promise<void>;
