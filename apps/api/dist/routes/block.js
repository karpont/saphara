import { prisma } from "../db/client";
import { requireAuth } from "./auth";
export async function registerBlockRoutes(app) {
    /* ── Block a user ─────────────────────────────────────────────── */
    app.post("/users/:targetId/block", async (req, reply) => {
        const me = requireAuth(req, reply);
        if (!me)
            return;
        const { targetId } = req.params;
        if (targetId === me)
            return reply.code(400).send({ error: "You cannot block yourself" });
        await prisma.block.upsert({
            where: { blockerId_blockedId: { blockerId: me, blockedId: targetId } },
            update: {},
            create: { blockerId: me, blockedId: targetId },
        });
        /* Also unfollow in both directions */
        await prisma.follow.deleteMany({
            where: {
                OR: [
                    { followerId: me, followingId: targetId },
                    { followerId: targetId, followingId: me },
                ],
            },
        });
        return { blocked: true };
    });
    /* ── Unblock a user ───────────────────────────────────────────── */
    app.delete("/users/:targetId/block", async (req, reply) => {
        const me = requireAuth(req, reply);
        if (!me)
            return;
        const { targetId } = req.params;
        await prisma.block.deleteMany({
            where: { blockerId: me, blockedId: targetId },
        });
        return { blocked: false };
    });
    /* ── List blocked users ───────────────────────────────────────── */
    app.get("/me/blocked", async (req, reply) => {
        const me = requireAuth(req, reply);
        if (!me)
            return;
        const blocks = await prisma.block.findMany({
            where: { blockerId: me },
            include: {
                blocked: { select: { id: true, handle: true, name: true, avatarUrl: true } },
            },
            orderBy: { createdAt: "desc" },
        });
        return { blocked: blocks.map((b) => ({ ...b.blocked, blockedAt: b.createdAt })) };
    });
    /* ── Check if a specific user is blocked ─────────────────────── */
    app.get("/users/:targetId/block-status", async (req, reply) => {
        const me = requireAuth(req, reply);
        if (!me)
            return;
        const { targetId } = req.params;
        const block = await prisma.block.findUnique({
            where: { blockerId_blockedId: { blockerId: me, blockedId: targetId } },
        });
        const reverse = await prisma.block.findUnique({
            where: { blockerId_blockedId: { blockerId: targetId, blockedId: me } },
        });
        return { blocking: !!block, blockedByThem: !!reverse };
    });
}
