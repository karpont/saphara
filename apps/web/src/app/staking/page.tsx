"use client";

import { useEffect, useState } from "react";
import {
  Zap, TrendingUp, Lock, Unlock, Shield, Info,
  ChevronDown, ChevronUp, RefreshCw, AlertTriangle, CheckCircle2,
  Wallet, BarChart3, Timer, Flame, Bell, BellOff,
} from "lucide-react";
import { useAuth } from "../../features/auth/AuthContext";
import {
  useStakingStats,
  useMyStakingNotify,
  useRegisterStakingNotify,
  useMyStakingPositions,
  usePartMarketData,
} from "../../hooks/useApi";

const POOLS = [
  {
    id: "flexible",
    name: "Esnek Staking",
    apy: "8–12%", apyNum: 10, apyMin: 8, apyMax: 12,
    lock: "Kilitsiz", lockDays: 0, min: 100,
    desc: "İstediğin zaman çekebilirsin. Düşük APY, tam esneklik.",
    badge: "Başlangıç", badgeColor: "#3fb950",
    icon: "🐰", compound: true, earlyExit: 0, risk: "low",
  },
  {
    id: "30d",
    name: "30 Gün Staking",
    apy: "18–22%", apyNum: 20, apyMin: 18, apyMax: 22,
    lock: "30 gün", lockDays: 30, min: 500,
    desc: "30 gün kilitli. Daha yüksek ödül, orta vadeli yatırım.",
    badge: "Popüler", badgeColor: "#f0b429",
    icon: "🦊", compound: true, earlyExit: 30, risk: "medium",
  },
  {
    id: "90d",
    name: "90 Gün Staking",
    apy: "35–42%", apyNum: 38, apyMin: 35, apyMax: 42,
    lock: "90 gün", lockDays: 90, min: 1000,
    desc: "En yüksek APY. Uzun vadeli inananlar için tasarlandı.",
    badge: "Yüksek Getiri", badgeColor: "#e5484d",
    icon: "🦁", compound: true, earlyExit: 30, risk: "medium",
  },
  {
    id: "lp",
    name: "LP Farm (PART/BNB)",
    apy: "55–80%", apyNum: 65, apyMin: 55, apyMax: 80,
    lock: "Kilitsiz", lockDays: 0, min: 50,
    desc: "PancakeSwap PART/BNB LP token'ı farm et. Impermanent loss riski var.",
    badge: "DeFi", badgeColor: "#7c3aed",
    icon: "🐼", compound: false, earlyExit: 0, risk: "high",
  },
];

const FAQS = [
  { q: "Staking ödülleri ne zaman dağıtılır?", a: "Esnek stakingde her gün, kilitli stakingde kilit süresi sonunda toplu olarak hesabınıza eklenir." },
  { q: "Minimum staking miktarı nedir?", a: "Esnek: 100 PART, 30 gün: 500 PART, 90 gün: 1.000 PART, LP Farm: 50 PART değerinde LP token." },
  { q: "Erken çekim yapabilir miyim?", a: "Kilitli havuzlarda erken çekim mümkündür ancak ödüllerin %30'u kesilir ve 3 gün bekleme süresi uygulanır." },
  { q: "Compound (yeniden yatırım) var mı?", a: "Evet — 'Auto-compound' seçeneği ile ödüller otomatik olarak stakinge eklenerek bileşik faiz etkisi yaratır." },
  { q: "Smart contract audit edildi mi?", a: "Staking sözleşmesi CertiK tarafından denetlenmektedir. Audit raporu çok yakında yayınlanacak." },
  { q: "LP Farm impermanent loss nedir?", a: "Likidite havuzuna PART/BNB çifti yatırdığınızda, token fiyatları değiştikçe sadece tutmaya kıyasla zarar oluşabilir. Yüksek APY bu riski telafi eder." },
  { q: "Stake ödülleri vergilendirilebilir mi?", a: "Bulunduğunuz ülkenin kripto vergi mevzuatına bakın. Türkiye'de kripto geliri için vergi danışmanına başvurmanızı öneririz." },
];

const RISK_COLORS = { low: "#3fb950", medium: "#f0b429", high: "#e5484d" } as const;
const RISK_LABELS = { low: "Düşük Risk", medium: "Orta Risk", high: "Yüksek Risk" } as const;

function fmtPart(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString("en-US");
}

