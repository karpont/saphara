import { prisma } from "../db/client";
import { requireAuth } from "./auth";
import { moderate } from "../services/moderation";
export async function registerCommunityRoutes(app) {
    /* ── Topluluk listesi ── */
    app.get("/communities", async (req) => {
        const { q } = req.query;
        const communities = await prisma.community.findMany({
            where: q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] } : {},
            orderBy: { memberCount: "desc" },
            take: 30,
            include: { creator: { select: { handle: true, name: true, avatarUrl: true } } },
        });
        return { items: communities };
    });
    /* ── Tek topluluk ── */
    app.get("/communities/:slug", async (req, reply) => {
        const { slug } = req.params;
        const community = await prisma.community.findUnique({
            where: { slug },
            include: {
                creator: { select: { handle: true, name: true, avatarUrl: true } },
                members: { include: { user: { select: { handle: true, name: true, avatarUrl: true, verified: true } } }, take: 20 },
            },
        });
        if (!community)
            return reply.code(404).send({ error: "Topluluk bulunamadı" });
        return community;
    });
    /* ── Topluluk oluştur ── */
    app.post("/communities", async (req, reply) => {
        const userId = requireAuth(req, reply);
        if (!userId)
            return;
        const { name, description, imageUrl, private: isPrivate } = req.body;
        if (!name?.trim())
            return reply.code(400).send({ error: "İsim gerekli" });
        const check = moderate(name + " " + (description ?? ""));
        if (!check.ok)
            return reply.code(422).send({ error: check.message });
        const slug = name.toLowerCase().replace(/[^a-z0-9ğüşıöçğüşıöç]/gi, "-").replace(/-+/g, "-").slice(0, 50)
            + "-" + Math.random().toString(36).slice(2, 6);
        const community = await prisma.community.create({
            data: {
                name: name.trim(), slug, description: description?.trim(), imageUrl,
                private: isPrivate ?? false, creatorId: userId, memberCount: 1,
            },
        });
        // Kurucuyu admin üye yap
        await prisma.communityMember.create({
            data: { userId, communityId: community.id, role: "admin" },
        });
        return reply.code(201).send(community);
    });
    /* ── Topluluğa katıl/ayrıl ── */
    app.post("/communities/:slug/join", async (req, reply) => {
        const userId = requireAuth(req, reply);
        if (!userId)
            return;
        const { slug } = req.params;
        const community = await prisma.community.findUnique({ where: { slug } });
        if (!community)
            return reply.code(404).send({ error: "Topluluk bulunamadı" });
        const existing = await prisma.communityMember.findUnique({
            where: { userId_communityId: { userId, communityId: community.id } },
        });
        if (existing) {
            await prisma.communityMember.delete({ where: { userId_communityId: { userId, communityId: community.id } } });
            await prisma.community.update({ where: { id: community.id }, data: { memberCount: { decrement: 1 } } });
            return { joined: false };
        }
        await prisma.communityMember.create({ data: { userId, communityId: community.id } });
        await prisma.community.update({ where: { id: community.id }, data: { memberCount: { increment: 1 } } });
        return { joined: true };
    });
    /* ── Kullanıcının toplulukları ── */
    app.get("/communities/my/list", async (req, reply) => {
        const userId = requireAuth(req, reply);
        if (!userId)
            return;
        const memberships = await prisma.communityMember.findMany({
            where: { userId },
            include: { community: { include: { creator: { select: { handle: true, name: true, avatarUrl: true } } } } },
            orderBy: { joinedAt: "desc" },
        });
        return { items: memberships.map(m => m.community) };
    });
    /* ── Öne çıkan topluluklar ── */
    app.get("/communities/featured", async () => {
        const communities = await prisma.community.findMany({
            where: { private: false },
            orderBy: { memberCount: "desc" },
            take: 6,
            include: { creator: { select: { handle: true, name: true, avatarUrl: true, verified: true } } },
        });
        return { items: communities };
    });
    /* ── Trend topluluklar (son 24 saatte en çok büyüyen) ── */
    app.get("/communities/trending", async () => {
        const dayAgo = new Date(Date.now() - 86400000);
        const recentJoins = await prisma.communityMember.groupBy({
            by: ["communityId"],
            where: { joinedAt: { gte: dayAgo } },
            _count: { communityId: true },
            orderBy: { _count: { communityId: "desc" } },
            take: 10,
        });
        const ids = recentJoins.map(r => r.communityId);
        if (ids.length === 0) {
            const fallback = await prisma.community.findMany({
                where: { private: false },
                orderBy: { memberCount: "desc" },
                take: 10,
                include: { creator: { select: { handle: true, name: true, avatarUrl: true } } },
            });
            return { items: fallback, period: "alltime" };
        }
        const communities = await prisma.community.findMany({
            where: { id: { in: ids } },
            include: { creator: { select: { handle: true, name: true, avatarUrl: true } } },
        });
        const ordered = recentJoins.map(r => ({
            ...(communities.find(c => c.id === r.communityId)),
            newMembersToday: r._count.communityId,
        })).filter(Boolean);
        return { items: ordered, period: "24h" };
    });
    /* ── Topluluk gönderileri (üyelerden son gönderiler) ── */
    app.get("/communities/:slug/posts", async (req, reply) => {
        const { slug } = req.params;
        const { limit = "20", cursor } = req.query;
        const take = Math.min(Number(limit), 50);
        const community = await prisma.community.findUnique({ where: { slug } });
        if (!community)
            return reply.code(404).send({ error: "Topluluk bulunamadı" });
        const memberIds = (await prisma.communityMember.findMany({
            where: { communityId: community.id },
            select: { userId: true },
            take: 200,
        })).map(m => m.userId);
        const posts = await prisma.post.findMany({
            where: {
                authorId: { in: memberIds },
                ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
            },
            take,
            orderBy: { createdAt: "desc" },
            include: {
                author: { select: { handle: true, name: true, avatarUrl: true, verified: true } },
            },
        });
        return {
            posts,
            nextCursor: posts.length === take ? posts[posts.length - 1].createdAt.toISOString() : null,
        };
    });
    /* ── Topluluk istatistikleri ── */
    app.get("/communities/:slug/stats", async (req, reply) => {
        const { slug } = req.params;
        const community = await prisma.community.findUnique({ where: { slug } });
        if (!community)
            return reply.code(404).send({ error: "Topluluk bulunamadı" });
        const weekAgo = new Date(Date.now() - 7 * 86400000);
        const newMembersWeek = await prisma.communityMember.count({
            where: { communityId: community.id, joinedAt: { gte: weekAgo } },
        });
        return {
            memberCount: community.memberCount,
            newMembersThisWeek: newMembersWeek,
            growthRate: community.memberCount > 0
                ? Math.round((newMembersWeek / community.memberCount) * 100 * 10) / 10
                : 0,
        };
    });
    /* ── Üye listesi ── */
    app.get("/communities/:slug/members", async (req, reply) => {
        const { slug } = req.params;
        const { limit = "20" } = req.query;
        const community = await prisma.community.findUnique({ where: { slug } });
        if (!community)
            return reply.code(404).send({ error: "Topluluk bulunamadı" });
        const members = await prisma.communityMember.findMany({
            where: { communityId: community.id },
            take: Math.min(Number(limit), 100),
            orderBy: { joinedAt: "asc" },
            include: { user: { select: { handle: true, name: true, avatarUrl: true, verified: true } } },
        });
        return { members: members.map(m => ({ ...m.user, role: m.role, joinedAt: m.joinedAt })) };
    });
}
