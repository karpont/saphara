import { prisma } from "../db/client";
import { requireAuth } from "./auth";
/** Yer imleri (bookmark) — gonderi kaydetme. */
export async function registerBookmarkRoutes(app) {
    app.get("/bookmarks", async (req, reply) => {
        const userId = requireAuth(req, reply);
        if (!userId)
            return;
        const items = await prisma.bookmark.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            include: { post: { include: { author: { select: { handle: true, name: true } } } } },
        });
        return { items: items.map((b) => b.post) };
    });
    app.post("/bookmarks/:postId", async (req, reply) => {
        const userId = requireAuth(req, reply);
        if (!userId)
            return;
        const { postId } = req.params;
        await prisma.bookmark.upsert({
            where: { userId_postId: { userId, postId } },
            create: { userId, postId },
            update: {},
        });
        return { bookmarked: true };
    });
    app.delete("/bookmarks/:postId", async (req, reply) => {
        const userId = requireAuth(req, reply);
        if (!userId)
            return;
        const { postId } = req.params;
        await prisma.bookmark.deleteMany({ where: { userId, postId } });
        return { bookmarked: false };
    });
}
