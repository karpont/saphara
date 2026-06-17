import type { FastifyInstance } from "fastify";
import { rankFeed, type ContentSignals } from "@saphara/recommendation";
import { prisma } from "../db/client";
import { notify } from "./inbox";
import { requireAuth } from "./auth";
import { moderate } from "../services/moderation";

/** Bir Post'u oneri sinyallerine donusturur. */
function toSignals(post: { qualityScore: number; createdAt: Date }): ContentSignals {
  const ageHours = (Date.now() - post.createdAt.getTime()) / 3_600_000;
  return {
    affinity: 0.5,            // kisisel ilgi backend'de kullaniciya gore hesaplanir
    quality: post.qualityScore,
    freshnessHours: ageHours,
    alreadySeen: false,
    creatorDiversityPenalty: 0,
  };
}

/* Demo gönderiler — DB yokken gösterilir */
const DEMO_POSTS = [
  {
    id: "demo-1", text: "Saphara'ya hoş geldin! 🎉 Web3 sosyal platform deneyimini keşfet. PART token ile içerik üret, kazan ve toplulukla büyü. #Saphara #Web3 #PART",
    likes: 248, comments: 32, repostCount: 18, qualityScore: 0.95, mediaUrl: null, mediaUrls: [], poll: null,
    createdAt: new Date(Date.now() - 3_600_000).toISOString(),
    author: { handle: "saphara_official", name: "Saphara", avatarUrl: null, verified: true, walletAddress: null },
  },
  {
    id: "demo-2", text: "PART token staking havuzları yakında açılıyor! Esnek (%8–12 APY), 30 gün (%18–22) ve 90 gün (%35–42) seçenekleriyle kazanmaya başla. CertiK audit sürecinde. 🔐 #PARTToken #DeFi #BNBChain",
    likes: 189, comments: 24, repostCount: 41, qualityScore: 0.90, mediaUrl: null, mediaUrls: [], poll: null,
    createdAt: new Date(Date.now() - 7_200_000).toISOString(),
    author: { handle: "part_defi", name: "PART DeFi", avatarUrl: null, verified: true, walletAddress: null },
  },
  {
    id: "demo-3", text: "NFT koleksiyonumu Saphara'da listeledim! Her satıştan %5 royalty otomatik geliyor. ERC-2981 standardı ile yaratıcılar korunuyor. 🖼️ #NFT #CreatorEconomy",
    likes: 127, comments: 15, repostCount: 9, qualityScore: 0.82, mediaUrl: null, mediaUrls: [], poll: null,
    createdAt: new Date(Date.now() - 10_800_000).toISOString(),
    author: { handle: "nft_creator", name: "NFT Creator", avatarUrl: null, verified: false, walletAddress: null },
  },
  {
    id: "demo-4", text: "Saphara Reels'te yeni video paylaştım! Kripto piyasasındaki son gelişmeleri anlattım. Beğeni ve yorum için teşekkürler 🙏 #Kripto #BNB #PART",
    likes: 312, comments: 47, repostCount: 28, qualityScore: 0.88, mediaUrl: null, mediaUrls: [], poll: null,
    createdAt: new Date(Date.now() - 14_400_000).toISOString(),
    author: { handle: "crypto_guru", name: "Kripto Guru", avatarUrl: null, verified: false, walletAddress: null },
  },
  {
    id: "demo-5", text: "Launchpad IDO'su bu ay! Diamond tier (20.000 PART) sahipleri garantili allocation alıyor. Whitelist başvurusu için staking sayfasını ziyaret et. 🚀 #IDO #Launchpad",
    likes: 445, comments: 61, repostCount: 93, qualityScore: 0.93, mediaUrl: null, mediaUrls: [], poll: null,
    createdAt: new Date(Date.now() - 18_000_000).toISOString(),
    author: { handle: "saphara_official", name: "Saphara", avatarUrl: null, verified: true, walletAddress: null },
  },
];

export async function registerFeedRoutes(app: FastifyInstance) {
  // Akis: son gonderileri cek, oneri paketiyle sirala
  app.get("/feed", async (req) => {
    const { cursor, limit, scope } = req.query as { cursor?: string; limit?: string; scope?: string };
    const take = Math.min(Number(limit ?? 30), 50);
    const userId = (req as any).userId as string | undefined;

    try {
      // scope=following: sadece takip edilenlerin gonderileri
      let authorFilter = {};
      if (scope === "following" && userId) {
        const following = await prisma.follow.findMany({ where: { followerId: userId }, select: { followingId: true } });
        authorFilter = { authorId: { in: following.map((f) => f.followingId) } };
      }

      const posts = await prisma.post.findMany({
        take,
        where: authorFilter,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        orderBy: { createdAt: "desc" },
        include: { author: { select: { handle: true, name: true, avatarUrl: true, verified: true, walletAddress: true } }, poll: { include: { options: true } } },
      });

      const withSignals = posts.map((p) => ({
        ...p,
        creatorId: p.authorId,
        signals: toSignals(p),
      }));

      return {
        items: rankFeed(withSignals),
        nextCursor: posts.length === take ? posts[posts.length - 1].id : null,
      };
    } catch {
      // DB yokken demo içerik döndür
      return { items: cursor ? [] : DEMO_POSTS, nextCursor: null, demo: true };
    }
  });

  // Gonderi olustur
  app.post("/posts", async (req, reply) => {
    const userId = requireAuth(req, reply);
    if (!userId) return;

    const { text, mediaUrl, mediaUrls, mediaType } = req.body as {
      text?: string; mediaUrl?: string; mediaUrls?: string[]; mediaType?: "image" | "video";
    };
    const cleanText = text?.trim();
    if (!cleanText && !mediaUrl && !(mediaUrls?.length)) return reply.code(400).send({ error: "Boş gönderi" });

    if (cleanText) {
      const check = moderate(cleanText);
      if (!check.ok) return reply.code(422).send({ error: check.message, reason: check.reason });
    }

    const post = await prisma.post.create({
      data: { authorId: userId, text: cleanText ?? null, mediaUrl, mediaUrls: mediaUrls ?? [], mediaType },
    });
    return reply.code(201).send(post);
  });

  // Begeni (ve uretiye bildirim)
  app.post("/posts/:id/like", async (req) => {
    const { id } = req.params as { id: string };
    const post = await prisma.post.update({
      where: { id },
      data: { likes: { increment: 1 } },
      select: { id: true, likes: true, authorId: true },
    });
    await notify(post.authorId, "like", "Gonderini birisi begendi");
    return { id: post.id, likes: post.likes };
  });

  // Reel olustur (Studio'dan veya yuklemeden)
  app.post("/reels", async (req, reply) => {
    const userId = requireAuth(req, reply);
    if (!userId) return;
    const { videoUrl, caption, sound, posterUrl, durationSec } = req.body as any;
    if (!videoUrl) return reply.code(400).send({ error: "videoUrl gerekli" });
    const reel = await prisma.reel.create({
      data: { authorId: userId, videoUrl, caption, sound, posterUrl, durationSec },
    });
    return reply.code(201).send(reel);
  });

  // Reels akisi
  app.get("/reels", async () => {
    try {
      const reels = await prisma.reel.findMany({
        take: 30,
        orderBy: { createdAt: "desc" },
        include: { author: { select: { handle: true, name: true, avatarUrl: true, walletAddress: true } } },
      });
      return { items: reels };
    } catch {
      return { items: [], demo: true };
    }
  });
}
