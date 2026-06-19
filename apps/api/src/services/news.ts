/**
 * Çok kaynaklı haber servisi.
 * Kaynak öncelik sırası: CryptoPanic > CoinTelegraph/CoinDesk/Decrypt/TheBlock/BitcoinMag RSS > GNews > NewsData > HackerNews
 * Kripto haberleri için piyasa duyarlılığı analizi dahildir.
 */

import { RateLimiter } from "@saphara/security";

export interface NewsItem {
  id:          string;
  title:       string;
  description?: string;
  url:         string;
  imageUrl?:   string;
  source:      string;
  publishedAt: string;
  category?:   string;
  sentiment?:  "bullish" | "bearish" | "neutral";
  votes?:      { positive: number; negative: number; important: number };
  currencies?: string[];
}

export interface MarketAnalysis {
  sentiment:     "bullish" | "bearish" | "neutral";
  sentimentScore: number;         // -100 to +100
  summary:       string;
  topHeadlines:  string[];
  fearGreedLabel: string;
  fearGreedValue: number;         // 0-100
  marketNote:    string;
}

const TTL_MS         = 5 * 60 * 1000;
const ANALYSIS_TTL   = 10 * 60 * 1000;
const cache          = new Map<string, { at: number; data: NewsItem[] }>();
const analysisCache  = new Map<string, { at: number; data: MarketAnalysis }>();
const apiLimiter     = new RateLimiter(90, 0.01);

const GNEWS_KEY      = process.env.GNEWS_API_KEY;
const NEWSDATA_KEY   = process.env.NEWSDATA_API_KEY;
const CRYPTOPANIC_KEY = process.env.CRYPTOPANIC_API_KEY;

/* ── Yardımcı ─────────────────────────────────────────────────── */

function dedupe(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>();
  return items.filter((it) => {
    const key = it.title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 40);
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });
}

function sortByDate(items: NewsItem[]): NewsItem[] {
  return items.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
}

/* ── RSS parser (lightweight, no npm dep) ─────────────────────── */

