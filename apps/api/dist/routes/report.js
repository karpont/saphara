import { prisma } from "../db/client";
import { requireAuth } from "./auth";
const VALID_REASONS = ["spam", "harassment", "hate_speech", "misinformation", "illegal", "nsfw", "other"];
const VALID_TYPES = ["post", "user", "reel", "comment"];
export async function registerReportRoutes(app) {
    /* ── Submit a report ──────────────────────────────────────────── */
    app.post("/report", async (req, reply) => {
        const me = requireAuth(req, reply);
        if (!me)
            return;
        const { targetType, targetId, reason, details } = req.body;
        if (!VALID_TYPES.includes(targetType)) {
            return reply.code(400).send({ error: `targetType must be one of: ${VALID_TYPES.join(", ")}` });
        }
        if (!VALID_REASONS.includes(reason)) {
            return reply.code(400).send({ error: `reason must be one of: ${VALID_REASONS.join(", ")}` });
        }
        if (!targetId?.trim())
            return reply.code(400).send({ error: "targetId is required" });
        /* Prevent duplicate reports from the same user for the same content */
        const existing = await prisma.report.findFirst({
            where: { reporterId: me, targetType, targetId },
        });
        if (existing)
            return reply.code(409).send({ error: "You have already reported this content" });
        const report = await prisma.report.create({
            data: { reporterId: me, targetType, targetId, reason, details: details?.trim() ?? null },
        });
        /* Auto-action: 5+ reports on the same target → sentinel picks it up */
        const count = await prisma.report.count({ where: { targetType, targetId } });
        if (count >= 5) {
            await prisma.notification.create({
                data: {
                    userId: me, /* placeholder — sentinel processes it */
                    kind: "system",
                    text: `[AUTO] ${targetType} ${targetId} has ${count} reports — review needed`,
                },
            }).catch(() => { });
        }
        return reply.code(201).send({ ok: true, reportId: report.id });
    });
    /* ── Admin: list pending reports (owner only via sentinel guard) ─ */
    app.get("/admin/reports", async (req, reply) => {
        const me = requireAuth(req, reply);
        if (!me)
            return;
        const user = await prisma.user.findUnique({ where: { id: me }, select: { walletAddress: true } });
        const treasury = (process.env.TREASURY_ADDRESS ?? "").toLowerCase();
        if (user?.walletAddress?.toLowerCase() !== treasury) {
            return reply.code(403).send({ error: "Owner access only" });
        }
        const { status = "pending" } = req.query;
        const reports = await prisma.report.findMany({
            where: { status },
            orderBy: { createdAt: "desc" },
            take: 100,
            include: { reporter: { select: { handle: true, name: true } } },
        });
        return { reports };
    });
    /* ── Admin: update report status ────────────────────────────────── */
    app.patch("/admin/reports/:id", async (req, reply) => {
        const me = requireAuth(req, reply);
        if (!me)
            return;
        const user = await prisma.user.findUnique({ where: { id: me }, select: { walletAddress: true } });
        const treasury = (process.env.TREASURY_ADDRESS ?? "").toLowerCase();
        if (user?.walletAddress?.toLowerCase() !== treasury) {
            return reply.code(403).send({ error: "Owner access only" });
        }
        const { id } = req.params;
        const { status } = req.body;
        const valid = ["reviewed", "resolved", "dismissed"];
        if (!valid.includes(status))
            return reply.code(400).send({ error: `status must be one of: ${valid.join(", ")}` });
        const updated = await prisma.report.update({ where: { id }, data: { status } });
        return { ok: true, report: updated };
    });
}
