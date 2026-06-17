/**
 * İçerik Bot Servisi
 * Bot hesapları belirli aralıklarla güncel konu, PART coin ve
 * haberler hakkında otomatik gönderi paylaşır.
 * Picsum.photos'tan ücretsiz, seed bazlı görseller kullanılır.
 */

import { prisma } from "../db/client";
import { upsertHashtags } from "../routes/trending";
import { getPartMarketData, getBnbData } from "./market-data";
import { getNews } from "./news";

/* ── Gönderi şablon havuzu ── */
const TEMPLATES = {
  part_price: [
    "PART token şu an ${PRICE} USDT. {CHANGE} Bu momentum devam ederse 🚀 #PART #BNBChain #Kripto",
    "Güncel PART fiyatı: ${PRICE} | 24s değişim: {CHANGE} | BNB Chain'in sosyal tokenı 💎 #PART",
    "PART/USDT: ${PRICE} — Saphara platformundaki ödeme tokenı. Güçlü fundamentaller! #PARTCoin #DeFi",
    "On-chain veriler: PART ${PRICE} USDT. Topluluk büyüyor, fiyat takip ediyor 📈 #PART #Web3",
  ],
  bnb_price: [
    "BNB şu an ${PRICE}. BSC ekosistemi canlanıyor, PART da bundan payını alacak 🔥 #BNB #BSC",
    "BNB fiyatı ${PRICE} USDT. BNB Chain üzerindeki projelere olumlu yansıyor #BNBChain #Kripto",
  ],
  crypto_news: [
    "Güncel kripto haberi: {TITLE} — Piyasalar bunu nasıl yorumluyor? #Kripto #DeFi",
    "Önemli gelişme: {TITLE} 🗞️ Web3 dünyası değişiyor. #Blockchain #Kripto",
    "Kripto gündem: {TITLE} — PART bu trendden nasıl etkilenir? #BNBChain #PART",
  ],
  general_news: [
    "Teknoloji dünyasından: {TITLE} 💡 #Teknoloji #Web3",
    "Güncel: {TITLE} — Blockchain bu alanda da devrim yaratacak. #Innovation",
    "Önemli haber: {TITLE} 📰 Kripto ve geleneksel finans yakınlaşıyor.",
  ],
  saphara_promo: [
    "Saphara'da {FOLLOWERS} takipçiye ulaştım! İçerik üretiyorum, PART kazanıyorum 🎉 #Saphara #PART",
    "Bu ay Saphara'da {POSTS} gönderi paylaştım. Algoritmalar içerik üreticileri ödüllendiriyor 📲",
    "Saphara Studio ile video düzenledim — masaüstü uygulama gerek yok! Tarayıcıda 4K 🎬 #SapharaStudio",
    "Saphara Market'te yeni ürün! PART ile sahip olabilirsiniz. Platform gerçekten büyüyor 🛒",
    "Cüzdanımı Saphara'ya bağladım, SIWE ile 10 saniyede giriş. Şifre derdi yok! 🔐 #Web3Auth",
    "Saphara botları spam yapmıyor, kaliteli içerik ödüllendiriyor. Fair launch ruhu 💯 #Saphara",
  ],
  lifestyle: [
    "Kripto ile özgür yaşam: Sabah kahve ☕ öğleden sonra Saphara içerik 📱 akşam PnL kontrol 📊",
    "Pasif gelir yolculuğu: Saphara'dan PART + staking getirisi. Her gün biraz daha özgür 🌟",
    "Web3 jenerasyonu: Verilerini kontrol et, içeriğinden kazan, kendin yönet 🔑 #Web3Life",
    "Gün bitti, günlük kripto hedefi tamamlandı. Düzenli içerik = Düzenli PART 🎯",
    "Dijital varlık oluşturmak için doğru yer: Saphara. İçerik üret, topluluk kur, kazan 💪",
  ],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function imageUrl(seed: number | string): string {
  return `https://picsum.photos/seed/${seed}/${800 + Math.floor(Math.random() * 400)}/${400 + Math.floor(Math.random() * 300)}`;
}

/** Anlık piyasa verisini şablona yerleştir */
async function buildPricePost(): Promise<string> {
  try {
    const [part, bnb] = await Promise.all([getPartMarketData(), getBnbData()]);
    const coinFlip = Math.random() > 0.5;
    if (coinFlip) {
      const tmpl = pickRandom(TEMPLATES.part_price);
      const change = part.priceChange24h >= 0
        ? `+${part.priceChange24h.toFixed(2)}% 24 saatte 📈`
        : `${part.priceChange24h.toFixed(2)}% 24 saatte 📉`;
      return tmpl.replace("{PRICE}", part.priceUsd.toFixed(4)).replace("{CHANGE}", change);
    } else {
      const tmpl = pickRandom(TEMPLATES.bnb_price);
      return tmpl.replace("{PRICE}", bnb.priceUsd.toFixed(2));
    }
  } catch {
    return pickRandom(TEMPLATES.saphara_promo)
      .replace("{FOLLOWERS}", String(Math.floor(Math.random() * 900 + 100)))
      .replace("{POSTS}", String(Math.floor(Math.random() * 50 + 10)));
  }
}

/** Güncel haberden içerik üret */
async function buildNewsPost(): Promise<{ text: string; mediaUrl?: string }> {
  try {
    const cat = Math.random() > 0.5 ? "crypto" : "technology";
    const news = await getNews(cat);
    if (news.length > 0) {
      const item = pickRandom(news.slice(0, 10));
      const tmpl = cat === "crypto"
        ? pickRandom(TEMPLATES.crypto_news)
        : pickRandom(TEMPLATES.general_news);
      const title = item.title.slice(0, 100);
      return {
        text: tmpl.replace("{TITLE}", title),
        mediaUrl: item.imageUrl,
      };
    }
  } catch { /* fallback */ }

  return { text: pickRandom(TEMPLATES.lifestyle) };
}

/** Bir bot hesabı için gönderi oluştur */
async function createBotPost(botId: string): Promise<void> {
  const strategy = Math.random();
  let text: string;
  let mediaUrl: string | undefined;

  if (strategy < 0.3) {
    // %30: fiyat güncellemesi
    text = await buildPricePost();
    if (Math.random() > 0.6) mediaUrl = imageUrl(`price_${Date.now()}`);
  } else if (strategy < 0.55) {
    // %25: haber paylaşımı
    const result = await buildNewsPost();
    text = result.text;
    mediaUrl = result.mediaUrl ?? (Math.random() > 0.5 ? imageUrl(`news_${Date.now()}`) : undefined);
  } else if (strategy < 0.75) {
    // %20: Saphara/PART tanıtımı
    text = pickRandom(TEMPLATES.saphara_promo)
      .replace("{FOLLOWERS}", String(Math.floor(Math.random() * 900 + 100)))
      .replace("{POSTS}", String(Math.floor(Math.random() * 50 + 10)));
    if (Math.random() > 0.4) mediaUrl = imageUrl(`promo_${Date.now()}`);
  } else {
    // %25: lifestyle + kripto
    text = pickRandom(TEMPLATES.lifestyle);
    if (Math.random() > 0.5) mediaUrl = imageUrl(`life_${Date.now()}`);
  }

  const post = await prisma.post.create({
    data: {
      authorId: botId,
      text,
      mediaUrl,
      mediaType: mediaUrl ? "image" : undefined,
      likes: Math.floor(Math.random() * 200),
      repostCount: Math.floor(Math.random() * 50),
      qualityScore: 0.4 + Math.random() * 0.5,
    },
  });

  await upsertHashtags(text, post.id);
}

/** Bot posting servisi başlat */
export function startContentBot(): void {
  const intervalMs = Number(process.env.BOT_POST_INTERVAL_MS ?? "1800000"); // 30 dk default
  const postsPerCycle = Number(process.env.BOT_POSTS_PER_CYCLE ?? "3");

  const runCycle = async () => {
    try {
      // BOT_ handle'ı olan kullanıcılar veya rastgele seç
      const bots = await prisma.user.findMany({
        where: {
          handle: { contains: "_" },
          walletAddress: { startsWith: "0x0000" },
        },
        select: { id: true },
        take: 200,
      });

      if (bots.length === 0) return;

      // Her döngüde rastgele postsPerCycle bot gönderi atar
      const selected = bots.sort(() => Math.random() - 0.5).slice(0, postsPerCycle);
      await Promise.allSettled(selected.map((b) => createBotPost(b.id)));
    } catch (e) {
      const msg = (e as Error)?.message ?? "";
      if (msg.includes("Can't reach database") || msg.includes("ECONNREFUSED")) return;
      console.error("[ContentBot] Hata:", e);
    }
  };

  // İlk çalıştırma: 2 dakika sonra (sunucu tam ayağa kalksın)
  const first = setTimeout(() => {
    runCycle();
    const interval = setInterval(runCycle, intervalMs);
    interval.unref();
  }, 2 * 60 * 1000);
  first.unref();

  console.log(`[ContentBot] Başlatıldı — her ${intervalMs / 60000} dakikada ${postsPerCycle} gönderi`);
}

/** Manuel tek çevrim (test için) */
export async function runBotCycleOnce(count = 5): Promise<number> {
  const bots = await prisma.user.findMany({
    where: { walletAddress: { startsWith: "0x0000" } },
    select: { id: true },
    take: 200,
  });
  if (bots.length === 0) return 0;
  const selected = bots.sort(() => Math.random() - 0.5).slice(0, count);
  const results = await Promise.allSettled(selected.map((b) => createBotPost(b.id)));
  return results.filter((r) => r.status === "fulfilled").length;
}
