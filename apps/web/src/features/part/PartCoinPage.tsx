"use client";

import { ExternalLink, Copy, Check, TrendingUp, Coins, Shield, Zap, Users, ShoppingBag, Gift, BarChart2 } from "lucide-react";
import { useState } from "react";
import { usePartPrice, usePartMarketData } from "../../hooks/useApi";
import { config } from "@saphara/config";

const CONTRACT = config.contracts.partToken;
const BSC_SCAN = `https://bscscan.com/token/${CONTRACT}`;
const PANCAKE  = `https://pancakeswap.finance/swap?outputCurrency=${CONTRACT}`;

const TOKENOMICS = [
  { label: "İçerik Ödülleri",     pct: 35, color: "#f0b429" },
  { label: "Ekip & Danışmanlar",  pct: 15, color: "#5b8def" },
  { label: "Likidite Havuzu",     pct: 20, color: "#3fb950" },
  { label: "Ekosistem Fonu",      pct: 15, color: "#e5484d" },
  { label: "Pazarlama",           pct: 10, color: "#a78bfa" },
  { label: "Rezerv",              pct:  5, color: "#f97316" },
];

const USE_CASES = [
  { icon: Gift,        title: "Bahşiş",       desc: "Beğendiğin içerik üreticilerine PART göndererek doğrudan destekle." },
  { icon: ShoppingBag, title: "Mağaza",       desc: "Avatar, çerçeve, rozet ve tema satın al. Profilini özelleştir." },
  { icon: Zap,         title: "Boost",        desc: "Gönderini öne çıkar, daha fazla kişiye ulaş." },
  { icon: Users,       title: "Üyelik",       desc: "Özel içeriklere erişmek için üreticilere PART ile abone ol." },
  { icon: BarChart2,   title: "Reklam",       desc: "PART ile reklam kampanyası oluştur, hedef kitleye ulaş." },
  { icon: Shield,      title: "Doğrulama",    desc: "PART stake ederek hesap doğrulaması al." },
];

const ROADMAP = [
  { quarter: "Q1 2025", done: true,  items: ["Token deploy (BSC)", "Platform alfa", "İlk 1000 kullanıcı"] },
  { quarter: "Q2 2025", done: true,  items: ["Reels & Studio", "Market & Mağaza", "Bahşiş sistemi"] },
  { quarter: "Q3 2025", done: true,  items: ["USDT ödeme", "Reklam platformu", "Mobil PWA"] },
  { quarter: "Q4 2025", done: false, items: ["Canlı Yayın", "PancakeSwap likidite", "CEX listeleme"] },
  { quarter: "Q1 2026", done: false, items: ["Mobil uygulama", "DAO yönetimi", "NFT içerik"] },
  { quarter: "Q2 2026", done: false, items: ["Staking ödülleri", "Çok dilli destek", "100K kullanıcı"] },
];

