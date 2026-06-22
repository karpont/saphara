"use client";
import { useState } from "react";
import {
  Newspaper, ExternalLink, Bitcoin, Trophy,
  Music2, Globe, Cpu, TrendingUp, Briefcase, Atom,
  Star, RefreshCw, BarChart2, Activity,
} from "lucide-react";
import { useNews, useTopCrypto, useMarketAnalysis } from "../../hooks/useApi";

const CATS = [
  { id: "general",       label: "Gündem",     icon: Globe },
  { id: "crypto",        label: "Kripto",      icon: Bitcoin },
  { id: "sports",        label: "Spor",        icon: Trophy },
  { id: "music",         label: "Müzik",       icon: Music2 },
  { id: "technology",    label: "Teknoloji",   icon: Cpu },
  { id: "business",      label: "Ekonomi",     icon: Briefcase },
  { id: "entertainment", label: "Magazin",     icon: Star },
  { id: "science",       label: "Bilim",       icon: Atom },
];

/* ── Korku/Açgözlülük renk ── */
function fearGreedColor(val: number): string {
  if (val <= 25)  return "#ef4444"; // extreme fear — kırmızı
  if (val <= 45)  return "#f97316"; // fear — turuncu
  if (val <= 55)  return "#eab308"; // nötr — sarı
  if (val <= 75)  return "#22c55e"; // greed — yeşil
  return "#a855f7";                  // extreme greed — mor
}

function sentimentColor(s: string): string {
  if (s === "bullish")        return "#22c55e";
  if (s === "bearish")        return "#ef4444";
  if (s === "very_bullish")   return "#16a34a";
  if (s === "very_bearish")   return "#dc2626";
  return "#94a3b8";
}

function sentimentLabel(s: string): string {
  const MAP: Record<string, string> = {
    very_bullish: "Çok Yükseliş",
    bullish:      "Yükseliş",
    neutral:      "Nötr",
    bearish:      "Düşüş",
    very_bearish: "Çok Düşüş",
  };
  return MAP[s] ?? s;
}

