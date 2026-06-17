import type { FastifyInstance } from "fastify";
import { prisma } from "../db/client";
import { requireOwner } from "./owner-guard";
import { generateReport } from "../services/sentinel";
import { getPartUsdRate, setPartUsdRate, PART_USD_FLOOR } from "../services/price";

/**
 * OWNER PANELI — yalnizca platform sahibine (treasury cuzdani) acik.
 * Gozcu bot raporu, PART fiyat yonetimi, moderasyon eylemleri.
 */
export async function registerOwnerRoutes(app: FastifyInstance) {
  // Sahip miyim? (frontend menu gosterimi icin)
  app.get("/owner/whoami", async (req) => {
    const userId = (req as any).userId;
    if (!userId) return { isOwner: false };
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { walletAddress: true } });
    const owner = (process.env.TREASURY_ADDRESS ?? process.env.NEXT_PUBLIC_TREASURY_ADDRESS ?? "")
      .toLowerCase();
    return { isOwner: !!user?.walletAddress && user.walletAddress.toLowerCase() === owner };
  });

  // GOZCU BOT RAPORU
  app.get("/owner/report", async (req, reply) => {
    const ownerId = await requireOwner(req, reply);
    if (!ownerId) return;
    return generateReport();
  });

  // PART FIYATI — oku (acik) / ayarla (owner)
  app.get("/price", async () => {
    const rate = await getPartUsdRate();
    return { partUsdRate: rate, floor: PART_USD_FLOOR };
  });

  app.post("/owner/price", async (req, reply) => {
    const ownerId = await requireOwner(req, reply);
    if (!ownerId) return;
    const { rate } = req.body as { rate: number };
    try {
      const result = await setPartUsdRate(Number(rate));
      return { ok: true, ...result };
    } catch (e) {
      return reply.code(400).send({ error: (e as Error).message });
    }
  });

  // MODERASYON — icerik kaldirma (onayli eylem)
  app.delete("/owner/posts/:id", async (req, reply) => {
    const ownerId = await requireOwner(req, reply);
    if (!ownerId) return;
    const { id } = req.params as { id: string };
    await prisma.post.delete({ where: { id } });
    return { ok: true, removed: id };
  });

  // MODERASYON — kullanici dogrulama rozeti ver/al
  app.post("/owner/users/:id/verify", async (req, reply) => {
    const ownerId = await requireOwner(req, reply);
    if (!ownerId) return;
    const { id } = req.params as { id: string };
    const { verified } = req.body as { verified: boolean };
    const u = await prisma.user.update({ where: { id }, data: { verified }, select: { id: true, verified: true } });
    return u;
  });

  // Kullanici listesi (moderasyon icin)
  app.get("/owner/users", async (req, reply) => {
    const ownerId = await requireOwner(req, reply);
    if (!ownerId) return;
    const users = await prisma.user.findMany({
      take: 50, orderBy: { createdAt: "desc" },
      select: { id: true, handle: true, name: true, verified: true, walletAddress: true, createdAt: true,
        _count: { select: { posts: true, followers: true } } },
    });
    return { users };
  });
}
