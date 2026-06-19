import type { FastifyInstance } from "fastify";
import { prisma } from "../db/client";
import { requireAuth } from "./auth";
import { calcReferralReward } from "../services/referral-rewards";

export async function registerReferralRoutes(app: FastifyInstance) {

  /* ── My referral code ──────────────────────────────────────── */
  app.get("/referral/my", async (req, reply) => {
    const userId = requireAuth(req, reply);
    if (!userId) return;

    let stats = await prisma.userStats.findUnique({ where: { userId } });
    if (!stats) {
      stats = await prisma.userStats.create({
        data: {
          userId,
          referralCode: `REF-${userId.slice(-8).toUpperCase()}`,
        },
      });
    }

    const referrals = await prisma.referralEntry.findMany({
      where: { referrerId: userId },
      orderBy: { createdAt: "desc" },
      include: { referred: { select: { handle: true, name: true, avatarUrl: true, createdAt: true } } },
    });

    const totalEarned = referrals.filter(r => r.paid).reduce((s, r) => s + Number(r.rewardPart), 0);
    const pendingEarnings = referrals.filter(r => !r.paid).reduce((s, r) => s + Number(r.rewardPart), 0);

    return {
      referralCode: stats.referralCode,
      referralUrl: `https://saphara.io/join?ref=${stats.referralCode}`,
      totalReferrals: referrals.length,
      paidReferrals: referrals.filter(r => r.paid).length,
      totalEarned,
      pendingEarnings,
      referrals,
    };
  });

  /* ── Apply referral code on register ──────────────────────── */
  app.post("/referral/apply", async (req, reply) => {
    const userId = requireAuth(req, reply);
    if (!userId) return;

    const { referralCode } = req.body as { referralCode: string };
    if (!referralCode?.trim()) return reply.code(400).send({ error: "Referral kodu gerekli" });

    // Check if user already has a referrer
    const existing = await prisma.referralEntry.findUnique({ where: { referredId: userId } });
    if (existing) return reply.code(409).send({ error: "Zaten bir referral kodunuz var" });

    // Find referrer by code
    const referrerStats = await prisma.userStats.findUnique({
      where: { referralCode: referralCode.trim().toUpperCase() },
    });
    if (!referrerStats) return reply.code(404).send({ error: "Geçersiz referral kodu" });
    if (referrerStats.userId === userId) return reply.code(400).send({ error: "Kendi kodunuzu kullanamazsınız" });

    const priorCount = await prisma.referralEntry.count({ where: { referrerId: referrerStats.userId } });
    const rewardPart = await calcReferralReward(priorCount + 1);

    const entry = await prisma.referralEntry.create({
      data: {
        referrerId: referrerStats.userId,
        referredId: userId,
        rewardPart,
        source: referralCode,
      },
    });

    return reply.code(201).send({ ok: true, entry, reward: `${rewardPart} PART ödül beklemede` });
  });

  /* ── Claim pending referral rewards ───────────────────────── */
  app.post("/referral/claim", async (req, reply) => {
    const userId = requireAuth(req, reply);
    if (!userId) return;

    const unpaid = await prisma.referralEntry.findMany({
      where: { referrerId: userId, paid: false },
    });

    if (unpaid.length === 0) return reply.code(400).send({ error: "Bekleyen ödül yok" });

    const totalReward = unpaid.reduce((s, r) => s + Number(r.rewardPart), 0);

    await prisma.$transaction([
      prisma.referralEntry.updateMany({
        where: { referrerId: userId, paid: false },
        data: { paid: true, paidAt: new Date() },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { earningsPart: { increment: totalReward } },
      }),
    ]);

    return { ok: true, claimed: unpaid.length, totalReward, message: `${totalReward} PART ödülünüz hesabınıza eklendi!` };
  });

  /* ── Leaderboard ───────────────────────────────────────────── */
  app.get("/referral/leaderboard", async () => {
    const topReferrers = await prisma.referralEntry.groupBy({
      by: ["referrerId"],
      _count: { referrerId: true },
      _sum:   { rewardPart: true },
      orderBy: { _count: { referrerId: "desc" } },
      take: 20,
    });

    const userIds = topReferrers.map(r => r.referrerId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, handle: true, name: true, avatarUrl: true, verified: true },
    });

    const leaderboard = topReferrers.map((r, i) => {
      const user = users.find(u => u.id === r.referrerId);
      return {
        rank: i + 1,
        user,
        referralCount: r._count.referrerId,
        totalEarned: Number(r._sum.rewardPart ?? 0),
      };
    });

    return { leaderboard };
  });

  /* ── Global referral stats ─────────────────────────────────── */
  app.get("/referral/stats", async () => {
    const [total, paid, totalPart, tier1] = await Promise.all([
      prisma.referralEntry.count(),
      prisma.referralEntry.count({ where: { paid: true } }),
      prisma.referralEntry.aggregate({ _sum: { rewardPart: true }, where: { paid: true } }),
      calcReferralReward(1),
    ]);
    return {
      totalReferrals: total,
      paidReferrals: paid,
      totalPartDistributed: Number(totalPart._sum.rewardPart ?? 0),
      rewardPerReferral: tier1,
      tiers: [
        { range: "1-10",  usdTarget: 0.05 },
        { range: "11-20", usdTarget: 0.05 },
        { range: "21-40", usdTarget: 0.10 },
        { range: "41+",   usdTarget: 0.20 },
      ],
    };
  });
}
