"use client";

import { useState, useEffect } from "react";
import {
  Megaphone, TrendingUp, Users, Target, Zap, Shield, BarChart3,
  Eye, MousePointer, CheckCircle2, ChevronDown, ChevronRight,
  Play, Image as ImageIcon, Layout, Film, BookOpen, Star, ArrowRight,
  DollarSign, Clock, Globe, Hash, Award, Layers,
} from "lucide-react";
import { AdManager } from "../../features/ads/AdManager";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const AD_FORMATS = [
  {
    id: "feed", icon: Layout, label: "Akış Reklamı", desc: "Ana sayfa akışında native görünümlü sponsorlu gönderi. En yüksek etkileşim formatı.",
    specs: ["Görsel veya video", "Başlık: max 80 karakter", "CTA düğmesi dahil", "Masaüstü + mobil"],
    cpm: "3 – 12 USDT", best: "Farkındalık & Trafik",
  },
  {
    id: "reels", icon: Film, label: "Reels Reklamı", desc: "Kısa video akışında 6–15 saniyelik geçilemez reklam. Genç kitlede en yüksek tamamlanma oranı.",
    specs: ["9:16 dikey video", "6–15 saniye", "Ses opsiyonel", "Otomatik oynatma"],
    cpm: "6 – 18 USDT", best: "Marka Bilinirliği",
  },
  {
    id: "story", icon: Layers, label: "Story Reklamı", desc: "24 saat görünür tam ekran hikaye formatı. Yüksek görünürlük, kaydırma ile geçiş.",
    specs: ["9:16 tam ekran", "Statik veya video", "Bağlantı çıkartması", "24 saat süre"],
    cpm: "5 – 15 USDT", best: "Dönüşüm",
  },
  {
    id: "blog", icon: BookOpen, label: "Blog Sponsorluğu", desc: "Blog yazıları arasında veya üstünde görünen makale sponsorluğu. İçerik pazarlama için ideal.",
    specs: ["Banner + metin", "Kategori hedefleme", "Okuyucu hedefleme", "Haftalık rapor"],
    cpm: "4 – 10 USDT", best: "Lead Generation",
  },
];

const HOW_IT_WORKS = [
  { step: 1, icon: Target, title: "Hedef Seç", desc: "Farkındalık, trafik, dönüşüm veya creator işbirliği hedeflerinden birini seç." },
  { step: 2, icon: Users, title: "Kitleni Tanımla", desc: "İlgi alanı, coğrafya, follower sayısı ve davranışa göre hedefini daralt." },
  { step: 3, icon: ImageIcon, title: "Kreatifleri Yükle", desc: "Görsel, video veya sadece metin ile reklam içeriğini oluştur." },
  { step: 4, icon: DollarSign, title: "Bütçeni Belirle", desc: "PART veya USDT ile ödeme yap. PART ile %20 indirim kazan." },
  { step: 5, icon: BarChart3, title: "Performansı Takip Et", desc: "Gerçek zamanlı gösterim, tıklama ve CTR raporlarını anlık izle." },
];

const TARGETING_OPTIONS = [
  { icon: "🌍", label: "Coğrafya", desc: "Ülke, şehir veya bölge bazlı hedefleme" },
  { icon: "🎯", label: "İlgi Alanı", desc: "Kripto, NFT, DeFi, Oyun, Sanat ve 50+ kategori" },
  { icon: "📊", label: "Davranış", desc: "Satın alma geçmişi, cüzdan aktivitesi, işlem sıklığı" },
  { icon: "👥", label: "Demografi", desc: "Yaş grubu, cihaz tipi, platform kullanımı" },
  { icon: "🔁", label: "Retargeting", desc: "Sitenizi veya profilinizi ziyaret edenleri tekrar hedefle" },
  { icon: "🤝", label: "Creator Match", desc: "Nişinize uygun içerik üreticileriyle otomatik eşleşme" },
];

