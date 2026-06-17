import type { FastifyInstance } from "fastify";
import { prisma } from "../db/client";
import { requireAuth } from "./auth";

export async function registerPrivacyRoutes(app: FastifyInstance) {
  // KVKK: kullanici verisini JSON olarak indir
  app.get("/me/export", async (req, reply) => {
    const userId = requireAuth(req, reply);
    if (!userId) return;

    const [user, posts, follows, tips, notifications, reposts] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId },
        select: { id:true, handle:true, name:true, bio:true, avatarUrl:true,
                  walletAddress:true, verified:true, createdAt:true, earningsPart:true } }),
      prisma.post.findMany({ where: { authorId: userId },
        select: { id:true, text:true, mediaUrls:true, likes:true, createdAt:true } }),
      prisma.follow.findMany({ where: { followerId: userId },
        select: { followingId:true, createdAt:true } }),
      prisma.tip.findMany({ where: { fromId: userId },
        select: { toId:true, amount:true, token:true, txHash:true, createdAt:true } }),
      prisma.notification.findMany({ where: { userId },
        select: { kind:true, text:true, read:true, createdAt:true } }),
      prisma.repost.findMany({ where: { userId },
        select: { postId:true, createdAt:true } }),
    ]);

    reply.header("Content-Type", "application/json");
    reply.header("Content-Disposition", `attachment; filename="saphara-veri-${userId}.json"`);
    return { user, posts, follows, tips, notifications, reposts,
             exportedAt: new Date().toISOString(),
             platform: "Saphara", kvkk: "KVKK Madde 11(1)(e)" };
  });

  // KVKK: hesap silme talebi (30 gun soft-delete)
  app.post("/me/delete-request", async (req, reply) => {
    const userId = requireAuth(req, reply);
    if (!userId) return;

    await prisma.user.update({
      where: { id: userId },
      data: { deletionRequestedAt: new Date() },
    });
    return { message: "Hesabiniz 30 gun icinde kalici olarak silinecek.", scheduledAt: new Date() };
  });

  // KVKK: silme talebini iptal et
  app.delete("/me/delete-cancel", async (req, reply) => {
    const userId = requireAuth(req, reply);
    if (!userId) return;

    await prisma.user.update({
      where: { id: userId },
      data: { deletionRequestedAt: null },
    });
    return { message: "Hesap silme talebi iptal edildi." };
  });

  // Riza durumunu getir
  app.get("/privacy/consent", async (req, reply) => {
    const userId = requireAuth(req, reply);
    if (!userId) return;

    const consent = await prisma.consentRecord.findFirst({
      where: { userId },
      orderBy: { consentedAt: "desc" },
    });
    return consent ?? { analytics: false, marketing: false, consentedAt: null };
  });

  // Riza kaydet
  app.post("/privacy/consent", async (req, reply) => {
    const userId = requireAuth(req, reply);
    if (!userId) return;

    const { analytics = false, marketing = false } = req.body as { analytics?: boolean; marketing?: boolean };
    const ip = req.ip;

    const record = await prisma.consentRecord.create({
      data: { userId, analytics, marketing, ip },
    });
    return record;
  });
}
