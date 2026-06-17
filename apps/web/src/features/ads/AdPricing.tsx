"use client";

import { TrendingUp, Users, Target, Zap, Check, DollarSign, Sparkles, Clock } from "lucide-react";

const PRICING_TIERS = [
  {
    name:    "Başlangıç",
    icon:    TrendingUp,
    color:   "#3fb950",
    price:   "50",
    unit:    "USDT / kampanya",
    reach:   "5.000 – 15.000",
    desc:    "Küçük işletmeler ve kişisel markalar için ideal.",
    features: [
      "Günlük bütçe: min. 5 USDT",
      "Hedefleme: ilgi alanı + coğrafya",
      "Desteklenen format: Gönderi reklamı",
      "Temel analitik",
      "CPM: ~$3 – $6",
    ],
    highlight: false,
  },
  {
    name:    "Büyüme",
    icon:    Users,
    color:   "#f0b429",
    price:   "250",
    unit:    "USDT / kampanya",
    reach:   "50.000 – 150.000",
    desc:    "Markalar ve içerik üreticileri için en popüler plan.",
    features: [
      "Günlük bütçe: min. 25 USDT",
      "Hedefleme: demografi + davranış",
      "Desteklenen format: Gönderi + Reels",
      "Gelişmiş analitik + CTR raporu",
      "CPM: ~$5 – $10",
      "Öncelikli müşteri desteği",
    ],
    highlight: true,
  },
  {
    name:    "Pro",
    icon:    Target,
    color:   "#5b8def",
    price:   "1.000",
    unit:    "USDT / kampanya",
    reach:   "250.000+",
    desc:    "Büyük markalar ve ajanslar için tam güç.",
    features: [
      "Günlük bütçe: min. 100 USDT",
      "Hedefleme: lookalike + retargeting",
      "Tüm formatlar: Gönderi + Reels + Story",
      "Gerçek zamanlı analitik paneli",
      "CPM: ~$8 – $15",
      "Özel hesap yöneticisi",
      "A/B test desteği",
    ],
    highlight: false,
  },
  {
    name:    "Kurumsal",
    icon:    Zap,
    color:   "#a78bfa",
    price:   "Özel",
    unit:    "teklif alın",
    reach:   "Sınırsız",
    desc:    "Büyük ölçekli kampanyalar ve özel entegrasyonlar.",
    features: [
      "Özel bütçe ve hedefleme",
      "API erişimi",
      "Whitelabel çözümü",
      "SLA garantisi",
      "Özel reklam formatları",
      "Müzik / AR efekt reklamları",
    ],
    highlight: false,
  },
];

const FORMATS = [
  {
    name: "Feed Reklamı",
    desc: "Twitter/Instagram gibi kullanıcı akışında gösterilir. Görsel + başlık + CTA.",
    cpm: "$3 – $8",
    ctr: "0.5 – 2%",
    icon: "📱",
  },
  {
    name: "Reels Reklamı",
    desc: "TikTok tarzı tam ekran dikey video reklam. En yüksek etkileşim oranı.",
    cpm: "$8 – $15",
    ctr: "2 – 5%",
    icon: "🎬",
  },
  {
    name: "Story Reklamı",
    desc: "24 saatte kaybolan hikaye reklamı. Görsel veya kısa video.",
    cpm: "$5 – $12",
    ctr: "1 – 3%",
    icon: "⭕",
  },
  {
    name: "Sponsored Hashtag",
    desc: "Trend hashtag olarak öne çıkma. Keşfet sayfasında görünür.",
    cpm: "$15 – $25",
    ctr: "3 – 8%",
    icon: "#️⃣",
  },
];

const DURATION_PACKAGES = [
  { days: 1,  label: "Günlük",   minUsdt: 20,  minPart: 16,  bonus: 0,      popular: false },
  { days: 7,  label: "Haftalık", minUsdt: 100, minPart: 80,  bonus: 5_000,  popular: true  },
  { days: 30, label: "Aylık",    minUsdt: 300, minPart: 240, bonus: 25_000, popular: false },
  { days: 90, label: "3 Aylık",  minUsdt: 750, minPart: 600, bonus: 80_000, popular: false },
];

const CPC_TIERS = [
  { label: "Standart",  cpcUsdt: "$0.15", cpcPart: "0.12 PART", desc: "Genel akış tıklamaları" },
  { label: "Hedefli",   cpcUsdt: "$0.30", cpcPart: "0.24 PART", desc: "İlgi alanı eşleşmeli" },
  { label: "Kripto Fan",cpcUsdt: "$0.60", cpcPart: "0.48 PART", desc: "Kripto ilgili kitleler" },
];

