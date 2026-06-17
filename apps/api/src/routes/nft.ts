import type { FastifyInstance } from "fastify";
import { prisma } from "../db/client";
import { requireAuth } from "./auth";

/* ─── Komisyon Yapısı (ERC-2981 + platform fee model) ─────────── */
const PLATFORM_COMMISSION = 0.025;       // %2.5 → platforma
const DEFAULT_ROYALTY     = 0.05;        // %5 varsayılan yaratıcı royaltisi
const MIN_ROYALTY         = 0.025;       // %2.5 minimum
const MAX_ROYALTY         = 0.10;        // %10 maksimum
const MINT_FEE_FIXED_PART = 5;          // Her mint için sabit 5 PART platform bedeli (whitelist'te yarıya indirilir)

/* Audit bilgisi */
const AUDIT_INFO = {
  auditor: "CertiK",
  status: "pending",
  expected: "Q3 2025",
  contractStandards: ["ERC-721", "ERC-2981 (Royalties)"],
  royaltySupport: "On-chain ERC-2981 royalty enforced at marketplace level",
};
const RARITY_WEIGHTS = [
  { rarity: "legendary", weight: 1 },
  { rarity: "epic",      weight: 4 },
  { rarity: "rare",      weight: 15 },
  { rarity: "uncommon",  weight: 30 },
  { rarity: "common",    weight: 50 },
];

function rollRarity(): string {
  const roll = Math.random() * 100;
  let cumulative = 0;
  for (const r of RARITY_WEIGHTS) {
    cumulative += r.weight;
    if (roll <= cumulative) return r.rarity;
  }
  return "common";
}

function generateAttributes(rarity: string): object[] {
  const backgrounds = ["Cosmic", "Forest", "Ocean", "Desert", "Neon", "Void", "Aurora"];
  const eyes       = ["Laser", "Diamond", "Normal", "Sleepy", "Wild", "Closed", "Glowing"];
  const accessories = ["Crown", "Glasses", "Hat", "None", "Chain", "Earring", "Mask"];
  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
  return [
    { trait_type: "Background", value: pick(backgrounds) },
    { trait_type: "Eyes",       value: pick(eyes)        },
    { trait_type: "Accessory",  value: pick(accessories) },
    { trait_type: "Rarity",     value: rarity            },
  ];
}

