"use client";
import { useMarketSummary } from "../hooks/useApi";

function fmt(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  if (n >= 1) return `$${n.toFixed(2)}`;
  return `$${n.toFixed(5)}`;
}

function Change({ v }: { v: number }) {
  const up = v >= 0;
  return (
    <span style={{ color: up ? "#22c55e" : "#ef4444", fontSize: 11, marginLeft: 3 }}>
      {up ? "▲" : "▼"} {Math.abs(v).toFixed(2)}%
    </span>
  );
}

const FALLBACK = [
  { symbol: "BTC", name: "Bitcoin",   priceUsd: 69420, change24h: 2.4  },
  { symbol: "ETH", name: "Ethereum",  priceUsd: 3820,  change24h: 1.8  },
  { symbol: "BNB", name: "BNB",       priceUsd: 605,   change24h: 0.9  },
  { symbol: "SOL", name: "Solana",    priceUsd: 182,   change24h: -1.2 },
  { symbol: "ADA", name: "Cardano",   priceUsd: 0.58,  change24h: 3.1  },
];

export function CryptoTicker() {
  const { data } = useMarketSummary();

  const topCrypto: { symbol: string; name: string; priceUsd: number; change24h: number }[] =
    (data?.topCrypto ?? FALLBACK).slice(0, 6);

  const partItem = data?.part
    ? { symbol: "PART", name: "PART", priceUsd: data.part.priceUsd, change24h: data.part.priceChange24h }
    : { symbol: "PART", name: "PART", priceUsd: 0.01, change24h: 0 };

  const items = [partItem, ...topCrypto];
  const doubled = [...items, ...items]; // seamless loop

  return (
    <div style={{
      background: "rgba(240,180,41,.06)",
      borderBottom: "1px solid rgba(240,180,41,.15)",
      overflow: "hidden",
      height: 32,
      display: "flex",
      alignItems: "center",
    }}>
      <style>{`
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-track {
          display: flex;
          align-items: center;
          white-space: nowrap;
          animation: ticker-scroll 38s linear infinite;
          gap: 0;
        }
        .ticker-track:hover { animation-play-state: paused; }
      `}</style>
      <div className="ticker-track">
        {doubled.map((c, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "0 18px", borderRight: "1px solid var(--border)", fontSize: 12, fontWeight: 700, color: "var(--text)" }}>
            <span style={{ color: "var(--accent)", fontWeight: 900 }}>{c.symbol}</span>
            <span>{fmt(c.priceUsd)}</span>
            <Change v={c.change24h} />
          </span>
        ))}
      </div>
    </div>
  );
}