const FAQS = [
  { q: "Minimum reklam bütçesi nedir?", a: "Günlük kampanya için minimum 20 USDT (veya 10 PART). Haftalık paketlerde 100 USDT'den başlar ve 5.000 bonus gösterim dahildir." },
  { q: "PART token ile ödeme nasıl çalışır?", a: "PART token ile ödeme yaparak tüm paketlerde %20 indirim kazanırsınız. Ödeme BNB Chain üzerinde akıllı sözleşme ile otomatik olarak işlenir." },
  { q: "Reklamım ne zaman yayınlanmaya başlar?", a: "Kampanya oluşturulduktan sonra içerik moderasyonu (max 4 saat) tamamlanınca yayına girer. Acele onay için destek ekibine yazın." },
  { q: "Creator işbirliği nasıl çalışır?", a: "Creator Collab seçeneğiyle platformdaki içerik üreticileriyle doğrudan reklam anlaşması yapabilirsiniz. Kazancın %85'i creator'a, %15'i platforma gider." },
  { q: "Reklam performansını nasıl ölçebilirim?", a: "Gerçek zamanlı dashboard'da gösterim, tıklama, CTR, harcama ve kalan bütçeyi anlık izleyebilirsiniz. Günlük ve haftalık raporlar otomatik e-postayla gönderilir." },
  { q: "Reklam iptal veya durdurma yapabilir miyim?", a: "Aktif kampanyayı istediğiniz zaman duraklatabilir, devam ettirebilir veya tamamen sonlandırabilirsiniz. Harcanan bütçe dışındaki kalan tutar iade edilmez ancak 30 gün içinde yeni kampanyada kullanılabilir." },
];

