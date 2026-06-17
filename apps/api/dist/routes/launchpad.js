import { prisma } from "../db/client";
import { requireAuth } from "./auth";
const VALID_STATUSES = ["upcoming", "active", "ended", "cancelled"];
/* ─── Yasal Kısıtlamalar ─────────────────────────────────────── */
// ABD/İngiltere/Kanada/Çin SEC/FCA uyum zorunluluğu
const BLOCKED_COUNTRY_CODES = ["US", "UK", "GB", "CA", "CN"];
const LEGAL_DISCLAIMER = `Bu IDO katılımı yatırım tavsiyesi değildir. Kripto para yatırımları yüksek risk içerir.
Değerin tamamını kaybedebilirsiniz. Yalnızca kaybetmeyi göze aldığınız miktarı yatırın.
Bazı yargı bölgelerinden katılım yasal kısıtlamalara tabidir. Kendi yargı bölgenizin yasal gerekliliklerini kontrol edin.
Saphara Platform herhangi bir proje için finansal garanti vermez.`;
/* ─── Vesting Şablonları ─────────────────────────────────────── */
const VESTING_TEMPLATES = {
    standard: {
        name: "Standart",
        tgeUnlockPct: 15,
        cliffMonths: 1,
        linearMonths: 9,
        desc: "TGE'de %15, 1 ay cliff, 9 ay lineer",
    },
    aggressive: {
        name: "Hızlı",
        tgeUnlockPct: 25,
        cliffMonths: 0,
        linearMonths: 6,
        desc: "TGE'de %25, cliff yok, 6 ay lineer",
    },
    conservative: {
        name: "Muhafazakâr",
        tgeUnlockPct: 10,
        cliffMonths: 3,
        linearMonths: 12,
        desc: "TGE'de %10, 3 ay cliff, 12 ay lineer",
    },
};
/* ─── Tier Allocasyon Sistemi (stake bakiyesine göre) ─────────── */
// BSCPad / Kommunitas modelinden ilham
const ALLOCATION_TIERS = [
    { name: "Bronz", minStake: 500, ticketWeight: 1, guaranteed: false, fcfs: true },
    { name: "Gümüş", minStake: 2000, ticketWeight: 4, guaranteed: false, fcfs: true },
    { name: "Altın", minStake: 5000, ticketWeight: 10, guaranteed: true, fcfs: false },
    { name: "Elmas", minStake: 20000, ticketWeight: 40, guaranteed: true, fcfs: false },
];
/* ─── Platform Komisyonu ─────────────────────────────────────── */
const PLATFORM_IDO_FEE_PCT = 3; // %3 başarılı IDO raise üzerinden
export async function registerLaunchpadRoutes(app) {
    /* ── Bilgi endpoint'i (kısıtlamalar, tier, vesting) ─────────── */
    app.get("/launchpad/info", async () => {
        return {
            platformFeePct: PLATFORM_IDO_FEE_PCT,
            blockedCountries: BLOCKED_COUNTRY_CODES,
            legalDisclaimer: LEGAL_DISCLAIMER,
            allocationTiers: ALLOCATION_TIERS,
            vestingTemplates: VESTING_TEMPLATES,
            minRaiseUsdt: 10000,
            maxRaiseUsdt: 5000000,
        };
    });
    /* ── List projects (public) ─────────────────────────────────── */
    app.get("/launchpad", async (req) => {
        const { status, limit = "20" } = req.query;
        const take = Math.min(Number(limit), 50);
        const projects = await prisma.launchpadProject.findMany({
            where: status ? { status } : undefined,
            orderBy: [{ status: "asc" }, { startAt: "asc" }],
            take,
            include: { creator: { select: { handle: true, name: true, avatarUrl: true, verified: true } } },
        });
        const enriched = projects.map((p) => ({
            ...p,
            progress: Number(p.targetAmount) > 0
                ? Math.min(100, parseFloat((Number(p.raisedAmount) / Number(p.targetAmount) * 100).toFixed(1)))
                : 0,
            vestingInfo: getVestingDisplay(p),
            disclaimer: "Bu IDO finansal tavsiye değildir. Yatırım kararlarınızı kendi araştırmanıza dayandırın.",
        }));
        return { projects: enriched };
    });
    /* ── Get single project ─────────────────────────────────────── */
    app.get("/launchpad/:id", async (req, reply) => {
        const { id } = req.params;
        const project = await prisma.launchpadProject.findUnique({
            where: { id },
            include: { creator: { select: { handle: true, name: true, avatarUrl: true, verified: true, bio: true } } },
        });
        if (!project)
            return reply.code(404).send({ error: "Project not found" });
        return {
            ...project,
            progress: Number(project.targetAmount) > 0
                ? Math.min(100, parseFloat((Number(project.raisedAmount) / Number(project.targetAmount) * 100).toFixed(1)))
                : 0,
            vestingInfo: getVestingDisplay(project),
            allocationTiers: ALLOCATION_TIERS,
            legalDisclaimer: LEGAL_DISCLAIMER,
            platformFeePct: PLATFORM_IDO_FEE_PCT,
        };
    });
    /* ── Create project (auth required) ────────────────────────── */
    app.post("/launchpad", async (req, reply) => {
        const userId = requireAuth(req, reply);
        if (!userId)
            return;
        const { name, symbol, tagline, description, logoUrl, bannerUrl, websiteUrl, twitterUrl, telegramUrl, whitepaperUrl, targetAmount, tokenPrice, totalSupply, minBuy, maxBuy, startAt, endAt, chain, tgeUnlockPct, cliffMonths, linearMonths, vestingTemplate, } = req.body;
        if (!name || !symbol || !description || !targetAmount || !startAt || !endAt)
            return reply.code(400).send({ error: "name, symbol, description, targetAmount, startAt, endAt zorunludur" });
        if (symbol.length > 10)
            return reply.code(400).send({ error: "symbol maks. 10 karakter" });
        if (new Date(startAt) >= new Date(endAt))
            return reply.code(400).send({ error: "endAt, startAt'tan sonra olmalı" });
        if (Number(targetAmount) < 10000)
            return reply.code(400).send({ error: "Minimum hedef tutar 10.000 USDT eşdeğeridir" });
        /* Vesting hesapla */
        let tge = tgeUnlockPct ?? VESTING_TEMPLATES.standard.tgeUnlockPct;
        let cliff = cliffMonths ?? VESTING_TEMPLATES.standard.cliffMonths;
        let linear = linearMonths ?? VESTING_TEMPLATES.standard.linearMonths;
        if (vestingTemplate && VESTING_TEMPLATES[vestingTemplate]) {
            const tmpl = VESTING_TEMPLATES[vestingTemplate];
            tge = tmpl.tgeUnlockPct;
            cliff = tmpl.cliffMonths;
            linear = tmpl.linearMonths;
        }
        if (tge < 5 || tge > 50)
            return reply.code(400).send({ error: "TGE unlock %5-%50 arasında olmalı" });
        if (cliff < 0 || cliff > 6)
            return reply.code(400).send({ error: "Cliff 0-6 ay arasında olmalı" });
        if (linear < 3 || linear > 24)
            return reply.code(400).send({ error: "Lineer vesting 3-24 ay olmalı" });
        const project = await prisma.launchpadProject.create({
            data: {
                creatorId: userId,
                name: name.trim(),
                symbol: symbol.trim().toUpperCase(),
                tagline: tagline?.trim(),
                description: description.trim(),
                logoUrl, bannerUrl, websiteUrl, twitterUrl, telegramUrl, whitepaperUrl,
                targetAmount: targetAmount ?? 0,
                tokenPrice: tokenPrice ?? 0,
                totalSupply: totalSupply ?? 0,
                minBuy: minBuy ?? 100,
                maxBuy: maxBuy ?? 10000,
                startAt: new Date(startAt),
                endAt: new Date(endAt),
                chain: chain ?? "BSC",
                status: new Date(startAt) > new Date() ? "upcoming" : "active",
                tgeUnlockPct: tge,
                cliffMonths: cliff,
                linearMonths: linear,
            },
        });
        return reply.code(201).send({
            ...project,
            vestingInfo: getVestingDisplay(project),
            legalDisclaimer: LEGAL_DISCLAIMER,
            message: "Proje oluşturuldu. Yayına alınmadan önce moderasyon ekibimiz inceleyecektir.",
        });
    });
    /* ── Participate (simulated — gerçek tx on-chain) ────────────── */
    app.post("/launchpad/:id/participate", async (req, reply) => {
        const userId = requireAuth(req, reply);
        if (!userId)
            return;
        const { id } = req.params;
        const { amount, countryCode, acceptedRisk } = req.body;
        /* Yargı bölgesi kontrolü */
        const country = (countryCode ?? "").toUpperCase();
        if (BLOCKED_COUNTRY_CODES.includes(country)) {
            return reply.code(403).send({
                error: "Bu yargı bölgesinden IDO katılımı yasal kısıtlamalar nedeniyle mümkün değildir.",
                blockedCountry: country,
            });
        }
        /* Risk onayı */
        if (!acceptedRisk) {
            return reply.code(400).send({
                error: "Katılmak için risk uyarısını kabul etmeniz gerekir.",
                disclaimer: LEGAL_DISCLAIMER,
            });
        }
        const project = await prisma.launchpadProject.findUnique({ where: { id } });
        if (!project)
            return reply.code(404).send({ error: "Project not found" });
        if (project.status !== "active")
            return reply.code(400).send({ error: "Proje şu an aktif değil" });
        if (amount < Number(project.minBuy) || amount > Number(project.maxBuy)) {
            return reply.code(400).send({
                error: `Tutar ${project.minBuy} - ${project.maxBuy} PART arasında olmalı`,
            });
        }
        await prisma.launchpadProject.update({
            where: { id },
            data: {
                raisedAmount: { increment: amount },
                participants: { increment: 1 },
            },
        });
        return {
            ok: true,
            invested: amount,
            projectId: id,
            message: `${amount} PART yatırıldı. Token dağıtımı vesting takviminde yapılacak.`,
        };
    });
    /* ── Remind (upcoming) ──────────────────────────────────────── */
    app.post("/launchpad/:id/remind", async (req, reply) => {
        const userId = requireAuth(req, reply);
        if (!userId)
            return;
        const { id } = req.params;
        const project = await prisma.launchpadProject.findUnique({ where: { id } });
        if (!project)
            return reply.code(404).send({ error: "Project not found" });
        const key = `launchpad_remind_${id}`;
        const rec = await prisma.platformSetting.findUnique({ where: { key } });
        let list = [];
        if (rec) {
            try {
                list = JSON.parse(rec.value);
            }
            catch {
                list = [];
            }
        }
        if (!list.includes(userId)) {
            list.push(userId);
            await prisma.platformSetting.upsert({
                where: { key },
                update: { value: JSON.stringify(list) },
                create: { key, value: JSON.stringify(list) },
            });
        }
        return { ok: true, reminded: true, total: list.length };
    });
    /* ── Admin: status güncelle ─────────────────────────────────── */
    app.patch("/launchpad/:id/status", async (req, reply) => {
        const userId = requireAuth(req, reply);
        if (!userId)
            return;
        const { id } = req.params;
        const { status } = req.body;
        if (!VALID_STATUSES.includes(status))
            return reply.code(400).send({ error: `status şunlardan biri olmalı: ${VALID_STATUSES.join(", ")}` });
        const project = await prisma.launchpadProject.findUnique({ where: { id } });
        if (!project)
            return reply.code(404).send({ error: "Not found" });
        if (project.creatorId !== userId)
            return reply.code(403).send({ error: "Proje sahibi değilsiniz" });
        const updated = await prisma.launchpadProject.update({ where: { id }, data: { status } });
        return { ok: true, project: updated };
    });
}
/* ─── Yardımcı: vesting takvim metni ────────────────────────── */
function getVestingDisplay(project) {
    const tge = project.tgeUnlockPct ?? VESTING_TEMPLATES.standard.tgeUnlockPct;
    const cliff = project.cliffMonths ?? VESTING_TEMPLATES.standard.cliffMonths;
    const linear = project.linearMonths ?? VESTING_TEMPLATES.standard.linearMonths;
    const steps = [];
    steps.push(`TGE'de %${tge} anında serbest bırakılır`);
    if (cliff > 0)
        steps.push(`${cliff} ay cliff (bekletme süresi)`);
    steps.push(`Kalan %${100 - tge}, ${linear} ayda eşit miktarlarda serbest bırakılır`);
    return { tgeUnlockPct: tge, cliffMonths: cliff, linearMonths: linear, steps };
}
