import type { FastifyInstance } from "fastify";
import { prisma } from "../db/client";
import { requireAuth } from "./auth";

export async function registerEventRoutes(app: FastifyInstance) {

  app.get("/events", async (req) => {
    const { upcoming } = req.query as { upcoming?: string };
    const now = new Date();
    const events = await prisma.event.findMany({
      where: upcoming ? { startAt: { gte: now } } : {},
      orderBy: { startAt: "asc" },
      take: 30,
      include: {
        organizer: { select: { handle: true, name: true, avatarUrl: true } },
        _count: { select: { attendees: true } },
      },
    });
    return { items: events };
  });

  app.post("/events", async (req, reply) => {
    const userId = requireAuth(req, reply);
    if (!userId) return;
    const { title, description, imageUrl, startAt, endAt, location, online, maxAttendees, pricePart } = req.body as any;
    if (!title || !startAt) return reply.code(400).send({ error: "Başlık ve başlangıç tarihi gerekli" });

    const event = await prisma.event.create({
      data: {
        organizerId: userId, title: title.trim(), description, imageUrl,
        startAt: new Date(startAt), endAt: endAt ? new Date(endAt) : null,
        location, online: online ?? true,
        maxAttendees: maxAttendees ? Number(maxAttendees) : null,
        pricePart: String(pricePart ?? 0),
      },
    });
    // Organizatör otomatik katılımcı
    await prisma.eventAttendee.create({ data: { userId, eventId: event.id, status: "organizer" } });
    return reply.code(201).send(event);
  });

  app.post("/events/:id/attend", async (req, reply) => {
    const userId = requireAuth(req, reply);
    if (!userId) return;
    const { id } = req.params as { id: string };
    const event = await prisma.event.findUnique({ where: { id }, include: { _count: { select: { attendees: true } } } });
    if (!event) return reply.code(404).send({ error: "Etkinlik bulunamadı" });
    if (event.maxAttendees && event._count.attendees >= event.maxAttendees)
      return reply.code(409).send({ error: "Etkinlik dolu" });

    const existing = await prisma.eventAttendee.findUnique({ where: { userId_eventId: { userId, eventId: id } } });
    if (existing) {
      await prisma.eventAttendee.delete({ where: { userId_eventId: { userId, eventId: id } } });
      return { attending: false };
    }
    await prisma.eventAttendee.create({ data: { userId, eventId: id } });
    return { attending: true };
  });

  app.get("/events/my", async (req, reply) => {
    const userId = requireAuth(req, reply);
    if (!userId) return;
    const attending = await prisma.eventAttendee.findMany({
      where: { userId },
      include: { event: { include: { organizer: { select: { handle: true, name: true, avatarUrl: true } } } } },
      orderBy: { event: { startAt: "asc" } },
    });
    return { items: attending.map(a => a.event) };
  });
}
