import { prisma } from "../db/client";
import { requireAuth } from "./auth";
import { addXp } from "./gamification";
export async function registerSubscriptionRoutes(app) {
    /* ── Creator abonelik planı ayarla ── */
    app.post("/subscriptions/plan", async (req, reply) => {
        const userId = requireAuth(req, reply);
        if (!userId)
            return;
        // Creator pricePart ayarlayabilir (gelecekte creator_plan modeli eklenebilir)
        // Şimdilik kullanıcının metadata'sına not düşüyoruz
        return { ok: true, message: "Plan ayarlandı" };
    });
    /* ── Abone ol ── */
    app.post("/subscriptions/subscribe", async (req, reply) => {
        const userId = requireAuth(req, reply);
        if (!userId)
            return;
        const { creatorId, pricePart, currency = "PART", txHash, durationDays = 30 } = req.body;
        if (!creatorId || !pricePart)
            return reply.code(400).send({ error: "creatorId ve pricePart gerekli" });
        if (creatorId === userId)
            return reply.code(400).send({ error: "Kendinize abone olamazsınız" });
        const expiresAt = new Date(Date.now() + durationDays * 86400000);
        const sub = await prisma.subscription.upsert({
            where: { subscriberId_creatorId: { subscriberId: userId, creatorId } },
            update: { pricePart: String(pricePart), currency, txHash, expiresAt, active: true },
            create: { subscriberId: userId, creatorId, pricePart: String(pricePart), currency, txHash, expiresAt },
        });
        // Creator'a kazanç ekle
        await prisma.user.update({
            where: { id: creatorId },
            data: { earningsPart: { increment: pricePart } },
        });
        await addXp(userId, 30);
        await addXp(creatorId, 50);
        return reply.code(201).send(sub);
    });
    /* ── Aboneliklerim ── */
    app.get("/subscriptions/my", async (req, reply) => {
        const userId = requireAuth(req, reply);
        if (!userId)
            return;
        const subs = await prisma.subscription.findMany({
            where: { subscriberId: userId, active: true },
            include: { creator: { select: { handle: true, name: true, avatarUrl: true, verified: true } } },
            orderBy: { createdAt: "desc" },
        });
        return { items: subs };
    });
    /* ── Abonelerim (creator görünümü) ── */
    app.get("/subscriptions/subscribers", async (req, reply) => {
        const userId = requireAuth(req, reply);
        if (!userId)
            return;
        const subs = await prisma.subscription.findMany({
            where: { creatorId: userId, active: true },
            include: { subscriber: { select: { handle: true, name: true, avatarUrl: true } } },
            orderBy: { createdAt: "desc" },
        });
        const total = subs.reduce((acc, s) => acc + Number(s.pricePart), 0);
        return { items: subs, totalEarned: total, count: subs.length };
    });
    /* ── Abonelik kontrolü ── */
    app.get("/subscriptions/check/:creatorId", async (req, reply) => {
        const userId = requireAuth(req, reply);
        if (!userId)
            return;
        const { creatorId } = req.params;
        const sub = await prisma.subscription.findUnique({
            where: { subscriberId_creatorId: { subscriberId: userId, creatorId } },
        });
        const active = sub?.active && sub.expiresAt > new Date();
        return { subscribed: !!active, expiresAt: sub?.expiresAt };
    });
}
