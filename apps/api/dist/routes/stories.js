import { prisma } from "../db/client";
import { requireAuth } from "./auth";
/**
 * Stories — 24 saatte kaybolan icerik (Snapchat/Instagram tarzi).
 * Suresi gecmis story'ler sorgularda otomatik filtrelenir.
 */
export async function registerStoryRoutes(app) {
    // Aktif story'ler (suresi gecmemis), kullaniciya gore gruplu
    app.get("/stories", async () => {
        const now = new Date();
        const stories = await prisma.story.findMany({
            where: { expiresAt: { gt: now } },
            orderBy: { createdAt: "desc" },
            include: { author: { select: { id: true, handle: true, name: true, avatarUrl: true } } },
        });
        // Yazara gore grupla (her kullanicinin story halkasi)
        const grouped = new Map();
        for (const s of stories) {
            const k = s.authorId;
            if (!grouped.has(k))
                grouped.set(k, { author: s.author, items: [] });
            grouped.get(k).items.push({ id: s.id, mediaUrl: s.mediaUrl, mediaType: s.mediaType, caption: s.caption, createdAt: s.createdAt });
        }
        return { rings: Array.from(grouped.values()) };
    });
    // Story olustur (24 saat sonra dolar)
    app.post("/stories", async (req, reply) => {
        const userId = requireAuth(req, reply);
        if (!userId)
            return;
        const { mediaUrl, mediaType, caption } = req.body;
        if (!mediaUrl)
            return reply.code(400).send({ error: "mediaUrl gerekli" });
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const story = await prisma.story.create({
            data: { authorId: userId, mediaUrl, mediaType: mediaType ?? "image", caption, expiresAt },
        });
        return reply.code(201).send(story);
    });
    // Goruntulenme say
    app.post("/stories/:id/view", async (req) => {
        const { id } = req.params;
        await prisma.story.update({ where: { id }, data: { views: { increment: 1 } } }).catch(() => { });
        return { ok: true };
    });
}
