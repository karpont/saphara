import type { FastifyInstance } from "fastify";
export declare function addXp(userId: string, amount: number): Promise<{
    xp: number;
    level: number;
    levelUp: boolean;
}>;
export declare function registerGamificationRoutes(app: FastifyInstance): Promise<void>;