export function PartCoinPage() {
  const price = usePartPrice();
  const market = usePartMarketData();
  const [copied, setCopied] = useState(false);

  const copyContract = () => {
    navigator.clipboard?.writeText(CONTRACT);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const partUsd  = price.data?.partUsdRate ?? config.partUsdRate;
  const mcapData = market.data;

  return (
    <div className="part-page">
      <header className="topbar"><h1><img src="/part-coin.svg" alt="PART" width={24} height={24} /> PART Coin</h1></header>

      {/* Hero */}
      <section className="part-hero">
        <div className="part-hero-coin">
          <img src="/part-coin.svg" alt="PART" width={80} height={80} />
        </div>
        <h2>PART Coin</h2>
        <p className="part-hero-sub">Saphara'nın BNB Chain Üzerindeki Yerel Token'ı</p>

        <div className="part-price-hero">
          <span className="part-price-big">${partUsd.toFixed(4)}</span>
          <span className="muted">/ PART</span>
        </div>

        {mcapData && (
          <div className="part-stats-row">
            {mcapData.price_change_24h != null && (
              <div className="part-stat">
                <span className="muted">24s Değişim</span>
                <span style={{ color: mcapData.price_change_24h >= 0 ? "#3fb950" : "var(--danger)", fontWeight: 700 }}>
                  {mcapData.price_change_24h >= 0 ? "+" : ""}{mcapData.price_change_24h.toFixed(2)}%
                </span>
              </div>
            )}
            {mcapData.market_cap && (
              <div className="part-stat">
                <span className="muted">Piyasa Değeri</span>
                <span>${(mcapData.market_cap / 1e6).toFixed(2)}M</span>
              </div>
            )}
            {mcapData.total_volume && (
              <div className="part-stat">
                <span className="muted">24s Hacim</span>
                <span>${(mcapData.total_volume / 1e3).toFixed(0)}K</span>
              </div>
            )}
          </div>
        )}

        <div className="part-actions-hero">
          <a href={PANCAKE} target="_blank" rel="noopener noreferrer" className="primary-btn part-buy-btn">
            <TrendingUp size={16} /> PancakeSwap'ta Al
          </a>
          <a href={BSC_SCAN} target="_blank" rel="noopener noreferrer" className="ghost-btn">
            <ExternalLink size={16} /> BscScan'de Gör
          </a>
        </div>
      </section>

      {/* Kontrat */}
      <section className="part-section">
        <h3>Kontrat Adresi <small className="muted">(BNB Smart Chain)</small></h3>
        <div className="part-contract">
          <code>{CONTRACT}</code>
          <button onClick={copyContract} className="ghost-btn copy-btn" title="Kopyala">
            {copied ? <Check size={16} style={{ color: "#3fb950" }} /> : <Copy size={16} />}
          </button>
        </div>
        <div className="part-contract-links">
          <a href={BSC_SCAN} target="_blank" rel="noopener noreferrer">
            <ExternalLink size={12} /> BscScan
          </a>
          <a href={PANCAKE} target="_blank" rel="noopener noreferrer">
            <ExternalLink size={12} /> PancakeSwap
          </a>
          <a href={`https://poocoin.app/tokens/${CONTRACT}`} target="_blank" rel="noopener noreferrer">
            <ExternalLink size={12} /> PooCoin Chart
          </a>
        </div>
      </section>

      {/* Token bilgileri */}
      <section className="part-section">
        <h3>Token Bilgileri</h3>
        <div className="part-info-grid">
          <div className="part-info-card">
            <span className="muted">Ağ</span>
            <strong>BNB Smart Chain (BSC)</strong>
          </div>
          <div className="part-info-card">
            <span className="muted">Standart</span>
            <strong>BEP-20</strong>
          </div>
          <div className="part-info-card">
            <span className="muted">Toplam Arz</span>
            <strong>1,000,000,000 PART</strong>
          </div>
          <div className="part-info-card">
            <span className="muted">Decimals</span>
            <strong>18</strong>
          </div>
          <div className="part-info-card">
            <span className="muted">Platform Komisyonu</span>
            <strong>%{(config.fees.platformBps / 100).toFixed(1)}</strong>
          </div>
          <div className="part-info-card">
            <span className="muted">USDT Karşılığı</span>
            <strong>1 PART = ${partUsd.toFixed(4)} USDT</strong>
          </div>
        </div>
      </section>

      {/* Kullanım alanları */}
      <section className="part-section">
        <h3>Kullanım Alanları</h3>
        <div className="part-use-grid">
          {USE_CASES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="part-use-card">
              <div className="part-use-icon"><Icon size={24} /></div>
              <h4>{title}</h4>
              <p className="muted">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tokenomics */}
      <section className="part-section">
        <h3>Token Dağılımı (Tokenomics)</h3>
        <div className="tokenomics">
          <div className="tokenomics-bar">
            {TOKENOMICS.map((t) => (
              <div key={t.label} title={`${t.label}: %${t.pct}`}
                style={{ width: `${t.pct}%`, background: t.color, height: "100%" }} />
            ))}
          </div>
          <div className="tokenomics-legend">
            {TOKENOMICS.map((t) => (
              <div key={t.label} className="token-legend-item">
                <span className="token-legend-dot" style={{ background: t.color }} />
                <span>{t.label}</span>
                <span className="muted">%{t.pct}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Yol Haritası */}
      <section className="part-section">
        <h3>Yol Haritası</h3>
        <div className="roadmap">
          {ROADMAP.map((item) => (
            <div key={item.quarter} className={`roadmap-item ${item.done ? "done" : "upcoming"}`}>
              <div className="roadmap-dot" />
              <div className="roadmap-content">
                <strong>{item.quarter}</strong>
                <ul>
                  {item.items.map((i) => <li key={i}>{i}</li>)}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Nasıl Alınır */}
      <section className="part-section">
        <h3>PART Coin Nasıl Alınır?</h3>
        <ol className="part-how-to">
          <li><strong>MetaMask veya Trust Wallet</strong> kur ve BNB Chain ağını ekle (Chain ID: 56).</li>
          <li>BNB al (Binance, OKX veya başka bir borsadan).</li>
          <li>BNB'yi cüzdanına transfer et.</li>
          <li><a href={PANCAKE} target="_blank" rel="noopener noreferrer">PancakeSwap'a git <ExternalLink size={12} style={{ display: "inline" }} /></a> ve kontrat adresini yapıştır.</li>
          <li>BNB → PART takas et. İşlem onayını imzala.</li>
          <li>PART'ı cüzdanına eklemek için kontrat adresini import et.</li>
        </ol>
        <a href={PANCAKE} target="_blank" rel="noopener noreferrer" className="primary-btn" style={{ marginTop: 16, display: "inline-flex", gap: 8 }}>
          <TrendingUp size={16} /> Hemen Al
        </a>
      </section>

      {/* Risk uyarısı */}
      <section className="part-section">
        <div className="part-disclaimer">
          <Shield size={16} />
          <p>
            PART Coin yatırım tavsiyesi değildir. Kripto para birimlerinde yüksek risk bulunmaktadır.
            Yatırmadan önce kendi araştırmanızı yapın (DYOR). Geçmiş performans gelecek getirileri garanti etmez.
          </p>
        </div>
      </section>
    </div>
  );
}
