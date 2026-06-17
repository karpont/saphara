import type { FastifyInstance } from "fastify";
import { prisma } from "../db/client";
import { requireAuth } from "./auth";

/* ── İçerik filtreleme ─────────────────────────────────────────────────── */
const BANNED_KW = [
  "casino","gambling","kumarhane","porn","pornografi","seks","sex",
  "uyuşturucu","drug","silah","weapon","hack","exploit","scam",
  "dolandırıcı","phishing","ponzi","pump and dump",
];
function hasBanned(text?: string | null): string | null {
  if (!text) return null;
  const low = text.toLowerCase();
  for (const kw of BANNED_KW) { if (low.includes(kw)) return kw; }
  return null;
}

const MIN_BUDGET   = 10;
const MAX_BUDGET   = 10_000_000;
const MIN_BID      = 0.1;
const MAX_BID      = 10_000;
const VALID_OBJ    = ["awareness","traffic","conversions","creator_collab","engagement"];

/* ── Fiyatlandırma Yapısı ──────────────────────────────────────── */
// USDT fiyatları, PART ile %20 indirim

const PART_DISCOUNT_PCT = 20; // PART ödemelerde %20 indirim

// CPM = Cost Per Mille (1000 gösterim başına)
// CPC = Cost Per Click (tıklama başına)
const PRICING_MODEL = {
  cpm: {
    name: "CPM — 1000 Gösterim Başına",
    tiers: [
      { label: "Standart",  cpmUsdt: 3,  cpmPart: 2.4,  minImpressions: 10_000  },
      { label: "Premium",   cpmUsdt: 6,  cpmPart: 4.8,  minImpressions: 50_000  },
      { label: "Spotlight", cpmUsdt: 12, cpmPart: 9.6,  minImpressions: 200_000 },
    ],
  },
  cpc: {
    name: "CPC — Tıklama Başına",
    tiers: [
      { label: "Standart",  cpcUsdt: 0.15, cpcPart: 0.12, desc: "Genel akış tıklamaları"   },
      { label: "Hedefli",   cpcUsdt: 0.30, cpcPart: 0.24, desc: "İlgi alanı eşleşmeli"     },
      { label: "Kriptofan", cpcUsdt: 0.60, cpcPart: 0.48, desc: "Kripto ilgili kitleler"   },
    ],
  },
  durationPackages: [
    { days: 1,  label: "Günlük",   budgetMinUsdt: 20,   bonusImpressions: 0,     popular: false },
    { days: 7,  label: "Haftalık", budgetMinUsdt: 100,  bonusImpressions: 5_000, popular: true  },
    { days: 30, label: "Aylık",    budgetMinUsdt: 300,  bonusImpressions: 25_000,popular: false },
    { days: 90, label: "3 Aylık",  budgetMinUsdt: 750,  bonusImpressions: 80_000,popular: false },
  ],
  // Creator işbirliği komisyonu
  creatorCollabCommission: {
    platformPct:  15,  // Platform payı
    creatorPct:   85,  // Creator payı
    minBudgetUsdt: 50,
  },
};