export async function registerNftRoutes(app: FastifyInstance) {

  /* ── Info & komisyon yapısı (public) ────────────────────────── */
  app.get("/nft/info", async () => {
    return {
      platformCommissionPct: PLATFORM_COMMISSION * 100,
      defaultRoyaltyPct:     DEFAULT_ROYALTY * 100,
      minRoyaltyPct:         MIN_ROYALTY * 100,
      maxRoyaltyPct:         MAX_ROYALTY * 100,
      mintFeeFixedPart:      MINT_FEE_FIXED_PART,
      mintFeeWhitelistPart:  MINT_FEE_FIXED_PART / 2,
      royaltyStandard:       "ERC-2981",
      auditInfo:             AUDIT_INFO,
      feeBreakdown: {
        example: "1000 PART satışta: %5 royalty (50 PART yaratıcı), %2.5 platform (23.75 PART), satıcı 926.25 PART alır",
      },
    };
  });

  /* ── List collections (public) ─────────────────────────────── */
  app.get("/nft/collections", async (req) => {
    const { status } = req.query as { status?: string };
    const collections = await prisma.nftCollection.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        creator: { select: { handle: true, name: true, avatarUrl: true, verified: true } },
        _count: { select: { tokens: true, whitelist: true } },
      },
    });
    return { collections };
  });

  /* ── Single collection ──────────────────────────────────────── */
  app.get("/nft/collections/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const col = await prisma.nftCollection.findUnique({
      where: { id },
      include: {
        creator: { select: { handle: true, name: true, avatarUrl: true, verified: true } },
        _count: { select: { tokens: true, whitelist: true } },
      },
    });
    if (!col) return reply.code(404).send({ error: "Collection not found" });
    return col;
  });

  /* ── Collection tokens (public gallery) ────────────────────── */
  app.get("/nft/collections/:id/tokens", async (req) => {
    const { id } = req.params as { id: string };
    const { limit = "24", offset = "0", listed } = req.query as any;
    const tokens = await prisma.nftToken.findMany({
      where: {
        collectionId: id,
        ...(listed === "true" ? { listed: true } : {}),
      },
      orderBy: { mintedAt: "desc" },
      take: Math.min(Number(limit), 100),
      skip: Number(offset),
      include: { owner: { select: { handle: true, name: true, avatarUrl: true } } },
    });
    return { tokens };
  });

  /* ── Check whitelist status ─────────────────────────────────── */
  app.get("/nft/collections/:id/whitelist", async (req, reply) => {
    const userId = requireAuth(req, reply);
    if (!userId) return;
    const { id } = req.params as { id: string };
    const entry = await prisma.nftWhitelist.findUnique({
      where: { collectionId_userId: { collectionId: id, userId } },
    });
    return {
      whitelisted: !!entry,
      slots: entry?.slots ?? 0,
      used: entry?.used ?? 0,
      remaining: entry ? entry.slots - entry.used : 0,
    };
  });

  /* ── Whitelist apply ────────────────────────────────────────── */
  app.post("/nft/collections/:id/whitelist/apply", async (req, reply) => {
    const userId = requireAuth(req, reply);
    if (!userId) return;
    const { id } = req.params as { id: string };
    const col = await prisma.nftCollection.findUnique({ where: { id } });
    if (!col) return reply.code(404).send({ error: "Collection not found" });
    if (col.status === "ended" || col.status === "soldout")
      return reply.code(400).send({ error: "Collection is no longer accepting whitelist applications" });

    const existing = await prisma.nftWhitelist.findUnique({
      where: { collectionId_userId: { collectionId: id, userId } },
    });
    if (existing) return reply.code(409).send({ error: "Already on whitelist", entry: existing });

    const entry = await prisma.nftWhitelist.create({
      data: { collectionId: id, userId, slots: 2, source: "application" },
    });
    return reply.code(201).send({ ok: true, entry, message: "Whitelist başvurunuz alındı! 2 mint hakkı kazandınız." });
  });

  /* ── MINT ───────────────────────────────────────────────────── */
  app.post("/nft/collections/:id/mint", async (req, reply) => {
    const userId = requireAuth(req, reply);
    if (!userId) return;
    const { id } = req.params as { id: string };
    const { quantity = 1, useWhitelist = false } = req.body as { quantity?: number; useWhitelist?: boolean };

    if (quantity < 1 || quantity > 5) return reply.code(400).send({ error: "Mint miktarı 1-5 arasında olmalı" });

    const col = await prisma.nftCollection.findUnique({ where: { id } });

    if (!col) return reply.code(404).send({ error: "Collection not found" });
    if (col.status !== "active") return reply.code(400).send({ error: "Mint şu an aktif değil" });
    if (col.minted + quantity > col.maxSupply) {
      return reply.code(400).send({ error: `Yalnızca ${col.maxSupply - col.minted} token kaldı` });
    }

    // Per-wallet limit check
    const alreadyMinted = await prisma.nftToken.count({ where: { collectionId: id, minterId: userId } });
    if (alreadyMinted + quantity > col.maxPerWallet) {
      return reply.code(400).send({ error: `Cüzdan başına maksimum ${col.maxPerWallet} mint hakkı` });
    }

    // Whitelist pricing check
    let pricePerToken = Number(col.mintPrice);
    if (useWhitelist) {
      const wl = await prisma.nftWhitelist.findUnique({
        where: { collectionId_userId: { collectionId: id, userId } },
      });
      if (!wl || wl.used + quantity > wl.slots)
        return reply.code(403).send({ error: "Whitelist hakkınız yetersiz" });
      pricePerToken = Number(col.whitelistPrice ?? col.mintPrice);

      await prisma.nftWhitelist.update({
        where: { collectionId_userId: { collectionId: id, userId } },
        data: { used: { increment: quantity } },
      });
    }

    const platformFee = (useWhitelist ? MINT_FEE_FIXED_PART / 2 : MINT_FEE_FIXED_PART) * quantity;
    const totalCost   = pricePerToken * quantity + platformFee;

    // Mint tokens
    const startId = col.minted + 1;
    const tokens = await prisma.$transaction(
      Array.from({ length: quantity }, (_, i) => {
        const tokenId = startId + i;
        const rarity  = rollRarity();
        const styles  = ["bottts", "adventurer", "lorelei", "bottts-neutral"];
        const style   = styles[tokenId % styles.length];
        const imageUrl = `https://api.dicebear.com/9.x/${style}/svg?seed=${col.symbol}-${tokenId}&size=200`;
        return prisma.nftToken.create({
          data: {
            tokenId,
            collectionId: id,
            ownerId: userId,
            minterId: userId,
            name: `${col.name} #${tokenId}`,
            description: `${col.name} koleksiyonundan #${tokenId} numaralı token`,
            imageUrl,
            rarity,
            attributes: generateAttributes(rarity) as any,
          },
        });
      })
    );

    await prisma.nftCollection.update({
      where: { id },
      data: {
        minted: { increment: quantity },
        status: col.minted + quantity >= col.maxSupply ? "soldout" : col.status,
      },
    });

    return reply.code(201).send({
      ok: true,
      tokens,
      pricePerToken,
      platformFee,
      totalCost,
      message: `${quantity} NFT başarıyla mint edildi! Toplam: ${totalCost} PART (${platformFee} PART platform bedeli dahil)`,
    });
  });

  /* ── My NFTs ────────────────────────────────────────────────── */
  app.get("/nft/my", async (req, reply) => {
    const userId = requireAuth(req, reply);
    if (!userId) return;
    const tokens = await prisma.nftToken.findMany({
      where: { ownerId: userId },
      orderBy: { mintedAt: "desc" },
      include: { collection: { select: { id: true, name: true, symbol: true, royaltyPct: true } } },
    });
    return { tokens };
  });

  /* ── List NFT for sale ──────────────────────────────────────── */
  app.post("/nft/tokens/:tokenId/list", async (req, reply) => {
    const userId = requireAuth(req, reply);
    if (!userId) return;
    const { tokenId } = req.params as { tokenId: string };
    const { price } = req.body as { price: number };

    if (!price || price <= 0) return reply.code(400).send({ error: "Geçerli fiyat girin" });

    const token = await prisma.nftToken.findUnique({ where: { id: tokenId } });
    if (!token) return reply.code(404).send({ error: "Token bulunamadı" });
    if (token.ownerId !== userId) return reply.code(403).send({ error: "Bu NFT size ait değil" });

    // Create marketplace listing for NFT
    const listing = await prisma.listing.create({
      data: {
        sellerId: userId,
        title: token.name,
        description: `${token.name} — Rarity: ${token.rarity}`,
        imageUrl: token.imageUrl,
        pricePart: price,
        category: "nft",
        commissionPct: 2.5,
        nftTokenId: tokenId,
      },
    });

    await prisma.nftToken.update({ where: { id: tokenId }, data: { listed: true, listingPrice: price } });

    return reply.code(201).send({ ok: true, listing });
  });

  /* ── Delist NFT ─────────────────────────────────────────────── */
  app.delete("/nft/tokens/:tokenId/list", async (req, reply) => {
    const userId = requireAuth(req, reply);
    if (!userId) return;
    const { tokenId } = req.params as { tokenId: string };

    const token = await prisma.nftToken.findUnique({ where: { id: tokenId } });
    if (!token || token.ownerId !== userId) return reply.code(403).send({ error: "Yetki yok" });

    await prisma.$transaction([
      prisma.nftToken.update({ where: { id: tokenId }, data: { listed: false, listingPrice: null } }),
      prisma.listing.deleteMany({ where: { nftTokenId: tokenId, sellerId: userId, status: "Listed" } }),
    ]);

    return { ok: true };
  });

  /* ── NFT marketplace (listed tokens) ───────────────────────── */
  app.get("/nft/marketplace", async (req) => {
    const { limit = "24", rarity, collection } = req.query as any;
    const tokens = await prisma.nftToken.findMany({
      where: {
        listed: true,
        ...(rarity ? { rarity } : {}),
        ...(collection ? { collectionId: collection } : {}),
      },
      orderBy: { listingPrice: "asc" },
      take: Math.min(Number(limit), 100),
      include: {
        owner: { select: { handle: true, name: true, avatarUrl: true } },
        collection: { select: { id: true, name: true, symbol: true, royaltyPct: true } },
      },
    });
    return { tokens };
  });

  /* ── Buy listed NFT ─────────────────────────────────────────── */
  app.post("/nft/tokens/:tokenId/buy", async (req, reply) => {
    const userId = requireAuth(req, reply);
    if (!userId) return;
    const { tokenId } = req.params as { tokenId: string };

    const token = await prisma.nftToken.findUnique({
      where: { id: tokenId },
      include: { collection: true },
    });
    if (!token) return reply.code(404).send({ error: "Token bulunamadı" });
    if (!token.listed) return reply.code(400).send({ error: "Bu NFT satışta değil" });
    if (token.ownerId === userId) return reply.code(400).send({ error: "Kendi NFT'nizi satın alamazsınız" });

    const price = Number(token.listingPrice ?? 0);

    /* ERC-2981: creator royalty — collection.royaltyPct stored as % (e.g. 5 = 5%) */
    const rawRoyaltyPct = Number((token.collection as any)?.royaltyPct ?? 0) / 100;
    const royaltyPct    = Math.min(MAX_ROYALTY, Math.max(MIN_ROYALTY, rawRoyaltyPct || DEFAULT_ROYALTY));
    const royaltyAmount = Math.round(price * royaltyPct * 100) / 100;
    const platformFee   = Math.round((price - royaltyAmount) * PLATFORM_COMMISSION * 100) / 100;
    const sellerReceives = Math.round((price - royaltyAmount - platformFee) * 100) / 100;
    const creatorId = (token.collection as any)?.creatorId as string | undefined;

    await prisma.$transaction([
      prisma.nftToken.update({
        where: { id: tokenId },
        data: { ownerId: userId, listed: false, listingPrice: null, soldAt: new Date(), salePrice: price },
      }),
      prisma.listing.updateMany({
        where: { nftTokenId: tokenId, status: "Listed" },
        data: { status: "Completed", buyerAddress: userId, soldAt: new Date() },
      }),
      prisma.user.update({ where: { id: token.ownerId }, data: { earningsPart: { increment: sellerReceives } } }),
      ...(creatorId && creatorId !== token.ownerId
        ? [prisma.user.update({ where: { id: creatorId }, data: { earningsPart: { increment: royaltyAmount } } })]
        : []),
    ]);

    return {
      ok: true,
      price,
      royaltyAmount,
      royaltyPct: Math.round(royaltyPct * 1000) / 10,
      platformFee,
      sellerReceives,
      message: `NFT satın alındı! ${price} PART ödendi. Yaratıcı royalty: ${royaltyAmount} PART, platform: ${platformFee} PART`,
    };
  });
}