function NotifyButton() {
  const { isAuthed } = useAuth();
  const myNotify  = useMyStakingNotify();
  const register  = useRegisterStakingNotify();
  const [done, setDone] = useState(false);

  if (!isAuthed) {
    return (
      <div className="stk-auth-warn">
        <Shield size={14} /> Bildirim almak için cüzdanını bağla.
      </div>
    );
  }

  const registered = myNotify.data?.registered || done;
  const position   = myNotify.data?.position;
  const total      = myNotify.data?.total ?? 0;

  const handleClick = async () => {
    try {
      const res = await register.mutateAsync();
      if (res.registered) setDone(true);
    } catch { /* ignore */ }
  };

  if (registered) {
    return (
      <div className="stk-notify-registered">
        <BellOff size={14} style={{ color: "#3fb950" }} />
        <span>
          <strong style={{ color: "#3fb950" }}>Erken erişim listesine kayıtlısın</strong>
          {position && ` — Sıra: #${position} / ${total}`}
        </span>
      </div>
    );
  }

  return (
    <button
      className="stk-notify-btn"
      onClick={handleClick}
      disabled={register.isPending || myNotify.isLoading}
    >
      <Bell size={13} />
      {register.isPending ? "Kaydediliyor…" : "🔔 Bildirim Al"}
    </button>
  );
}

