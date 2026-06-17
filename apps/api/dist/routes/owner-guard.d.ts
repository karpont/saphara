/** Korumali owner rotalari icin. userId yoksa 401, owner degilse 403. */
export declare function requireOwner(req: any, reply: any): Promise<string | undefined>;
export declare function isOwnerAddress(address?: string): boolean;
