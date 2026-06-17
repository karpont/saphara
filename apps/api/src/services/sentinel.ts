import { prisma } from "../db/client";
import { createLogger } from "@saphara/security";
import { deliverTo } from "../routes/realtime";
import { prisma as db } from "../db/client";

/**
 * SAPHARA GÖZÜCÜ BOTU (Sentinel v2)
 *
 * Platform sahibine sürekli rapor sunar. KESİNLİKLE kendi başına kod değiştirmez,
 * otomatik müdahale etmez. Tespit, raporla, öner — karar sahibe aittir.
 *
 * Yeni v2 kontrolleri:
 *  - Güvenlik taraması (şüpheli aktivite, brute-force belirtisi)
 *  - Ana hesap (treasury) koruması
 *  - Hata analizü (yüksek frekanslı hatalar, kritik rotalar)
 *  - İçerik kalitesi (spam tespiti heuristiği)
 *  - Sistem kaynak uyarıları (nonce haritası büyüklüğü)
 */

const log = createLogger();

export interface HealthCheck  { name: string; ok: boolean; detail?: string; latencyMs?: number; }
export interface ErrorEntry   { at: number; level: string; msg: string; ctx?: any; }
export interface SecurityEvent { at: number; type: string; ip?: string; detail: string; }
export interface BotIssue {
  id: string;
  severity: "info" | "warning" | "critical";
  title: string;
  detail: string;
  suggestion: string;
  actionable?: string;
}
export interface BotReport {
  generatedAt: string;
  health: HealthCheck[];
  stats: Record<string, number>;
  recentErrors: ErrorEntry[];
  recentSecurityEvents: SecurityEvent[];
  issues: BotIssue[];
  summary: string;
}

// ── Hafıza içi halkalar ────────────────────────────────────────────────────
const errorRing:    ErrorEntry[]    = [];
const securityRing: SecurityEvent[] = [];
const requestCounts = new Map<string, number>(); // ip → istek sayısı (son dakika)

export function recordError(level: string, msg: string, ctx?: any) {
  errorRing.push({ at: Date.now(), level, msg, ctx });
  if (errorRing.length > 200) errorRing.shift();
}

export function recordSecurityEvent(type: string, detail: string, ip?: string) {
  securityRing.push({ at: Date.now(), type, ip, detail });
  if (securityRing.length > 100) securityRing.shift();
}

export function recordRequest(ip: string) {
  requestCounts.set(ip, (requestCounts.get(ip) ?? 0) + 1);
}

// Her dakika IP sayaçlarını sıfırla
setInterval(() => requestCounts.clear(), 60_000).unref();