export default function StakingPage() {
  const { isAuthed }   = useAuth();
  const [selected, setSelected] = useState<string | null>(null);
  const [amount, setAmount]     = useState("");
  const [compound, setCompound] = useState(true);
  const [faqOpen, setFaqOpen]   = useState<number | null>(null);
  const [tab, setTab]           = useState<"stake" | "my">("stake");
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => { setNow(Date.now()); }, []);

  const stats        = useStakingStats();
  const partMarket   = usePartMarketData();
  const myPositions  = useMyStakingPositions();

  const partPrice = (partMarket.data as any)?.priceUsd ?? null;
  const totalTvl  = stats.data?.totalTvl ?? 10192000;

  const pool      = POOLS.find((p) => p.id === selected);
  const numAmount = Number(amount) || 0;

  const calcReward = (apyPct: number, days: number) =>
    numAmount > 0 ? (numAmount * apyPct / 100 / 365 * Math.max(days, 30)).toFixed(2) : null;

  const estRewardMin = pool ? calcReward(pool.apyMin, pool.lockDays) : null;
  const estRewardMax = pool ? calcReward(pool.apyMax, pool.lockDays) : null;

  const compoundReward = () => {
    if (!pool || !numAmount) return null;
    const rate = pool.apyNum / 100;
    const days = Math.max(pool.lockDays, 30);
    const n    = 365;
    return (numAmount * Math.pow(1 + rate / n, (n * days) / 365) - numAmount).toFixed(2);
  };

  const displayTvl = totalTvl > 0 ? totalTvl : POOLS.reduce((a, p) => a + (p.id === "flexible" ? 842000 : p.id === "30d" ? 2340000 : p.id === "90d" ? 5120000 : 1890000), 0);

  return (
    <div className="stk-wrap">
      <header className="topbar"><h1>Staking</h1></header>

      {/* Hero stats */}
      <div className="stk-hero">
        <div className="stk-hero-stat">
          <span className="stk-hero-num">~{stats.data?.avgApy ?? 38}%</span>
          <span className="stk-hero-label">Ortalama APY</span>
        </div>
        <div className="stk-hero-divider" />
        <div className="stk-hero-stat">
          <span className="stk-hero-num">{fmtPart(displayTvl)}</span>
          <span className="stk-hero-label">Toplam TVL (PART)</span>
        </div>
        <div className="stk-hero-divider" />
        <div className="stk-hero-stat">
          <span className="stk-hero-num">{(stats.data?.totalStakers ?? 8120).toLocaleString("en-US")}</span>
          <span className="stk-hero-label">Aktif Staker</span>
        </div>
        <div className="stk-hero-divider" />
        <div className="stk-hero-stat">
          {partMarket.isLoading ? (
            <span className="stk-hero-num" style={{ fontSize: 16 }}>…</span>
          ) : (
            <span className="stk-hero-num" style={{ color: "#3fb950" }}>
              ${partPrice ? Number(partPrice).toFixed(4) : "—"}
            </span>
          )}
          <span className="stk-hero-label">PART / USDT</span>
        </div>
      </div>

      {/* Coming soon banner */}
      <div className="stk-soon">
        <Zap size={16} style={{ color: "var(--accent)" }} />
        <span>
          <strong>Staking yakında aktif!</strong> Smart contract audit aşamasında.
          {stats.data?.earlyAccessCount ? ` ${stats.data.earlyAccessCount} kişi erken erişim listesinde.` : ""}
        </span>
        <NotifyButton />
      </div>

      {/* Tabs */}
      <div className="stk-tabs">
        <button className={tab === "stake" ? "on" : ""} onClick={() => setTab("stake")}>
          <Flame size={14} /> Havuzlar
        </button>
        <button className={tab === "my" ? "on" : ""} onClick={() => setTab("my")}>
          <Wallet size={14} /> Pozisyonlarım
        </button>
      </div>

      {tab === "stake" && (
        <>
          {/* Pool cards */}
          <div className="stk-grid">
            {POOLS.map((p) => {
              const riskCol = RISK_COLORS[p.risk as keyof typeof RISK_COLORS];
              const tvlVal  = p.id === "flexible" ? 842000 : p.id === "30d" ? 2340000 : p.id === "90d" ? 5120000 : 1890000;
              const tvlPct  = Math.round((tvlVal / displayTvl) * 100);
              return (
                <div
                  key={p.id}
                  className={`stk-card${selected === p.id ? " stk-card--sel" : ""}`}
                  onClick={() => setSelected(selected === p.id ? null : p.id)}
                >
                  <div className="stk-card-top">
                    <span className="stk-animal">{p.icon}</span>
                    <div className="stk-card-info">
                      <span className="stk-card-name">{p.name}</span>
                      <span className="stk-card-lock">
                        {p.lockDays > 0
                          ? <><Lock size={11} /> {p.lock}</>
                          : <><Unlock size={11} /> {p.lock}</>}
                      </span>
                    </div>
                    <div className="stk-badges-col">
                      <span className="stk-badge" style={{ background: p.badgeColor + "22", color: p.badgeColor }}>
                        {p.badge}
                      </span>
                      <span className="stk-risk-dot" style={{ background: riskCol }} title={RISK_LABELS[p.risk as keyof typeof RISK_LABELS]} />
                    </div>
                  </div>

                  <div className="stk-apy">{p.apy} <span className="stk-apy-label">APY</span></div>
                  <p className="stk-desc">{p.desc}</p>

                  <div className="stk-tvl-bar-wrap">
                    <div className="stk-tvl-bar-track">
                      <div className="stk-tvl-bar-fill" style={{ width: `${tvlPct}%` }} />
                    </div>
                    <span className="stk-tvl-label">{fmtPart(tvlVal)} PART TVL</span>
                  </div>

                  <div className="stk-card-stats">
                    <span><TrendingUp size={12} /> {(p.id === "flexible" ? 1240 : p.id === "30d" ? 3100 : p.id === "90d" ? 2800 : 980).toLocaleString("en-US")} staker</span>
                    <span style={{ color: riskCol, fontWeight: 700 }}>
                      {RISK_LABELS[p.risk as keyof typeof RISK_LABELS]}
                    </span>
                  </div>

                  {p.earlyExit > 0 && (
                    <div className="stk-early-exit">
                      <AlertTriangle size={11} /> Erken çekim: %{p.earlyExit} ceza
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Calculator */}
          {pool && (
            <div className="stk-calc">
              <h3 className="stk-calc-title">
                {pool.icon} {pool.name} — Getiri Hesaplama
              </h3>

              <div className="stk-calc-row">
                <label className="stk-label">Stake miktarı (PART)</label>
                <div className="stk-input-wrap">
                  <input
                    className="stk-input"
                    type="number"
                    placeholder={`Min. ${pool.min} PART`}
                    value={amount}
                    min={pool.min}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <button className="stk-max" onClick={() => setAmount("10000")}>MAX</button>
                </div>
                {partPrice && numAmount > 0 && (
                  <span className="stk-usd-hint">≈ ${(numAmount * Number(partPrice)).toFixed(2)} USD</span>
                )}
              </div>

              {pool.compound && (
                <div className="stk-compound-row" onClick={() => setCompound(!compound)} style={{ cursor: "pointer" }}>
                  <div className="stk-compound-info">
                    <RefreshCw size={14} />
                    <div>
                      <span className="stk-compound-label">Auto-compound</span>
                      <span className="stk-compound-sub">Ödülleri otomatik stakinge ekle</span>
                    </div>
                  </div>
                  <div className={`ck-toggle${compound ? " ck-toggle--on" : ""}`}>
                    <span className="ck-knob" />
                  </div>
                </div>
              )}

              {numAmount > 0 && (
                <div className="stk-result">
                  <div className="stk-result-header">
                    <BarChart3 size={14} /> Tahmini Getiri ({pool.lockDays > 0 ? `${pool.lockDays} gün` : "30 gün"})
                  </div>
                  <div className="stk-result-row">
                    <span>Min. getiri ({pool.apyMin}% APY)</span>
                    <strong style={{ color: "#3fb950" }}>+{estRewardMin} PART</strong>
                  </div>
                  <div className="stk-result-row">
                    <span>Max. getiri ({pool.apyMax}% APY)</span>
                    <strong style={{ color: "#3fb950" }}>+{estRewardMax} PART</strong>
                  </div>
                  {compound && pool.compound && (
                    <div className="stk-result-row stk-compound-row-result">
                      <span><RefreshCw size={11} /> Compound getiri</span>
                      <strong style={{ color: "var(--accent)" }}>+{compoundReward()} PART</strong>
                    </div>
                  )}
                  {partPrice && estRewardMax && (
                    <div className="stk-result-row">
                      <span>USD değeri (maks.)</span>
                      <strong>${(Number(estRewardMax) * Number(partPrice)).toFixed(4)}</strong>
                    </div>
                  )}
                  <p className="stk-result-note">
                    <Info size={11} /> Tahmini değer — gerçek APY piyasa koşullarına göre değişir.
                  </p>
                  {pool.lockDays > 0 && now && (
                    <div className="stk-lock-info">
                      <Timer size={12} />
                      <span>
                        Kilit bitiş: <strong>
                          {new Date(now + pool.lockDays * 86400000).toLocaleDateString("tr-TR")}
                        </strong>
                        {pool.earlyExit > 0 && ` · Erken çekim cezası: %${pool.earlyExit}`}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {!isAuthed ? (
                <div className="stk-auth-warn">
                  <Shield size={14} /> Stake etmek için cüzdanını bağla ve giriş yap.
                </div>
              ) : (
                <button className="stk-stake-btn" disabled>
                  <Lock size={15} /> Stake Et — Yakında Aktif
                </button>
              )}
            </div>
          )}

          {/* Tier Sistemi */}
          <div className="stk-security" style={{ marginTop: 20 }}>
            <h3 className="stk-sec-title">🏆 Tier Sistemi — Launchpad Erişimi</h3>
            <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 14, lineHeight: 1.6 }}>
              Ne kadar PART stake edersen, o kadar yüksek tier kazanırsın. Üst tierlar launchpad IDO'larında garantili allocation hakkı verir.
            </p>
            <div className="stk-tier-grid">
              {[
                { name: "Bronz",  minPart: "500",    multi: "1×",  color: "#cd7f32", guaranteed: false, emoji: "🥉" },
                { name: "Gümüş",  minPart: "2.000",  multi: "4×",  color: "#94a3b8", guaranteed: false, emoji: "🥈" },
                { name: "Altın",  minPart: "5.000",  multi: "10×", color: "#f0b429", guaranteed: true,  emoji: "🥇" },
                { name: "Elmas",  minPart: "20.000", multi: "40×", color: "#a5f3fc", guaranteed: true,  emoji: "💎" },
              ].map((t) => (
                <div key={t.name} className="stk-tier-card" style={{ borderColor: t.color + "50" }}>
                  <span style={{ fontSize: 22 }}>{t.emoji}</span>
                  <span style={{ fontWeight: 700, fontSize: 13, color: t.color }}>{t.name}</span>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>Min. {t.minPart} PART</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)" }}>Çarpan: {t.multi}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                    background: t.guaranteed ? "rgba(63,185,80,.15)" : "rgba(100,116,139,.15)",
                    color: t.guaranteed ? "#3fb950" : "#94a3b8",
                  }}>
                    {t.guaranteed ? "✓ Garantili" : "FCFS"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Komisyon Dağılımı */}
          <div className="stk-security" style={{ marginTop: 16 }}>
            <h3 className="stk-sec-title">💸 Gelir Dağılımı — Ödüller Nereden Geliyor?</h3>
            <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 14, lineHeight: 1.6 }}>
              Platform ücretleri (NFT, market, blog, reklam) havuza girer ve şu şekilde dağıtılır:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Staking Ödül Havuzu",  pct: 55, color: "#3fb950", icon: "🏦" },
                { label: "Hazine / Operasyon",   pct: 25, color: "#60a5fa", icon: "🏛️" },
                { label: "Buyback & Burn (PART)", pct: 15, color: "#f97316", icon: "🔥" },
                { label: "DAO Yönetim Fonu",      pct: 5,  color: "#a78bfa", icon: "🗳️" },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 20, textAlign: "center" }}>{item.icon}</span>
                  <span style={{ fontSize: 12, flex: 1 }}>{item.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: item.color, minWidth: 32, textAlign: "right" }}>%{item.pct}</span>
                  <div style={{ width: 100, height: 6, background: "var(--surface-2)", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${item.pct * 2}%`, background: item.color, borderRadius: 99 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Protocol security */}
          <div className="stk-security">
            <h3 className="stk-sec-title">Protokol Güvenliği</h3>
            <div className="stk-sec-grid">
              <div className="stk-sec-item">
                <CheckCircle2 size={16} style={{ color: "#3fb950" }} />
                <div>
                  <div className="stk-sec-name">Audit (Bekliyor)</div>
                  <div className="stk-sec-sub">CertiK incelemesi devam ediyor</div>
                </div>
              </div>
              <div className="stk-sec-item">
                <CheckCircle2 size={16} style={{ color: "#3fb950" }} />
                <div>
                  <div className="stk-sec-name">Açık Kaynak</div>
                  <div className="stk-sec-sub">Tüm sözleşmeler GitHub'da</div>
                </div>
              </div>
              <div className="stk-sec-item">
                <CheckCircle2 size={16} style={{ color: "#3fb950" }} />
                <div>
                  <div className="stk-sec-name">DAO Yönetimi</div>
                  <div className="stk-sec-sub">Parametreler topluluk oyuyla değişir</div>
                </div>
              </div>
              <div className="stk-sec-item">
                <CheckCircle2 size={16} style={{ color: "#3fb950" }} />
                <div>
                  <div className="stk-sec-name">Time-lock</div>
                  <div className="stk-sec-sub">Kritik değişiklikler 48s gecikmeli</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {tab === "my" && (
        <div className="stk-my">
          {!isAuthed ? (
            <div className="stk-empty">
              <span style={{ fontSize: 40 }}>🔗</span>
              <p>Cüzdanını bağla ve stake ettiğin varlıkları görüntüle.</p>
            </div>
          ) : myPositions.isLoading ? (
            <div className="stk-empty">
              <span style={{ fontSize: 40 }}>⏳</span>
              <p>Yükleniyor…</p>
            </div>
          ) : (
            <div className="stk-empty">
              <span style={{ fontSize: 40 }}>🔒</span>
              <p>Henüz aktif staking pozisyonun yok.</p>
              <p className="muted">Staking yakında aktif olacak. Bildirim al!</p>
              <div style={{ marginTop: 12 }}>
                <NotifyButton />
              </div>
            </div>
          )}
        </div>
      )}

      {/* FAQ */}
      <div className="stk-faq">
        <h2 className="stk-faq-title">Sık Sorulan Sorular</h2>
        {FAQS.map((f, i) => (
          <div key={i} className="stk-faq-item">
            <button className="stk-faq-q" onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
              {f.q}
              {faqOpen === i ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
            {faqOpen === i && <p className="stk-faq-a">{f.a}</p>}
          </div>
        ))}
      </div>

      <style>{`
        .stk-wrap { max-width: 900px; margin: 0 auto; padding-bottom: 80px; }

        .stk-hero { display:flex;align-items:center;background:linear-gradient(135deg,var(--surface) 0%,var(--surface-2) 100%);border:1px solid var(--border);border-radius:16px;margin:16px 20px;overflow:hidden; }
        .stk-hero-stat { flex:1;text-align:center;padding:20px 12px; }
        .stk-hero-num { display:block;font-size:22px;font-weight:900;color:var(--accent); }
        .stk-hero-label { display:block;font-size:11px;color:var(--muted);margin-top:2px; }
        .stk-hero-divider { width:1px;background:var(--border);align-self:stretch; }

        .stk-soon { display:flex;align-items:center;gap:10px;margin:12px 20px;padding:12px 16px;background:rgba(240,180,41,.08);border:1px solid rgba(240,180,41,.2);border-radius:12px;font-size:13px;flex-wrap:wrap; }
        .stk-soon span { flex:1; }
        .stk-notify-btn { display:inline-flex;align-items:center;gap:5px;padding:7px 14px;border-radius:8px;background:var(--accent);color:#1a1300;font-size:12px;font-weight:700;border:none;cursor:pointer;white-space:nowrap;transition:opacity .15s; }
        .stk-notify-btn:hover:not(:disabled) { opacity:.85; }
        .stk-notify-btn:disabled { opacity:.5;cursor:default; }
        .stk-notify-registered { display:inline-flex;align-items:center;gap:7px;padding:7px 12px;border-radius:8px;background:rgba(63,185,80,.1);border:1px solid rgba(63,185,80,.2);font-size:12px;white-space:nowrap; }

        .stk-tabs { display:flex;gap:4px;margin:16px 20px 12px;background:var(--surface-2);border-radius:12px;padding:4px; }
        .stk-tabs button { flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:9px;border-radius:9px;border:none;font-size:14px;font-weight:600;cursor:pointer;background:transparent;color:var(--muted);transition:all .15s; }
        .stk-tabs button.on { background:var(--surface);color:var(--text);box-shadow:0 1px 4px rgba(0,0,0,.2); }

        .stk-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px;padding:0 20px; }
        .stk-card { background:var(--surface);border:1.5px solid var(--border);border-radius:16px;padding:16px;cursor:pointer;transition:all .15s; }
        .stk-card:hover,.stk-card--sel { border-color:var(--accent);box-shadow:0 0 0 2px rgba(240,180,41,.12); }
        .stk-card-top { display:flex;align-items:center;gap:10px;margin-bottom:12px; }
        .stk-animal { font-size:26px; }
        .stk-card-info { flex:1; }
        .stk-card-name { display:block;font-size:13px;font-weight:700; }
        .stk-card-lock { display:flex;align-items:center;gap:4px;font-size:11px;color:var(--muted);margin-top:2px; }
        .stk-badges-col { display:flex;flex-direction:column;align-items:flex-end;gap:4px; }
        .stk-badge { font-size:10px;font-weight:700;padding:2px 7px;border-radius:99px; }
        .stk-risk-dot { width:8px;height:8px;border-radius:50%; }
        .stk-apy { font-size:24px;font-weight:900;color:var(--accent);margin-bottom:6px; }
        .stk-apy-label { font-size:13px;font-weight:600;color:var(--muted); }
        .stk-desc { font-size:12px;color:var(--muted);line-height:1.5;margin-bottom:10px; }
        .stk-tvl-bar-wrap { margin-bottom:8px; }
        .stk-tvl-bar-track { height:4px;background:var(--surface-2);border-radius:99px;overflow:hidden;margin-bottom:3px; }
        .stk-tvl-bar-fill { height:100%;background:linear-gradient(90deg,var(--accent),#22c55e);border-radius:99px; }
        .stk-tvl-label { font-size:10px;color:var(--muted); }
        .stk-card-stats { display:flex;justify-content:space-between;align-items:center;font-size:11px;color:var(--muted); }
        .stk-card-stats span { display:flex;align-items:center;gap:4px; }
        .stk-early-exit { display:flex;align-items:center;gap:4px;font-size:10px;color:#f59e0b;margin-top:6px; }

        .stk-calc { margin:20px 20px 0;padding:20px;background:var(--surface);border:1px solid var(--border);border-radius:16px; }
        .stk-calc-title { font-size:16px;font-weight:700;margin-bottom:16px; }
        .stk-calc-row { margin-bottom:14px; }
        .stk-label { display:block;font-size:13px;color:var(--muted);margin-bottom:6px; }
        .stk-input-wrap { display:flex;gap:8px; }
        .stk-input { flex:1;padding:10px 14px;border-radius:10px;border:1.5px solid var(--border);background:var(--surface-2);color:var(--text);font-size:14px;outline:none; }
        .stk-input:focus { border-color:var(--accent); }
        .stk-max { padding:0 14px;border-radius:10px;background:var(--surface-2);border:1.5px solid var(--border);color:var(--accent);font-size:12px;font-weight:700;cursor:pointer; }
        .stk-usd-hint { display:block;font-size:12px;color:var(--muted);margin-top:4px; }

        .stk-compound-row { display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--surface-2);border-radius:10px;margin-bottom:14px;cursor:pointer; }
        .stk-compound-info { display:flex;align-items:center;gap:10px;flex:1;color:var(--muted); }
        .stk-compound-label { display:block;font-size:13px;font-weight:600;color:var(--text); }
        .stk-compound-sub { display:block;font-size:11px;color:var(--muted); }

        .stk-result { background:var(--surface-2);border-radius:12px;padding:14px;margin-bottom:16px; }
        .stk-result-header { display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;margin-bottom:10px;color:var(--muted); }
        .stk-result-row { display:flex;justify-content:space-between;align-items:center;font-size:13px;padding:4px 0;border-bottom:1px solid var(--border); }
        .stk-result-row:last-of-type { border-bottom:none; }
        .stk-compound-row-result { background:rgba(240,180,41,.06);margin:0 -4px;padding:4px 4px;border-radius:6px; }
        .stk-result-note { font-size:11px;color:var(--muted);margin-top:8px;display:flex;align-items:center;gap:4px; }
        .stk-lock-info { display:flex;align-items:center;gap:6px;font-size:12px;color:var(--muted);margin-top:8px;padding:8px 10px;background:rgba(245,158,11,.07);border-radius:8px; }

        .stk-auth-warn { display:flex;align-items:center;gap:8px;padding:12px 16px;background:rgba(240,180,41,.08);border:1px solid rgba(240,180,41,.2);border-radius:10px;font-size:13px;color:var(--muted); }
        .stk-stake-btn { width:100%;padding:14px;border-radius:12px;background:var(--surface-2);color:var(--muted);font-size:15px;font-weight:700;border:1.5px solid var(--border);cursor:not-allowed;display:flex;align-items:center;justify-content:center;gap:8px; }

        .stk-security { margin:20px 20px 0;padding:20px;background:var(--surface);border:1px solid var(--border);border-radius:16px; }
        .stk-sec-title { font-size:15px;font-weight:700;margin-bottom:14px; }
        .stk-sec-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px; }
        .stk-sec-item { display:flex;align-items:flex-start;gap:10px; }
        .stk-sec-name { font-size:13px;font-weight:600; }
        .stk-sec-sub { font-size:11px;color:var(--muted);margin-top:2px; }

        .stk-my { padding:0 20px; }
        .stk-empty { display:flex;flex-direction:column;align-items:center;gap:12px;padding:60px 20px;text-align:center;color:var(--muted); }

        .stk-faq { padding:32px 20px 0; }
        .stk-faq-title { font-size:18px;font-weight:800;margin-bottom:16px; }
        .stk-faq-item { border-bottom:1px solid var(--border); }
        .stk-faq-q { width:100%;background:none;border:none;padding:16px 0;display:flex;justify-content:space-between;align-items:center;font-size:14px;font-weight:600;color:var(--text);cursor:pointer;text-align:left;gap:12px; }
        .stk-faq-q:hover { color:var(--accent); }
        .stk-faq-a { font-size:13px;color:var(--muted);line-height:1.7;padding-bottom:16px; }

        .stk-tier-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:10px; }
        .stk-tier-card { display:flex;flex-direction:column;align-items:center;gap:5px;padding:12px 8px;background:var(--surface-2);border:1.5px solid var(--border);border-radius:12px;text-align:center; }
        @media(max-width:600px){ .stk-tier-grid{grid-template-columns:repeat(2,1fr);} }

        /* Toggle reuse */
        .ck-toggle{width:40px;height:23px;background:var(--border,#444);border-radius:99px;flex-shrink:0;position:relative;transition:background .2s;}
        .ck-toggle--on{background:var(--accent,#f0b429);}
        .ck-knob{position:absolute;top:3px;left:3px;width:17px;height:17px;background:#fff;border-radius:50%;transition:left .2s;box-shadow:0 1px 4px rgba(0,0,0,.3);}
        .ck-toggle--on .ck-knob{left:20px;}

        @media(max-width:600px){
          .stk-hero{flex-wrap:wrap;}
          .stk-hero-stat{min-width:50%;}
          .stk-hero-divider{display:none;}
          .stk-grid{grid-template-columns:1fr 1fr;}
        }
      `}</style>
    </div>
  );
}
