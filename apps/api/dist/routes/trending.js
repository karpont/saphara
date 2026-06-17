import { prisma } from "../db/client";
/*
 * Trending skor formülü (TikTok/Reddit karma + velocity boost):
 *   score = (engagement × mediaBoost × velocityBoost × verifyBoost) / (ageHours + 2)^1.5
 *
 * velocity boost:
 *   ilk 2 saat  → ×2.0  (yeni içerik hızlı tırmanır)
 *   2-6 saat    → ×1.5
 *   6-12 saat   → ×1.2
 *   12h+        → ×1.0  (normal)
 *
 * media boost: video ×1.5 | audio ×1.2 | image ×1.1
 * verify boost: doğrulanmış ×1.1
 */
function velocityBoost(createdAt) {
    const ageHours = (Date.now() - createdAt.getTime()) / 3600000;
    if (ageHours < 2)
        return 2.0;
    if (ageHours < 6)
        return 1.5;
    if (ageHours < 12)
        return 1.2;
    return 1.0;
}
function trendScore(post) {
    const ageMs = Date.now() - post.createdAt.getTime();
    const ageHours = ageMs / 3600000;
    const gravity = Math.pow(ageHours + 2, 1.5);
    const engagementScore = post.likes +
        post.shares * 2 +
        post.comments * 3 +
        post.repostCount * 2.5 +
        post.saveCount * 2 +
        (post.views ?? 0) * 0.1 +
        (post.videoCompletion ?? 0) * 5;
    let boost = velocityBoost(post.createdAt);
    const mt = post.mediaType;
    if (mt === "video")
        boost *= 1.5;
    else if (mt === "audio")
        boost *= 1.2;
    else if (mt === "image")
        boost *= 1.1;
    if (post.author?.verified)
        boost *= 1.1;
    return (engagementScore * boost) / gravity;
}
export async function registerTrendingRoutes(app) {
    /* ── Trending gönderiler (time-decay scorlu) ─────────────────────── */
    app.get("/trending", async (req) => {
        const { limit = "10", window = "48" } = req.query;
        const take = Math.min(Number(limit), 50);
        const windowHrs = Math.min(Number(window), 168); // max 7 gün
        const [hashtags, rawPosts, trendingReels] = await Promise.all([
            /* Hashtag listesi: postCount'a göre sırala */
            prisma.hashtag.findMany({
                orderBy: { postCount: "desc" },
                take: 15,
                select: { id: true, tag: true, postCount: true },
            }),
            /* Son N saatteki gönderiler — score hesabı için geniş çek */
            prisma.post.findMany({
                where: { createdAt: { gte: new Date(Date.now() - windowHrs * 3600000) } },
                take: 200,
                include: {
                    author: { select: { handle: true, name: true, avatarUrl: true, verified: true } },
                    _count: { select: { commentList: true } },
                },
            }),
            /* Trending reels: views + likes */
            prisma.reel.findMany({
                where: { createdAt: { gte: new Date(Date.now() - windowHrs * 3600000) } },
                orderBy: [{ views: "desc" }, { likes: "desc" }],
                take: 10,
                include: { author: { select: { handle: true, name: true, avatarUrl: true, verified: true } } },
            }),
        ]);
        /* Skor hesapla ve sırala */
        const scored = rawPosts
            .map((p) => ({
            ...p,
            _trendScore: trendScore({
                ...p,
                comments: p._count.commentList,
                author: p.author,
            }),
        }))
            .sort((a, b) => b._trendScore - a._trendScore)
            .slice(0, take);
        /* Medya türüne göre kırılım */
        const breakdown = {
            video: scored.filter((p) => p.mediaType === "video").length,
            image: scored.filter((p) => p.mediaType === "image").length,
            text: scored.filter((p) => !p.mediaType).length,
        };
        return { hashtags, posts: scored, reels: trendingReels, breakdown, window: windowHrs };
    });
    /* ── Belirli zaman dilimi için trending özeti ──────────────────────── */
    app.get("/trending/summary", async () => {
        const hourAgo = new Date(Date.now() - 3600000);
        const dayAgo = new Date(Date.now() - 86400000);
        const [postsHour, postsDay, topHashtag, topReel] = await Promise.all([
            prisma.post.count({ where: { createdAt: { gte: hourAgo } } }),
            prisma.post.count({ where: { createdAt: { gte: dayAgo } } }),
            prisma.hashtag.findFirst({ orderBy: { postCount: "desc" }, select: { tag: true, postCount: true } }),
            prisma.reel.findFirst({
                orderBy: { views: "desc" },
                where: { createdAt: { gte: dayAgo } },
                select: { id: true, caption: true, views: true, likes: true },
            }),
        ]);
        return { postsLastHour: postsHour, postsLast24h: postsDay, topHashtag, topReel };
    });
}
/** Gonderi metnindeki hashtag'leri DB'ye kaydeder. */
export async function upsertHashtags(text, postId) {
    const tags = [...new Set((text.match(/#[\wÀ-ɏ]+/g) ?? []).map((t) => t.slice(1).toLowerCase()))];
    for (const tag of tags) {
        const ht = await prisma.hashtag.upsert({
            where: { tag },
            update: { postCount: { increment: 1 } },
            create: { tag, postCount: 1 },
        });
        await prisma.postHashtag.upsert({
            where: { postId_hashtagId: { postId, hashtagId: ht.id } },
            update: {},
            create: { postId, hashtagId: ht.id },
        });
    }
}
