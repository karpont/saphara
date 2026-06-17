import type { FastifyInstance } from "fastify";
export declare function verifyJwt(token: string): any | null;
export declare function registerAuthRoutes(app: FastifyInstance): Promise<void>;
/** Verify Bearer JWT on protected routes and attach userId to request. */
export declare function authPlugin(app: FastifyInstance): void;
/** Call from protected handlers. Returns userId or sends 401. */
export declare function requireAuth(req: any, reply: any): string | undefined;
