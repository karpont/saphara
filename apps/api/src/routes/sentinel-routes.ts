import type { FastifyInstance } from "fastify";
import { generateReport, recordSecurityEvent } from "../services/sentinel";
import { getLastReport } from "../services/scheduler";
import { prisma } from "../db/client";
import { requireAuth } from "./auth";

const TREASURY = (
  process.env.TREASURY_ADDRESS ?? process.env.NEXT_PUBLIC_TREASURY_ADDRESS ?? ""
).toLowerCase();

async function isOwner(req: any, reply: any): Promise<boolean> {
  const userId = requireAuth(req, reply);
  if (!userId) return false;
  if (!TREASURY) { reply.code(403).send({ error: "Treasury tanımlı değil" }); return false; }
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { walletAddress: true } });
  if (user?.walletAddress?.toLowerCase() !== TREASURY) {
    reply.code(403).send({ error: "Bu panel yalnızca platform sahibine açıktır" });
    return false;
  }
  return true;
}

/** Engellenen IP listesi (in-memory, sunucu restartında sıfırlanır) */
const blockedIPs = new Set<string>();
/** Uyarılan kullanıcı kayıtları */
const warnedUsers = new Map<string, { reason: string; at: number }>();

export function isIPBlocked(ip: string): boolean { return blockedIPs.has(ip); }

export async function registerSentinelRoutes(app: FastifyInstance) {
  /* ── Son raporu getir (önbellekten) ───────────────────────────────── */
  app.get("/admin/sentinel/report", async (req, reply) => {
    if (!await isOwner(req, reply)) return;
    const cached = getLastReport();
    if (cached) return cached;
    return await generateReport();
  });

  /* ── Anlık tam tarama ──────────────────────────────────────────────── */
  app.post("/admin/sentinel/scan", async (req, reply) => {
    if (!await isOwner(req, reply)) return;
    return await generateReport();
  });

  /* ── Eylem uygula: IP blok, kullanıcı uyarı/ban, içerik kaldır ─────── */
  app.post("/admin/sentinel/action", async (req, reply) => {
    if (!await isOwner(req, reply)) return;
    const { action, target } = req.body as { action: string; target: string };

    if (!action || !target) return reply.code(400).send({ error: "action ve target zorunlu" });

    switch (action) {
      case "block_ip": {
        blockedIPs.add(target);
        recordSecurityEvent("ip_blocked", `IP manuel olarak engellendi: ${target}`);
        return { ok: true, msg: `${target} engellendi` };
      }
      case "unblock_ip": {
        blockedIPs.delete(target);
        return { ok: true, msg: `${target} engel kaldırıldı` };
      }
      case "warn_user": {
        warnedUsers.set(target, { reason: "Platform kurallarını ihlal", at: Date.now() });
        await prisma.notification.create({
          data: {
            userId: target,
            kind:   "system",
            text:   "Hesabınız platform kurallarını ihlal ettiği için uyarıldı.",
          },
        }).catch(() => {});
        return { ok: true, msg: `Kullanıcı uyarıldı: ${target}` };
      }
      case "suspend_user": {
        await prisma.user.update({
          where: { id: target },
          data: { isPrivate: true },
        }).catch(() => {});
        return { ok: true, msg: `Kullanıcı askıya alındı: ${target}` };
      }
      case "delete_post": {
        await prisma.post.delete({ where: { id: target } }).catch(() => {});
        return { ok: true, msg: `Gönderi silindi: ${target}` };
      }
      case "end_campaign": {
        await prisma.campaign.update({ where: { id: target }, data: { status: "ended" } }).catch(() => {});
        return { ok: true, msg: `Kampanya sonlandırıldı: ${target}` };
      }
      default:
        return reply.code(400).send({ error: `Bilinmeyen eylem: ${action}` });
    }
  });

  /* ── Engellenen IP listesi ─────────────────────────────────────────── */
  app.get("/admin/sentinel/blocked-ips", async (req, reply) => {
    if (!await isOwner(req, reply)) return;
    return { ips: [...blockedIPs] };
  });

  /* ── Uyarılan kullanıcılar ─────────────────────────────────────────── */
  app.get("/admin/sentinel/warned-users", async (req, reply) => {
    if (!await isOwner(req, reply)) return;
    const entries = [...warnedUsers.entries()].map(([id, v]) => ({ id, ...v }));
    return { users: entries };
  });

  /* ── Platform genel istatistikleri (gerçek zamanlı) ────────────────── */
  app.get("/admin/sentinel/stats", async (req, reply) => {
    if (!await isOwner(req, reply)) return;
    const [
      totalUsers, totalPosts, totalReels, totalCampaigns,
      activeCampaigns, totalTips, totalMessages,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.reel.count(),
      prisma.campaign.count(),
      prisma.campaign.count({ where: { status: "active" } }),
      prisma.tip.count(),
      prisma.message.count(),
    ]);
    const dayAgo = new Date(Date.now() - 86_400_000);
    const [newUsers24h, newPosts24h] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: dayAgo } } }),
      prisma.post.count({ where: { createdAt: { gte: dayAgo } } }),
    ]);
    return {
      totalUsers, totalPosts, totalReels, totalCampaigns,
      activeCampaigns, totalTips, totalMessages, newUsers24h, newPosts24h,
      blockedIPs: blockedIPs.size,
    };
  });
}
