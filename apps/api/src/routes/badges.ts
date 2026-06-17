import type { FastifyInstance } from "fastify";
import { prisma } from "../db/client";
import { requireAuth } from "./auth";

/** Kullanicinin aktivitesine gore rozet listesi doner */
export async function registerBadgeRoutes(app: FastifyInstance) {
  app.get("/badges/:handle", async (req, reply) => {
    const { handle } = req.params as { handle: string };
    const user = await prisma.user.findUnique({
      where: { handle },
      include: {
        _count: { select: { posts: true, followers: true, sentTips: true, reels: true } },
      },
    });
    if (!user) return reply.code(404).send({ error: "Kullanici bulunamadi" });

    const badges = computeBadges(user);
    return { badges };
  });

  // Kendi rozetlerim
  app.get("/me/badges", async (req, reply) => {
    const userId = requireAuth(req, reply);
    if (!userId) return;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: { select: { posts: true, followers: true, sentTips: true, reels: true } },
      },
    });
    if (!user) return reply.code(404).send({ error: "Kullanici bulunamadi" });

    return { badges: computeBadges(user) };
  });
}

interface Badge {
  id: string;
  label: string;
  emoji: string;
  description: string;
  earned: boolean;
}

function computeBadges(user: any): Badge[] {
  const posts     = user._count?.posts     ?? 0;
  const followers = user._count?.followers ?? 0;
  const tips      = user._count?.sentTips  ?? 0;
  const reels     = user._count?.reels     ?? 0;
  const earnings  = Number(user.earningsPart ?? 0);
  const isEarly   = new Date(user.createdAt) < new Date("2026-01-01");

  return [
    {
      id: "early_adopter",
      emoji: "🌟",
      label: "Erken Üye",
      description: "Saphara'nın ilk kullanıcılarından biri",
      earned: isEarly,
    },
    {
      id: "content_creator",
      emoji: "✍️",
      label: "İçerik Üreticisi",
      description: "10+ gönderi paylaştı",
      earned: posts >= 10,
    },
    {
      id: "viral_creator",
      emoji: "🔥",
      label: "Viral Yaratıcı",
      description: "100+ gönderi paylaştı",
      earned: posts >= 100,
    },
    {
      id: "rising_star",
      emoji: "⭐",
      label: "Yükselen Yıldız",
      description: "100+ takipçiye ulaştı",
      earned: followers >= 100,
    },
    {
      id: "influencer",
      emoji: "👑",
      label: "Fenomen",
      description: "1,000+ takipçiye ulaştı",
      earned: followers >= 1000,
    },
    {
      id: "mega_influencer",
      emoji: "💎",
      label: "Mega Fenomen",
      description: "10,000+ takipçiye ulaştı",
      earned: followers >= 10000,
    },
    {
      id: "reels_maker",
      emoji: "🎬",
      label: "Reels Ustası",
      description: "5+ Reels yayınladı",
      earned: reels >= 5,
    },
    {
      id: "tipper",
      emoji: "💸",
      label: "Destekçi",
      description: "5+ kez bahşiş gönderdi",
      earned: tips >= 5,
    },
    {
      id: "part_earner",
      emoji: "🪙",
      label: "PART Kazanıcı",
      description: "1,000+ PART kazandı",
      earned: earnings >= 1000,
    },
    {
      id: "verified",
      emoji: "✅",
      label: "Doğrulandı",
      description: "Kimliği platform tarafından doğrulandı",
      earned: user.verified === true,
    },
  ];
}
