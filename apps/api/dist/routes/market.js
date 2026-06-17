import { prisma } from "../db/client";
import { requireAuth } from "./auth";
const PLATFORM_COMMISSION_PCT = 2.5; // %2.5 platform komisyonu
const DEMO_LISTINGS = [
    { id: "dl-1", title: "Saphara NFT Koleksiyon Seti — Genesis #001", description: "Platform genesis koleksiyonundan özel bir NFT. Yalnızca 500 adet basılacak.", category: "nft", pricePart: 250, imageUrl: "https://api.dicebear.com/9.x/shapes/svg?seed=genesis001&backgroundColor=f0b429", seller: { handle: "saphara_official", name: "Saphara", avatarUrl: null, verified: true, walletAddress: null }, status: "Listed", views: 1840 },
    { id: "dl-2", title: "DeFi Telegram Bot Kaynak Kodu", description: "BNB Chain üzerinde çalışan gelişmiş DEX arbitraj botu. Python & web3.py ile yazılmış, tam dokümanlı.", category: "code", pricePart: 800, imageUrl: "https://api.dicebear.com/9.x/shapes/svg?seed=defibot&backgroundColor=5b8def", seller: { handle: "blockchain_dev", name: "Blockchain Dev", avatarUrl: null, verified: true, walletAddress: null }, status: "Listed", views: 3210 },
    { id: "dl-3", title: "Kripto Dashboard Tasarım Paketi (Figma)", description: "12 adet ekran, dark/light mod, komponent kütüphanesi dahil. Figma + Adobe XD formatları.", category: "design", pricePart: 150, imageUrl: "https://api.dicebear.com/9.x/shapes/svg?seed=figmaui&backgroundColor=a855f7", seller: { handle: "ux_designer", name: "UX Designer", avatarUrl: null, verified: false, walletAddress: null }, status: "Listed", views: 2450 },
    { id: "dl-4", title: "Web3 Pazarlama Rehberi (E-Kitap, 180 sayfa)", description: "NFT, DeFi ve token projelerini nasıl pazarlarsınız? Twitter, Discord, Telegram stratejileri.", category: "ebook", pricePart: 60, imageUrl: "https://api.dicebear.com/9.x/shapes/svg?seed=ebook&backgroundColor=10b981", seller: { handle: "marketing_guru", name: "Marketing Guru", avatarUrl: null, verified: false, walletAddress: null }, status: "Listed", views: 1120 },
    { id: "dl-5", title: "Solidity Akıllı Sözleşme Güvenlik Kursu", description: "10 modül, 40+ saat içerik. Reentrancy, overflow, access control güvenlik açıkları ve düzeltmeleri.", category: "course", pricePart: 350, imageUrl: "https://api.dicebear.com/9.x/shapes/svg?seed=soliditycourse&backgroundColor=f97316", seller: { handle: "security_expert", name: "Güvenlik Uzmanı", avatarUrl: null, verified: true, walletAddress: null }, status: "Listed", views: 4780 },
    { id: "dl-6", title: "Kripto Portföy Takip Aracı (Excel + Sheets)", description: "50+ exchange entegrasyonu, vergi raporu, P&L analizi. Yıllık otomatik güncelleme dahil.", category: "tools", pricePart: 45, imageUrl: "https://api.dicebear.com/9.x/shapes/svg?seed=portfolio&backgroundColor=06b6d4", seller: { handle: "fintech_tools", name: "FinTech Tools", avatarUrl: null, verified: false, walletAddress: null }, status: "Listed", views: 890 },
    { id: "dl-7", title: "4K Kripto Fotoğraf Paketi (500 görsel)", description: "Ticari lisanslı blockchain, kripto ve teknoloji temalı 4K fotoğraflar. Blog ve sosyal medya için.", category: "photos", pricePart: 80, imageUrl: "https://api.dicebear.com/9.x/shapes/svg?seed=cryptophotos&backgroundColor=e11d48", seller: { handle: "photo_studio", name: "Photo Studio", avatarUrl: null, verified: false, walletAddress: null }, status: "Listed", views: 670 },
    { id: "dl-8", title: "Token Analiz & Araştırma Raporu Şablonları", description: "Tokenomics, vesting, team analysis için hazır şablonlar. DYOR sürecini hızlandır.", category: "analytics", pricePart: 120, imageUrl: "https://api.dicebear.com/9.x/shapes/svg?seed=analytics&backgroundColor=8b5cf6", seller: { handle: "crypto_analyst", name: "Kripto Analist", avatarUrl: null, verified: true, walletAddress: null }, status: "Listed", views: 2130 },
];
export async function registerMarketRoutes(app) {
    /* ── List listings (public) ─────────────────────────────────── */
    app.get("/listings", async (req) => {
        const { status = "Listed", category, seller, limit = "24", offset = "0", sort = "newest", minPrice, maxPrice, } = req.query;
        const orderBy = sort === "price_asc" ? { pricePart: "asc" } :
            sort === "price_desc" ? { pricePart: "desc" } :
                sort === "popular" ? { views: "desc" } :
                    { createdAt: "desc" };
        try {
            const listings = await prisma.listing.findMany({
                where: {
                    status: status,
                    ...(category ? { category } : {}),
                    ...(seller ? { seller: { handle: seller } } : {}),
                    ...(minPrice ? { pricePart: { gte: Number(minPrice) } } : {}),
                    ...(maxPrice ? {
                        pricePart: {
                            ...(minPrice ? { gte: Number(minPrice) } : {}),
                            lte: Number(maxPrice),
                        },
                    } : {}),
                },
                orderBy,
                take: Math.min(Number(limit), 100),
                skip: Number(offset),
                include: {
                    seller: { select: { handle: true, name: true, avatarUrl: true, verified: true } },
                },
            });
            return { items: listings };
        }
        catch {
            const filtered = category ? DEMO_LISTINGS.filter(l => l.category === category) : DEMO_LISTINGS;
            return { items: filtered, demo: true };
        }
    });
    /* ── Single listing ─────────────────────────────────────────── */
    app.get("/listings/:id", async (req, reply) => {
        const { id } = req.params;
        const listing = await prisma.listing.findUnique({
            where: { id },
            include: {
                seller: { select: { handle: true, name: true, avatarUrl: true, verified: true } },
            },
        });
        if (!listing)
            return reply.code(404).send({ error: "İlan bulunamadı" });
        // Track view
        await prisma.listing.update({ where: { id }, data: { views: { increment: 1 } } });
        const price = Number(listing.pricePart);
        const commission = price * (Number(listing.commissionPct) / 100);
        const sellerReceives = price - commission;
        return { ...listing, commission, sellerReceives };
    });
    /* ── Create listing ─────────────────────────────────────────── */
    app.post("/listings", async (req, reply) => {
        const userId = requireAuth(req, reply);
        if (!userId)
            return;
        const { title, description, imageUrl, pricePart, metadataURI, category = "digital", nftTokenId, } = req.body;
        if (!title?.trim())
            return reply.code(400).send({ error: "Başlık gerekli" });
        if (!pricePart || Number(pricePart) <= 0)
            return reply.code(400).send({ error: "Geçerli fiyat girin" });
        // If NFT, check ownership
        if (nftTokenId) {
            const token = await prisma.nftToken.findUnique({ where: { id: nftTokenId } });
            if (!token)
                return reply.code(404).send({ error: "NFT bulunamadı" });
            if (token.ownerId !== userId)
                return reply.code(403).send({ error: "Bu NFT size ait değil" });
            await prisma.nftToken.update({
                where: { id: nftTokenId },
                data: { listed: true, listingPrice: Number(pricePart) },
            });
        }
        const listing = await prisma.listing.create({
            data: {
                sellerId: userId,
                title: title.trim(),
                description: description?.trim(),
                imageUrl,
                pricePart: Number(pricePart),
                metadataURI,
                category,
                commissionPct: PLATFORM_COMMISSION_PCT,
                nftTokenId,
            },
        });
        const price = Number(listing.pricePart);
        const commission = price * (PLATFORM_COMMISSION_PCT / 100);
        return reply.code(201).send({
            listing,
            commission,
            sellerReceives: price - commission,
            message: `İlan oluşturuldu. Satışta %${PLATFORM_COMMISSION_PCT} komisyon uygulanır.`,
        });
    });
    /* ── Update listing price ───────────────────────────────────── */
    app.patch("/listings/:id", async (req, reply) => {
        const userId = requireAuth(req, reply);
        if (!userId)
            return;
        const { id } = req.params;
        const { pricePart, description, imageUrl } = req.body;
        const listing = await prisma.listing.findUnique({ where: { id } });
        if (!listing)
            return reply.code(404).send({ error: "İlan bulunamadı" });
        if (listing.sellerId !== userId)
            return reply.code(403).send({ error: "Bu ilan size ait değil" });
        if (listing.status !== "Listed")
            return reply.code(400).send({ error: "Satılan ilan güncellenemez" });
        const updated = await prisma.listing.update({
            where: { id },
            data: {
                ...(pricePart ? { pricePart: Number(pricePart) } : {}),
                ...(description ? { description } : {}),
                ...(imageUrl ? { imageUrl } : {}),
            },
        });
        return { ok: true, listing: updated };
    });
    /* ── Cancel listing ─────────────────────────────────────────── */
    app.delete("/listings/:id", async (req, reply) => {
        const userId = requireAuth(req, reply);
        if (!userId)
            return;
        const { id } = req.params;
        const listing = await prisma.listing.findUnique({ where: { id } });
        if (!listing)
            return reply.code(404).send({ error: "İlan bulunamadı" });
        if (listing.sellerId !== userId)
            return reply.code(403).send({ error: "Yetki yok" });
        if (listing.status !== "Listed")
            return reply.code(400).send({ error: "Aktif olmayan ilan silinemez" });
        await prisma.$transaction([
            prisma.listing.update({ where: { id }, data: { status: "Refunded" } }),
            ...(listing.nftTokenId
                ? [prisma.nftToken.update({
                        where: { id: listing.nftTokenId },
                        data: { listed: false, listingPrice: null },
                    })]
                : []),
        ]);
        return { ok: true };
    });
    /* ── Buy listing ────────────────────────────────────────────── */
    app.post("/listings/:id/buy", async (req, reply) => {
        const userId = requireAuth(req, reply);
        if (!userId)
            return;
        const { id } = req.params;
        const listing = await prisma.listing.findUnique({
            where: { id },
            include: { seller: { select: { id: true, handle: true } } },
        });
        if (!listing)
            return reply.code(404).send({ error: "İlan bulunamadı" });
        if (listing.status !== "Listed")
            return reply.code(400).send({ error: "Bu ilan artık mevcut değil" });
        if (listing.sellerId === userId)
            return reply.code(400).send({ error: "Kendi ilanınızı satın alamazsınız" });
        const price = Number(listing.pricePart);
        const commission = price * (Number(listing.commissionPct) / 100);
        const sellerReceives = price - commission;
        await prisma.$transaction([
            prisma.listing.update({
                where: { id },
                data: { status: "Completed", buyerAddress: userId, soldAt: new Date() },
            }),
            // Seller earns their share
            prisma.user.update({
                where: { id: listing.sellerId },
                data: { earningsPart: { increment: sellerReceives } },
            }),
            // Transfer NFT ownership if applicable
            ...(listing.nftTokenId
                ? [prisma.nftToken.update({
                        where: { id: listing.nftTokenId },
                        data: {
                            ownerId: userId,
                            listed: false,
                            listingPrice: null,
                            soldAt: new Date(),
                            salePrice: price,
                        },
                    })]
                : []),
        ]);
        return {
            ok: true,
            price,
            commission,
            sellerReceives,
            message: `Satın alma başarılı! ${price} PART ödendi, ${commission.toFixed(2)} PART komisyon.`,
        };
    });
    /* ── On-chain sync ──────────────────────────────────────────── */
    app.post("/listings/:id/sync", async (req, reply) => {
        const userId = requireAuth(req, reply);
        if (!userId)
            return;
        const { id } = req.params;
        const existing = await prisma.listing.findUnique({ where: { id }, select: { sellerId: true } });
        if (!existing)
            return reply.code(404).send({ error: "İlan bulunamadı" });
        if (existing.sellerId !== userId)
            return reply.code(403).send({ error: "Yetkisiz" });
        const { onchainId, status } = req.body;
        const listing = await prisma.listing.update({
            where: { id },
            data: {
                ...(onchainId ? { onchainId: BigInt(onchainId) } : {}),
                ...(status ? { status: status } : {}),
            },
        });
        return { id: listing.id, status: listing.status };
    });
    /* ── Market summary ─────────────────────────────────────────── */
    app.get("/market/summary", async () => {
        const [total, nftCount, volume] = await Promise.all([
            prisma.listing.count({ where: { status: "Listed" } }),
            prisma.listing.count({ where: { status: "Listed", category: "nft" } }),
            prisma.listing.aggregate({
                _sum: { pricePart: true },
                where: { status: "Completed" },
            }),
        ]);
        return {
            activeListings: total,
            nftListings: nftCount,
            totalVolume: Number(volume._sum.pricePart ?? 0),
            commissionPct: PLATFORM_COMMISSION_PCT,
        };
    });
}
