import { prisma } from "../db/client";
import { requireAuth } from "./auth";
export async function registerNotificationSettingsRoutes(app) {
    app.get("/notifications/settings", async (req, reply) => {
        const userId = requireAuth(req, reply);
        if (!userId)
            return;
        const prefs = await prisma.userNotificationPrefs.findUnique({ where: { userId } });
        return prefs ?? { likes: true, comments: true, follows: true, tips: true, dm: true, reposts: true };
    });
    app.post("/notifications/settings", async (req, reply) => {
        const userId = requireAuth(req, reply);
        if (!userId)
            return;
        const { likes, comments, follows, tips, dm, reposts } = req.body;
        const data = {};
        if (likes !== undefined)
            data.likes = likes;
        if (comments !== undefined)
            data.comments = comments;
        if (follows !== undefined)
            data.follows = follows;
        if (tips !== undefined)
            data.tips = tips;
        if (dm !== undefined)
            data.dm = dm;
        if (reposts !== undefined)
            data.reposts = reposts;
        const prefs = await prisma.userNotificationPrefs.upsert({
            where: { userId },
            update: data,
            create: { userId, ...data },
        });
        return prefs;
    });
}