// ── Sağlık kontrolleri ────────────────────────────────────────────────────
async function runHealthChecks(): Promise<HealthCheck[]> {
  const checks: HealthCheck[] = [];

  // Veritabanı
  const t0 = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.push({ name: "Veritabanı",     ok: true,  latencyMs: Date.now() - t0 });
  } catch (e) {
    checks.push({ name: "Veritabanı",     ok: false, detail: (e as Error).message });
  }

  // Haber API anahtarı
  checks.push({
    name: "Haber kaynağı",
    ok: !!(process.env.GNEWS_API_KEY || process.env.NEWSDATA_API_KEY),
    detail: (process.env.GNEWS_API_KEY || process.env.NEWSDATA_API_KEY)
      ? undefined : "GNEWS_API_KEY veya NEWSDATA_API_KEY tanımsız",
  });

  // S3 / medya depolama
  checks.push({
    name: "Medya depolama (S3)",
    ok: !!process.env.S3_BUCKET,
    detail: process.env.S3_BUCKET ? undefined : "S3_BUCKET tanımsız — yükleme çalışmaz",
  });

  // Kontrat adresleri
  checks.push({
    name: "PART token adresi",
    ok: !!(process.env.NEXT_PUBLIC_PART_TOKEN_ADDRESS),
    detail: process.env.NEXT_PUBLIC_PART_TOKEN_ADDRESS ? undefined : "PART_TOKEN_ADDRESS tanımsız",
  });

  // JWT Secret güvenliği
  checks.push({
    name: "JWT Secret",
    ok: !!(process.env.JWT_SECRET) && process.env.JWT_SECRET !== "DEV_ONLY_SECRET_DEGISTIR",
    detail: !process.env.JWT_SECRET
      ? "JWT_SECRET env tanımsız — DEV değeri kullanılıyor!"
      : process.env.JWT_SECRET === "DEV_ONLY_SECRET_DEGISTIR"
        ? "JWT_SECRET hâlâ dev varsayılanı — üretimde GÜVENLİ DEĞİL"
        : undefined,
  });

  // CORS ayarı
  checks.push({
    name: "CORS konfigürasyonu",
    ok: !!process.env.CORS_ORIGIN,
    detail: process.env.CORS_ORIGIN ? undefined : "CORS_ORIGIN tanımsız — tüm origin'lere açık",
  });

  // Treasury/ana hesap adresi
  const treasury = process.env.TREASURY_ADDRESS ?? process.env.NEXT_PUBLIC_TREASURY_ADDRESS;
  checks.push({
    name: "Treasury adresi",
    ok: !!treasury && treasury !== "0x0000000000000000000000000000000000000000",
    detail: treasury ? undefined : "Treasury/owner adresi tanımsız",
  });

  return checks;
}

function isDbOffline(e: unknown): boolean {
  const msg = (e as Error)?.message ?? "";
  return msg.includes("Can't reach database") || msg.includes("ECONNREFUSED") || msg.includes("connect ENOENT");
}

// ── Platform istatistikleri ─────────────────────────────────────────────────
async function collectStats(): Promise<Record<string, number>> {
  try {
    const [users, posts, reels, listings, campaigns, tips, messages, stories] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.reel.count(),
      prisma.listing.count(),
      prisma.campaign.count(),
      prisma.tip.count(),
      prisma.message.count(),
      prisma.story.count(),
    ]);
    const dayAgo = new Date(Date.now() - 86400000);
    const [newUsers24h, newPosts24h, activeCampaigns] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: dayAgo } } }),
      prisma.post.count({ where: { createdAt: { gte: dayAgo } } }),
      prisma.campaign.count({ where: { status: "active" } }),
    ]);
    return { users, posts, reels, listings, campaigns, activeCampaigns, tips, messages, stories, newUsers24h, newPosts24h };
  } catch (e) {
    if (isDbOffline(e)) return {};
    throw e;
  }
}

