import { prisma } from "../db/client";
import { requireAuth } from "./auth";
/* ── BSC token adresleri ──────────────────────────────────────────────── */
const PART_TOKEN = (process.env.NEXT_PUBLIC_PART_TOKEN_ADDRESS ?? "0xD95aC89029451c57Adf172192176d7264d49305a").toLowerCase();
const TREASURY = (process.env.TREASURY_ADDRESS ?? process.env.NEXT_PUBLIC_TREASURY_ADDRESS ?? "0x55B26f8CD67632d7AF9a888c645054Ca76E53455").toLowerCase();
const USDT_BSC = "0x55d398326f99059ff775485246999027b3197955"; // BSC Mainnet USDT
const BSC_RPC = process.env.BSC_RPC_URL ?? "https://bsc-dataseed1.binance.org";
/* ERC-20 Transfer(address,address,uint256) konu ID'si */
const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
/* ── BSC üzerinde tx'i doğrula ────────────────────────────────────────── */
async function verifyBscTx(txHash, currency) {
    try {
        const res = await fetch(BSC_RPC, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ jsonrpc: "2.0", method: "eth_getTransactionReceipt", params: [txHash], id: 1 }),
        });
        const json = await res.json();
        const receipt = json.result;
        if (!receipt)
            return { ok: false, reason: "İşlem henüz onaylanmamış" };
        if (receipt.status !== "0x1")
            return { ok: false, reason: "İşlem başarısız (reverted)" };
        if (currency === "BNB") {
            /* BNB transferi: to alanını kontrol et */
            const txRes = await fetch(BSC_RPC, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ jsonrpc: "2.0", method: "eth_getTransactionByHash", params: [txHash], id: 2 }),
            });
            const txJson = await txRes.json();
            const tx = txJson.result;
            if (!tx)
                return { ok: false, reason: "İşlem bulunamadı" };
            if (tx.to?.toLowerCase() !== TREASURY)
                return { ok: false, reason: "Alıcı treasury değil" };
            return { ok: true };
        }
        /* ERC-20 (PART veya USDT): Transfer logundan doğrula */
        const contractAddr = currency === "PART" ? PART_TOKEN : USDT_BSC;
        const transferLog = receipt.logs?.find((l) => l.address?.toLowerCase() === contractAddr &&
            l.topics?.[0] === TRANSFER_TOPIC &&
            `0x${l.topics?.[2]?.slice(26)}`.toLowerCase() === TREASURY);
        if (!transferLog)
            return { ok: false, reason: `${currency} treasury transferi logda bulunamadı` };
        return { ok: true };
    }
    catch (e) {
        return { ok: false, reason: `RPC hatası: ${e.message}` };
    }
}
const DEMO_STORE_ITEMS = [
    // Avatarlar
    { id: "sa-bear", name: "Boz Ayı", kind: "avatar", pricePart: 50, priceUsd: "0.50", imageUrl: null, active: true, description: "Sevimli boz ayı avatarı" },
    { id: "sa-cat", name: "Gizemli Kedi", kind: "avatar", pricePart: 50, priceUsd: "0.50", imageUrl: null, active: true, description: "Neon gözlü kedi avatarı" },
    { id: "sa-fox", name: "Kurnaz Tilki", kind: "avatar", pricePart: 75, priceUsd: "0.75", imageUrl: null, active: true, description: "Turuncu tilki avatarı" },
    { id: "sa-dragon", name: "Kripto Dragon", kind: "avatar", pricePart: 200, priceUsd: "2.00", imageUrl: null, active: true, description: "NFT Dragon — nadir karakter" },
    { id: "sa-unicorn", name: "Unicorn DeFi", kind: "avatar", pricePart: 150, priceUsd: "1.50", imageUrl: null, active: true, description: "Gökkuşağı rengi unicorn" },
    { id: "sa-owl", name: "Bilge Baykuş", kind: "avatar", pricePart: 80, priceUsd: "0.80", imageUrl: null, active: true, description: "Derin mor arka planlı baykuş" },
    { id: "sa-wolf", name: "Alpha Kurt", kind: "avatar", pricePart: 120, priceUsd: "1.20", imageUrl: null, active: true, description: "Mavi arka planlı alpha kurt" },
    { id: "sa-lion", name: "Aslan Kral", kind: "avatar", pricePart: 180, priceUsd: "1.80", imageUrl: null, active: true, description: "Premium altın aslan avatarı" },
    { id: "sa-panda", name: "Panda DAO", kind: "avatar", pricePart: 65, priceUsd: "0.65", imageUrl: null, active: true, description: "Yeşil orman pandası" },
    { id: "sa-robot", name: "AI Robot", kind: "avatar", pricePart: 100, priceUsd: "1.00", imageUrl: null, active: true, description: "Gelecek nesil robot avatarı" },
    // Çerçeveler
    { id: "sf-gold", name: "Altın Çerçeve", kind: "frame", pricePart: 100, priceUsd: "1.00", imageUrl: null, active: true, description: "Parlak altın profil çerçevesi" },
    { id: "sf-diamond", name: "Diamond Frame", kind: "frame", pricePart: 250, priceUsd: "2.50", imageUrl: null, active: true, description: "Diamond tier — mavi parlak" },
    { id: "sf-neon", name: "Neon Glow", kind: "frame", pricePart: 150, priceUsd: "1.50", imageUrl: null, active: true, description: "Yeşil neon ışıltılı çerçeve" },
    { id: "sf-fire", name: "Ateş Çerçeve", kind: "frame", pricePart: 175, priceUsd: "1.75", imageUrl: null, active: true, description: "Alev efektli turuncu çerçeve" },
    { id: "sf-galaxy", name: "Galaxy Frame", kind: "frame", pricePart: 200, priceUsd: "2.00", imageUrl: null, active: true, description: "Galaksi rengi uzay çerçevesi" },
    { id: "sf-rainbow", name: "Rainbow", kind: "frame", pricePart: 120, priceUsd: "1.20", imageUrl: null, active: true, description: "7 renk gökkuşağı çerçeve" },
    { id: "sf-ice", name: "Buz Kristal", kind: "frame", pricePart: 130, priceUsd: "1.30", imageUrl: null, active: true, description: "Buz kristali soğuk mavi çerçeve" },
    { id: "sf-plasma", name: "Plasma", kind: "frame", pricePart: 220, priceUsd: "2.20", imageUrl: null, active: true, description: "Mor-pembe plasma enerji çerçeve" },
    // Temalar
    { id: "st-dark", name: "Dark Pro Tema", kind: "theme", pricePart: 80, priceUsd: "0.80", imageUrl: null, active: true, description: "Koyu arka plan, altın aksan" },
    { id: "st-neon", name: "Neon Gece", kind: "theme", pricePart: 100, priceUsd: "1.00", imageUrl: null, active: true, description: "Siyah arka plan, neon yeşil detaylar" },
    { id: "st-ocean", name: "Okyanus Mavisi", kind: "theme", pricePart: 80, priceUsd: "0.80", imageUrl: null, active: true, description: "Derin mavi tonlar, dalga animasyonu" },
    { id: "st-sunset", name: "Gün Batımı", kind: "theme", pricePart: 90, priceUsd: "0.90", imageUrl: null, active: true, description: "Turuncu-mor degrade arka plan" },
    // Rozetler
    { id: "sb-og", name: "OG Üye Rozeti", kind: "badge", pricePart: 500, priceUsd: "5.00", imageUrl: null, active: true, description: "Saphara ilk 1000 üyesi rozeti — nadir" },
    { id: "sb-whale", name: "PART Whale", kind: "badge", pricePart: 300, priceUsd: "3.00", imageUrl: null, active: true, description: "10.000+ PART sahibi balina rozeti" },
    { id: "sb-creator", name: "Creator Pro", kind: "badge", pricePart: 150, priceUsd: "1.50", imageUrl: null, active: true, description: "İçerik üreticisi profil rozeti" },
];
/* ── Sanal mağaza route'ları ──────────────────────────────────────────── */
export async function registerStoreRoutes(app) {
    /* Mağaza ürünleri */
    app.get("/store", async (req) => {
        const { kind } = req.query;
        try {
            const items = await prisma.storeItem.findMany({
                where: { active: true, ...(kind ? { kind: kind } : {}) },
                orderBy: { createdAt: "desc" },
            });
            return { items };
        }
        catch {
            const filtered = kind ? DEMO_STORE_ITEMS.filter(i => i.kind === kind) : DEMO_STORE_ITEMS;
            return { items: filtered, demo: true };
        }
    });
    /* Kullanıcı envanteri */
    app.get("/inventory", async (req, reply) => {
        const userId = requireAuth(req, reply);
        if (!userId)
            return;
        const items = await prisma.userInventory.findMany({
            where: { userId },
            include: { item: true },
        });
        return { items };
    });
    /* Satın alma — txHash ile BSC üzerinde doğrulama yapılır */
    app.post("/store/:itemId/buy", async (req, reply) => {
        const userId = requireAuth(req, reply);
        if (!userId)
            return;
        const { itemId } = req.params;
        const { txHash, currency = "PART" } = req.body;
        const item = await prisma.storeItem.findUnique({ where: { id: itemId } });
        if (!item || !item.active)
            return reply.code(404).send({ error: "Ürün bulunamadı" });
        /* Ücretli ürünlerde txHash zorunlu ve BSC'de doğrulanır */
        const price = Number(item.pricePart ?? 0);
        if (price > 0) {
            if (!txHash)
                return reply.code(400).send({ error: "Ödeme txHash zorunlu" });
            const valid = await verifyBscTx(txHash, currency);
            if (!valid.ok)
                return reply.code(402).send({ error: `Ödeme doğrulanamadı: ${valid.reason}` });
            /* Aynı txHash daha önce kullanılmış mı? */
            const used = await prisma.userInventory.findFirst({ where: { txHash } });
            if (used)
                return reply.code(409).send({ error: "Bu işlem zaten kullanılmış" });
        }
        try {
            const inv = await prisma.userInventory.create({
                data: { userId, itemId, txHash: txHash ?? null },
                include: { item: true },
            });
            return reply.code(201).send(inv);
        }
        catch {
            return reply.code(409).send({ error: "Bu ürüne zaten sahipsin" });
        }
    });
    /* Kuşan (avatar/çerçeve/tema aktif et) */
    app.post("/inventory/:invId/equip", async (req, reply) => {
        const userId = requireAuth(req, reply);
        if (!userId)
            return;
        const { invId } = req.params;
        const inv = await prisma.userInventory.findUnique({ where: { id: invId }, include: { item: true } });
        if (!inv || inv.userId !== userId)
            return reply.code(403).send({ error: "Yetkisiz" });
        if (inv.item.kind === "avatar") {
            /* Identifier → imageName (StoreVisuals.tsx'in beklediği slug) */
            await prisma.user.update({ where: { id: userId }, data: { avatarUrl: inv.item.imageUrl } });
        }
        else if (inv.item.kind === "frame") {
            await prisma.user.update({ where: { id: userId }, data: { activeFrame: inv.item.imageUrl } });
        }
        await prisma.userInventory.updateMany({ where: { userId }, data: { equipped: false } });
        await prisma.userInventory.update({ where: { id: invId }, data: { equipped: true } });
        return { equipped: true, applied: inv.item.kind };
    });
    /* Fiyat bilgisi + treasury adresi (frontend'in approve çağrısı için) */
    app.get("/store/payment-info", async () => {
        return {
            treasury: TREASURY,
            partToken: PART_TOKEN,
            usdtToken: USDT_BSC,
            chainId: 56,
            network: "BSC Mainnet",
        };
    });
    /* Admin: mağazaya yeni ürün ekle (imageUrl PNG/SVG/HTTP destekler) */
    app.post("/store/admin/items", async (req, reply) => {
        const userId = requireAuth(req, reply);
        if (!userId)
            return;
        const { name, imageUrl, pricePart, kind, active } = req.body;
        if (!name?.trim())
            return reply.code(400).send({ error: "name zorunlu" });
        const VALID_KINDS = ["avatar", "frame", "theme", "badge", "effect"];
        if (kind && !VALID_KINDS.includes(kind))
            return reply.code(400).send({ error: `kind şunlardan biri olmalı: ${VALID_KINDS.join(", ")}` });
        /* imageUrl: HTTP URL (PNG/SVG/GIF/WebP) veya keyword (storeVisuals tarafından eşlenir) */
        let finalImageUrl = imageUrl;
        if (imageUrl?.startsWith("http")) {
            try {
                new URL(imageUrl);
            }
            catch {
                return reply.code(400).send({ error: "Geçersiz imageUrl" });
            }
        }
        const item = await prisma.storeItem.create({
            data: {
                name: name.trim(),
                imageUrl: finalImageUrl ?? "",
                pricePart: pricePart ?? 0,
                kind: (kind ?? "avatar"),
                active: active ?? true,
            },
        });
        return reply.code(201).send(item);
    });
}
