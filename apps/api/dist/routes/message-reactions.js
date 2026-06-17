import { prisma } from "../db/client";
import { requireAuth } from "./auth";
import { deliverTo } from "./realtime";
export async function registerMessageReactionRoutes(app) {
    // Emoji reaksiyon ekle/guncelle
    app.post("/messages/:id/react", async (req, reply) => {
        const userId = requireAuth(req, reply);
        if (!userId)
            return;
        const { id: messageId } = req.params;
        const { emoji } = req.body;
        if (!emoji)
            return reply.code(400).send({ error: "emoji gerekli" });
        const msg = await prisma.message.findUnique({
            where: { id: messageId },
            select: { fromId: true, toId: true },
        });
        if (!msg)
            return reply.code(404).send({ error: "Mesaj bulunamadi" });
        const reaction = await prisma.messageReaction.upsert({
            where: { messageId_userId: { messageId, userId } },
            update: { emoji },
            create: { messageId, userId, emoji },
        });
        // Gondericiye WS bildirimi
        const otherId = msg.fromId === userId ? msg.toId : msg.fromId;
        deliverTo(otherId, { type: "dm_react", payload: { messageId, userId, emoji }, ts: Date.now() });
        return reaction;
    });
    // Reaksiyonu kaldir
    app.delete("/messages/:id/react", async (req, reply) => {
        const userId = requireAuth(req, reply);
        if (!userId)
            return;
        const { id: messageId } = req.params;
        await prisma.messageReaction.deleteMany({ where: { messageId, userId } });
        return { removed: true };
    });
    // Mesaji okundu olarak isaretle
    app.put("/messages/:id/seen", async (req, reply) => {
        const userId = requireAuth(req, reply);
        if (!userId)
            return;
        const { id: messageId } = req.params;
        const msg = await prisma.message.findUnique({ where: { id: messageId } });
        if (!msg)
            return reply.code(404).send({ error: "Mesaj bulunamadi" });
        if (msg.toId !== userId)
            return reply.code(403).send({ error: "Sadece alici okuyabilir" });
        await prisma.message.update({
            where: { id: messageId },
            data: { read: true, readAt: new Date() },
        });
        // Gondericiye okundu bilgisi gonder
        deliverTo(msg.fromId, { type: "dm_seen", payload: { messageId, seenAt: new Date() }, ts: Date.now() });
        return { seen: true };
    });
}