/* ── ROI Hesaplayıcı ─────────────────────────────────────────────────── */
function ROICalculator() {
  const [budget, setBudget] = useState(100);
  const [format, setFormat] = useState("feed");
  const [usePart, setUsePart] = useState(false);

  const cpmBase = format === "reels" ? 12 : format === "story" ? 10 : format === "blog" ? 7 : 6;
  const effectiveBudget = usePart ? budget * 0.8 : budget;
  const impressions = Math.round((effectiveBudget / cpmBase) * 1000);
  const clicks = Math.round(impressions * 0.022); // ortalama %2.2 CTR
  const cpc = clicks > 0 ? (effectiveBudget / clicks).toFixed(2) : "0";
  const partDiscount = usePart ? (budget * 0.2).toFixed(0) : "0";

  return (
    <div className="roi-calc">
      <div className="roi-calc-header">
        <BarChart3 size={18} />
        <strong>Tahmini Performans Hesaplayıcı</strong>
        <span className="roi-calc-note">Gerçek sonuçlar değişebilir</span>
      </div>
      <div className="roi-inputs">
        <div className="roi-input-group">
          <label>Toplam Bütçe (USDT)</label>
          <input type="range" min={20} max={2000} step={10} value={budget}
            onChange={e => setBudget(Number(e.target.value))} />
          <span className="roi-val">{budget} USDT {usePart && <em>(− {partDiscount} USDT PART indirimi)</em>}</span>
        </div>
        <div className="roi-input-group">
          <label>Reklam Formatı</label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {AD_FORMATS.map(f => (
              <button key={f.id} className={`roi-fmt-btn ${format === f.id ? "on" : ""}`}
                onClick={() => setFormat(f.id)}>{f.label}</button>
            ))}
          </div>
        </div>
        <label className="roi-part-toggle">
          <input type="checkbox" checked={usePart} onChange={e => setUsePart(e.target.checked)} />
          PART ile öde (-%20 indirim)
        </label>
      </div>
      <div className="roi-results">
        <div className="roi-stat">
          <Eye size={20} />
          <strong>{impressions.toLocaleString("tr")}</strong>
          <span>Tahmini Gösterim</span>
        </div>
        <div className="roi-stat">
          <MousePointer size={20} />
          <strong>{clicks.toLocaleString("tr")}</strong>
          <span>Tahmini Tıklama</span>
        </div>
        <div className="roi-stat">
          <DollarSign size={20} />
          <strong>{cpc} USDT</strong>
          <span>Tahmini CPC</span>
        </div>
        <div className="roi-stat">
          <TrendingUp size={20} />
          <strong>~2.2%</strong>
          <span>Ort. CTR</span>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────────────── */
export default function AdvertisePage() {
  const [pricing, setPricing] = useState<any>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeFormat, setActiveFormat] = useState(0);
  const [showManager, setShowManager] = useState(false);

  useEffect(() => {
    fetch(`${API}/ads/pricing`)
      .then(r => r.json())
      .then(setPricing)
      .catch(() => {});
  }, []);

  return (
    <div className="adlanding">

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="ad-hero">
        <div className="ad-hero-badge"><Zap size={13} /> Web3'ün En Büyük Sosyal Platformu</div>
        <h1>Kripto Kitlenize <span className="accent">Doğrudan Ulaşın</span></h1>
        <p className="ad-hero-sub">
          250.000+ aktif Web3 kullanıcısına hedefli reklam verin. PART token ile %20 indirim kazanın.
          Farkındalıktan satışa tam dönüşüm hunisi.
        </p>
        <div className="ad-hero-ctas">
          <button className="ad-cta-primary" onClick={() => setShowManager(true)}>
            <Megaphone size={16} /> Kampanya Oluştur <ArrowRight size={16} />
          </button>
          <button className="ad-cta-ghost" onClick={() => document.getElementById("ad-formats")?.scrollIntoView({ behavior: "smooth" })}>
            <Play size={14} /> Formatları Gör
          </button>
        </div>
        <div className="ad-hero-stats">
          <div><strong>250K+</strong><span>Aktif Kullanıcı</span></div>
          <div><strong>4.2%</strong><span>Ort. CTR</span></div>
          <div><strong>$0.12</strong><span>Min. CPC</span></div>
          <div><strong>%20</strong><span>PART İndirimi</span></div>
        </div>
      </section>

      {/* ── ROI Hesaplayıcı ───────────────────────────────────── */}
      <section className="ad-section">
        <ROICalculator />
      </section>

      {/* ── Neden Saphara ─────────────────────────────────────── */}
      <section className="ad-section">
        <h2 className="ad-section-title">Neden Saphara'da Reklam Verin?</h2>
        <div className="ad-why-grid">
          {[
            { icon: Target, title: "Kripto-Doğal Kitle", desc: "Kullanıcıların %78'i aktif kripto yatırımcısı. Cüzdan sahipleri, NFT alıcıları, DeFi kullanıcıları." },
            { icon: Shield, title: "Şeffaf & On-Chain", desc: "Tüm ödemeler BNB Chain üzerinde. Bütçe harcaması ve gösterim verileri manipüle edilemez." },
            { icon: Zap, title: "PART ile %20 İndirim", desc: "PART token kullanarak tüm reklam paketlerinde %20 indirim kazanın. En düşük maliyet." },
            { icon: BarChart3, title: "Gerçek Zamanlı Analitik", desc: "Gösterim, tıklama, CTR ve harcama verilerini anlık dashboard'dan takip edin." },
            { icon: Globe, title: "Global Hedefleme", desc: "190+ ülkede coğrafi hedefleme. İlgi alanı, davranış ve demografi filtreleri." },
            { icon: Award, title: "Creator Ağı", desc: "Platform içindeki 5.000+ içerik üreticisiyle doğrudan sponsorluk anlaşmaları yapın." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="ad-why-card">
              <div className="ad-why-icon"><Icon size={22} /></div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Reklam Formatları ────────────────────────────────── */}
      <section className="ad-section" id="ad-formats">
        <h2 className="ad-section-title">Reklam Formatları</h2>
        <div className="ad-formats-tabs">
          {AD_FORMATS.map((f, i) => (
            <button key={f.id} className={`ad-fmt-tab ${activeFormat === i ? "on" : ""}`}
              onClick={() => setActiveFormat(i)}>
              <f.icon size={16} /> {f.label}
            </button>
          ))}
        </div>
        <div className="ad-format-detail">
          <div className="ad-format-preview">
            <div className="ad-mock-preview">
              {activeFormat === 0 && (
                <div className="mock-feed-ad">
                  <div className="mock-ad-header">
                    <div className="mock-avatar" />
                    <div><div className="mock-name" /><div className="mock-sponsored">Sponsorlu</div></div>
                  </div>
                  <div className="mock-ad-img" />
                  <div className="mock-ad-headline">Reklam Başlığınız Burada</div>
                  <div className="mock-ad-cta">Daha Fazla Bilgi →</div>
                </div>
              )}
              {activeFormat === 1 && (
                <div className="mock-reels-ad">
                  <div className="mock-reels-video" />
                  <div className="mock-reels-overlay">
                    <div className="mock-reels-brand" />
                    <div className="mock-reels-cta">Keşfet</div>
                  </div>
                  <div className="mock-reels-label">Sponsorlu Video</div>
                </div>
              )}
              {(activeFormat === 2 || activeFormat === 3) && (
                <div className="mock-story-ad">
                  <div className="mock-story-bg" />
                  <div className="mock-story-label">Story Reklamı</div>
                  <div className="mock-story-cta">Daha Fazla Bilgi ↑</div>
                </div>
              )}
            </div>
          </div>
          <div className="ad-format-info">
            <h3>{AD_FORMATS[activeFormat].label}</h3>
            <p>{AD_FORMATS[activeFormat].desc}</p>
            <div className="ad-format-specs">
              <strong>Teknik Özellikler:</strong>
              <ul>
                {AD_FORMATS[activeFormat].specs.map(s => <li key={s}><CheckCircle2 size={13} /> {s}</li>)}
              </ul>
            </div>
            <div className="ad-format-kpis">
              <div><Eye size={14} /><span>CPM: {AD_FORMATS[activeFormat].cpm}</span></div>
              <div><Target size={14} /><span>En iyi: {AD_FORMATS[activeFormat].best}</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Hedefleme ────────────────────────────────────────── */}
      <section className="ad-section">
        <h2 className="ad-section-title">Gelişmiş Hedefleme</h2>
        <p className="ad-section-sub">Kripto yatırımcılarını, NFT meraklılarını veya DeFi kullanıcılarını tam olarak bulun.</p>
        <div className="ad-targeting-grid">
          {TARGETING_OPTIONS.map(t => (
            <div key={t.label} className="ad-target-card">
              <span className="ad-target-icon">{t.icon}</span>
              <div>
                <strong>{t.label}</strong>
                <p>{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Nasıl Çalışır ─────────────────────────────────── */}
      <section className="ad-section">
        <h2 className="ad-section-title">Nasıl Çalışır?</h2>
        <div className="ad-steps">
          {HOW_IT_WORKS.map((s, i) => (
            <div key={s.step} className="ad-step">
              <div className="ad-step-num"><s.icon size={18} /></div>
              {i < HOW_IT_WORKS.length - 1 && <div className="ad-step-connector" />}
              <div className="ad-step-body">
                <strong>{s.title}</strong>
                <p>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Fiyatlandırma ────────────────────────────────── */}
      <section className="ad-section">
        <h2 className="ad-section-title">Fiyatlandırma</h2>
        {pricing ? (
          <div className="ad-pricing-wrap">
            <div className="ad-pricing-note">
              <Zap size={14} style={{ color: "var(--accent)" }} />
              {pricing.note}
            </div>
            <div className="ad-pricing-tables">
              <div className="ad-pricing-table">
                <h4>CPM — 1.000 Gösterim Başına</h4>
                <table>
                  <thead><tr><th>Plan</th><th>USDT</th><th>PART (-%20)</th><th>Min. Gösterim</th></tr></thead>
                  <tbody>
                    {pricing.cpm?.tiers?.map((t: any) => (
                      <tr key={t.label}>
                        <td><strong>{t.label}</strong></td>
                        <td>${t.cpmUsdt}</td>
                        <td style={{ color: "var(--accent)" }}>{t.cpmPart} PART</td>
                        <td>{t.minImpressions.toLocaleString("tr")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="ad-pricing-table">
                <h4>CPC — Tıklama Başına</h4>
                <table>
                  <thead><tr><th>Plan</th><th>USDT</th><th>PART</th><th>Açıklama</th></tr></thead>
                  <tbody>
                    {pricing.cpc?.tiers?.map((t: any) => (
                      <tr key={t.label}>
                        <td><strong>{t.label}</strong></td>
                        <td>${t.cpcUsdt}</td>
                        <td style={{ color: "var(--accent)" }}>{t.cpcPart} PART</td>
                        <td>{t.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="ad-duration-packages">
              <h4><Clock size={14} /> Süre Paketleri</h4>
              <div className="ad-duration-grid">
                {pricing.durationPackages?.map((p: any) => (
                  <div key={p.days} className={`ad-duration-card ${p.popular ? "popular" : ""}`}>
                    {p.popular && <div className="ad-popular-tag"><Star size={11} /> Popüler</div>}
                    <strong>{p.label}</strong>
                    <div className="ad-duration-price">Min. {p.budgetMinUsdt} USDT</div>
                    {p.bonusImpressions > 0 && (
                      <div className="ad-duration-bonus">+{p.bonusImpressions.toLocaleString("tr")} bonus gösterim</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="ad-pricing-static">
            {[
              { name: "Başlangıç", price: "50+", unit: "USDT", reach: "5K–15K", popular: false },
              { name: "Büyüme", price: "250+", unit: "USDT", reach: "50K–150K", popular: true },
              { name: "Pro", price: "1.000+", unit: "USDT", reach: "250K+", popular: false },
            ].map(p => (
              <div key={p.name} className={`ad-price-card ${p.popular ? "popular" : ""}`}>
                {p.popular && <div className="ad-popular-tag"><Star size={11} /> En Popüler</div>}
                <h3>{p.name}</h3>
                <div className="ad-price-amount"><strong>{p.price}</strong> {p.unit}</div>
                <div className="ad-price-reach"><Users size={12} /> {p.reach} erişim</div>
                <button className="ad-cta-primary" style={{ width: "100%", justifyContent: "center", marginTop: 16 }}
                  onClick={() => setShowManager(true)}>
                  Başla <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section className="ad-section">
        <h2 className="ad-section-title">Sık Sorulan Sorular</h2>
        <div className="ad-faq">
          {FAQS.map((faq, i) => (
            <div key={i} className="ad-faq-item">
              <button className="ad-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                {faq.q}
                {openFaq === i ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {openFaq === i && <div className="ad-faq-a">{faq.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────── */}
      <section className="ad-cta-banner">
        <h2>Bugün Başlayın</h2>
        <p>250.000+ Web3 kullanıcısına ulaşın. İlk kampanyanızda %10 ekstra kredi.</p>
        <button className="ad-cta-primary" style={{ fontSize: 16, padding: "14px 32px" }}
          onClick={() => setShowManager(true)}>
          <Megaphone size={18} /> Kampanya Oluştur
        </button>
      </section>

      {/* ── Ad Manager (Giriş yapıldıysa) ─────────────── */}
      {showManager && (
        <div className="admanager-modal-overlay" onClick={() => setShowManager(false)}>
          <div className="admanager-modal" onClick={e => e.stopPropagation()}>
            <AdManager />
          </div>
        </div>
      )}

      <style>{`
        .adlanding { max-width: 1100px; margin: 0 auto; padding-bottom: 80px; }

        /* Hero */
        .ad-hero { padding: 64px 24px 40px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 20px; }
        .ad-hero-badge { display: inline-flex; align-items: center; gap: 6px; padding: 5px 14px; border-radius: 999px; background: rgba(240,180,41,.15); color: var(--accent); font-size: 12px; font-weight: 700; border: 1.5px solid rgba(240,180,41,.3); }
        .ad-hero h1 { font-size: clamp(28px, 5vw, 48px); font-weight: 900; line-height: 1.15; color: var(--text); max-width: 700px; }
        .ad-hero h1 .accent { color: var(--accent); }
        .ad-hero-sub { font-size: 17px; color: var(--muted); max-width: 600px; line-height: 1.7; }
        .ad-hero-ctas { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
        .ad-cta-primary { display: flex; align-items: center; gap: 8px; padding: 12px 24px; border-radius: 12px; background: var(--accent); color: #1a1300; font-size: 15px; font-weight: 800; border: none; cursor: pointer; transition: opacity .15s; }
        .ad-cta-primary:hover { opacity: .88; }
        .ad-cta-ghost { display: flex; align-items: center; gap: 6px; padding: 12px 20px; border-radius: 12px; border: 1.5px solid var(--border); background: transparent; color: var(--text); font-size: 14px; font-weight: 700; cursor: pointer; transition: border-color .15s; }
        .ad-cta-ghost:hover { border-color: var(--accent); }
        .ad-hero-stats { display: flex; gap: 32px; flex-wrap: wrap; justify-content: center; margin-top: 16px; }
        .ad-hero-stats div { display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .ad-hero-stats strong { font-size: 28px; font-weight: 900; color: var(--accent); }
        .ad-hero-stats span { font-size: 12px; color: var(--muted); font-weight: 600; }

        /* Sections */
        .ad-section { padding: 48px 24px; border-top: 1px solid var(--border); }
        .ad-section-title { font-size: 26px; font-weight: 900; color: var(--text); margin-bottom: 8px; }
        .ad-section-sub { font-size: 15px; color: var(--muted); margin-bottom: 28px; }

        /* ROI Calc */
        .roi-calc { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; overflow: hidden; }
        .roi-calc-header { display: flex; align-items: center; gap: 10px; padding: 16px 24px; border-bottom: 1px solid var(--border); font-size: 15px; color: var(--text); }
        .roi-calc-note { font-size: 12px; color: var(--muted); margin-left: auto; }
        .roi-inputs { padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; }
        .roi-input-group { display: flex; flex-direction: column; gap: 8px; }
        .roi-input-group label { font-size: 13px; font-weight: 700; color: var(--muted); }
        .roi-input-group input[type=range] { accent-color: var(--accent); width: 100%; }
        .roi-val { font-size: 14px; font-weight: 700; color: var(--accent); }
        .roi-val em { font-size: 12px; color: #3fb950; font-style: normal; }
        .roi-fmt-btn { padding: 6px 14px; border-radius: 8px; border: 1.5px solid var(--border); background: transparent; color: var(--muted); font-size: 13px; font-weight: 600; cursor: pointer; transition: all .15s; }
        .roi-fmt-btn.on { background: var(--accent); border-color: var(--accent); color: #1a1300; }
        .roi-part-toggle { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: var(--text); cursor: pointer; }
        .roi-results { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; border-top: 1px solid var(--border); }
        .roi-stat { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 20px 16px; border-right: 1px solid var(--border); }
        .roi-stat:last-child { border-right: none; }
        .roi-stat svg { color: var(--accent); }
        .roi-stat strong { font-size: 22px; font-weight: 900; color: var(--text); }
        .roi-stat span { font-size: 12px; color: var(--muted); }

        /* Why Grid */
        .ad-why-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-top: 28px; }
        .ad-why-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; gap: 10px; transition: border-color .15s; }
        .ad-why-card:hover { border-color: var(--accent); }
        .ad-why-icon { width: 40px; height: 40px; border-radius: 10px; background: rgba(240,180,41,.12); display: flex; align-items: center; justify-content: center; color: var(--accent); }
        .ad-why-card h3 { font-size: 15px; font-weight: 800; color: var(--text); }
        .ad-why-card p { font-size: 13px; color: var(--muted); line-height: 1.6; }

        /* Formats */
        .ad-formats-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px; }
        .ad-fmt-tab { display: flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 10px; border: 1.5px solid var(--border); background: transparent; color: var(--muted); font-size: 13px; font-weight: 700; cursor: pointer; transition: all .15s; }
        .ad-fmt-tab.on { background: var(--accent); border-color: var(--accent); color: #1a1300; }
        .ad-format-detail { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: start; }
        .ad-format-preview { background: var(--surface-2); border-radius: 16px; padding: 24px; display: flex; align-items: center; justify-content: center; min-height: 280px; }
        .ad-format-info { display: flex; flex-direction: column; gap: 14px; }
        .ad-format-info h3 { font-size: 22px; font-weight: 900; color: var(--text); }
        .ad-format-info p { font-size: 14px; color: var(--muted); line-height: 1.7; }
        .ad-format-specs ul { list-style: none; padding: 0; margin: 8px 0 0; display: flex; flex-direction: column; gap: 6px; }
        .ad-format-specs li { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text); }
        .ad-format-specs li svg { color: #3fb950; }
        .ad-format-kpis { display: flex; gap: 20px; flex-wrap: wrap; }
        .ad-format-kpis div { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700; color: var(--accent); }

        /* Mock previews */
        .mock-feed-ad { width: 240px; background: var(--surface); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; }
        .mock-ad-header { display: flex; align-items: center; gap: 10px; padding: 10px 12px; }
        .mock-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--accent); flex-shrink: 0; }
        .mock-name { width: 80px; height: 10px; background: var(--border); border-radius: 4px; margin-bottom: 4px; }
        .mock-sponsored { font-size: 10px; color: var(--muted); }
        .mock-ad-img { height: 140px; background: linear-gradient(135deg, #f0b429 0%, #5b8def 100%); }
        .mock-ad-headline { padding: 10px 12px 6px; font-size: 13px; font-weight: 700; color: var(--text); }
        .mock-ad-cta { margin: 0 12px 12px; padding: 8px 12px; background: var(--accent); color: #1a1300; border-radius: 8px; font-size: 12px; font-weight: 700; text-align: center; }
        .mock-reels-ad { width: 140px; height: 250px; border-radius: 14px; background: #111; overflow: hidden; position: relative; }
        .mock-reels-video { position: absolute; inset: 0; background: linear-gradient(180deg, #5b8def44 0%, #f0b42966 100%); }
        .mock-reels-overlay { position: absolute; bottom: 40px; left: 12px; right: 12px; }
        .mock-reels-brand { width: 60px; height: 8px; background: rgba(255,255,255,.6); border-radius: 4px; margin-bottom: 6px; }
        .mock-reels-cta { background: rgba(255,255,255,.9); color: #111; font-size: 11px; font-weight: 800; padding: 5px 10px; border-radius: 6px; text-align: center; }
        .mock-reels-label { position: absolute; bottom: 12px; left: 0; right: 0; text-align: center; font-size: 10px; color: rgba(255,255,255,.7); }
        .mock-story-ad { width: 140px; height: 250px; border-radius: 14px; overflow: hidden; position: relative; }
        .mock-story-bg { position: absolute; inset: 0; background: linear-gradient(180deg, #a855f7 0%, #f0b429 100%); }
        .mock-story-label { position: absolute; top: 14px; left: 0; right: 0; text-align: center; font-size: 10px; color: rgba(255,255,255,.8); font-weight: 600; }
        .mock-story-cta { position: absolute; bottom: 20px; left: 0; right: 0; text-align: center; font-size: 12px; color: white; font-weight: 800; }

        /* Targeting */
        .ad-targeting-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; margin-top: 28px; }
        .ad-target-card { display: flex; align-items: flex-start; gap: 14px; padding: 16px; background: var(--surface); border: 1px solid var(--border); border-radius: 14px; transition: border-color .15s; }
        .ad-target-card:hover { border-color: var(--accent); }
        .ad-target-icon { font-size: 28px; flex-shrink: 0; }
        .ad-target-card strong { font-size: 14px; font-weight: 800; color: var(--text); display: block; margin-bottom: 4px; }
        .ad-target-card p { font-size: 12px; color: var(--muted); line-height: 1.5; margin: 0; }

        /* How it works */
        .ad-steps { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0; position: relative; margin-top: 32px; }
        .ad-step { display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center; padding: 0 8px; position: relative; }
        .ad-step-num { width: 50px; height: 50px; border-radius: 50%; background: rgba(240,180,41,.15); border: 2px solid var(--accent); display: flex; align-items: center; justify-content: center; color: var(--accent); flex-shrink: 0; }
        .ad-step-connector { position: absolute; top: 25px; left: 50%; right: -50%; height: 2px; background: var(--border); z-index: 0; }
        .ad-step-body strong { font-size: 14px; font-weight: 800; color: var(--text); display: block; margin-bottom: 4px; }
        .ad-step-body p { font-size: 12px; color: var(--muted); line-height: 1.5; }

        /* Pricing tables */
        .ad-pricing-note { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: var(--accent); background: rgba(240,180,41,.08); border: 1px solid rgba(240,180,41,.2); border-radius: 10px; padding: 10px 16px; margin-bottom: 20px; }
        .ad-pricing-tables { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
        .ad-pricing-table h4 { font-size: 14px; font-weight: 800; color: var(--text); margin-bottom: 12px; }
        .ad-pricing-table table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .ad-pricing-table th { padding: 8px 12px; text-align: left; color: var(--muted); font-size: 11px; font-weight: 700; border-bottom: 1px solid var(--border); text-transform: uppercase; letter-spacing: .5px; }
        .ad-pricing-table td { padding: 10px 12px; border-bottom: 1px solid var(--border); color: var(--text); }
        .ad-pricing-table tr:last-child td { border-bottom: none; }
        .ad-duration-packages h4 { display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 800; color: var(--text); margin-bottom: 14px; }
        .ad-duration-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .ad-duration-card { position: relative; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px; text-align: center; display: flex; flex-direction: column; gap: 6px; }
        .ad-duration-card.popular { border-color: var(--accent); }
        .ad-duration-card strong { font-size: 15px; font-weight: 800; color: var(--text); }
        .ad-duration-price { font-size: 13px; color: var(--muted); }
        .ad-duration-bonus { font-size: 11px; font-weight: 700; color: #3fb950; }
        .ad-popular-tag { display: flex; align-items: center; gap: 3px; font-size: 10px; font-weight: 800; color: var(--accent); text-transform: uppercase; letter-spacing: .5px; justify-content: center; }

        /* Static pricing */
        .ad-pricing-static { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 28px; }
        .ad-price-card { position: relative; background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 28px 24px; display: flex; flex-direction: column; gap: 10px; transition: border-color .15s; }
        .ad-price-card.popular { border-color: var(--accent); }
        .ad-price-card h3 { font-size: 18px; font-weight: 900; color: var(--text); }
        .ad-price-amount { font-size: 28px; font-weight: 900; color: var(--accent); }
        .ad-price-amount strong { font-size: 36px; }
        .ad-price-reach { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--muted); }

        /* FAQ */
        .ad-faq { display: flex; flex-direction: column; margin-top: 24px; }
        .ad-faq-item { border-bottom: 1px solid var(--border); }
        .ad-faq-q { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 0; background: none; border: none; cursor: pointer; text-align: left; font-size: 15px; font-weight: 700; color: var(--text); }
        .ad-faq-a { padding: 0 0 16px; font-size: 14px; color: var(--muted); line-height: 1.7; }

        /* CTA Banner */
        .ad-cta-banner { margin: 0 24px 48px; background: linear-gradient(135deg, #1a1300 0%, #0a0b0f 50%, #0d0e18 100%); border: 1px solid var(--accent); border-radius: 24px; padding: 48px 32px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 16px; }
        .ad-cta-banner h2 { font-size: 32px; font-weight: 900; color: var(--accent); }
        .ad-cta-banner p { font-size: 16px; color: var(--muted); max-width: 500px; }

        /* Manager modal */
        .admanager-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.75); z-index: 1000; display: flex; align-items: flex-end; justify-content: center; }
        .admanager-modal { background: var(--bg); border-top: 1px solid var(--border); width: 100%; max-height: 90vh; overflow-y: auto; border-radius: 20px 20px 0 0; }

        @media (max-width: 768px) {
          .ad-steps { grid-template-columns: 1fr; }
          .ad-step-connector { display: none; }
          .ad-format-detail { grid-template-columns: 1fr; }
          .ad-pricing-tables { grid-template-columns: 1fr; }
          .ad-duration-grid { grid-template-columns: repeat(2, 1fr); }
          .ad-pricing-static { grid-template-columns: 1fr; }
          .roi-results { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </div>
  );
}