export async function registerAdAnalyticsRoutes(app: FastifyInstance) {

  /* ── Fiyatlandırma bilgisi (public) ─────────────────────────────────── */
  app.get("/ads/pricing", async () => {
    return {
      ...PRICING_MODEL,
      partDiscountPct: PART_DISCOUNT_PCT,
      note: `PART ile ödeme yaparak %${PART_DISCOUNT_PCT} indirim kazanın! USDT eşdeğeri fiyatlardan daha avantajlı.`,
      partUsdtRate: 0.01,
      currencyOptions: ["PART (indirimli)", "USDT (standart)"],
    };
  });

  /* ── Reklam besleme (genel, kimlik doğrulama gerektirmez) ─────────────── */
  app.get("/ads/feed", async (req) => {
    const { limit } = req.query as { limit?: string };
    const take = Math.min(Number(limit ?? 3), 10);
    const now = new Date();
    const items = await prisma.campaign.findMany({
      where: {
        status: "active",
        budgetRemaining: { gt: "0" },
        OR: [{ startDate: null }, { startDate: { lte: now } }],
        AND: [{ OR: [{ endDate: null }, { endDate: { gte: now } }] }],
      },
      orderBy: { bidPart: "desc" },
      take,
      select: {
        id: true, name: true, headline: true, mediaUrl: true, cta: true,
        objective: true, impressions: true, clicks: true,
      },
    });
    return { items };
  });

  /* ── Kampanya listesi ────────────────────────────────────────────────── */
  app.get("/ads/campaigns", async (req, reply) => {
    const userId = requireAuth(req, reply);
    if (!userId) return;
    const items = await prisma.campaign.findMany({
      where: { advertiserId: userId },
      orderBy: { createdAt: "desc" },
      select: {
        id:true, name:true, objective:true, status:true,
        budgetPart:true, spentPart:true, budgetRemaining:true,
        impressions:true, clicks:true, createdAt:true,
        startDate:true, endDate:true, headline:true, mediaUrl:true, cta:true,
      },
    });
    return { items };
  });

  /* ── Kampanya oluştur ── tam validasyon ────────────────────────────── */
  app.post("/ads/campaigns", async (req, reply) => {
    const userId = requireAuth(req, reply);
    if (!userId) return;
    const b = req.body as any;

    if (!b.name?.trim())               return reply.code(400).send({ error: "Kampanya adı zorunlu" });
    if (!b.objective)                  return reply.code(400).send({ error: "Hedef zorunlu" });
    if (!VALID_OBJ.includes(b.objective)) return reply.code(400).send({ error: "Geçersiz hedef" });
    if (!b.budgetPart || !b.bidPart)   return reply.code(400).send({ error: "Bütçe ve teklif zorunlu" });

    const budget = Number(b.budgetPart);
    const bid    = Number(b.bidPart);
    if (!Number.isFinite(budget) || budget < MIN_BUDGET)
      return reply.code(400).send({ error: `Minimum bütçe ${MIN_BUDGET} PART` });
    if (budget > MAX_BUDGET)
      return reply.code(400).send({ error: `Maksimum bütçe ${MAX_BUDGET} PART` });
    if (!Number.isFinite(bid) || bid < MIN_BID)
      return reply.code(400).send({ error: `Minimum teklif ${MIN_BID} PART` });
    if (bid > MAX_BID || bid > budget)
      return reply.code(400).send({ error: "Geçersiz teklif değeri" });

    for (const field of [b.name, b.headline, b.cta]) {
      const found = hasBanned(field);
      if (found) return reply.code(400).send({ error: `İzin verilmeyen içerik: "${found}"` });
    }
    if (b.headline && b.headline.length > 80)
      return reply.code(400).send({ error: "Başlık 80 karakteri aşamaz" });
    if (b.mediaUrl) {
      try { new URL(b.mediaUrl); } catch { return reply.code(400).send({ error: "Geçersiz medya URL" }); }
    }

    const interests = Array.isArray(b.interests) ? b.interests.slice(0, 10) : [];
    const geo = Array.isArray(b.geo) ? b.geo.slice(0, 5) : (b.geo ? [b.geo] : []);

    const campaign = await prisma.campaign.create({
      data: {
        advertiserId: userId, name: b.name.trim(), objective: b.objective,
        budgetPart: String(budget), budgetRemaining: String(budget),
        bidPart: String(bid), interests, minFollowers: b.minFollowers ? Number(b.minFollowers) : null,
        geo, headline: b.headline?.trim() ?? null, mediaUrl: b.mediaUrl ?? null,
        cta: b.cta?.trim() ?? "Keşfet", status: "active",
        startDate: b.startDate ? new Date(b.startDate) : null,
        endDate:   b.endDate   ? new Date(b.endDate)   : null,
      },
    });
    return reply.code(201).send(campaign);
  });

  /* ── Tekil kampanya detayı + günlük analitik ───────────────────────── */
  app.get("/ads/campaigns/:id", async (req, reply) => {
    const userId = requireAuth(req, reply);
    if (!userId) return;
    const { id } = req.params as { id: string };
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        adImpressions: { orderBy: { createdAt: "desc" }, take: 100, select: { type:true, createdAt:true } },
      },
    });
    if (!campaign)                       return reply.code(404).send({ error: "Kampanya bulunamadı" });
    if (campaign.advertiserId !== userId) return reply.code(403).send({ error: "Yetkisiz" });

    const byDay: Record<string, { impressions: number; clicks: number }> = {};
    for (const imp of campaign.adImpressions) {
      const day = imp.createdAt.toISOString().slice(0, 10);
      if (!byDay[day]) byDay[day] = { impressions: 0, clicks: 0 };
      if (imp.type === "impression") byDay[day].impressions++;
      else if (imp.type === "click") byDay[day].clicks++;
    }
    const ctr = campaign.impressions > 0
      ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2) : "0.00";
    return { ...campaign, ctr: Number(ctr), byDay };
  });

  /* ── Durum değiştir (pause / resume / end) ─────────────────────────── */
  app.post("/ads/campaigns/:id/pause",  async (req, reply) => _setStatus(req, reply, "paused"));
  app.post("/ads/campaigns/:id/resume", async (req, reply) => _setStatus(req, reply, "active"));
  app.post("/ads/campaigns/:id/end",    async (req, reply) => _setStatus(req, reply, "ended"));

  /* ── Gösterim / tıklanma kaydet ────────────────────────────────────── */
  app.post("/ads/track/:id", async (req) => {
    const { id: campaignId } = req.params as { id: string };
    const { type = "impression", userId, postId } =
      req.body as { type?: string; userId?: string; postId?: string };
    await prisma.adImpression.create({ data: { campaignId, userId, postId, type } });
    if (type === "impression") {
      await prisma.campaign.update({ where: { id: campaignId }, data: { impressions: { increment: 1 } } });
    } else if (type === "click") {
      await prisma.campaign.update({ where: { id: campaignId }, data: { clicks: { increment: 1 } } });
    }
    return { tracked: true };
  });
}

async function _setStatus(req: any, reply: any, status: string) {
  const userId = requireAuth(req, reply);
  if (!userId) return;
  const { id } = req.params as { id: string };
  const c = await prisma.campaign.findUnique({ where: { id }, select: { advertiserId:true, status:true } });
  if (!c)                          return reply.code(404).send({ error: "Bulunamadı" });
  if (c.advertiserId !== userId)   return reply.code(403).send({ error: "Yetkisiz" });
  if (c.status === "ended")        return reply.code(400).send({ error: "Sonlanmış kampanya değiştirilemez" });
  await prisma.campaign.update({ where: { id }, data: { status } });
  return { status };
}
