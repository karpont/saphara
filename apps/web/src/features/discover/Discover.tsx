"use client";

import { useMemo, useState } from "react";
import { Search, Flame, Music, Gamepad2, Palette, Coins } from "lucide-react";
import { rankFeed, type ContentSignals } from "@saphara/recommendation";

interface DiscoverItem {
  id: string;
  creatorId: string;
  title: string;
  category: string;
  views: number;
  signals: ContentSignals;
}

const CATEGORIES = [
  { id: "all", label: "Tumu", icon: Flame },
  { id: "music", label: "Muzik", icon: Music },
  { id: "gaming", label: "Oyun", icon: Gamepad2 },
  { id: "art", label: "Sanat", icon: Palette },
  { id: "crypto", label: "Crypto", icon: Coins },
];

// sin tabanlı deterministik pseudo-random — SSR/client aynı değer üretir.
function sr(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

const CONTENT_TITLES = [
  "BNB Chain DeFi Rehberi", "NFT Koleksiyon Stratejisi", "Kripto Teknik Analiz",
  "Web3 Geliştirici Başlangıç", "PART Token Neden Değerli?", "Yield Farming Temelleri",
  "Saphara Studio Nasıl Kullanılır", "Metaverse Sanal Arsa Yatırımı", "DAO Yönetişim Rehberi",
  "Blockchain Güvenliği 101", "Smart Contract Audit", "Cross-Chain Köprüler",
  "GameFi Play-to-Earn", "Kripto Vergi Rehberi", "Sosyal Medya ile PART Kazan",
  "PancakeSwap LP Stratejisi", "On-Chain Analiz Araçları", "Kripto Portföy Çeşitlendirme",
  "BNB Staking Getirisi", "Layer 2 Çözümleri", "DeFi Protokol İncelemesi",
  "NFT Mint Nasıl Yapılır", "Kripto Haber Analizi", "Saphara Market Satıcı Rehberi",
];

// Demo havuz — uretimde GET /discover'dan gelir, signals backend'de hesaplanir.
function makePool(): DiscoverItem[] {
  const cats = ["music", "gaming", "art", "crypto"];
  return Array.from({ length: 24 }, (_, i) => ({
    id: String(i),
    creatorId: `c${i % 6}`,
    title: CONTENT_TITLES[i % CONTENT_TITLES.length],
    category: cats[i % cats.length],
    views: Math.round(1000 + sr(i * 7) * 90000),
    signals: {
      affinity: sr(i * 13),
      quality: 0.5 + sr(i * 17) * 0.5,
      freshnessHours: sr(i * 23) * 96,
      alreadySeen: sr(i * 31) < 0.1,
      creatorDiversityPenalty: 0,
    },
  }));
}

export function Discover() {
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const pool = useMemo(makePool, []);

  // recommendation paketiyle kalite/ilgi/tazelik bazli siralama
  const ranked = useMemo(() => {
    let items = pool;
    if (cat !== "all") items = items.filter((i) => i.category === cat);
    if (q.trim()) items = items.filter((i) => i.title.toLowerCase().includes(q.toLowerCase()));
    return rankFeed(items);
  }, [pool, cat, q]);

  return (
    <div className="discover">
      <header className="topbar">
        <h1>Kesfet</h1>
      </header>

      <div className="discover-search">
        <Search size={18} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ara: kullanici, icerik, etiket…" />
      </div>

      <div className="discover-cats">
        {CATEGORIES.map(({ id, label, icon: Icon }) => (
          <button key={id} className={cat === id ? "cat on" : "cat"} onClick={() => setCat(id)}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      <div className="discover-grid">
        {ranked.map((item, idx) => (
          <article key={item.id} className={`disc-item ${idx === 0 ? "feature" : ""}`}>
            <div className="disc-thumb">
              <img
                src={`https://picsum.photos/seed/disc${item.id}/400/250`}
                alt={item.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div className="disc-meta">
              <strong>{item.title}</strong>
              <small className="muted">{item.views.toLocaleString()} izlenme · {item.category}</small>
            </div>
          </article>
        ))}
        {ranked.length === 0 && <p className="muted center">Sonuc bulunamadi</p>}
      </div>
    </div>
  );
}