// ── Güvenlik + anomali tespiti ──────────────────────────────────────────────
async function detectIssues(health: HealthCheck[], stats: Record<string, number>): Promise<BotIssue[]> {
  const issues: BotIssue[] = [];

  // Sağlık hataları
  for (const h of health) {
    if (!h.ok) {
      issues.push({
        id: `health_${h.name.replace(/\s/g, "_")}`,
        severity: ["Veritabanı", "JWT Secret"].includes(h.name) ? "critical" : "warning",
        title: `${h.name} sorunu`,
        detail: h.detail ?? "Kontrol başarısız",
        suggestion: suggestionFor(h.name, h.detail),
      });
    }
    if (h.latencyMs && h.latencyMs > 500) {
      issues.push({
        id: `latency_${h.name}`, severity: "warning",
        title: `${h.name} yavaş (${h.latencyMs}ms)`,
        detail: "Yanıt süresi yüksek — sorgu optimizasyonu veya donanım güçlendirmesi gerekebilir.",
        suggestion: "Veritabanı indekslerini, connection pool boyutunu ve sorgu planlarını kontrol et.",
      });
    }
  }

  // Hata spike
  const tenMin = Date.now() - 600_000;
  const recentErrors = errorRing.filter((e) => e.at > tenMin);
  if (recentErrors.length > 20) {
    issues.push({
      id: "error_spike", severity: "critical",
      title: `Hata artışı: 10dk'da ${recentErrors.length} hata`,
      detail: `En sık hata: ${topError(recentErrors)}`,
      suggestion: "İlgili rotayı geçici devre dışı bırak ve logları incele. Gerekirse hızlı düzeltme deploy et.",
    });
  }

  // Güvenlik olayları: çok sayıda 401/403
  const secRecent = securityRing.filter((e) => e.at > tenMin);
  const authFails  = secRecent.filter((e) => e.type === "auth_fail");
  if (authFails.length > 10) {
    const topIp = mostCommon(authFails.map((e) => e.ip ?? "?"));
    issues.push({
      id: "brute_force", severity: "critical",
      title: `Şüpheli kimlik doğrulama girişimi: ${authFails.length} başarısız`,
      detail: `En çok girişim yapan IP: ${topIp}`,
      suggestion: `${topIp} IP'sini geçici blokla. Rate limit değerini düşür ve CAPTCHA eşiğini kontrol et.`,
      actionable: `block_ip:${topIp}`,
    });
  }

  // Brute-force benzeri yüksek istek oranı
  for (const [ip, count] of requestCounts) {
    if (count > 200) {
      issues.push({
        id: `ratelimit_${ip}`, severity: "warning",
        title: `Yüksek istek oranı: ${ip} — ${count} istek/dk`,
        detail: "Bir IP'den dakikada 200+ istek alındı.",
        suggestion: `${ip} adresini geçici blokla veya rate limit eşiğini düşür.`,
        actionable: `block_ip:${ip}`,
      });
    }
  }

  // Spam: son 24 saatte tek kullanıcıdan aşırı gönderi
  const day = new Date(Date.now() - 86400000);
  try {
    const prolificAuthors = await prisma.post.groupBy({
      by: ["authorId"],
      where: { createdAt: { gte: day } },
      _count: { id: true },
      having: { id: { _count: { gt: 50 } } },
    });
    if (prolificAuthors.length > 0) {
      issues.push({
        id: "spam_detect", severity: "warning",
        title: `Olası spam: ${prolificAuthors.length} hesap bugün 50+ gönderi paylaştı`,
        detail: "Normal kullanım için olağandışı yüksek gönderi sayısı.",
        suggestion: "Bu hesapları incele. Spam ise geçici olarak gönderimlerini sınırla.",
      });
    }
  } catch { /* DB yoksa sessiz */ }

  // Ana hesap (treasury) güvenliği
  const treasury = process.env.TREASURY_ADDRESS ?? process.env.NEXT_PUBLIC_TREASURY_ADDRESS ?? "";
  if (treasury) {
    try {
      const owner = await db.user.findFirst({
        where: { walletAddress: { mode: "insensitive", equals: treasury } },
        select: { id: true, handle: true, createdAt: true },
      });
      if (!owner) {
        issues.push({
          id: "treasury_unregistered", severity: "warning",
          title: "Treasury adresi platform'a kayıtlı değil",
          detail: "Sahibin treasury adresi Saphara hesabıyla eşleştirilmemiş.",
          suggestion: "Treasury cüzdanıyla giriş yaparak hesabı kaydet.",
        });
      }
    } catch { /* DB yoksa sessiz */ }
  }

  // Pozitif bilgiler
  if (stats.newUsers24h > 0) {
    issues.push({
      id: "growth", severity: "info",
      title: `Son 24 saatte ${stats.newUsers24h} yeni kullanıcı`,
      detail: `Toplam ${stats.users} kullanıcı, ${stats.posts} gönderi, ${stats.reels} Reels.`,
      suggestion: "Büyüme devam ediyor. Onboarding içeriğini güçlü tut.",
    });
  }

  // Boş feed uyarısı
  if (stats.posts === 0 && stats.users > 0) {
    issues.push({
      id: "empty_feed", severity: "warning",
      title: "Akış boş",
      detail: "Kullanıcı var ama gönderi yok.",
      suggestion: "`pnpm prisma:seed` ile demo veri ekle veya ilk içeriği paylaş.",
    });
  }

  // Aktif reklam yoksa gelir uyarısı
  if (stats.activeCampaigns === 0 && stats.users > 10) {
    issues.push({
      id: "no_ads", severity: "info",
      title: "Aktif reklam kampanyası yok",
      detail: "Platform geliri için reklam kampanyalarına ihtiyaç var.",
      suggestion: "Reklam sayfasını ziyaret ederek ilk kampanyayı başlat.",
    });
  }

  return issues;
}

