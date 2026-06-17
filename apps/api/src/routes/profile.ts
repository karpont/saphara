import type { FastifyInstance } from "fastify";
import { prisma } from "../db/client";
import { notify } from "./inbox";
import { requireAuth } from "./auth";

const ALLOWED_IMAGE_EXTS = /\.(png|jpg|jpeg|gif|webp|svg)(\?.*)?$/i;

function validateImageUrl(url: string | undefined): string | undefined {
  if (!url) return url;
  try {
    const u = new URL(url);
    if (!["http:", "https:"].includes(u.protocol)) return undefined;
    // Uzantı kontrolü veya DiceBear / IPFS / S3/CDN kaynaklı URL
    const extOk   = ALLOWED_IMAGE_EXTS.test(u.pathname);
    const knownOk = u.hostname.endsWith("dicebear.com") ||
                    u.hostname.endsWith("ipfs.io") ||
                    u.hostname.includes("amazonaws.com") ||
                    u.hostname.includes("cloudflare") ||
                    u.hostname.includes("saphara");
    if (!extOk && !knownOk) return undefined;
    return url;
  } catch {
    return undefined;
  }
}

/** Profil ve takip uc noktalari (Prisma semasina bagli). */
export async function registerProfileRoutes(app: FastifyInstance) {
  // Profil getir
  app.get("/users/:handle", async (req, reply) => {
    const { handle } = req.params as { handle: string };
    const user = await prisma.user.findUnique({
      where: { handle },
      include: { _count: { select: { followers: true, following: true, posts: true } } },
    });
    if (!user) return reply.code(404).send({ error: "Kullanici bulunamadi" });
    return user;
  });

  // Takip et
  app.post("/follow/:id", async (req, reply) => {
    const followerId = requireAuth(req, reply);
    if (!followerId) return;
    const { id } = req.params as { id: string };
    if (id === followerId) return reply.code(400).send({ error: "Kendini takip edemezsin" });
    await prisma.follow.upsert({
      where: { followerId_followingId: { followerId, followingId: id } },
      create: { followerId, followingId: id },
      update: {},
    });
    await notify(id, "follow", "Yeni bir takipcin var");
    return { following: true };
  });

  // Profil guncelle (kendi profilin)
  app.patch("/me", async (req, reply) => {
    const userId = requireAuth(req, reply);
    if (!userId) return;
    const { name, bio, avatarUrl, coverUrl } = req.body as {
      name?: string; bio?: string; avatarUrl?: string; coverUrl?: string;
    };
    const data: any = {};
    if (name      !== undefined) data.name = name.slice(0, 50);
    if (bio       !== undefined) data.bio  = bio.slice(0, 300);
    if (coverUrl  !== undefined) data.coverUrl  = validateImageUrl(coverUrl);
    if (avatarUrl !== undefined) data.avatarUrl = validateImageUrl(avatarUrl);
    const user = await prisma.user.update({
      where: { id: userId }, data,
      select: { id: true, handle: true, name: true, bio: true, avatarUrl: true, coverUrl: true },
    });
    return user;
  });

  // Kendi bilgilerim
  app.get("/me", async (req, reply) => {
    const userId = requireAuth(req, reply);
    if (!userId) return;
    const user = await prisma.user.findUnique({ where: { id: userId },
      select: { id: true, handle: true, name: true, bio: true, avatarUrl: true, verified: true, walletAddress: true } });
    return user;
  });

  /* ── Mark onboarding complete ────────────────────────────────── */
  app.patch("/me/onboarded", async (req, reply) => {
    const userId = requireAuth(req, reply);
    if (!userId) return;
    await prisma.user.update({ where: { id: userId }, data: { isOnboarded: true } });
    return { ok: true };
  });

  // Takibi birak
  app.delete("/follow/:id", async (req, reply) => {
    const followerId = requireAuth(req, reply);
    if (!followerId) return;
    const { id } = req.params as { id: string };
    await prisma.follow.deleteMany({ where: { followerId, followingId: id } });
    return { following: false };
  });

  // Kullanicinin gonderileri (handle'a gore, sayfalanmis)
  app.get("/users/:handle/posts", async (req, reply) => {
    const { handle } = req.params as { handle: string };
    const { cursor, limit = "12" } = req.query as { cursor?: string; limit?: string };
    const take = Math.min(Number(limit), 50);

    const user = await prisma.user.findUnique({ where: { handle }, select: { id: true } });
    if (!user) return reply.code(404).send({ error: "Kullanici bulunamadi" });

    const posts = await prisma.post.findMany({
      where: { authorId: user.id },
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { createdAt: "desc" },
      include: { author: { select: { handle:true, name:true, avatarUrl:true, verified:true } } },
    });
    return { items: posts, nextCursor: posts.length === take ? posts[posts.length - 1]?.id ?? null : null };
  });

  // Kullanicinin reels'leri
  app.get("/users/:handle/reels", async (req, reply) => {
    const { handle } = req.params as { handle: string };
    const { cursor, limit = "12" } = req.query as { cursor?: string; limit?: string };
    const take = Math.min(Number(limit), 50);

    const user = await prisma.user.findUnique({ where: { handle }, select: { id: true } });
    if (!user) return reply.code(404).send({ error: "Kullanici bulunamadi" });

    const reels = await prisma.reel.findMany({
      where: { authorId: user.id },
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { createdAt: "desc" },
      include: { author: { select: { handle:true, name:true, avatarUrl:true, verified:true } } },
    });
    return { items: reels, nextCursor: reels.length === take ? reels[reels.length - 1]?.id ?? null : null };
  });

  // Takipciler listesi
  app.get("/users/:handle/followers", async (req, reply) => {
    const { handle } = req.params as { handle: string };
    const user = await prisma.user.findUnique({ where: { handle }, select: { id: true } });
    if (!user) return reply.code(404).send({ error: "Kullanici bulunamadi" });

    const follows = await prisma.follow.findMany({
      where: { followingId: user.id },
      take: 50,
      include: { follower: { select: { handle:true, name:true, avatarUrl:true, verified:true } } },
    });
    return { items: follows.map((f) => f.follower) };
  });

  // Takip edilenler listesi
  app.get("/users/:handle/following", async (req, reply) => {
    const { handle } = req.params as { handle: string };
    const user = await prisma.user.findUnique({ where: { handle }, select: { id: true } });
    if (!user) return reply.code(404).send({ error: "Kullanici bulunamadi" });

    const follows = await prisma.follow.findMany({
      where: { followerId: user.id },
      take: 50,
      include: { following: { select: { handle:true, name:true, avatarUrl:true, verified:true } } },
    });
    return { items: follows.map((f) => f.following) };
  });
}
