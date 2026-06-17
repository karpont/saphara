import { prisma } from "../db/client";
import { requireAuth } from "./auth";
/* ─────────────────── Havuz Tanımları ─────────────────────────── */
const POOLS = [
    {
        id: "flexible",
        name: "Esnek Staking",
        apyMin: 8, apyMax: 12, apyNum: 10,
        lockDays: 0, min: 100, max: 500000,
        tvl: 842000, stakers: 1240,
        badge: "Başlangıç", risk: "low",
        compound: true, earlyExitPenalty: 0,
        icon: "🐰",
        desc: "İstediğin zaman çekebilirsin. Düşük APY, tam esneklik.",
        allocPoint: 10,
    },
    {
        id: "30d",
        name: "30 Gün Staking",
        apyMin: 18, apyMax: 22, apyNum: 20,
        lockDays: 30, min: 500, max: 2000000,
        tvl: 2340000, stakers: 3100,
        badge: "Popüler", risk: "medium",
        compound: true, earlyExitPenalty: 30,
        icon: "🦊",
        desc: "30 gün kilitli. Daha yüksek ödül, orta vadeli yatırım.",
        allocPoint: 25,
    },
    {
        id: "90d",
        name: "90 Gün Staking",
        apyMin: 35, apyMax: 42, apyNum: 38,
        lockDays: 90, min: 1000, max: 5000000,
        tvl: 5120000, stakers: 2800,
        badge: "Yüksek Getiri", risk: "medium",
        compound: true, earlyExitPenalty: 30,
        icon: "🦁",
        desc: "En yüksek APY. Uzun vadeli inananlar için tasarlandı.",
        allocPoint: 50,
    },
    {
        id: "lp",
        name: "LP Farm (PART/BNB)",
        apyMin: 55, apyMax: 80, apyNum: 65,
        lockDays: 0, min: 50, max: 10000000,
        tvl: 1890000, stakers: 980,
        badge: "DeFi", risk: "high",
        compound: false, earlyExitPenalty: 0,
        icon: "🐼",
        desc: "PancakeSwap PART/BNB LP token'ı farm et. Impermanent loss riski var.",
        allocPoint: 15,
    },
];
/* ─────────────────── Tier Sistemi ───────────────────────────── */
// BSCPad/Kommunitas modelinden ilham — PART stake bakiyesine göre
const TIERS = [
    { name: "Bronz", minStake: 500, multiplier: 1, color: "#cd7f32", launchpadAlloc: true, guaranteed: false },
    { name: "Gümüş", minStake: 2000, multiplier: 4, color: "#94a3b8", launchpadAlloc: true, guaranteed: false },
    { name: "Altın", minStake: 5000, multiplier: 10, color: "#f0b429", launchpadAlloc: true, guaranteed: true },
    { name: "Elmas", minStake: 20000, multiplier: 40, color: "#a5f3fc", launchpadAlloc: true, guaranteed: true },
];
/* ─────────────────── Komisyon Dağıtımı ─────────────────────── */
// Tüm staking ödülleri platform gelirinden beslenir (fee revenue model)
const COMMISSION_SPLIT = {
    stakingRewardsPool: 0.55, // %55 → staking ödülleri
    treasury: 0.25, // %25 → hazine / operasyon
    buybackBurn: 0.15, // %15 → PART geri alım + yakma
    dao: 0.05, // %5  → DAO yönetim fonu
};
/* ─────────────────── APY Hesabı ─────────────────────────────── */
// APY = (1 + APR/365)^365 - 1  (günlük bileşik faiz)
function calcApy(aprDecimal) {
    return (Math.pow(1 + aprDecimal / 365, 365) - 1) * 100;
}
function estimatedReward(amount, apyNum, days) {
    return (amount * (apyNum / 100) * days) / 365;
}
/* ─────────────────── Erken Erişim Listesi ────────────────────── */
const NOTIFY_KEY = "staking_early_access_v1";
async function getNotifyList() {
    const rec = await prisma.platformSetting.findUnique({ where: { key: NOTIFY_KEY } });
    if (!rec)
        return [];
    try {
        return JSON.parse(rec.value);
    }
    catch {
        return [];
    }
}
async function saveNotifyList(list) {
    await prisma.platformSetting.upsert({
        where: { key: NOTIFY_KEY },
        update: { value: JSON.stringify(list) },
        create: { key: NOTIFY_KEY, value: JSON.stringify(list) },
    });
}
/* ─────────────────── Routes ─────────────────────────────────── */
export async function registerStakingRoutes(app) {
    /* GET /staking/pools — havuz bilgisi */
    app.get("/staking/pools", async () => {
        const totalAllocPoints = POOLS.reduce((s, p) => s + p.allocPoint, 0);
        return {
            pools: POOLS.map(p => ({
                ...p,
                poolWeight: ((p.allocPoint / totalAllocPoints) * 100).toFixed(1) + "%",
                exampleReward30d: estimatedReward(1000, p.apyNum, 30),
                exampleReward90d: estimatedReward(1000, p.apyNum, 90),
                exampleReward365d: estimatedReward(1000, p.apyNum, 365),
            })),
            active: false,
            message: "Staking yakında aktif! Smart contract CertiK audit devam ediyor.",
            commissionSplit: COMMISSION_SPLIT,
        };
    });
    /* GET /staking/tiers — tier bilgisi */
    app.get("/staking/tiers", async () => {
        return { tiers: TIERS };
    });
    /* GET /staking/stats — TVL + istatistikler */
    app.get("/staking/stats", async () => {
        const totalTvl = POOLS.reduce((a, p) => a + p.tvl, 0);
        const totalStakers = POOLS.reduce((a, p) => a + p.stakers, 0);
        const avgApy = Math.round(POOLS.reduce((a, p) => a + p.apyNum, 0) / POOLS.length);
        const notifyList = await getNotifyList();
        return {
            totalTvl,
            totalStakers,
            avgApy,
            active: false,
            earlyAccessCount: notifyList.length,
            commissionSplit: COMMISSION_SPLIT,
            auditStatus: {
                auditor: "CertiK",
                status: "in_progress",
                expected: "Q3 2025",
                badge: "https://certik.com",
            },
        };
    });
    /* GET /staking/calculate — ödül hesaplayıcı */
    app.get("/staking/calculate", async (req) => {
        const { amount, poolId, days } = req.query;
        const pool = POOLS.find(p => p.id === (poolId ?? "flexible"));
        if (!pool)
            return { error: "Geçersiz havuz" };
        const amt = Math.max(0, Number(amount ?? 1000));
        const d = Math.max(1, Math.min(Number(days ?? 30), 3650));
        const apy = pool.apyNum / 100;
        const apr = apy; // simplified — treat APY ≈ APR for display
        const simpleReward = estimatedReward(amt, pool.apyNum, d);
        const compoundReward = amt * (Math.pow(1 + apy / 365, d) - 1);
        return {
            pool: pool.name,
            amount: amt,
            days: d,
            apyPct: pool.apyNum,
            aprPct: Math.round(apr * 100 * 100) / 100,
            simpleReward: Math.round(simpleReward * 100) / 100,
            compoundReward: Math.round(compoundReward * 100) / 100,
            totalWithCompound: Math.round((amt + compoundReward) * 100) / 100,
        };
    });
    /* POST /staking/notify */
    app.post("/staking/notify", async (req, reply) => {
        const userId = requireAuth(req, reply);
        if (!userId)
            return;
        const list = await getNotifyList();
        if (list.includes(userId)) {
            return { ok: true, registered: true, alreadyRegistered: true, position: list.indexOf(userId) + 1, total: list.length };
        }
        list.push(userId);
        await saveNotifyList(list);
        return { ok: true, registered: true, alreadyRegistered: false, position: list.length, total: list.length };
    });
    /* DELETE /staking/notify */
    app.delete("/staking/notify", async (req, reply) => {
        const userId = requireAuth(req, reply);
        if (!userId)
            return;
        const filtered = (await getNotifyList()).filter(id => id !== userId);
        await saveNotifyList(filtered);
        return { ok: true, registered: false };
    });
    /* GET /staking/my-notify */
    app.get("/staking/my-notify", async (req, reply) => {
        const userId = requireAuth(req, reply);
        if (!userId)
            return;
        const list = await getNotifyList();
        const idx = list.indexOf(userId);
        return { registered: idx >= 0, position: idx >= 0 ? idx + 1 : null, total: list.length };
    });
    /* GET /staking/my-positions */
    app.get("/staking/my-positions", async (req, reply) => {
        const userId = requireAuth(req, reply);
        if (!userId)
            return;
        return { positions: [], active: false, message: "Staking yakında aktif olacak." };
    });
}