export function AdPricing() {
  return (
    <div className="ad-pricing">
      {/* Hero */}
      <div className="ad-pricing-hero">
        <h2>Saphara Reklam Platformu</h2>
        <p>BNB Chain üzerinde şeffaf, USDT veya PART ile ödeme yapılan hedefli reklam.</p>
        <div className="ad-pricing-badges">
          <span>✓ BNB Chain</span>
          <span>✓ USDT Ödeme</span>
          <span>✓ PART Ödeme</span>
          <span>✓ Şeffaf Analitik</span>
          <span>✓ Gerçek Zamanlı</span>
        </div>
      </div>

      {/* PART İndirim Bandı */}
      <div style={{
        margin: "0 20px 20px",
        padding: "14px 18px",
        background: "linear-gradient(135deg,rgba(240,180,41,.15) 0%,rgba(168,139,250,.12) 100%)",
        border: "1px solid rgba(240,180,41,.3)",
        borderRadius: 14,
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <Sparkles size={20} color="#f0b429" />
        <div style={{ flex: 1 }}>
          <strong style={{ fontSize: 14, color: "#f0b429" }}>PART ile %20 indirim!</strong>
          <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0" }}>
            Reklamlarını PART ile öde, USDT fiyatına göre %20 daha ucuza reklam ver.
            1 PART = $0.01 taban fiyat garantisi.
          </p>
        </div>
        <div style={{
          background: "rgba(240,180,41,.2)", padding: "6px 14px",
          borderRadius: 99, fontSize: 14, fontWeight: 800, color: "#f0b429",
        }}>%20</div>
      </div>

      {/* Süre Paketleri */}
      <section style={{ padding: "0 20px 24px" }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <Clock size={16} color="#a78bfa" /> Süre Bazlı Paketler
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))", gap: 10 }}>
          {DURATION_PACKAGES.map((pkg) => (
            <div key={pkg.days} style={{
              background: pkg.popular ? "linear-gradient(135deg,rgba(240,180,41,.12),rgba(168,139,250,.08))" : "var(--surface)",
              border: `1.5px solid ${pkg.popular ? "rgba(240,180,41,.4)" : "var(--border)"}`,
              borderRadius: 12, padding: "14px 16px", position: "relative",
            }}>
              {pkg.popular && (
                <span style={{
                  position: "absolute", top: -9, left: "50%", transform: "translateX(-50%)",
                  background: "#f0b429", color: "#1a1300", fontSize: 10, fontWeight: 800,
                  padding: "2px 10px", borderRadius: 99,
                }}>Popüler</span>
              )}
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{pkg.label}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>
                Min. <strong style={{ color: "var(--text)" }}>${pkg.minUsdt}</strong> USDT
              </div>
              <div style={{ fontSize: 12, color: "#f0b429", marginBottom: 6 }}>
                veya <strong>{pkg.minPart} PART</strong> <span style={{ fontSize: 10 }}>(−%20)</span>
              </div>
              {pkg.bonus > 0 && (
                <div style={{ fontSize: 11, color: "#22c55e", fontWeight: 600 }}>
                  +{(pkg.bonus / 1000).toFixed(0)}K bonus gösterim
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CPC Fiyatları */}
      <section style={{ padding: "0 20px 24px" }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>CPC — Tıklama Başına Fiyat</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {CPC_TIERS.map((t) => (
            <div key={t.label} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 16px", background: "var(--surface)",
              border: "1px solid var(--border)", borderRadius: 10,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{t.label}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>{t.desc}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#f0b429" }}>{t.cpcPart}</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>{t.cpcUsdt} USDT</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reklam Formatları */}
      <section className="ad-formats-section">
        <h3>Reklam Formatları</h3>
        <div className="ad-formats-grid">
          {FORMATS.map((f) => (
            <div key={f.name} className="ad-format-card">
              <div className="ad-format-icon">{f.icon}</div>
              <h4>{f.name}</h4>
              <p className="muted">{f.desc}</p>
              <div className="ad-format-stats">
                <span><DollarSign size={12} /> CPM: {f.cpm}</span>
                <span>CTR: {f.ctr}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Fiyatlandırma Tiers */}
      <section className="ad-tiers-section">
        <h3>Fiyatlandırma Planları</h3>
        <div className="ad-tiers-grid">
          {PRICING_TIERS.map((tier) => {
            const Icon = tier.icon;
            return (
              <div key={tier.name} className={`ad-tier-card ${tier.highlight ? "highlighted" : ""}`}>
                {tier.highlight && <div className="tier-popular-badge">En Popüler</div>}
                <div className="tier-icon" style={{ color: tier.color }}><Icon size={28} /></div>
                <h4>{tier.name}</h4>
                <p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>{tier.desc}</p>
                <div className="tier-price">
                  <span className="tier-amount" style={{ color: tier.color }}>{tier.price}</span>
                  <span className="muted tier-unit">{tier.unit}</span>
                </div>
                <div className="tier-reach">
                  <Users size={13} /> ~{tier.reach} gösterim
                </div>
                <ul className="tier-features">
                  {tier.features.map((f) => (
                    <li key={f}><Check size={13} style={{ color: tier.color }} /> {f}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Nasıl çalışır */}
      <section className="ad-how-section">
        <h3>Nasıl Çalışır?</h3>
        <div className="ad-how-steps">
          {[
            { n: "1", t: "Kampanya Oluştur",  d: "Hedef, bütçe ve hedef kitleni belirle." },
            { n: "2", t: "USDT/PART ile Öde", d: "MetaMask ile BNB Chain üzerinde şeffaf ödeme." },
            { n: "3", t: "Reklam Yayınlanır",  d: "Reklamın otomatik olarak hedef kitleye gösterilir." },
            { n: "4", t: "Analitik Takip Et",  d: "Gösterim, tıklama, CTR ve harcamayı gerçek zamanlı izle." },
          ].map((s) => (
            <div key={s.n} className="ad-how-step">
              <div className="ad-how-num">{s.n}</div>
              <h4>{s.t}</h4>
              <p className="muted">{s.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
