import Fastify from "fastify";
import cors from "@fastify/cors";
import { prisma } from "./db/client";
import { RateLimiter, createLogger } from "@saphara/security";
import { registerFeedRoutes } from "./routes/feed";
import { registerAuthRoutes, authPlugin } from "./routes/auth";
import { registerRealtime } from "./routes/realtime";
import { registerProfileRoutes } from "./routes/profile";
import { registerMarketRoutes } from "./routes/market";
import { registerInboxRoutes } from "./routes/inbox";
import { registerUploadRoutes } from "./routes/uploads";
import { registerNewsRoutes } from "./routes/news";
import { registerEngagementRoutes } from "./routes/engagement";
import { registerAdRoutes } from "./routes/ads";
import { registerTranscodeRoutes } from "./routes/transcode";
import { registerBookmarkRoutes } from "./routes/bookmarks";
import { registerStoreRoutes } from "./routes/store";
import { registerOwnerRoutes } from "./routes/owner";
import { registerStoryRoutes } from "./routes/stories";
import { registerSearchRoutes } from "./routes/search";
import { registerPrivacyRoutes } from "./routes/privacy";
import { registerNotificationSettingsRoutes } from "./routes/notifications-settings";
import { registerTrendingRoutes } from "./routes/trending";
import { registerRepostRoutes } from "./routes/reposts";
import { registerMessageReactionRoutes } from "./routes/message-reactions";
import { registerAdAnalyticsRoutes } from "./routes/ads-analytics";
import { registerBadgeRoutes } from "./routes/badges";
import { registerMarketDataRoutes } from "./routes/market-data";
import { registerAnalyticsRoutes } from "./routes/analytics";
import { registerGamificationRoutes } from "./routes/gamification";
import { registerCommunityRoutes } from "./routes/communities";
import { registerSubscriptionRoutes } from "./routes/subscriptions";
import { registerEventRoutes } from "./routes/events";
import { registerSentinelRoutes } from "./routes/sentinel-routes";
import { registerBlockRoutes } from "./routes/block";
import { registerReportRoutes } from "./routes/report";
import { registerBlogRoutes } from "./routes/blog";
import { registerLaunchpadRoutes } from "./routes/launchpad";
import { registerNftRoutes } from "./routes/nft";
import { registerDaoRoutes } from "./routes/dao";
import { registerReferralRoutes } from "./routes/referral";
import { registerStakingRoutes } from "./routes/staking";
import { recordRequest, recordSecurityEvent } from "./services/sentinel";
import { startSentinel, startAdAutomation } from "./services/scheduler";
import { startContentBot, runBotCycleOnce } from "./services/content-bot";
const log = createLogger();
const limiter = new RateLimiter(60, 1); // 60 istek, saniyede 1 yenilenir
async function main() {
    const app = Fastify({ logger: false });
    /* â”€â”€ CORS: fail-closed in production â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    const corsOrigin = process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
        : (process.env.NODE_ENV === "production" ? false : true);
    await app.register(cors, { origin: corsOrigin, credentials: true });
    /* â”€â”€ Security headers on every response â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    app.addHook("onSend", async (_req, reply) => {
        reply.header("X-Content-Type-Options", "nosniff");
        reply.header("X-Frame-Options", "DENY");
        reply.header("Referrer-Policy", "strict-origin-when-cross-origin");
        reply.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
        reply.header("X-XSS-Protection", "1; mode=block");
        reply.header("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src * data: blob:; media-src * blob:; connect-src * wss:; font-src 'self' data:; frame-ancestors 'none';");
        if (process.env.NODE_ENV === "production") {
            reply.header("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
        }
    });
    authPlugin(app);
    /* â”€â”€ Rate limiting + sentinel tracking â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    app.addHook("onRequest", async (req, reply) => {
        const key = req.ip;
        recordRequest(key);
        if (!limiter.allow(key)) {
            recordSecurityEvent("rate_limit_hit", `Rate limit exceeded: ${req.url}`, key);
            reply.code(429).send({ error: "Too many requests. Please slow down." });
        }
    });
    /* â”€â”€ Auth failures â†’ sentinel log â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    app.addHook("onResponse", async (req, reply) => {
        if (reply.statusCode === 401 || reply.statusCode === 403) {
            recordSecurityEvent("auth_fail", `${reply.statusCode} â€” ${req.url}`, req.ip);
        }
    });
    app.get("/health", async () => ({ ok: true, ts: Date.now() }));
    app.get("/", async () => ({
        name: "Saphara API",
        version: "1.0.0",
        status: "running",
        docs: "https://saphara.io/docs",
        endpoints: ["/health", "/stats", "/feed", "/blog", "/launchpad", "/listings", "/market-data/summary"],
    }));
    /* â”€â”€ Error handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    app.setErrorHandler((err, _req, reply) => {
        const msg = err.message ?? "";
        if (msg.includes("Can't reach database") || msg.includes("Connection refused") || err.code === "P1001") {
            return reply.code(503).send({ error: "Database unavailable. Please try again shortly.", code: "DB_UNAVAILABLE" });
        }
        reply.code(err.statusCode ?? 500).send({ error: err.message });
    });
    await registerAuthRoutes(app);
    await registerFeedRoutes(app);
    await registerRealtime(app);
    await registerProfileRoutes(app);
    await registerMarketRoutes(app);
    await registerInboxRoutes(app);
    await registerUploadRoutes(app);
    await registerNewsRoutes(app);
    await registerEngagementRoutes(app);
    await registerAdRoutes(app);
    await registerTranscodeRoutes(app);
    await registerBookmarkRoutes(app);
    await registerStoreRoutes(app);
    await registerOwnerRoutes(app);
    await registerStoryRoutes(app);
    await registerSearchRoutes(app);
    await registerPrivacyRoutes(app);
    await registerNotificationSettingsRoutes(app);
    await registerTrendingRoutes(app);
    await registerRepostRoutes(app);
    await registerMessageReactionRoutes(app);
    await registerAdAnalyticsRoutes(app);
    await registerBadgeRoutes(app);
    await registerMarketDataRoutes(app);
    await registerAnalyticsRoutes(app);
    await registerGamificationRoutes(app);
    await registerCommunityRoutes(app);
    await registerSubscriptionRoutes(app);
    await registerEventRoutes(app);
    await registerSentinelRoutes(app);
    await registerBlockRoutes(app);
    await registerReportRoutes(app);
    await registerBlogRoutes(app);
    await registerLaunchpadRoutes(app);
    await registerNftRoutes(app);
    await registerDaoRoutes(app);
    await registerReferralRoutes(app);
    await registerStakingRoutes(app);
    const port = Number(process.env.PORT ?? 4000);
    /* â”€â”€ Public platform stats (no auth required) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    app.get("/stats", async () => {
        try {
            const [users, posts, reels, tips] = await Promise.all([
                prisma.user.count(),
                prisma.post.count(),
                prisma.reel.count(),
                prisma.tip.aggregate({ _sum: { amount: true } }),
            ]);
            return { users, posts, reels, partDistributed: tips._sum.amount ?? 0 };
        }
        catch {
            return { users: 0, posts: 0, reels: 0, partDistributed: 0, cached: true };
        }
    });
    /* â”€â”€ Suggested users (public, no auth) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    app.get("/users/suggested", async () => {
        const users = await prisma.user.findMany({
            where: { NOT: { walletAddress: null } },
            select: { id: true, handle: true, name: true, avatarUrl: true, verified: true, bio: true },
            orderBy: [{ verified: "desc" }, { createdAt: "asc" }],
            take: 10,
        });
        return { users };
    });
    // Admin: trigger bot manually (localhost only)
    app.post("/admin/bot/run", async (req, reply) => {
        if (req.ip !== "127.0.0.1" && req.ip !== "::1" && req.ip !== "::ffff:127.0.0.1") {
            return reply.code(403).send({ error: "Localhost only" });
        }
        const count = await runBotCycleOnce(10);
        return { posted: count };
    });
    await app.listen({ port, host: "0.0.0.0" });
    startSentinel();
    startAdAutomation();
    startContentBot();
    log.info("API running", { port });
}
main().catch((e) => { console.error(e); process.exit(1); });