/* ── Market Analiz Paneli ── */
function MarketAnalysisPanel() {
  const { data, isLoading } = useMarketAnalysis();

  if (isLoading) {
    return (
      <div style={styles.analysisCard}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <BarChart2 size={16} color="#a78bfa" />
          <span style={{ fontWeight: 600, fontSize: 14 }}>Piyasa Analizi</span>
        </div>
        <div className="skeleton" style={{ height: 60, borderRadius: 8 }} />
      </div>
    );
  }
  if (!data) return null;

  const fgColor = fearGreedColor(data.fearGreedValue);
  const sentColor = sentimentColor(data.sentiment);

  return (
    <div style={styles.analysisCard}>
      {/* Başlık */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <BarChart2 size={16} color="#a78bfa" />
        <span style={{ fontWeight: 700, fontSize: 14 }}>Kripto Piyasa Analizi</span>
        <Activity size={12} color="#64748b" style={{ marginLeft: "auto" }} />
        <span style={{ fontSize: 11, color: "#64748b" }}>10 dakikada bir güncellenir</span>
      </div>

      {/* 2 metrik yan yana */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        {/* Korku & Açgözlülük */}
        <div style={{ ...styles.metricBox, borderColor: fgColor + "40" }}>
          <span style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4, display: "block" }}>Korku & Açgözlülük</span>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: fgColor, lineHeight: 1 }}>
              {data.fearGreedValue}
            </span>
            <span style={{ fontSize: 12, color: fgColor, fontWeight: 600 }}>{data.fearGreedLabel}</span>
          </div>
          {/* progress bar */}
          <div style={{ marginTop: 8, height: 4, background: "#1e293b", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${data.fearGreedValue}%`, background: fgColor, borderRadius: 4, transition: "width .4s" }} />
          </div>
        </div>

        {/* Piyasa Duyarlılığı */}
        <div style={{ ...styles.metricBox, borderColor: sentColor + "40" }}>
          <span style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4, display: "block" }}>Duyarlılık</span>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: sentColor, lineHeight: 1 }}>
              {sentimentLabel(data.sentiment)}
            </span>
          </div>
          <span style={{ fontSize: 11, color: "#64748b", marginTop: 6, display: "block" }}>
            Skor: {data.sentimentScore > 0 ? "+" : ""}{data.sentimentScore}
          </span>
          {/* puan barı -100..+100 → 0..100% */}
          <div style={{ marginTop: 4, height: 4, background: "#1e293b", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.max(0, (data.sentimentScore + 100) / 2)}%`, background: sentColor, borderRadius: 4, transition: "width .4s" }} />
          </div>
        </div>
      </div>

      {/* Piyasa Yorumu */}
      {data.marketNote && (
        <div style={styles.noteBox}>
          <span style={{ fontSize: 12, color: "#cbd5e1", lineHeight: 1.6 }}>{data.marketNote}</span>
        </div>
      )}

      {/* Öne çıkan başlıklar */}
      {data.topHeadlines?.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>
            Öne Çıkan Başlıklar
          </span>
          <ul style={{ margin: "6px 0 0", padding: 0, listStyle: "none" }}>
            {data.topHeadlines.slice(0, 3).map((h, i) => (
              <li key={i} style={{ fontSize: 12, color: "#94a3b8", padding: "3px 0", borderBottom: "1px solid #1e293b" }}>
                • {h}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const styles = {
  analysisCard: {
    background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
    border: "1px solid #312e81",
    borderRadius: 14,
    padding: "16px 18px",
    margin: "12px 0",
  } as React.CSSProperties,
  metricBox: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: 10,
    padding: "12px 14px",
  } as React.CSSProperties,
  noteBox: {
    background: "#1e293b",
    borderRadius: 8,
    padding: "10px 12px",
    borderLeft: "3px solid #a78bfa",
  } as React.CSSProperties,
};

/* ── Ana bileşen ── */
export function NewsFeed() {
  const [cat, setCat] = useState("general");
  const [lang, setLang] = useState("tr");
  const { data, isLoading, isError, refetch, isFetching } = useNews(cat, lang);
  const crypto = useTopCrypto();
  const items = data?.items ?? [];

  return (
    <div className="news-page">
      <header className="topbar news-header">
        <h1><Newspaper size={20} /> Güncel Haberler</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <select className="lang-select" value={lang} onChange={(e) => setLang(e.target.value)}>
            <option value="tr">🇹🇷 Türkçe</option>
            <option value="en">🇬🇧 English</option>
          </select>
          <button className="ghost-btn icon-btn" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw size={15} className={isFetching ? "spin" : ""} />
          </button>
        </div>
      </header>

      {/* Kripto ticker şeridi */}
      {cat === "crypto" && crypto.data && (
        <div className="crypto-ticker">
          {(crypto.data.items ?? []).map((c: any) => (
            <span key={c.symbol} className="ticker-item">
              <span className="ticker-sym">{c.symbol}</span>
              <span className="ticker-price">${c.priceUsd < 1 ? c.priceUsd.toFixed(4) : c.priceUsd.toLocaleString("en-US")}</span>
              <span className={`ticker-change ${c.change24h >= 0 ? "up" : "dn"}`}>
                {c.change24h >= 0 ? "▲" : "▼"}{Math.abs(c.change24h).toFixed(1)}%
              </span>
            </span>
          ))}
        </div>
      )}

      {/* Piyasa Analizi — sadece kripto sekmesinde göster */}
      {cat === "crypto" && <MarketAnalysisPanel />}

      {/* Kategori sekmeler */}
      <div className="discover-cats news-cats">
        {CATS.map(({ id, label, icon: Icon }) => (
          <button key={id} className={cat === id ? "cat on" : "cat"} onClick={() => setCat(id)}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Yüklenme / hata */}
      {isLoading && (
        <div className="news-skeleton">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="news-item-skel">
              <div className="skel news-skel-img skeleton" />
              <div className="news-skel-body">
                <div className="skel skeleton" style={{ height: 16, width: "80%" }} />
                <div className="skel skeleton" style={{ height: 12, width: "60%", marginTop: 8 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="feed-state error">
          <Newspaper size={28} /><p>Haberler yüklenemedi</p>
          <button className="ghost-btn" onClick={() => refetch()}>Tekrar dene</button>
        </div>
      )}

      {!isLoading && !isError && items.length === 0 && (
        <div className="feed-state muted">
          <Newspaper size={36} className="empty-icon" />
          <p className="empty-title">Haber bulunamadı</p>
          <p className="empty-hint">
            {cat === "crypto"
              ? "CoinGecko API bağlantısı kontrol ediliyor..."
              : cat === "sports"
              ? "Spor verileri yükleniyor..."
              : "API anahtarı için .env dosyasına GNEWS_API_KEY ekleyin"}
          </p>
        </div>
      )}

      {/* Haberler */}
      {!isLoading && items.length > 0 && (
        <>
          {/* Öne çıkan haber */}
          {items[0] && (
            <a className="news-featured" href={items[0].url} target="_blank" rel="noopener noreferrer">
              {items[0].imageUrl && (
                <div className="news-featured-img" style={{ backgroundImage: `url(${items[0].imageUrl})` }} />
              )}
              <div className="news-featured-body">
                <span className="news-featured-cat">{CATS.find((c) => c.id === cat)?.label ?? cat}</span>
                <h2>{items[0].title}</h2>
                {items[0].description && <p className="muted">{items[0].description.slice(0, 120)}…</p>}
                <span className="news-meta">{items[0].source} · {timeAgo(items[0].publishedAt)} <ExternalLink size={12} /></span>
              </div>
            </a>
          )}

          {/* Kalan haberler */}
          <div className="news-list">
            {items.slice(1).map((n: any) => (
              <a key={n.id} className="news-item" href={n.url} target="_blank" rel="noopener noreferrer">
                {n.imageUrl && <img src={n.imageUrl} alt="" className="news-img" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />}
                <div className="news-body">
                  <strong>{n.title}</strong>
                  {n.description && <p className="muted">{n.description.slice(0, 100)}…</p>}
                  <span className="news-meta">
                    <TrendingUp size={11} /> {n.source} · {timeAgo(n.publishedAt)} <ExternalLink size={11} />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function timeAgo(iso: string): string {
  if (!iso) return "";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s önce`;
  if (s < 3600) return `${Math.floor(s / 60)}dk önce`;
  if (s < 86400) return `${Math.floor(s / 3600)}sa önce`;
  return `${Math.floor(s / 86400)}g önce`;
}
