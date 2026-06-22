"use client";

import { TrendingUp, Coins, ExternalLink, Hash, Loader2, BarChart2, Users, Zap } from "lucide-react";
import dynamic from "next/dynamic";
import { useTrending, usePartPrice, useTopCrypto, usePartMarketData } from "../hooks/useApi";

const WalletButton = dynamic(
  () => import("./WalletButton").then((m) => ({ default: m.WalletButton })),
  { ssr: false, loading: () => <div className="panel" style={{ height: 80 }} /> }
);

function PriceChange({ v }: { v: number }) {
  const up = v >= 0;
  return (
    <span style={{ color: up ? "#22c55e" : "#ef4444", fontSize: 11, fontWeight: 700 }}>
      {up ? "▲" : "▼"}{Math.abs(v).toFixed(2)}%
    </span>
  );
}

function fmtPrice(n: number) {
  if (n >= 1000) return `$${n.toLocaleString("en", { maximumFractionDigits: 0 })}`;
  if (n >= 1)    return `$${n.toFixed(2)}`;
  return `$${n.toFixed(5)}`;
}

const CRYPTO_FALLBACK = [
  { symbol: "BTC", name: "Bitcoin",  priceUsd: 69420, change24h:  2.4 },
  { symbol: "ETH", name: "Ethereum", priceUsd: 3820,  change24h:  1.8 },
  { symbol: "BNB", name: "BNB",      priceUsd: 605,   change24h:  0.9 },
  { symbol: "SOL", name: "Solana",   priceUsd: 182,   change24h: -1.2 },
];

export function RightRail() {
  const trending    = useTrending();
  const price       = usePartPrice();
  const topCrypto   = useTopCrypto();
  const partMarket  = usePartMarketData();

  const hashtags = trending.data?.hashtags ?? [];
  const cryptos  = (topCrypto.data?.items ?? CRYPTO_FALLBACK).slice(0, 5);

  const partData = partMarket.data;
  const partRate = price.data?.partUsdRate ?? partData?.priceUsd ?? 0.01;
  const partChange = partData?.priceChange24h ?? 0;
  const partVol   = partData?.volume24h ?? 0;
  const partMcap  = partData?.marketCap ?? 0;

  return (
    <>
      {/* PART Token Özeti */}
      <section className="panel">
        <h3 style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Coins size={15} /> PART Token</span>
          <a href="/part" style={{ fontSize: 11, color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>
            Detay <ExternalLink size={10} />
          </a>
        </h3>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 22, fontWeight: 900, color: "var(--accent)" }}>{fmtPrice(partRate)}</span>
          <PriceChange v={partChange} />
        </div>
        {(partVol > 0 || partMcap > 0) && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
            {partVol > 0 && (
              <div style={{ background: "var(--card)", borderRadius: 8, padding: "6px 8px" }}>
                <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 2 }}>24s Hacim</div>
                <div style={{ fontSize: 12, fontWeight: 700 }}>${(partVol / 1000).toFixed(1)}K</div>
              </div>
            )}
            {partMcap > 0 && (
              <div style={{ background: "var(--card)", borderRadius: 8, padding: "6px 8px" }}>
                <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 2 }}>Piyasa Değeri</div>
                <div style={{ fontSize: 12, fontWeight: 700 }}>${(partMcap / 1_000_000).toFixed(2)}M</div>
              </div>
            )}
          </div>
        )}
        <div style={{ display: "flex", gap: 6 }}>
          <a href="/wallet" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "8px", borderRadius: 8, background: "var(--accent)", color: "#1a1300", fontSize: 12, fontWeight: 800, textDecoration: "none" }}>
            <Coins size={12} /> Al
          </a>
          <a href="/staking" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "8px", borderRadius: 8, border: "1.5px solid var(--accent)", color: "var(--accent)", fontSize: 12, fontWeight: 800, textDecoration: "none" }}>
            <Zap size={12} /> Stake
          </a>
        </div>
      </section>

      {/* Kripto Piyasası */}
      <section className="panel">
        <h3 style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <BarChart2 size={15} /> Kripto Piyasası
        </h3>
        {topCrypto.isLoading ? (
          <div style={{ padding: "10px 0", display: "flex", justifyContent: "center" }}>
            <Loader2 size={16} className="spin" />
          </div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {cryptos.map((c: any) => (
              <li key={c.symbol} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {c.image ? (
                    <img src={c.image} alt={c.symbol} style={{ width: 22, height: 22, borderRadius: "50%" }} />
                  ) : (
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 900, color: "#1a1300" }}>
                      {c.symbol.slice(0, 2)}
                    </div>
                  )}
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{c.symbol}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{fmtPrice(c.priceUsd)}</div>
                  <PriceChange v={c.change24h} />
                </div>
              </li>
            ))}
          </ul>
        )}
        <a href="/news" style={{ display: "block", textAlign: "center", marginTop: 10, fontSize: 12, color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>
          Piyasa Haberleri →
        </a>
      </section>

      {/* Cüzdan */}
      <WalletButton />

      {/* Trendler */}
      <section className="panel">
        <h3 style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <TrendingUp size={15} /> Trendler
        </h3>
        {trending.isLoading ? (
          <div style={{ padding: "10px 0", display: "flex", justifyContent: "center" }}>
            <Loader2 size={18} className="spin" />
          </div>
        ) : hashtags.length > 0 ? (
          <ul className="trends">
            {hashtags.slice(0, 8).map((h: any) => (
              <li key={h.id}>
                <a href={`/search?q=%23${h.tag}&type=posts`} className="trend-link">
                  <Hash size={12} /><span>#{h.tag}</span>
                </a>
                <small className="muted">{h.postCount.toLocaleString("en-US")} gönderi</small>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="trends">
            {["#Saphara", "#PART", "#Reels", "#BNBChain", "#DeFi", "#NFT"].map(tag => (
              <li key={tag}>
                <a href={`/search?q=${tag}&type=posts`} className="trend-link">
                  <Hash size={12} /><span>{tag}</span>
                </a>
                <small className="muted">Platform trendi</small>
              </li>
            ))}
          </ul>
        )}
        <a href="/explore" className="trends-more">Daha fazla keşfet</a>
      </section>

      {/* Platform İstatistikleri */}
      <section className="panel">
        <h3 style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Users size={15} /> Platform Özeti
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { label: "Kullanıcı", value: "250K+" },
            { label: "İçerik",   value: "1.2M+"  },
            { label: "PART Dağıtıldı", value: "48M" },
            { label: "İşlem Hacmi",    value: "$2.4M" },
          ].map(s => (
            <div key={s.label} style={{ background: "var(--card)", borderRadius: 8, padding: "8px 10px" }}>
              <div style={{ fontSize: 15, fontWeight: 900, color: "var(--accent)" }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Hızlı linkler */}
      <section className="panel quick-links">
        <a href="/privacy">Gizlilik</a>
        <a href="/about">Hakkında</a>
        <a href="mailto:destek@saphara.io">Destek</a>
        <a href="/advertise">Reklam</a>
        <span className="muted">© 2026 Saphara</span>
      </section>
    </>
  );
}
