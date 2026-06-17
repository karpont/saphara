import type { FastifyInstance } from "fastify";
import { prisma } from "../db/client";
import { requireAuth } from "./auth";

const VALID_CATEGORIES = ["general","crypto","defi","nft","tutorial","analysis","community","technology","market","lifestyle"] as const;

/* Paragraph.xyz / Mirror.xyz modelinden ilham */
const BLOG_CREATION_FEE_PART = 50;  // her yeni blog yazısı için 50 PART
const MAX_CONTENT_LENGTH = 50_000;  // ~10k kelime sınırı
const MAX_TITLE_LENGTH   = 200;

/* İçerik moderasyon — açık ihlal terimleri (kaba liste, gerçek sistemde AI moderation yapılır) */
const BANNED_TERMS_TR = [
  "kumar sitesi", "illegal bahis", "kaçak bahis", "kripto dolandırıcılık", "çocuk pornosu",
  "uyuşturucu sat", "silah sat", "hack satış", "şantaj", "dolandırıcılık",
];
const BANNED_TERMS_EN = [
  "child porn", "drug dealing", "weapon sale", "hack sale", "phishing", "scam token",
  "pump and dump", "fraud scheme",
];
const ALL_BANNED = [...BANNED_TERMS_TR, ...BANNED_TERMS_EN];

function hasBannedContent(text: string): string | null {
  const lower = text.toLowerCase();
  for (const term of ALL_BANNED) {
    if (lower.includes(term)) return term;
  }
  return null;
}

function estimateReadingMins(content: string): number {
  const wordCount = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(wordCount / 200));
}

/* ── Demo blog gönderileri — DB yokken gösterilir ────────── */
const DEMO_BLOG_POSTS = [
  {
    id: "demo-b1", title: "PART Token ile Sosyal Medyada Para Kazanmak: Kapsamlı Rehber",
    slug: "part-token-sosyal-medya-kazanc", excerpt: "Web3 sosyal platformlarda içerik üreterek PART token kazanmanın en etkili yollarını keşfedin. Staking, tip ve creator economy rehberi.",
    content: "...", coverUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800",
    category: "crypto", tags: ["PART", "Web3", "CreatorEconomy", "Kazanç"], readingMins: 7,
    likes: 412, views: 8430, featured: true, hasPoll: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), published: true,
    author: { handle: "saphara_official", name: "Saphara Ekibi", avatarUrl: null, verified: true },
  },
  {
    id: "demo-b2", title: "DeFi'de Güvenli Staking: Akıllı Sözleşme Riskleri ve Korunma Yolları",
    slug: "defi-staking-guvenlik", excerpt: "Likidite havuzlarında sermayenizi kaybetmeden kazanç elde etmek için bilmeniz gereken her şey. Impermanent loss, rug pull ve audit.",
    content: "...", coverUrl: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800",
    category: "defi", tags: ["DeFi", "Staking", "Güvenlik", "BNBChain"], readingMins: 11,
    likes: 287, views: 5910, featured: true, hasPoll: false,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(), published: true,
    author: { handle: "defi_analyst", name: "DeFi Analist", avatarUrl: null, verified: true },
  },
  {
    id: "demo-b3", title: "NFT Koleksiyon Oluşturma: ERC-721 ve ERC-2981 Royalty Standardı",
    slug: "nft-koleksiyon-erc721-royalty", excerpt: "Sıfırdan bir NFT koleksiyonu nasıl oluşturulur? ERC-2981 royalty standartı ile yaratıcılar her satıştan otomatik komisyon alır.",
    content: "...", coverUrl: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=800",
    category: "nft", tags: ["NFT", "ERC721", "Royalty", "Creator"], readingMins: 9,
    likes: 341, views: 7120, featured: false, hasPoll: true,
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(), published: true,
    author: { handle: "nft_creator", name: "NFT Creator", avatarUrl: null, verified: false },
  },
  {
    id: "demo-b4", title: "BNB Chain'de Gas Optimizasyonu: İşlem Maliyetlerini %60 Azaltın",
    slug: "bnbchain-gas-optimizasyon", excerpt: "Akıllı sözleşmelerde gas tüketimini minimize etmek için Solidity optimizasyon teknikleri. Mapping, storage ve calldata kullanımı.",
    content: "...", coverUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800",
    category: "technology", tags: ["BNBChain", "Solidity", "Gas", "Dev"], readingMins: 13,
    likes: 198, views: 4320, featured: false, hasPoll: false,
    createdAt: new Date(Date.now() - 86400000 * 9).toISOString(), published: true,
    author: { handle: "blockchain_dev", name: "Blockchain Dev", avatarUrl: null, verified: true },
  },
  {
    id: "demo-b5", title: "Kripto Piyasasında Teknik Analiz: Destek-Direnç ve Fibonacci",
    slug: "kripto-teknik-analiz-fibonacci", excerpt: "Bitcoin ve altcoinlerde destek/direnç seviyeleri nasıl belirlenir? Fibonacci retracement, RSI ve MACD kullanımı.",
    content: "...", coverUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800",
    category: "analysis", tags: ["TeknikAnaliz", "Bitcoin", "Fibonacci", "Trading"], readingMins: 8,
    likes: 523, views: 11240, featured: true, hasPoll: false,
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(), published: true,
    author: { handle: "crypto_analyst", name: "Kripto Analist", avatarUrl: null, verified: true },
  },
  {
    id: "demo-b6", title: "Saphara DAO: Topluluk Kararları ve Yönetişim Rehberi",
    slug: "saphara-dao-yonetisim", excerpt: "PART token sahipleri platform kararlarına nasıl katılır? Oylama mekanizması, proposal oluşturma ve quorum gereksinimleri.",
    content: "...", coverUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800",
    category: "community", tags: ["DAO", "Governance", "PART", "Topluluk"], readingMins: 6,
    likes: 176, views: 3450, featured: false, hasPoll: true,
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(), published: true,
    author: { handle: "saphara_official", name: "Saphara Ekibi", avatarUrl: null, verified: true },
  },
  {
    id: "demo-b7", title: "2025 Kripto Market Görünümü: Yükseliş Trendi mi, Düzeltme mi?",
    slug: "2025-kripto-market-gorunumu", excerpt: "Bitcoin ETF sonrası piyasa dinamikleri, kurumsal yatırım akışı ve altcoin sezonu beklentileri. Uzman analistlerin 2025 tahminleri.",
    content: "...", coverUrl: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800",
    category: "market", tags: ["Market", "Bitcoin", "2025", "Boğa"], readingMins: 10,
    likes: 689, views: 14870, featured: true, hasPoll: true,
    createdAt: new Date(Date.now() - 86400000 * 18).toISOString(), published: true,
    author: { handle: "market_watch", name: "Market Watch", avatarUrl: null, verified: false },
  },
  {
    id: "demo-b8", title: "Web3 Cüzdan Güvenliği: MetaMask ve Trust Wallet'ı Koruma Rehberi",
    slug: "web3-cuzdan-guvenligi", excerpt: "Seed phrase koruması, phishing saldırıları ve donanım cüzdanı kullanımı. 12 kelimelik gizli anahtarınızı güvende tutmanın 10 yolu.",
    content: "...", coverUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800",
    category: "tutorial", tags: ["Güvenlik", "Cüzdan", "MetaMask", "Rehber"], readingMins: 8,
    likes: 445, views: 9870, featured: false, hasPoll: false,
    createdAt: new Date(Date.now() - 86400000 * 21).toISOString(), published: true,
    author: { handle: "security_expert", name: "Güvenlik Uzmanı", avatarUrl: null, verified: true },
  },
];

