import { generateReport } from "./sentinel";
import { prisma } from "../db/client";
import { deliverTo } from "../routes/realtime";
import { createLogger } from "@saphara/security";
const log = createLogger();
function isDbOffline(e) {
    const msg = e?.message ?? "";
    return msg.includes("Can't reach database") || msg.includes("ECONNREFUSED") || msg.includes("connect ENOENT");
}
let timer = null;
let adTimer = null;
let lastReport = null;
const SCAN_INTERVAL_MS = Number(process.env.BOT_SCAN_INTERVAL_MS ?? 15 * 60 * 1000);
const AD_SWEEP_INTERVAL_MS = 2 * 60 * 1000; // Her 2 dakikada reklam sweep
export function getLastReport() { return lastReport; }
/* ── Sentinel tarama ──────────────────────────────────────────────────── */
async function scan() {
    try {
        await prisma.story.deleteMany({ where: { expiresAt: { lt: new Date() } } }).catch(() => { });
        lastReport = await generateReport();
        const crit = lastReport.issues.filter((i) => i.severity === "critical").length;
        log.info("gozcu bot taramasi", { critical: crit, summary: lastReport.summary });
    }
    catch (e) {
        if (isDbOffline(e))
            return;
        log.error("bot tarama hatasi", { err: e.message });
    }
}
export function startSentinel() {
    if (timer)
        return;
    void scan();
    timer = setInterval(scan, SCAN_INTERVAL_MS);
    log.info("gozcu bot baslatildi", { intervalMs: SCAN_INTERVAL_MS });
}
export function stopSentinel() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
}
/* ── Reklam otomasyonu ────────────────────────────────────────────────── */
async function adSweep() {
    try {
        const now = new Date();
        /* Süresi biten kampanyaları "ended" yap */
        const expired = await prisma.campaign.findMany({
            where: { status: "active", endDate: { lt: now } },
            select: { id: true, advertiserId: true, name: true },
        });
        for (const c of expired) {
            await prisma.campaign.update({ where: { id: c.id }, data: { status: "ended" } });
            notifyAdvertiser(c.advertiserId, `Kampanyanız "${c.name}" süre dolduğu için otomatik sonlandırıldı.`);
            log.info("kampanya suresi doldu, ended", { id: c.id });
        }
        /* Bütçesi tükenen aktif kampanyaları "paused" yap */
        const depleted = await prisma.campaign.findMany({
            where: { status: "active", budgetRemaining: { lte: "0" } },
            select: { id: true, advertiserId: true, name: true },
        });
        for (const c of depleted) {
            await prisma.campaign.update({ where: { id: c.id }, data: { status: "paused" } });
            notifyAdvertiser(c.advertiserId, `Kampanyanız "${c.name}" bütçesi tükendi — duraklatıldı.`);
            log.info("kampanya butcesi tukendi, paused", { id: c.id });
        }
        /* Başlangıç tarihi gelmiş "pending" → "active" yap */
        const toActivate = await prisma.campaign.findMany({
            where: { status: "paused", startDate: { lte: now }, endDate: { gte: now } },
            select: { id: true, advertiserId: true, name: true, budgetRemaining: true },
        });
        for (const c of toActivate) {
            if (Number(c.budgetRemaining) > 0) {
                await prisma.campaign.update({ where: { id: c.id }, data: { status: "active" } });
                notifyAdvertiser(c.advertiserId, `Kampanyanız "${c.name}" otomatik olarak başlatıldı.`);
                log.info("kampanya aktif edildi", { id: c.id });
            }
        }
        /* Günlük bütçe sıfırlama (her gece 00:00 UTC) */
        const h = now.getUTCHours(), m = now.getUTCMinutes();
        if (h === 0 && m < 3) {
            await prisma.campaign.updateMany({
                where: { status: { in: ["active", "paused"] } },
                data: { spentPart: "0" },
            });
        }
        if (expired.length + depleted.length + toActivate.length > 0) {
            log.info("reklam sweep tamamlandi", {
                expired: expired.length, depleted: depleted.length, activated: toActivate.length,
            });
        }
    }
    catch (e) {
        if (isDbOffline(e))
            return;
        log.error("reklam sweep hatasi", { err: e.message });
    }
}
function notifyAdvertiser(userId, text) {
    try {
        deliverTo(userId, { type: "notification", payload: { kind: "ad_alert", text }, ts: Date.now() });
        prisma.notification.create({
            data: { userId, kind: "system", text },
        }).catch(() => { });
    }
    catch { /* sessiz */ }
}
export function startAdAutomation() {
    if (adTimer)
        return;
    void adSweep();
    adTimer = setInterval(adSweep, AD_SWEEP_INTERVAL_MS);
    log.info("reklam otomasyonu baslatildi", { intervalMs: AD_SWEEP_INTERVAL_MS });
}
export function stopAdAutomation() {
    if (adTimer) {
        clearInterval(adTimer);
        adTimer = null;
    }
}
