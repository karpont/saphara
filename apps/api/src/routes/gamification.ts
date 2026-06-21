import type { FastifyInstance } from "fastify";
import { prisma } from "../db/client";
import { requireAuth } from "./auth";
import { calcReferralReward } from "../services/referral-rewards";

const LEVEL_XP = (lvl: number) => Math.floor(100 * Math.pow(lvl, 1.6));
const xpToLevel = (xp: number) => {
  let lvl = 1;
  while (LEVEL_XP(lvl + 1) <= xp) lvl++;
  return lvl;
};

const LEVEL_TITLES: Record<number, string> = {
  1: "Newcomer", 2: "Explorer", 3: "Participant", 4: "Active Member", 5: "Content Creator",
  6: "Community Star", 7: "Regular", 8: "Influencer", 9: "Crypto Enthusiast", 10: "PART Supporter",
  15: "Rising Creator", 20: "Top Creator", 25: "Saphara Expert", 30: "Crypto Guru",
  40: "Legend", 50: "Saphara Legend",
};

function levelTitle(lvl: number) {
  const keys = Object.keys(LEVEL_TITLES).map(Number).sort((a, b) => b - a);
  for (const k of keys) { if (lvl >= k) return LEVEL_TITLES[k]; }
  return "Yeni Üye";
}

async function getOrCreateStats(userId: string) {
  const existing = await prisma.userStats.findUnique({ where: { userId } });
  if (existing) return existing;
  const code = Math.random().toString(36).slice(2, 8).toUpperCase();
  return prisma.userStats.create({
    data: { userId, referralCode: code },
  });
}

/** Seviye kilometre taşı ödülleri — düşürülmüş, gerçekten dağıtılan miktarlar. */
const LEVEL_MILESTONE_PART: Record<number, number> = { 5: 20, 20: 80, 30: 150 };

export async function addXp(userId: string, amount: number) {
  const stats = await getOrCreateStats(userId);
  const newXp = stats.xp + amount;
  const newLevel = xpToLevel(newXp);
  await prisma.userStats.update({
    where: { userId },
    data: { xp: newXp, level: newLevel },
  });

  let milestoneReward = 0;
  for (let lvl = stats.level + 1; lvl <= newLevel; lvl++) {
    if (LEVEL_MILESTONE_PART[lvl]) milestoneReward += LEVEL_MILESTONE_PART[lvl];
  }
  if (milestoneReward > 0) {
    await prisma.user.update({ where: { id: userId }, data: { earningsPart: { increment: milestoneReward } } });
  }

  return { xp: newXp, level: newLevel, levelUp: newLevel > stats.level, milestoneReward };
}

