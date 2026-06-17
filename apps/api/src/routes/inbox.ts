import type { FastifyInstance } from "fastify";
import { prisma } from "../db/client";
import { requireAuth } from "./auth";
import { deliverTo, pushNotification } from "./realtime";
import { moderate } from "../services/moderation";

export async function registerInboxRoutes(app: FastifyInstance) {
  // --- Bildirimler ---
  app.get("/notifications", async (req, reply) => {
    const userId = requireAuth(req, reply);
    if (!userId) return;
    const items = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return { items, unread: items.filter((n) => !n.read).length };
  });

  app.post("/notifications/read", async (req, reply) => {
    const userId = requireAuth(req, reply);
    if (!userId) return;
    await prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
    return { ok: true };
  });

  // --- Mesajlar ---
  app.get("/messages/:withId", async (req, reply) => {
    const me = requireAuth(req, reply);
    if (!me) return;
    const { withId } = req.params as { withId: string };
    const items = await prisma.message.findMany({
      where: {
        OR: [
          { fromId: me, toId: withId },
          { fromId: withId, toId: me },
        ],
        deletedAt: null,
      },
      orderBy: { createdAt: "asc" },
      take: 100,
      include: {
        from: { select: { handle: true, name: true, avatarUrl: true } },
        reactions: { select: { id: true, emoji: true, userId: true } },
      },
    });
    await prisma.message.updateMany({
      where: { fromId: withId, toId: me, read: false },
      data: { read: true, readAt: new Date() },
    });
    return { items };
  });

  // Mesaj gönder
  app.post("/messages", async (req, reply) => {
    const me = requireAuth(req, reply);
    if (!me) return;
    const { to, text, mediaUrl, mediaType } = req.body as {
      to: string; text?: string; mediaUrl?: string; mediaType?: "image" | "video" | "audio";
    };
    if (!to || (!text?.trim() && !mediaUrl)) {
      return reply.code(400).send({ error: "to + text veya mediaUrl gerekli" });
    }
    if (to === me) return reply.code(400).send({ error: "Kendinize mesaj gönderemezsiniz" });
    if (text?.trim()) {
      const check = moderate(text.trim(), 1000);
      if (!check.ok) return reply.code(422).send({ error: check.message });
    }
    const msg = await prisma.message.create({
      data: {
        fromId: me, toId: to,
        text: text?.trim() ?? null,
        mediaUrl: mediaUrl ?? null,
        mediaType: mediaType ?? null,
      },
    });
    deliverTo(to, {
      type: "dm", from: me, to,
      payload: { id: msg.id, text: msg.text, mediaUrl: msg.mediaUrl, mediaType: msg.mediaType },
      ts: msg.createdAt.getTime(),
    });
    return reply.code(201).send(msg);
  });

  // Mesaj sil (soft delete)
  app.delete("/messages/:id", async (req, reply) => {
    const me = requireAuth(req, reply);
    if (!me) return;
    const { id } = req.params as { id: string };
    await prisma.message.updateMany({
      where: { id, fromId: me },
      data: { deletedAt: new Date() },
    });
    return { ok: true };
  });

  // Okundu işareti
  app.patch("/messages/:id/seen", async (req, reply) => {
    const me = requireAuth(req, reply);
    if (!me) return;
    const { id } = req.params as { id: string };
    await prisma.message.updateMany({
      where: { id, toId: me },
      data: { read: true, readAt: new Date() },
    });
    return { ok: true };
  });

  // Sohbet listesi — kullanıcı detayları ve okunmamış sayısı dahil
  app.get("/conversations", async (req, reply) => {
    const me = requireAuth(req, reply);
    if (!me) return;

    const recent = await prisma.message.findMany({
      where: { OR: [{ fromId: me }, { toId: me }], deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    const seenSet = new Set<string>();
    const orderedOthers: string[] = [];
    const lastMsgMap = new Map<string, typeof recent[0]>();
    for (const m of recent) {
      const other = m.fromId === me ? m.toId : m.fromId;
      if (!seenSet.has(other)) { seenSet.add(other); orderedOthers.push(other); }
      if (!lastMsgMap.has(other)) lastMsgMap.set(other, m);
    }

    if (orderedOthers.length === 0) return { threads: [] };

    const [users, unreadGroups] = await Promise.all([
      prisma.user.findMany({
        where: { id: { in: orderedOthers } },
        select: { id: true, handle: true, name: true, avatarUrl: true, verified: true },
      }),
      prisma.message.groupBy({
        by: ["fromId"],
        where: { toId: me, read: false, fromId: { in: orderedOthers }, deletedAt: null },
        _count: { id: true },
      }),
    ]);

    const userMap = new Map(users.map((u) => [u.id, u]));
    const unreadMap = new Map(unreadGroups.map((r) => [r.fromId, r._count.id]));

    const threads = orderedOthers.map((otherId) => {
      const user = userMap.get(otherId);
      const last = lastMsgMap.get(otherId)!;
      return {
        withId: otherId,
        withHandle: user?.handle ?? null,
        withName: user?.name ?? null,
        withAvatarUrl: user?.avatarUrl ?? null,
        withVerified: user?.verified ?? false,
        lastText: last.text,
        lastMediaType: last.mediaType,
        lastAt: last.createdAt,
        fromMe: last.fromId === me,
        unread: unreadMap.get(otherId) ?? 0,
      };
    });

    return { threads };
  });
}

export async function notify(userId: string, kind: string, text: string) {
  await prisma.notification.create({ data: { userId, kind: kind as any, text } });
  pushNotification(userId, { kind, text });
}
