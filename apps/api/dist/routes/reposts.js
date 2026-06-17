import { prisma } from "../db/client";
import { requireAuth } from "./auth";
import { notify } from "./inbox";
export async function registerRepostRoutes(app) {
    app.post("/posts/:id/repost", async (req, reply) => {
        const userId = requireAuth(req, reply);
        if (!userId)
            return;
        const { id: postId } = req.params;
        const post = await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } });
        if (!post)
            return reply.code(404).send({ error: "Gonderi bulunamadi" });
        try {
            await prisma.repost.create({ data: { userId, postId } });
            await prisma.post.update({ where: { id: postId }, data: { repostCount: { increment: 1 } } });
            if (post.authorId !== userId) {
                await notify(post.authorId, "repost", "Gonderini biri yeniden paylasti");
            }
            return { reposted: true };
        }
        catch {
            return reply.code(409).send({ error: "Zaten yeniden paylasildi" });
        }
    });
    app.delete("/posts/:id/repost", async (req, reply) => {
        const userId = requireAuth(req, reply);
        if (!userId)
            return;
        const { id: postId } = req.params;
        const deleted = await prisma.repost.deleteMany({ where: { userId, postId } });
        if (deleted.count > 0) {
            await prisma.post.update({ where: { id: postId }, data: { repostCount: { decrement: 1 } } });
        }
        return { reposted: false };
    });
    app.get("/posts/:id/reposts", async (req) => {
        const { id: postId } = req.params;
        const reposts = await prisma.repost.findMany({
            where: { postId },
            take: 50,
            orderBy: { createdAt: "desc" },
            include: { user: { select: { handle: true, name: true, avatarUrl: true, verified: true } } },
        });
        return { items: reposts };
    });
}
