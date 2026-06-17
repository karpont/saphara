import type { FastifyInstance } from "fastify";
import { prisma } from "../db/client";

/**
 * Owner (sahip) yetki kontrolu. Admin/bot paneline YALNIZCA ana hesap
 * (treasury cuzdani) erisebilir. Kimlik JWT'den gelir, adres treasury ile
 * eslesmek zorundadir.
 */

const OWNER_ADDRESS = (process.env.TREASURY_ADDRESS
  ?? process.env.NEXT_PUBLIC_TREASURY_ADDRESS
  ?? "0x55B26f8CD67632d7AF9a888c645054Ca76E53455").toLowerCase();

/** Korumali owner rotalari icin. userId yoksa 401, owner degilse 403. */
export async function requireOwner(req: any, reply: any): Promise<string | undefined> {
  const userId = req.userId as string;
  if (!userId) { reply.code(401).send({ error: "Giris gerekli" }); return undefined; }
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { walletAddress: true } });
  if (!user?.walletAddress || user.walletAddress.toLowerCase() !== OWNER_ADDRESS) {
    reply.code(403).send({ error: "Bu panel yalnizca platform sahibine aciktir" });
    return undefined;
  }
  return userId;
}

export function isOwnerAddress(address?: string): boolean {
  return !!address && address.toLowerCase() === OWNER_ADDRESS;
}
