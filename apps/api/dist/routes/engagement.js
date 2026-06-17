import { prisma } from "../db/client";
import { requireAuth } from "./auth";
import { notify } from "./inbox";
/** Yorum + anket (interaktif icerik) uclari. */
export async function registerEngagementRoutes(app) {
    // --- Yorumlar ---
    app.get("/posts/:id/comments", async (req) => {
        const { id } = req.params;
        const items = await prisma.comment.findMany({
            where: { postId: id },
            orderBy: { createdAt: "desc" },
            include: { author: { select: { handle: true, name: true, avatarUrl: true } } },
        });
        return { items };
    });
    app.post("/posts/:id/comments", async (req, reply) => {
        const userId = requireAuth(req, reply);
        if (!userId)
            return;
        const { id } = req.params;
        const { text } = req.body;
        if (!text?.trim())
            return reply.code(400).send({ error: "Bos yorum" });
        const comment = await prisma.comment.create({ data: { postId: id, authorId: userId, text: text.trim() } });
        const post = await prisma.post.update({
            where: { id }, data: { comments: { increment: 1 } }, select: { authorId: true },
        });
        if (post.authorId !== userId)
            await notify(post.authorId, "comment", "Gonderine yeni yorum geldi");
        return reply.code(201).send(comment);
    });
    // --- Anketler ---
    app.post("/posts/:id/poll", async (req, reply) => {
        const userId = requireAuth(req, reply);
        if (!userId)
            return;
        const { id } = req.params;
        const { question, options, endsAt } = req.body;
        if (!question || !options || options.length < 2) {
            return reply.code(400).send({ error: "Soru ve en az 2 secenek gerekli" });
        }
        const poll = await prisma.poll.create({
            data: {
                postId: id, question, endsAt: endsAt ? new Date(endsAt) : undefined,
                options: { create: options.map((label) => ({ label })) },
            },
            include: { options: true },
        });
        return reply.code(201).send(poll);
    });
    // Oy ver (kullanici basina secenek basina tek oy)
    app.post("/polls/options/:optionId/vote", async (req, reply) => {
        const userId = requireAuth(req, reply);
        if (!userId)
            return;
        const { optionId } = req.params;
        try {
            await prisma.pollVote.create({ data: { optionId, userId } });
        }
        catch {
            return reply.code(409).send({ error: "Zaten oy verdin" });
        }
        return { ok: true };
    });
    // Anket sonuclari (secenek basina oy sayisi)
    app.get("/polls/:pollId/results", async (req) => {
        const { pollId } = req.params;
        const options = await prisma.pollOption.findMany({
            where: { pollId },
            include: { _count: { select: { votes: true } } },
        });
        const total = options.reduce((s, o) => s + o._count.votes, 0);
        return {
            total,
            options: options.map((o) => ({
                id: o.id, label: o.label, votes: o._count.votes,
                pct: total ? Math.round((o._count.votes / total) * 100) : 0,
            })),
        };
    });
}
