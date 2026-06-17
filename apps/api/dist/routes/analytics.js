import { prisma } from "../db/client";
import { requireAuth } from "./auth";
/**
 * Creator analitik API — gerçek veritabanı verisi.
 * GET /analytics/me → kendi profilime ait son 30 günlük istatistikler.
 */
export async function registerAnalyticsRoutes(app) {
    app.get("/analytics/me", async (req, reply) => {
        const userId = requireAuth(req, reply);
        if (!userId)
            return;
        const now = new Date();
        const day30 = new Date(now.getTime() - 30 * 86400000);
        const day7 = new Date(now.getTime() - 7 * 86400000);
        // Toplam ve son 7 gün takipçi
        const [followers, followers7dAgo, posts, reels] = await Promise.all([
            prisma.follow.count({ where: { followingId: userId } }),
            prisma.follow.count({ where: { followingId: userId, createdAt: { lt: day7 } } }),
            prisma.post.findMany({ where: { authorId: userId, createdAt: { gte: day30 } }, select: { likes: true, comments: true, repostCount: true, createdAt: true } }),
            prisma.reel.findMany({ where: { authorId: userId, createdAt: { gte: day30 } }, select: { likes: true, views: true, createdAt: true } }),
        ]);
        const followerDelta7d = followers - followers7dAgo;
        // Son 30 günü gün bazında buckle et
        const buckets = {};
        for (let i = 29; i >= 0; i--) {
            const d = new Date(now.getTime() - i * 86400000);
            const key = d.toISOString().slice(0, 10);
            buckets[key] = { likes: 0, comments: 0, reposts: 0, views: 0 };
        }
        for (const p of posts) {
            const key = p.createdAt.toISOString().slice(0, 10);
            if (buckets[key]) {
                buckets[key].likes += p.likes;
                buckets[key].comments += p.comments;
                buckets[key].reposts += p.repostCount ?? 0;
            }
        }
        for (const r of reels) {
            const key = r.createdAt.toISOString().slice(0, 10);
            if (buckets[key]) {
                buckets[key].likes += r.likes;
                buckets[key].views += r.views;
            }
        }
        const series = Object.entries(buckets).map(([date, v]) => ({ date, ...v }));
        // Toplam gösterim tahmini (likes * 15 heurisitk; gerçekte bir impression table gerekir)
        const totalLikes = posts.reduce((s, p) => s + p.likes, 0) + reels.reduce((s, r) => s + r.likes, 0);
        const impressions = totalLikes * 15 + reels.reduce((s, r) => s + r.views, 0);
        // Kazanç (tips — toId = alıcı)
        const USDT_ADDR = (process.env.NEXT_PUBLIC_USDT_BSC_ADDRESS ?? "0x55d398326f99059fF775485246999027B3197955").toLowerCase();
        const PART_ADDR = (process.env.NEXT_PUBLIC_PART_TOKEN_ADDRESS ?? "").toLowerCase();
        const tips = await prisma.tip.findMany({ where: { toId: userId }, select: { amount: true, token: true } });
        const earningsPart = tips.filter((t) => t.token.toLowerCase() === PART_ADDR).reduce((s, t) => s + Number(t.amount), 0);
        const earningsUsdt = tips.filter((t) => t.token.toLowerCase() === USDT_ADDR).reduce((s, t) => s + Number(t.amount), 0);
        return {
            followers,
            followerDelta7d,
            impressions,
            totalLikes,
            earningsPart: Math.round(earningsPart),
            earningsUsdt: earningsUsdt.toFixed(2),
            series,
        };
    });
    // Takipçi büyüme serisi (son 30 gün, gün bazında yeni follow count)
    app.get("/analytics/followers", async (req, reply) => {
        const userId = requireAuth(req, reply);
        if (!userId)
            return;
        const day30 = new Date(Date.now() - 30 * 86400000);
        const follows = await prisma.follow.findMany({
            where: { followingId: userId, createdAt: { gte: day30 } },
            select: { createdAt: true },
        });
        const buckets = {};
        const now = new Date();
        for (let i = 29; i >= 0; i--) {
            const key = new Date(now.getTime() - i * 86400000).toISOString().slice(0, 10);
            buckets[key] = 0;
        }
        for (const f of follows) {
            const key = f.createdAt.toISOString().slice(0, 10);
            if (buckets[key] !== undefined)
                buckets[key]++;
        }
        return Object.entries(buckets).map(([date, count]) => ({ date, count }));
    });
}
