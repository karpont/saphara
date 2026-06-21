import type { FastifyInstance } from "fastify";
import { prisma } from "../db/client";
import { requireAuth } from "./auth";

/** DAO proposal açabilmek için gereken minimum PART bakiyesi (spam'i caydırır). */
const MIN_PART_FOR_PROPOSAL = 100;

export async function registerDaoRoutes(app: FastifyInstance) {

  /* ── List proposals ────────────────────────────────────────── */
  app.get("/dao/proposals", async (req) => {
    const { status, type, limit = "20", offset = "0" } = req.query as any;
    const proposals = await prisma.daoProposal.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(type ? { type } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: Math.min(Number(limit), 50),
      skip: Number(offset),
      include: {
        author: { select: { handle: true, name: true, avatarUrl: true, verified: true } },
        _count: { select: { votes: true } },
      },
    });
    return { proposals };
  });

  /* ── Single proposal ───────────────────────────────────────── */
  app.get("/dao/proposals/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const proposal = await prisma.daoProposal.findUnique({
      where: { id },
      include: {
        author: { select: { handle: true, name: true, avatarUrl: true, verified: true } },
        votes: {
          orderBy: { votePower: "desc" },
          take: 50,
          include: { voter: { select: { handle: true, name: true, avatarUrl: true } } },
        },
        _count: { select: { votes: true } },
      },
    });
    if (!proposal) return reply.code(404).send({ error: "Proposal not found" });

    const totalPower = proposal.votes.reduce((a, v) => a + v.votePower, 0) || 1;
    const forPct   = Math.round((proposal.votesFor   / totalPower) * 100);
    const agPct    = Math.round((proposal.votesAgainst / totalPower) * 100);
    const absPct   = Math.round((proposal.votesAbstain / totalPower) * 100);

    return { ...proposal, forPct, agPct, absPct };
  });

  /* ── Create proposal ───────────────────────────────────────── */
  app.post("/dao/proposals", async (req, reply) => {
    const userId = requireAuth(req, reply);
    if (!userId) return;

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { earningsPart: true } });
    if (Number(user?.earningsPart ?? 0) < MIN_PART_FOR_PROPOSAL) {
      return reply.code(403).send({
        error: `Anket açmak için en az ${MIN_PART_FOR_PROPOSAL} PART bakiyesi gerekiyor.`,
        required: MIN_PART_FOR_PROPOSAL,
        current: Number(user?.earningsPart ?? 0),
      });
    }

    const {
      title, description, type = "general",
      endsAt, treasuryAmount, treasuryRecipient, tags = [],
    } = req.body as any;

    if (!title?.trim()) return reply.code(400).send({ error: "Başlık gerekli" });
    if (!description?.trim()) return reply.code(400).send({ error: "Açıklama gerekli" });
    if (!endsAt) return reply.code(400).send({ error: "Bitiş tarihi gerekli" });

    const endsAtDate = new Date(endsAt);
    if (endsAtDate <= new Date()) return reply.code(400).send({ error: "Bitiş tarihi gelecekte olmalı" });

    const proposal = await prisma.daoProposal.create({
      data: {
        authorId: userId,
        title: title.trim(),
        description: description.trim(),
        type,
        endsAt: endsAtDate,
        treasuryAmount: treasuryAmount ?? 0,
        treasuryRecipient,
        tags,
      },
      include: { author: { select: { handle: true, name: true, avatarUrl: true } } },
    });

    return reply.code(201).send({ ok: true, proposal });
  });

  /* ── Vote ──────────────────────────────────────────────────── */
  app.post("/dao/proposals/:id/vote", async (req, reply) => {
    const userId = requireAuth(req, reply);
    if (!userId) return;
    const { id } = req.params as { id: string };
    const { vote, reason } = req.body as { vote: string; reason?: string };

    if (!["for", "against", "abstain"].includes(vote))
      return reply.code(400).send({ error: "Geçerli oy: for | against | abstain" });

    const proposal = await prisma.daoProposal.findUnique({ where: { id } });
    if (!proposal) return reply.code(404).send({ error: "Teklif bulunamadı" });
    if (proposal.status !== "active") return reply.code(400).send({ error: "Oylama aktif değil" });
    if (new Date() > proposal.endsAt) return reply.code(400).send({ error: "Oylama süresi doldu" });

    const existing = await prisma.daoVote.findUnique({
      where: { proposalId_voterId: { proposalId: id, voterId: userId } },
    });
    if (existing) return reply.code(409).send({ error: "Zaten oy kullandınız" });

    // Vote power: PART bakiyesine göre 1-100 arası, minimum 1
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { earningsPart: true } });
    const balance = Number(user?.earningsPart ?? 0);
    const votePower = Math.min(100, Math.max(1, Math.floor(balance / 100)));

    const daoVote = await prisma.daoVote.create({
      data: { proposalId: id, voterId: userId, vote, votePower, reason },
    });

    // Update counts
    await prisma.daoProposal.update({
      where: { id },
      data: {
        votesFor:     vote === "for"     ? { increment: votePower } : undefined,
        votesAgainst: vote === "against" ? { increment: votePower } : undefined,
        votesAbstain: vote === "abstain" ? { increment: votePower } : undefined,
      },
    });

    // Auto-resolve if ended
    const updated = await prisma.daoProposal.findUnique({ where: { id } });
    if (updated && new Date() >= updated.endsAt) {
      const total = updated.votesFor + updated.votesAgainst + updated.votesAbstain;
      const forRatio = total > 0 ? (updated.votesFor / total) * 100 : 0;
      const newStatus = forRatio >= updated.passThreshold ? "passed" : "rejected";
      await prisma.daoProposal.update({ where: { id }, data: { status: newStatus } });
    }

    return reply.code(201).send({ ok: true, daoVote, votePower });
  });

  /* ── My vote on a proposal ─────────────────────────────────── */
  app.get("/dao/proposals/:id/my-vote", async (req, reply) => {
    const userId = requireAuth(req, reply);
    if (!userId) return;
    const { id } = req.params as { id: string };
    const daoVote = await prisma.daoVote.findUnique({
      where: { proposalId_voterId: { proposalId: id, voterId: userId } },
    });
    return { voted: !!daoVote, vote: daoVote ?? null };
  });

  /* ── DAO stats ─────────────────────────────────────────────── */
  app.get("/dao/stats", async () => {
    const [total, active, passed, rejected, totalVotes] = await Promise.all([
      prisma.daoProposal.count(),
      prisma.daoProposal.count({ where: { status: "active" } }),
      prisma.daoProposal.count({ where: { status: "passed" } }),
      prisma.daoProposal.count({ where: { status: "rejected" } }),
      prisma.daoVote.count(),
    ]);
    return { total, active, passed, rejected, totalVotes };
  });

  /* ── Finalize expired proposals (cron-friendly) ────────────── */
  app.post("/dao/finalize", async (req, reply) => {
    const userId = requireAuth(req, reply);
    if (!userId) return;

    const expired = await prisma.daoProposal.findMany({
      where: { status: "active", endsAt: { lte: new Date() } },
    });

    let finalized = 0;
    for (const p of expired) {
      const total = p.votesFor + p.votesAgainst + p.votesAbstain;
      const forRatio = total > 0 ? (p.votesFor / total) * 100 : 0;
      const newStatus = forRatio >= p.passThreshold ? "passed" : "rejected";
      await prisma.daoProposal.update({ where: { id: p.id }, data: { status: newStatus } });
      finalized++;
    }

    return { ok: true, finalized };
  });
}