export async function registerGamificationRoutes(app: FastifyInstance) {

  /* ── Kullanıcı istatistikleri ── */
  app.get("/gamification/stats", async (req, reply) => {
    const userId = requireAuth(req, reply);
    if (!userId) return;
    const stats = await getOrCreateStats(userId);
    const level = xpToLevel(stats.xp);
    const thisLevelXp = LEVEL_XP(level);
    const nextLevelXp = LEVEL_XP(level + 1);
    return {
      xp: stats.xp, level,
      levelTitle: levelTitle(level),
      xpToNext: nextLevelXp - stats.xp,
      xpProgress: stats.xp - thisLevelXp,
      xpForLevel: nextLevelXp - thisLevelXp,
      loginStreak: stats.loginStreak,
      referralCode: stats.referralCode,
    };
  });

  /* ── Günlük giriş ödülü ── */
  app.post("/gamification/daily-login", async (req, reply) => {
    const userId = requireAuth(req, reply);
    if (!userId) return;
    const stats = await getOrCreateStats(userId);
    const now = new Date();
    const lastLogin = stats.lastLoginAt;
    const today = now.toDateString();

    if (lastLogin && lastLogin.toDateString() === today) {
      return reply.code(409).send({ error: "Daily reward already claimed today", streak: stats.loginStreak });
    }

    const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
    const isConsecutive = lastLogin && lastLogin.toDateString() === yesterday.toDateString();
    const newStreak = isConsecutive ? stats.loginStreak + 1 : 1;

    // Streak bonus: 7 günde bir 2x
    const partReward = newStreak % 7 === 0 ? 20 : (newStreak % 3 === 0 ? 10 : 5);
    const xpReward = newStreak % 7 === 0 ? 100 : 50;

    await prisma.userStats.update({
      where: { userId },
      data: { loginStreak: newStreak, lastLoginAt: now },
    });
    const xpResult = await addXp(userId, xpReward);

    // PART kazan
    await prisma.user.update({
      where: { id: userId },
      data: { earningsPart: { increment: partReward } },
    });

    return {
      streak: newStreak, partReward, xpReward,
      levelUp: xpResult.levelUp,
      newLevel: xpResult.level,
      message: newStreak % 7 === 0
        ? `🎉 ${newStreak} günlük seri! Büyük ödül: ${partReward} PART!`
        : `🔥 ${newStreak} günlük seri! ${partReward} PART kazandın!`,
    };
  });

  /* ── Görev listesi ── */
  app.get("/gamification/quests", async (req, reply) => {
    const userId = requireAuth(req, reply);
    if (!userId) return;
    const quests = await prisma.quest.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
    const progress = await prisma.userQuestProgress.findMany({
      where: { userId, questId: { in: quests.map(q => q.id) } },
    });
    const progressMap = new Map(progress.map(p => [p.questId, p]));
    return {
      quests: quests.map(q => {
        const p = progressMap.get(q.id);
        return { ...q, userProgress: p?.progress ?? 0, completed: p?.completed ?? false, claimed: !!p?.claimedAt };
      }),
    };
  });

  /* ── Görev ilerlemesi güncelle ── */
  app.post("/gamification/quests/:id/progress", async (req, reply) => {
    const userId = requireAuth(req, reply);
    if (!userId) return;
    const { id } = req.params as { id: string };
    const quest = await prisma.quest.findUnique({ where: { id } });
    if (!quest || !quest.active) return reply.code(404).send({ error: "Görev bulunamadı" });

    const existing = await prisma.userQuestProgress.findUnique({
      where: { userId_questId: { userId, questId: id } },
    });
    if (existing?.completed) return { alreadyCompleted: true };

    const newProgress = Math.min((existing?.progress ?? 0) + 1, quest.target);
    const completed = newProgress >= quest.target;

    await prisma.userQuestProgress.upsert({
      where: { userId_questId: { userId, questId: id } },
      update: { progress: newProgress, completed },
      create: { userId, questId: id, progress: newProgress, completed },
    });
    return { progress: newProgress, completed };
  });

  /* ── Görev ödülü al ── */
  app.post("/gamification/quests/:id/claim", async (req, reply) => {
    const userId = requireAuth(req, reply);
    if (!userId) return;
    const { id } = req.params as { id: string };
    const progress = await prisma.userQuestProgress.findUnique({
      where: { userId_questId: { userId, questId: id } },
      include: { quest: true },
    });
    if (!progress?.completed) return reply.code(400).send({ error: "Görev tamamlanmadı" });
    if (progress.claimedAt) return reply.code(409).send({ error: "Ödül zaten alındı" });

    await prisma.userQuestProgress.update({
      where: { userId_questId: { userId, questId: id } },
      data: { claimedAt: new Date() },
    });
    const xpResult = await addXp(userId, progress.quest.xpReward);
    if (Number(progress.quest.partReward) > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: { earningsPart: { increment: progress.quest.partReward } },
      });
    }
    return { claimed: true, xpReward: progress.quest.xpReward, partReward: progress.quest.partReward, levelUp: xpResult.levelUp };
  });

  /* ── Referral kodu kullan ── */
  app.post("/gamification/referral/use", async (req, reply) => {
    const userId = requireAuth(req, reply);
    if (!userId) return;
    const { code } = req.body as { code: string };
    if (!code) return reply.code(400).send({ error: "Kod gerekli" });

    const referrerStats = await prisma.userStats.findUnique({ where: { referralCode: code.toUpperCase() } });
    if (!referrerStats) return reply.code(404).send({ error: "Geçersiz referral kodu" });
    if (referrerStats.userId === userId) return reply.code(400).send({ error: "Kendi kodunuzu kullanamazsınız" });

    const myStats = await getOrCreateStats(userId);
    if (myStats.referredBy) return reply.code(409).send({ error: "Referral kodu zaten kullandınız" });

    await prisma.userStats.update({ where: { userId }, data: { referredBy: referrerStats.userId } });

    // Davet edenin kademeli ödülü (referral sayısına göre, USD değeri sabit)
    const priorCount = await prisma.userStats.count({ where: { referredBy: referrerStats.userId } });
    const referrerReward = await calcReferralReward(priorCount); // priorCount zaten bu kaydı dahil etti (update yukarıda)
    const joinerReward = Math.round((referrerReward / 2) * 100) / 100; // katılana yarı oranda hoş geldin ödülü

    await addXp(userId, 100);
    await addXp(referrerStats.userId, 200);
    await prisma.user.update({ where: { id: userId }, data: { earningsPart: { increment: joinerReward } } });
    await prisma.user.update({ where: { id: referrerStats.userId }, data: { earningsPart: { increment: referrerReward } } });

    return { success: true, xpEarned: 100, partEarned: joinerReward, referrerEarned: referrerReward };
  });

  /* ── Liderlik tablosu ── */
  app.get("/gamification/leaderboard", async () => {
    const DEMO = [
      { rank: 1,  xp: 98420, level: 42, levelTitle: "Saphara Legend",  handle: "saphara_official", name: "Saphara",       avatarUrl: `https://api.dicebear.com/9.x/bottts/svg?seed=saphara`,    verified: true  },
      { rank: 2,  xp: 74810, level: 35, levelTitle: "Legend",          handle: "crypto_guru",      name: "Kripto Guru",   avatarUrl: `https://api.dicebear.com/9.x/bottts/svg?seed=cg`,          verified: true  },
      { rank: 3,  xp: 61230, level: 30, levelTitle: "Crypto Guru",     handle: "nft_creator",      name: "NFT Creator",   avatarUrl: `https://api.dicebear.com/9.x/bottts/svg?seed=nft`,         verified: true  },
      { rank: 4,  xp: 52100, level: 27, levelTitle: "Saphara Expert",  handle: "defi_analyst",     name: "DeFi Analist",  avatarUrl: `https://api.dicebear.com/9.x/bottts/svg?seed=defi`,        verified: false },
      { rank: 5,  xp: 44890, level: 24, levelTitle: "Top Creator",     handle: "blockchain_dev",   name: "BChain Dev",    avatarUrl: `https://api.dicebear.com/9.x/bottts/svg?seed=bcd`,         verified: true  },
      { rank: 6,  xp: 38760, level: 21, levelTitle: "Top Creator",     handle: "part_defi",        name: "PART DeFi",     avatarUrl: `https://api.dicebear.com/9.x/bottts/svg?seed=pd`,          verified: false },
      { rank: 7,  xp: 29340, level: 18, levelTitle: "Rising Creator",  handle: "web3_artist",      name: "Web3 Sanatçı",  avatarUrl: `https://api.dicebear.com/9.x/bottts/svg?seed=wa`,          verified: false },
      { rank: 8,  xp: 22180, level: 15, levelTitle: "Rising Creator",  handle: "bnb_builder",      name: "BNB Builder",   avatarUrl: `https://api.dicebear.com/9.x/bottts/svg?seed=bb`,          verified: false },
      { rank: 9,  xp: 17450, level: 12, levelTitle: "PART Supporter",  handle: "dex_trader",       name: "DEX Trader",    avatarUrl: `https://api.dicebear.com/9.x/bottts/svg?seed=dt`,          verified: false },
      { rank: 10, xp: 13920, level: 10, levelTitle: "PART Supporter",  handle: "community_mod",    name: "Community Mod", avatarUrl: `https://api.dicebear.com/9.x/bottts/svg?seed=cm`,          verified: false },
    ];
    try {
      const top = await prisma.userStats.findMany({
        orderBy: { xp: "desc" },
        take: 20,
        include: { user: { select: { handle: true, name: true, avatarUrl: true, verified: true } } },
      });
      if (top.length > 0) {
        return {
          items: top.map((s, i) => ({
            rank: i + 1, xp: s.xp, level: s.level,
            levelTitle: levelTitle(s.level),
            handle: s.user.handle, name: s.user.name,
            avatarUrl: s.user.avatarUrl, verified: s.user.verified,
          })),
        };
      }
      return { items: DEMO, demo: true };
    } catch {
      return { items: DEMO, demo: true };
    }
  });
}