function suggestionFor(name: string, _detail?: string): string {
  const map: Record<string, string> = {
    "Veritabanı":            "DATABASE_URL'i ve PostgreSQL servisini kontrol et. `docker compose ps` ile durumu gör.",
    "JWT Secret":            "JWT_SECRET env değişkenini güçlü (min 32 karakter) rastgele bir değerle güncelle.",
    "CORS konfigürasyonu":   "CORS_ORIGIN'i production domain'ine kısıtla (örn. https://saphara.io).",
    "Treasury adresi":       "TREASURY_ADDRESS env değişkenini owner cüzdan adresiyle güncelle.",
    "Medya depolama (S3)":   "S3_BUCKET, AWS_ACCESS_KEY_ID ve AWS_SECRET_ACCESS_KEY env değişkenlerini tanımla.",
  };
  return map[name] ?? `${name} için .env yapılandırmasını tamamla.`;
}

function topError(errors: ErrorEntry[]): string {
  const freq: Record<string, number> = {};
  for (const e of errors) { freq[e.msg] = (freq[e.msg] ?? 0) + 1; }
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "bilinmiyor";
}

function mostCommon(arr: string[]): string {
  const freq: Record<string, number> = {};
  for (const v of arr) { freq[v] = (freq[v] ?? 0) + 1; }
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "?";
}

// ── Tam rapor ──────────────────────────────────────────────────────────────
export async function generateReport(): Promise<BotReport> {
  const health = await runHealthChecks();
  const stats  = await collectStats();
  const issues = await detectIssues(health, stats);

  const critical = issues.filter((i) => i.severity === "critical").length;
  const warnings = issues.filter((i) => i.severity === "warning").length;
  const summary  = critical > 0
    ? `⚠ ${critical} kritik sorun — acil ilgi gerekiyor.`
    : warnings > 0
      ? `${warnings} uyarı var. Sistem çalışıyor ama iyileştirme önerileri mevcut.`
      : "✓ Sistem sağlıklı. Tüm kontroller geçti.";

  log.info("bot raporu üretildi", { critical, warnings });

  if (critical > 0) {
    await notifyOwnerRealtime(critical, issues.filter((i) => i.severity === "critical"));
  }

  return {
    generatedAt: new Date().toISOString(),
    health, stats,
    recentErrors:         errorRing.slice(-20).reverse(),
    recentSecurityEvents: securityRing.slice(-10).reverse(),
    issues,
    summary,
  };
}

let lastAlertAt = 0;
async function notifyOwnerRealtime(count: number, criticals: BotIssue[]) {
  if (Date.now() - lastAlertAt < 300_000) return;
  lastAlertAt = Date.now();
  const ownerAddr = (process.env.TREASURY_ADDRESS ?? process.env.NEXT_PUBLIC_TREASURY_ADDRESS ?? "").toLowerCase();
  if (!ownerAddr) return;
  try {
    const owner = await db.user.findFirst({
      where: { walletAddress: { mode: "insensitive", equals: ownerAddr } },
      select: { id: true },
    });
    if (!owner) return;
    deliverTo(owner.id, {
      type: "notification",
      payload: { kind: "system_alert", text: `⚠ ${count} kritik sorun: ${criticals.map((c) => c.title).join(", ")}` },
      ts: Date.now(),
    });
  } catch { /* sessiz */ }
}