function parseRss(xml: string, source: string, category: string): NewsItem[] {
  const items: NewsItem[] = [];
  const itemBlocks = xml.match(/<item>([\s\S]*?)<\/item>/g) ?? [];
  itemBlocks.slice(0, 15).forEach((block, i) => {
    const get = (tag: string) => {
      const m = block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\/${tag}>`, "i"))
        ?? block.match(new RegExp(`<${tag}[^>]*>([^<]+)<\/${tag}>`, "i"));
      return m?.[1]?.trim() ?? "";
    };
    const title = get("title");
    if (!title) return;
    const mediaMatch =
      block.match(/url="([^"]+\.(jpg|jpeg|png|webp))"/i) ??
      block.match(/<media:thumbnail[^>]+url="([^"]+)"/i) ??
      block.match(/<enclosure[^>]+url="([^"]+\.(jpg|jpeg|png|webp))"/i);
    items.push({
      id:          `rss_${source}_${i}_${Date.now()}`,
      title,
      description: get("description").replace(/<[^>]+>/g, "").slice(0, 250),
      url:         get("link") || get("guid"),
      imageUrl:    mediaMatch?.[1],
      source,
      publishedAt: new Date(get("pubDate") || Date.now()).toISOString(),
      category,
    });
  });
  return items;
}

/* ── CryptoPanic (birincil kripto haber kaynağı) ─────────────── */

async function fetchCryptoPanic(filter: "hot" | "rising" | "bullish" | "bearish" = "hot"): Promise<NewsItem[]> {
  const key = CRYPTOPANIC_KEY;
  if (!key) return [];
  try {
    const url = `https://cryptopanic.com/api/v1/posts/?auth_token=${key}&public=true&kind=news&filter=${filter}&regions=en`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return [];
    const json: any = await res.json();
    return (json.results ?? []).map((a: any, i: number): NewsItem => ({
      id:          `cp_${a.id ?? i}`,
      title:       a.title,
      description: a.title,
      url:         a.url ?? `https://cryptopanic.com/news/${a.slug}`,
      imageUrl:    undefined,
      source:      a.source?.title ?? "CryptoPanic",
      publishedAt: a.published_at ?? new Date().toISOString(),
      category:    "crypto",
      sentiment:   filter === "bullish" ? "bullish" : filter === "bearish" ? "bearish" : "neutral",
      votes: {
        positive:  a.votes?.positive ?? 0,
        negative:  a.votes?.negative ?? 0,
        important: a.votes?.important ?? 0,
      },
      currencies: (a.currencies ?? []).map((c: any) => c.code),
    }));
  } catch { return []; }
}

/* ── Kripto RSS kaynakları ────────────────────────────────────── */

const CRYPTO_RSS_FEEDS = [
  { url: "https://cointelegraph.com/rss",              source: "CoinTelegraph" },
  { url: "https://www.coindesk.com/arc/outboundfeeds/rss/", source: "CoinDesk" },
  { url: "https://decrypt.co/feed",                    source: "Decrypt" },
  { url: "https://www.theblock.co/rss.xml",            source: "The Block" },
  { url: "https://bitcoinmagazine.com/feed",           source: "Bitcoin Magazine" },
];

async function fetchCryptoRss(): Promise<NewsItem[]> {
  const results = await Promise.allSettled(
    CRYPTO_RSS_FEEDS.map(async ({ url, source }) => {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; Saphara/1.0; +https://saphara.app)" },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return [] as NewsItem[];
      return parseRss(await res.text(), source, "crypto");
    })
  );
  return results.flatMap((r) => r.status === "fulfilled" ? r.value : []);
}

/* ── Piyasa duyarlılığı analizi ───────────────────────────────── */

function inferSentimentFromTitle(title: string): "bullish" | "bearish" | "neutral" {
  const t = title.toLowerCase();
  const bullish = ["surge","rally","soar","ath","all-time high","bull","gains","rise","moon","pump","breakout","high","record","buy","approval","launch","partnership","adoption"];
  const bearish  = ["crash","plunge","dump","bear","sell","drop","fall","decline","hack","exploit","ban","regulation","fear","loss","down","correction","low","liquidation"];
  const bScore   = bullish.filter(k => t.includes(k)).length;
  const rScore   = bearish.filter(k => t.includes(k)).length;
  if (bScore > rScore) return "bullish";
  if (rScore > bScore) return "bearish";
  return "neutral";
}

function calcSentimentScore(items: NewsItem[]): number {
  if (!items.length) return 0;
  let score = 0;
  for (const it of items) {
    const s = it.sentiment ?? inferSentimentFromTitle(it.title);
    if (s === "bullish") score += 1;
    else if (s === "bearish") score -= 1;
    // CryptoPanic votes boost
    if (it.votes) score += (it.votes.positive - it.votes.negative) * 0.1;
  }
  return Math.max(-100, Math.min(100, (score / items.length) * 20));
}

function getFearGreed(score: number): { label: string; value: number } {
  const value = Math.round(50 + score / 2);
  const clamped = Math.max(0, Math.min(100, value));
  if (clamped >= 80) return { label: "Aşırı Açgözlülük", value: clamped };
  if (clamped >= 60) return { label: "Açgözlülük",        value: clamped };
  if (clamped >= 45) return { label: "Nötr",              value: clamped };
  if (clamped >= 25) return { label: "Korku",             value: clamped };
  return                     { label: "Aşırı Korku",      value: clamped };
}

function buildMarketNote(score: number, label: string): string {
  if (score > 30)  return `Piyasa genel olarak yükseliş eğiliminde görünüyor. ${label} seviyesinde işlem yapılıyor. Dikkatli olun — aşırı iyimserlik düzeltme riskini artırabilir.`;
  if (score > 5)   return `Hafif yükseliş haberleri öne çıkıyor. Piyasa temkinli iyimser bir tutum sergiliyor.`;
  if (score < -30) return `Olumsuz haberler baskın. ${label} seviyesindeki korku genellikle iyi bir satın alma fırsatı olarak değerlendirilir, ancak risk yönetimine dikkat edin.`;
  if (score < -5)  return `Hafif düşüş yönlü haberler mevcut. Piyasa temkinli bir seyir izliyor.`;
  return `Piyasa nötr bir seyir izliyor. Haber akışında net bir yön bulunmuyor.`;
}

export async function getMarketAnalysis(): Promise<MarketAnalysis> {
  const cacheKey = "market_analysis";
  const hit = analysisCache.get(cacheKey);
  if (hit && Date.now() - hit.at < ANALYSIS_TTL) return hit.data;

  const [cpHot, cpBull, cpBear, rss] = await Promise.allSettled([
    fetchCryptoPanic("hot"),
    fetchCryptoPanic("bullish"),
    fetchCryptoPanic("bearish"),
    fetchCryptoRss(),
  ]);

  const hotItems  = cpHot.status  === "fulfilled" ? cpHot.value  : [];
  const bullItems = cpBull.status === "fulfilled" ? (cpBull.value ?? []).map(i => ({...i, sentiment: "bullish" as const})) : [];
  const bearItems = cpBear.status === "fulfilled" ? (cpBear.value ?? []).map(i => ({...i, sentiment: "bearish" as const})) : [];
  const rssItems  = rss.status    === "fulfilled" ? rss.value    : [];

  const allItems  = dedupe([...hotItems, ...bullItems, ...bearItems, ...rssItems]);
  const tagged    = allItems.map(i => ({ ...i, sentiment: i.sentiment ?? inferSentimentFromTitle(i.title) }));

  const score     = calcSentimentScore(tagged);
  const fg        = getFearGreed(score);
  const label     = fg.value >= 50 ? "bullish" : fg.value === 50 ? "neutral" : "bearish";

  const result: MarketAnalysis = {
    sentiment:      label as "bullish" | "bearish" | "neutral",
    sentimentScore: Math.round(score),
    fearGreedValue: fg.value,
    fearGreedLabel: fg.label,
    topHeadlines:   tagged.slice(0, 5).map(i => i.title),
    summary: buildMarketNote(score, fg.label),
    marketNote: `${bullItems.length} yükseliş haberi · ${bearItems.length} düşüş haberi · Toplam ${tagged.length} kaynak analiz edildi.`,
  };

  analysisCache.set(cacheKey, { at: Date.now(), data: result });
  return result;
}

/* ── Harici haber kaynakları ──────────────────────────────────── */

async function fetchGNews(category: string, lang: string): Promise<NewsItem[]> {
  if (!GNEWS_KEY) return [];
  try {
    const res = await fetch(`https://gnews.io/api/v4/top-headlines?category=${category}&lang=${lang}&max=10&apikey=${GNEWS_KEY}`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return [];
    const json: any = await res.json();
    return (json.articles ?? []).map((a: any, i: number): NewsItem => ({
      id: `gnews_${category}_${i}`, title: a.title, description: a.description,
      url: a.url, imageUrl: a.image, source: a.source?.name ?? "GNews",
      publishedAt: a.publishedAt, category,
    }));
  } catch { return []; }
}

async function fetchNewsData(category: string, lang: string): Promise<NewsItem[]> {
  if (!NEWSDATA_KEY) return [];
  try {
    const res = await fetch(`https://newsdata.io/api/1/latest?category=${category}&language=${lang}&apikey=${NEWSDATA_KEY}`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return [];
    const json: any = await res.json();
    return (json.results ?? []).map((a: any, i: number): NewsItem => ({
      id: `newsdata_${category}_${i}`, title: a.title, description: a.description,
      url: a.link, imageUrl: a.image_url, source: a.source_id ?? "NewsData",
      publishedAt: a.pubDate, category,
    }));
  } catch { return []; }
}

async function fetchHackerNews(): Promise<NewsItem[]> {
  try {
    const res = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json", { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return [];
    const ids = (await res.json()) as number[];
    const stories = await Promise.allSettled(
      ids.slice(0, 12).map((id) =>
        fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, { signal: AbortSignal.timeout(5000) }).then((r) => r.json())
      )
    );
    return stories
      .filter((s) => s.status === "fulfilled" && (s as any).value?.title)
      .map((s: any, i) => ({
        id:          `hn_${i}`,
        title:       s.value.title,
        description: `${s.value.score ?? 0} puan · ${s.value.descendants ?? 0} yorum`,
        url:         s.value.url ?? `https://news.ycombinator.com/item?id=${s.value.id}`,
        source:      "Hacker News",
        publishedAt: new Date((s.value.time ?? 0) * 1000).toISOString(),
        category:    "technology",
      }));
  } catch { return []; }
}

async function fetchSportsNews(): Promise<NewsItem[]> {
  try {
    const res = await fetch("https://www.thesportsdb.com/api/v1/json/3/eventspastleague.php?id=4328", { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return [];
    const json: any = await res.json();
    return (json.events ?? []).slice(0, 10).map((e: any, i: number): NewsItem => ({
      id:          `sports_${i}`,
      title:       `${e.strHomeTeam} ${e.intHomeScore ?? "?"} - ${e.intAwayScore ?? "?"} ${e.strAwayTeam}`,
      description: `${e.strLeague} · ${e.strEvent}`,
      url:         e.strVideo ?? `https://www.thesportsdb.com/event/${e.idEvent}`,
      imageUrl:    e.strThumb ?? e.strBanner,
      source:      e.strLeague ?? "TheSportsDB",
      publishedAt: e.dateEvent ? `${e.dateEvent}T${e.strTime ?? "12:00:00"}` : new Date().toISOString(),
      category:    "sports",
    }));
  } catch { return []; }
}

async function fetchMusicNews(): Promise<NewsItem[]> {
  try {
    const res = await fetch("https://api.deezer.com/chart/0/tracks?limit=10", { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return [];
    const json: any = await res.json();
    return (json.data ?? []).map((t: any, i: number): NewsItem => ({
      id:          `music_${i}`,
      title:       `${t.title} — ${t.artist?.name}`,
      description: `Albüm: ${t.album?.title}`,
      url:         t.link,
      imageUrl:    t.album?.cover_big,
      source:      "Deezer Charts",
      publishedAt: new Date().toISOString(),
      category:    "music",
    }));
  } catch { return []; }
}

/* ── Ana getirici ─────────────────────────────────────────────── */

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

export async function getNews(category = "general", lang = "tr"): Promise<NewsItem[]> {
  const cacheKey = `${category}:${lang}`;
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.data;
  if (!apiLimiter.allow("news")) return hit?.data ?? [];

  const items = await withTimeout(fetchByCategory(category, lang), 12000, hit?.data ?? []);
  cache.set(cacheKey, { at: Date.now(), data: items });
  return items;
}

async function fetchByCategory(category: string, lang: string): Promise<NewsItem[]> {
  let items: NewsItem[];

  switch (category) {
    case "crypto": {
      const [cp, rss, g, n] = await Promise.allSettled([
        fetchCryptoPanic("hot"),
        fetchCryptoRss(),
        fetchGNews("technology", lang),
        fetchNewsData("technology", lang),
      ]);
      const cpItems  = cp.status  === "fulfilled" ? cp.value  : [];
      const rssItems = rss.status === "fulfilled" ? rss.value : [];
      const gItems   = g.status   === "fulfilled" ? g.value   : [];
      const nItems   = n.status   === "fulfilled" ? n.value   : [];
      items = dedupe(sortByDate([...cpItems, ...rssItems, ...gItems, ...nItems]));
      items = items.map(i => ({ ...i, sentiment: i.sentiment ?? inferSentimentFromTitle(i.title) }));
      break;
    }
    case "sports":
      items = dedupe(sortByDate([
        ...(await fetchSportsNews()),
        ...(await fetchGNews("sports", lang)),
        ...(await fetchNewsData("sports", lang)),
      ]));
      break;
    case "music":
    case "entertainment":
      items = dedupe(sortByDate([
        ...(await fetchMusicNews()),
        ...(await fetchGNews("entertainment", lang)),
        ...(await fetchNewsData("entertainment", lang)),
      ]));
      break;
    case "technology": {
      const [hn, g, n] = await Promise.allSettled([fetchHackerNews(), fetchGNews(category, lang), fetchNewsData(category, lang)]);
      items = dedupe(sortByDate([
        ...(hn.status === "fulfilled" ? hn.value : []),
        ...(g.status  === "fulfilled" ? g.value  : []),
        ...(n.status  === "fulfilled" ? n.value  : []),
      ]));
      break;
    }
    default: {
      const [g, n, hn, rss] = await Promise.allSettled([
        fetchGNews(category, lang),
        fetchNewsData(category, lang),
        fetchHackerNews(),
        fetchCryptoRss(),
      ]);
      items = dedupe(sortByDate([
        ...(g.status   === "fulfilled" ? g.value   : []),
        ...(n.status   === "fulfilled" ? n.value   : []),
        ...(hn.status  === "fulfilled" ? hn.value  : []),
        ...(rss.status === "fulfilled" ? rss.value : []),
      ]));
    }
  }

  return items;
}