export async function registerBlogRoutes(app: FastifyInstance) {

  /* ── Info endpoint — fees & rules ──────────────────────────── */
  app.get("/blog/info", async () => {
    return {
      creationFeePartAmount: BLOG_CREATION_FEE_PART,
      maxContentLength: MAX_CONTENT_LENGTH,
      maxTitleLength: MAX_TITLE_LENGTH,
      validCategories: VALID_CATEGORIES,
      moderationPolicy: "Otomatik içerik denetimi + insan moderasyonu aktif. İhlal durumunda yazı kaldırılır, ücret iade edilmez.",
    };
  });

  /* ── List published posts (public) ─────────────────────────── */
  app.get("/blog", async (req) => {
    const { category, featured, limit = "20", cursor } = req.query as {
      category?: string; featured?: string; limit?: string; cursor?: string;
    };
    const take = Math.min(Number(limit), 50);

    try {
      const posts = await prisma.blogPost.findMany({
        where: {
          published: true,
          ...(category ? { category } : {}),
          ...(featured === "true" ? { featured: true } : {}),
          ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
        },
        orderBy: { createdAt: "desc" },
        take,
        include: { author: { select: { handle: true, name: true, avatarUrl: true, verified: true } } },
      });

      return {
        posts,
        nextCursor: posts.length === take ? posts[posts.length - 1].createdAt.toISOString() : null,
      };
    } catch {
      // DB yokken demo gönderiler
      const filtered = category
        ? DEMO_BLOG_POSTS.filter(p => p.category === category)
        : DEMO_BLOG_POSTS;
      return { posts: cursor ? [] : filtered, nextCursor: null, demo: true };
    }
  });

  /* ── Categories list ────────────────────────────────────────── */
  app.get("/blog/categories", async () => {
    const counts = await prisma.blogPost.groupBy({
      by: ["category"],
      where: { published: true },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    });
    return { categories: counts.map((c) => ({ name: c.category, count: c._count.id })) };
  });

  /* ── Get single post by slug (public, increments view) ─────── */
  app.get("/blog/:slug", async (req, reply) => {
    const { slug } = req.params as { slug: string };
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: { author: { select: { handle: true, name: true, avatarUrl: true, verified: true, bio: true } } },
    });
    if (!post || !post.published) return reply.code(404).send({ error: "Post not found" });
    await prisma.blogPost.update({ where: { slug }, data: { views: { increment: 1 } } });
    return post;
  });

  /* ── Create post (auth required + 50 PART fee) ──────────────── */
  app.post("/blog", async (req, reply) => {
    const userId = requireAuth(req, reply);
    if (!userId) return;

    const {
      title, content, excerpt, coverUrl, category, tags,
      hasPoll, pollQuestion, pollOptions, featured,
    } = req.body as {
      title: string; content: string; excerpt?: string; coverUrl?: string;
      category?: string; tags?: string[];
      hasPoll?: boolean; pollQuestion?: string; pollOptions?: string[];
      featured?: boolean;
    };

    /* ── Temel validasyon ── */
    if (!title?.trim() || !content?.trim())
      return reply.code(400).send({ error: "title ve content zorunludur" });
    if (title.trim().length > MAX_TITLE_LENGTH)
      return reply.code(400).send({ error: `Başlık maksimum ${MAX_TITLE_LENGTH} karakter olabilir` });
    if (content.trim().length > MAX_CONTENT_LENGTH)
      return reply.code(400).send({ error: `İçerik maksimum ${MAX_CONTENT_LENGTH} karakter olabilir` });
    if (category && !VALID_CATEGORIES.includes(category as any))
      return reply.code(400).send({ error: `category şunlardan biri olmalı: ${VALID_CATEGORIES.join(", ")}` });
    if (hasPoll && (!pollQuestion || !pollOptions || pollOptions.length < 2))
      return reply.code(400).send({ error: "Anket için pollQuestion ve en az 2 seçenek gerekli" });

    /* ── İçerik moderasyon ── */
    const bannedHit = hasBannedContent(title + " " + content);
    if (bannedHit)
      return reply.code(400).send({ error: "İçerik politikasına aykırı içerik tespit edildi. Yazı yayınlanamaz." });

    /* ── PART bakiye kontrolü ── */
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, earningsPart: true, handle: true },
    });
    if (!user) return reply.code(401).send({ error: "Kullanıcı bulunamadı" });

    const balance = Number(user.earningsPart ?? 0);
    if (balance < BLOG_CREATION_FEE_PART) {
      return reply.code(402).send({
        error: `Blog yazısı oluşturmak için ${BLOG_CREATION_FEE_PART} PART gerekmektedir. Mevcut bakiye: ${balance} PART`,
        required: BLOG_CREATION_FEE_PART,
        balance,
        shortBy: BLOG_CREATION_FEE_PART - balance,
      });
    }

    const slug = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim().replace(/\s+/g, "-")
      .slice(0, 80) + "-" + Date.now().toString(36);

    /* ── PART düş + Post oluştur (transaction) ── */
    const [, post] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { earningsPart: { decrement: BLOG_CREATION_FEE_PART } },
      }),
      prisma.blogPost.create({
        data: {
          authorId: userId, title: title.trim(), slug, content: content.trim(),
          excerpt: excerpt?.trim(), coverUrl, category: category ?? "general",
          tags: tags ?? [], readingMins: estimateReadingMins(content),
          hasPoll: hasPoll ?? false, pollQuestion, pollOptions: pollOptions ?? [],
          featured: featured ?? false,
        },
      }),
    ]);

    return reply.code(201).send({
      ...post,
      feePaid: BLOG_CREATION_FEE_PART,
      message: `Blog yazınız oluşturuldu! ${BLOG_CREATION_FEE_PART} PART ücret kesildi.`,
    });
  });

  /* ── Like a post ────────────────────────────────────────────── */
  app.post("/blog/:slug/like", async (req, reply) => {
    const userId = requireAuth(req, reply);
    if (!userId) return;
    const { slug } = req.params as { slug: string };
    const post = await prisma.blogPost.findUnique({ where: { slug } });
    if (!post) return reply.code(404).send({ error: "Not found" });
    await prisma.blogPost.update({ where: { slug }, data: { likes: { increment: 1 } } });
    return { liked: true };
  });

  /* ── Report a post ──────────────────────────────────────────── */
  app.post("/blog/:slug/report", async (req, reply) => {
    const userId = requireAuth(req, reply);
    if (!userId) return;
    const { slug } = req.params as { slug: string };
    const { reason } = req.body as { reason?: string };
    const post = await prisma.blogPost.findUnique({ where: { slug } });
    if (!post) return reply.code(404).send({ error: "Not found" });

    await prisma.platformSetting.upsert({
      where:  { key: `blog_report_${post.id}_${userId}` },
      update: { value: reason ?? "violation" },
      create: { key: `blog_report_${post.id}_${userId}`, value: reason ?? "violation" },
    });

    return { ok: true, message: "Şikayetiniz alındı. Moderasyon ekibimiz inceleyecek." };
  });
}
