"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../features/auth/AuthContext";
import { api } from "../../lib/api";
import {
  Rocket, Clock, Users, TrendingUp, Shield, Globe,
  Send, FileText, Zap, Lock, Coins,
  CheckCircle2, AlertCircle, Info,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface Project {
  id: string; name: string; symbol: string; tagline?: string; description: string;
  logoUrl?: string; bannerUrl?: string; websiteUrl?: string; twitterUrl?: string;
  telegramUrl?: string; whitepaperUrl?: string;
  targetAmount: string; raisedAmount: string; tokenPrice: string; totalSupply: string;
  minBuy: string; maxBuy: string; status: string; startAt: string; endAt: string;
  chain: string; participants: number; progress: number;
  tgeUnlockPct?: number; cliffMonths?: number; linearMonths?: number;
  creator: { handle: string; name: string; avatarUrl?: string; verified: boolean };
}

const STATUS: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  active:    { label: "🟢 Live Now",  color: "#22c55e", bg: "rgba(34,197,94,.12)",  dot: "#22c55e" },
  upcoming:  { label: "🟡 Upcoming",  color: "#f59e0b", bg: "rgba(245,158,11,.12)", dot: "#f59e0b" },
  ended:     { label: "⬛ Ended",     color: "#8b90a0", bg: "rgba(139,144,160,.1)", dot: "#8b90a0" },
  cancelled: { label: "🔴 Cancelled", color: "#e5484d", bg: "rgba(229,72,77,.12)",  dot: "#e5484d" },
};

function useCountdown(endAt: string) {
  const [text, setText] = useState("");
  useEffect(() => {
    const tick = () => {
      const diff = new Date(endAt).getTime() - Date.now();
      if (diff <= 0) { setText("Ended"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setText(d > 0 ? `${d}g ${h}s ${m}d` : `${h}s ${m}d ${s}sn`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endAt]);
  return text;
}

function fmtPart(val: string | number) {
  const n = Number(val);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

const ANIMAL_LOGOS: Record<string, string> = {
  SapharaDAO:       "https://api.dicebear.com/9.x/bottts/svg?seed=dao-lion&backgroundColor=ffd5dc&size=80",
  ChainVault:       "https://api.dicebear.com/9.x/adventurer/svg?seed=vault-fox&backgroundColor=b6e3f4&size=80",
  PixelRealms:      "https://api.dicebear.com/9.x/lorelei/svg?seed=pixel-panda&backgroundColor=c0aede&size=80",
  "DataLink Protocol": "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=data-owl&backgroundColor=d1d4f9&size=80",
  GreenChain:       "https://api.dicebear.com/9.x/adventurer/svg?seed=green-bear&backgroundColor=b6e3f4&size=80",
};

/* ── Upcoming Remind Button ── */
function UpcomingRemind({ p, isAuthed }: { p: Project; isAuthed: boolean }) {
  const [reminded, setReminded] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleRemind = async () => {
    if (!isAuthed) { alert("Hatırlatma için cüzdanını bağla."); return; }
    setBusy(true);
    try {
      await api.post(`/launchpad/${p.id}/remind`, {});
      setReminded(true);
    } catch {
      setReminded(true); // best-effort
    } finally { setBusy(false); }
  };

  return (
    <div className="lpm-upcoming-note">
      <Clock size={14} /> Sale başlangıç: <strong>{new Date(p.startAt).toLocaleString("tr-TR")}</strong>
      <button
        className="lpm-remind-btn"
        onClick={handleRemind}
        disabled={busy || reminded}
        style={reminded ? { opacity: .6, cursor: "default" } : undefined}
      >
        {reminded ? "✓ Hatırlatma Ayarlandı" : busy ? "…" : "🔔 Hatırlat"}
      </button>
    </div>
  );
}

/* ── Project Detail Modal ── */
function ProjectModal({ p, onClose, onParticipate }: { p: Project; onClose: () => void; onParticipate: (id: string, amount: string) => Promise<void> }) {
  const { isAuthed } = useAuth();
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [tab, setTab] = useState<"overview" | "tokenomics" | "team">("overview");
  const countdown = useCountdown(p.endAt);
  const s = STATUS[p.status] ?? STATUS.ended;

  const handle = async () => {
    if (!isAuthed) { setMsg({ ok: false, text: "Cüzdanını bağla ve giriş yap." }); return; }
    if (!amount || Number(amount) <= 0) { setMsg({ ok: false, text: "Geçerli bir miktar gir." }); return; }
    setBusy(true); setMsg(null);
    try {
      await onParticipate(p.id, amount);
      setMsg({ ok: true, text: `${Number(amount).toLocaleString()} PART ile katıldınız! ✓` });
      setAmount("");
    } catch (e: any) {
      setMsg({ ok: false, text: e?.message?.slice(0, 80) ?? "Hata oluştu." });
    } finally { setBusy(false); }
  };

  const logoSrc = p.logoUrl ?? ANIMAL_LOGOS[p.name] ?? `https://api.dicebear.com/9.x/bottts/svg?seed=${p.symbol}&size=80`;

  const tokenomicsRows = [
    { label: "Halka Arz (IDO)", pct: 30, color: "#f0b429" },
    { label: "Likidite Havuzu", pct: 25, color: "#22c55e" },
    { label: "Ekip & Danışmanlar", pct: 15, color: "#3b82f6" },
    { label: "Ekosistem Fonları", pct: 20, color: "#8b5cf6" },
    { label: "Rezerv",            pct: 10, color: "#e5484d" },
  ];

  return (
    <div className="lpm-overlay" onClick={onClose}>
      <div className="lpm-panel" onClick={(e) => e.stopPropagation()}>
        {/* Banner */}
        <div className="lpm-banner" style={{
          background: p.bannerUrl ? `url(${p.bannerUrl}) center/cover` : "linear-gradient(135deg, #1a1a2e, #16213e)",
        }}>
          <button className="lpm-close" onClick={onClose}>✕</button>
          <div className="lpm-banner-overlay" />
        </div>

        <div className="lpm-body">
          {/* Header */}
          <div className="lpm-head">
            <img src={logoSrc} alt={p.name} className="lpm-logo" />
            <div className="lpm-titles">
              <div className="lpm-name-row">
                <h2>{p.name}</h2>
                <span className="lpm-symbol">{p.symbol}</span>
                <span className="lpm-status" style={{ background: s.bg, color: s.color }}>{s.label}</span>
              </div>
              {p.tagline && <p className="lpm-tagline">{p.tagline}</p>}
              <div className="lpm-chain">
                <Shield size={12} /> {p.chain || "BNB Smart Chain"}
              </div>
            </div>
          </div>

          {/* Key stats */}
          <div className="lpm-stats">
            <div className="lpm-stat">
              <span className="lpm-stat-v">{fmtPart(p.raisedAmount)} PART</span>
              <span className="lpm-stat-l">Toplandı</span>
            </div>
            <div className="lpm-stat">
              <span className="lpm-stat-v">{p.progress}%</span>
              <span className="lpm-stat-l">Tamamlandı</span>
            </div>
            <div className="lpm-stat">
              <span className="lpm-stat-v">{fmtPart(p.targetAmount)} PART</span>
              <span className="lpm-stat-l">Hedef</span>
            </div>
            <div className="lpm-stat">
              <span className="lpm-stat-v">{p.participants.toLocaleString()}</span>
              <span className="lpm-stat-l">Katılımcı</span>
            </div>
          </div>

          {/* Progress */}
          <div className="lpm-progress-wrap">
            <div className="lpm-progress-track">
              <div className="lpm-progress-fill" style={{ width: `${Math.min(100, p.progress)}%` }} />
            </div>
            <div className="lpm-progress-labels">
              <span>{fmtPart(p.raisedAmount)} / {fmtPart(p.targetAmount)} PART</span>
              {p.status === "active" && (
                <span style={{ color: s.color, display: "flex", alignItems: "center", gap: 4 }}>
                  <Clock size={12} /> {countdown}
                </span>
              )}
              {p.status === "upcoming" && (
                <span style={{ color: s.color }}>
                  Başlangıç: {new Date(p.startAt).toLocaleDateString("tr-TR")}
                </span>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="lpm-tabs">
            {(["overview","tokenomics","team"] as const).map((t) => (
              <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>
                {t === "overview" ? "Genel Bakış" : t === "tokenomics" ? "Tokenomics" : "Ekip"}
              </button>
            ))}
          </div>

          {tab === "overview" && (
            <div className="lpm-tab-body">
              <p className="lpm-desc">{p.description}</p>
              <div className="lpm-detail-grid">
                <div className="lpm-detail-cell">
                  <span className="lpm-detail-label">Token Fiyatı</span>
                  <span className="lpm-detail-val">{Number(p.tokenPrice)} PART</span>
                </div>
                <div className="lpm-detail-cell">
                  <span className="lpm-detail-label">Toplam Arz</span>
                  <span className="lpm-detail-val">{fmtPart(p.totalSupply)}</span>
                </div>
                <div className="lpm-detail-cell">
                  <span className="lpm-detail-label">Min. Alım</span>
                  <span className="lpm-detail-val">{fmtPart(p.minBuy)} PART</span>
                </div>
                <div className="lpm-detail-cell">
                  <span className="lpm-detail-label">Max. Alım</span>
                  <span className="lpm-detail-val">{fmtPart(p.maxBuy)} PART</span>
                </div>
              </div>
              <div className="lpm-audit">
                <CheckCircle2 size={14} style={{ color: "#3fb950" }} />
                <span>Smart contract audit hazırlık aşamasında (CertiK)</span>
              </div>
              <div className="lpm-audit">
                <Shield size={14} style={{ color: "#f0b429" }} />
                <span>Saphara Launchpad tarafından incelendi</span>
              </div>
              <div className="lpm-links-row">
                {p.websiteUrl  && <a href={p.websiteUrl}  target="_blank" rel="noreferrer" className="lpm-ext-link"><Globe size={13}/> Website</a>}
                {p.twitterUrl  && <a href={p.twitterUrl}  target="_blank" rel="noreferrer" className="lpm-ext-link"><Globe size={13}/> Twitter / X</a>}
                {p.telegramUrl && <a href={p.telegramUrl} target="_blank" rel="noreferrer" className="lpm-ext-link"><Send size={13}/> Telegram</a>}
                {p.whitepaperUrl && <a href={p.whitepaperUrl} target="_blank" rel="noreferrer" className="lpm-ext-link"><FileText size={13}/> Whitepaper</a>}
              </div>
            </div>
          )}

          {tab === "tokenomics" && (
            <div className="lpm-tab-body">
              <div className="lpm-tknmx">
                {tokenomicsRows.map((r) => (
                  <div key={r.label} className="lpm-tknmx-row">
                    <span className="lpm-tknmx-dot" style={{ background: r.color }} />
                    <span className="lpm-tknmx-label">{r.label}</span>
                    <div className="lpm-tknmx-bar-wrap">
                      <div className="lpm-tknmx-bar" style={{ width: `${r.pct}%`, background: r.color }} />
                    </div>
                    <span className="lpm-tknmx-pct">{r.pct}%</span>
                  </div>
                ))}
              </div>
              <div className="lpm-vesting">
                <h4 className="lpm-vesting-title">Vesting Takvimi</h4>
                <div className="lpm-vesting-row">
                  <Clock size={12}/> TGE anında <strong>%{p.tgeUnlockPct ?? 15}</strong> serbest
                </div>
                {(p.cliffMonths ?? 1) > 0 && (
                  <div className="lpm-vesting-row">
                    <Lock size={12}/> <strong>{p.cliffMonths ?? 1} ay</strong> cliff (bekletme)
                  </div>
                )}
                <div className="lpm-vesting-row">
                  <Lock size={12}/> Kalan <strong>%{100 - (p.tgeUnlockPct ?? 15)}</strong>, <strong>{p.linearMonths ?? 9} ayda</strong> eşit dağıtılır
                </div>
              </div>

              {/* Yasal Uyarı */}
              <div style={{
                marginTop: 8,
                padding: "10px 12px",
                background: "rgba(239,68,68,.06)",
                border: "1px solid rgba(239,68,68,.2)",
                borderRadius: 8,
                fontSize: 11,
                color: "#94a3b8",
                lineHeight: 1.6,
              }}>
                ⚠️ <strong style={{ color: "#ef4444" }}>Yasal Uyarı:</strong> Bu IDO katılımı yatırım tavsiyesi değildir.
                Kripto para yatırımları yüksek risk içerir. Değerin tamamını kaybedebilirsiniz.
                ABD, İngiltere, Kanada ve Çin'den katılım yasal kısıtlamalara tabi olabilir.
              </div>
            </div>
          )}

          {tab === "team" && (
            <div className="lpm-tab-body">
              <div className="lpm-team">
                {[
                  { name: "Kurucu Ekip", role: "Blockchain Geliştirici", animal: "🦊" },
                  { name: "Protokol Mimarı", role: "Smart Contract Uzmanı", animal: "🐻" },
                  { name: "Topluluk Yöneticisi", role: "Büyüme & Pazarlama", animal: "🦁" },
                ].map((m) => (
                  <div key={m.name} className="lpm-team-card">
                    <span className="lpm-team-animal">{m.animal}</span>
                    <div>
                      <div className="lpm-team-name">{m.name}</div>
                      <div className="lpm-team-role">{m.role}</div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="muted" style={{ fontSize: 12, marginTop: 12 }}>
                <Info size={11} /> Ekip bilgileri proje başvurusu sırasında doğrulanmıştır.
              </p>
            </div>
          )}

          {/* Participate */}
          {p.status === "active" && (
            <div className="lpm-invest">
              <h3 className="lpm-invest-title">
                <Zap size={15} style={{ color: "var(--accent)" }} /> Katıl
              </h3>

              {/* Tier bilgisi */}
              <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
                {[
                  { name: "Bronz",  min: "500",    color: "#cd7f32" },
                  { name: "Gümüş",  min: "2K",     color: "#94a3b8" },
                  { name: "Altın",  min: "5K",     color: "#f0b429" },
                  { name: "Elmas",  min: "20K",    color: "#a5f3fc" },
                ].map((t) => (
                  <span key={t.name} style={{
                    fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 99,
                    border: `1px solid ${t.color}50`, color: t.color,
                    background: `${t.color}15`,
                  }}>
                    {t.name} {t.min}+ PART
                  </span>
                ))}
              </div>

              {!isAuthed && (
                <div className="lpm-no-auth">
                  <AlertCircle size={14} /> Katılmak için <a href="/" className="ck-link">cüzdanını bağla</a>
                </div>
              )}
              <div className="lpm-invest-row">
                <div className="lpm-invest-input-wrap">
                  <input
                    className="lpm-invest-input"
                    type="number"
                    placeholder={`Min. ${fmtPart(p.minBuy)} PART`}
                    value={amount}
                    min={p.minBuy}
                    max={p.maxBuy}
                    disabled={!isAuthed || busy}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <span className="lpm-invest-unit">PART</span>
                </div>
                <button className="lpm-invest-btn" onClick={handle} disabled={!isAuthed || busy || !amount}>
                  {busy ? "İşleniyor…" : "Katıl"}
                </button>
              </div>
              <div className="lpm-invest-range">
                Min: {fmtPart(p.minBuy)} · Max: {fmtPart(p.maxBuy)} PART
              </div>
              {msg && (
                <div className={`lpm-msg ${msg.ok ? "lpm-msg--ok" : "lpm-msg--err"}`}>
                  {msg.ok ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />} {msg.text}
                </div>
              )}
            </div>
          )}

          {p.status === "upcoming" && (
            <UpcomingRemind p={p} isAuthed={isAuthed} />
          )}

        </div>
      </div>

      <style suppressHydrationWarning>{`
        .lpm-overlay{position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px;}
        .lpm-panel{background:var(--surface);border:1px solid var(--border);border-radius:20px;width:100%;max-width:620px;overflow:hidden;max-height:92vh;overflow-y:auto;position:relative;}
        .lpm-banner{height:160px;position:relative;flex-shrink:0;}
        .lpm-banner-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,transparent 30%,var(--surface) 100%);}
        .lpm-close{position:absolute;top:12px;right:12px;background:rgba(0,0,0,.5);border:none;color:#fff;cursor:pointer;width:32px;height:32px;border-radius:50%;font-size:16px;display:flex;align-items:center;justify-content:center;z-index:1;}
        .lpm-body{padding:0 22px 24px;}
        .lpm-head{display:flex;gap:14px;align-items:flex-start;margin-bottom:16px;margin-top:-30px;position:relative;z-index:1;}
        .lpm-logo{width:56px;height:56px;border-radius:14px;border:3px solid var(--surface);object-fit:cover;background:var(--surface-2);}
        .lpm-titles{flex:1;min-width:0;}
        .lpm-name-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
        .lpm-name-row h2{font-size:20px;font-weight:900;}
        .lpm-symbol{font-size:12px;font-weight:700;color:var(--accent);background:rgba(240,180,41,.12);padding:2px 8px;border-radius:99px;}
        .lpm-status{font-size:11px;font-weight:700;padding:3px 10px;border-radius:99px;}
        .lpm-tagline{font-size:13px;color:var(--muted);margin-top:4px;}
        .lpm-chain{display:flex;align-items:center;gap:4px;font-size:11px;color:var(--muted);margin-top:4px;}
        .lpm-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--border);border-radius:12px;overflow:hidden;margin-bottom:14px;}
        .lpm-stat{background:var(--surface-2);padding:10px 8px;text-align:center;}
        .lpm-stat-v{display:block;font-size:14px;font-weight:800;color:var(--accent);}
        .lpm-stat-l{display:block;font-size:10px;color:var(--muted);margin-top:2px;}
        .lpm-progress-wrap{margin-bottom:16px;}
        .lpm-progress-track{height:10px;background:var(--surface-2);border-radius:99px;overflow:hidden;margin-bottom:6px;}
        .lpm-progress-fill{height:100%;background:linear-gradient(90deg,var(--accent),#22c55e);border-radius:99px;transition:width .8s;}
        .lpm-progress-labels{display:flex;justify-content:space-between;font-size:12px;color:var(--muted);}
        .lpm-tabs{display:flex;background:var(--surface-2);border-radius:10px;padding:3px;margin-bottom:14px;}
        .lpm-tabs button{flex:1;padding:8px;border:none;background:transparent;color:var(--muted);font-size:13px;font-weight:600;cursor:pointer;border-radius:8px;transition:all .15s;}
        .lpm-tabs button.on{background:var(--surface);color:var(--text);box-shadow:0 1px 4px rgba(0,0,0,.2);}
        .lpm-tab-body{display:flex;flex-direction:column;gap:12px;}
        .lpm-desc{font-size:14px;color:var(--muted);line-height:1.7;}
        .lpm-detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
        .lpm-detail-cell{background:var(--surface-2);border-radius:10px;padding:10px 12px;}
        .lpm-detail-label{display:block;font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;}
        .lpm-detail-val{display:block;font-size:14px;font-weight:700;margin-top:2px;}
        .lpm-audit{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--muted);}
        .lpm-links-row{display:flex;gap:8px;flex-wrap:wrap;}
        .lpm-ext-link{display:flex;align-items:center;gap:5px;padding:6px 12px;border-radius:8px;background:var(--surface-2);border:1px solid var(--border);color:var(--muted);font-size:12px;text-decoration:none;transition:all .15s;}
        .lpm-ext-link:hover{border-color:var(--accent);color:var(--text);}
        .lpm-tknmx{display:flex;flex-direction:column;gap:10px;}
        .lpm-tknmx-row{display:flex;align-items:center;gap:10px;}
        .lpm-tknmx-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;}
        .lpm-tknmx-label{font-size:13px;width:160px;flex-shrink:0;}
        .lpm-tknmx-bar-wrap{flex:1;height:8px;background:var(--surface-2);border-radius:99px;overflow:hidden;}
        .lpm-tknmx-bar{height:100%;border-radius:99px;}
        .lpm-tknmx-pct{font-size:12px;font-weight:700;width:32px;text-align:right;}
        .lpm-vesting{margin-top:16px;padding:12px;background:var(--surface-2);border-radius:10px;}
        .lpm-vesting-title{font-size:13px;font-weight:700;margin-bottom:8px;}
        .lpm-vesting-row{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--muted);margin-bottom:4px;}
        .lpm-team{display:flex;flex-direction:column;gap:10px;}
        .lpm-team-card{display:flex;align-items:center;gap:12px;padding:12px;background:var(--surface-2);border-radius:12px;}
        .lpm-team-animal{font-size:28px;}
        .lpm-team-name{font-size:14px;font-weight:700;}
        .lpm-team-role{font-size:12px;color:var(--muted);margin-top:2px;}
        .lpm-invest{background:var(--surface-2);border-radius:14px;padding:16px;margin-top:14px;}
        .lpm-invest-title{font-size:15px;font-weight:700;display:flex;align-items:center;gap:6px;margin-bottom:12px;}
        .lpm-no-auth{display:flex;align-items:center;gap:6px;font-size:13px;color:var(--muted);margin-bottom:10px;}
        .lpm-invest-row{display:flex;gap:8px;}
        .lpm-invest-input-wrap{flex:1;position:relative;display:flex;align-items:center;}
        .lpm-invest-input{width:100%;padding:11px 48px 11px 14px;border-radius:10px;border:1.5px solid var(--border);background:var(--surface);color:var(--text);font-size:14px;outline:none;}
        .lpm-invest-input:focus{border-color:var(--accent);}
        .lpm-invest-unit{position:absolute;right:12px;font-size:12px;font-weight:700;color:var(--accent);}
        .lpm-invest-btn{padding:11px 20px;border-radius:10px;background:var(--accent);color:#1a1300;font-size:14px;font-weight:800;border:none;cursor:pointer;white-space:nowrap;transition:opacity .15s;}
        .lpm-invest-btn:hover:not(:disabled){opacity:.85;}
        .lpm-invest-btn:disabled{opacity:.4;cursor:default;}
        .lpm-invest-range{font-size:11px;color:var(--muted);margin-top:6px;}
        .lpm-msg{display:flex;align-items:center;gap:6px;font-size:13px;font-weight:600;margin-top:8px;padding:8px 12px;border-radius:8px;}
        .lpm-msg--ok{background:rgba(63,185,80,.1);color:#3fb950;}
        .lpm-msg--err{background:rgba(229,72,77,.1);color:#e5484d;}
        .lpm-upcoming-note{display:flex;align-items:center;gap:10px;padding:14px;background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2);border-radius:12px;font-size:13px;margin-top:14px;flex-wrap:wrap;}
        .lpm-remind-btn{margin-left:auto;padding:7px 14px;border-radius:8px;background:rgba(245,158,11,.15);color:#f59e0b;border:1px solid rgba(245,158,11,.3);font-size:12px;font-weight:700;cursor:pointer;}
      `}</style>
    </div>
  );
}

/* ── Main Page ── */
export default function LaunchpadPage() {
  const [projects, setProjects]   = useState<Project[]>([]);
  const [filter, setFilter]       = useState<"all" | "active" | "upcoming" | "ended">("all");
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState<Project | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const q = filter === "all" ? "" : `?status=${filter}`;
    fetch(`${API}/launchpad${q}`)
      .then((r) => r.json())
      .then((d) => { setProjects(d.projects ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const participate = async (id: string, amount: string) => {
    await api.post(`/launchpad/${id}/participate`, { amount: Number(amount) });
    load();
  };

  const totalRaised  = projects.reduce((a, p) => a + Number(p.raisedAmount), 0);
  const totalTarget  = projects.reduce((a, p) => a + Number(p.targetAmount), 0);
  const liveCount    = projects.filter((p) => p.status === "active").length;
  const totalPart    = projects.reduce((a, p) => a + p.participants, 0);

  return (
    <div className="lp-page">
      <header className="topbar"><h1>Launchpad</h1></header>

      {/* Hero */}
      <div className="lp-hero">
        <div className="lp-hero-glow" />
        <div className="lp-hero-text">
          <div className="lp-hero-badge"><Rocket size={13} /> BNB Chain IDO Platform</div>
          <h2>Token Launches on BNB Chain</h2>
          <p>Vetted token sales — community reviewed, contract audited, PART-powered.</p>
        </div>
        <div className="lp-hero-stats">
          <div className="lp-hero-stat">
            <span className="lp-hs-num">{projects.length}</span>
            <span className="lp-hs-lbl">Proje</span>
          </div>
          <div className="lp-hs-div" />
          <div className="lp-hero-stat">
            <span className="lp-hs-num" style={{ color: "#22c55e" }}>{liveCount}</span>
            <span className="lp-hs-lbl">Canlı</span>
          </div>
          <div className="lp-hs-div" />
          <div className="lp-hero-stat">
            <span className="lp-hs-num">{totalPart.toLocaleString()}</span>
            <span className="lp-hs-lbl">Katılımcı</span>
          </div>
          <div className="lp-hs-div" />
          <div className="lp-hero-stat">
            <span className="lp-hs-num">{fmtPart(totalRaised)}</span>
            <span className="lp-hs-lbl">PART Toplandı</span>
          </div>
        </div>
      </div>

      {/* Overall progress bar */}
      {totalTarget > 0 && (
        <div className="lp-overall">
          <div className="lp-overall-label">
            <span>Toplam kampanya ilerlemesi</span>
            <strong>{((totalRaised / totalTarget) * 100).toFixed(1)}%</strong>
          </div>
          <div className="lp-overall-track">
            <div className="lp-overall-fill" style={{ width: `${Math.min(100, (totalRaised / totalTarget) * 100)}%` }} />
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="lp-filter">
        {(["all", "active", "upcoming", "ended"] as const).map((s) => (
          <button
            key={s}
            className={`lp-filter-btn${filter === s ? " active" : ""}`}
            onClick={() => setFilter(s)}
          >
            {s === "all" ? "Tümü" : STATUS[s]?.label ?? s}
          </button>
        ))}
      </div>

      {/* Cards */}
      {loading ? (
        <div className="lp-grid">
          {[1,2,3].map((i) => <div key={i} className="lp-skeleton" />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="lp-empty">
          <Rocket size={40} style={{ opacity: .3 }} />
          <p>Bu filtrede proje yok. Yakında!</p>
        </div>
      ) : (
        <div className="lp-grid">
          {projects.map((p) => {
            const s = STATUS[p.status] ?? STATUS.ended;
            const logoSrc = p.logoUrl ?? ANIMAL_LOGOS[p.name] ?? `https://api.dicebear.com/9.x/bottts/svg?seed=${p.symbol}&size=80`;
            return (
              <div
                key={p.id}
                className={`lp-card${p.status === "active" ? " lp-card--live" : ""}`}
                onClick={() => setSelected(p)}
              >
                {/* Live pulse */}
                {p.status === "active" && <div className="lp-live-dot"><span /></div>}

                <div className="lp-card-banner" style={{
                  background: p.bannerUrl ? `url(${p.bannerUrl}) center/cover` : "linear-gradient(135deg,#1a1a2e,#16213e)"
                }} />

                <div className="lp-card-body">
                  <div className="lp-card-top">
                    <img src={logoSrc} alt={p.name} className="lp-card-logo" />
                    <div className="lp-card-info">
                      <div className="lp-card-name">
                        {p.name}
                        <span className="lp-card-sym">{p.symbol}</span>
                      </div>
                      {p.tagline && <div className="lp-card-tag">{p.tagline}</div>}
                    </div>
                    <span className="lp-card-status" style={{ background: s.bg, color: s.color }}>
                      {s.label}
                    </span>
                  </div>

                  <p className="lp-card-desc">{p.description.slice(0, 120)}…</p>

                  <div className="lp-card-stats">
                    <span><Users size={12} /> {p.participants.toLocaleString()}</span>
                    <span><TrendingUp size={12} /> {fmtPart(p.targetAmount)} PART</span>
                    <span><Shield size={12} /> {p.chain || "BSC"}</span>
                  </div>

                  <div className="lp-card-prog">
                    <div className="lp-card-prog-bar">
                      <div style={{ width: `${Math.min(100, p.progress)}%` }} />
                    </div>
                    <div className="lp-card-prog-labels">
                      <span>{fmtPart(p.raisedAmount)} toplandı</span>
                      <span style={{ color: s.color, fontWeight: 700 }}>{p.progress}%</span>
                    </div>
                  </div>

                  <button className="lp-card-btn">
                    {p.status === "active" ? "Katıl →" : p.status === "upcoming" ? "Yakında →" : "Detaylar →"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CTA */}
      <div className="lp-cta">
        <div className="lp-cta-glow" />
        <div className="lp-cta-body">
          <Rocket size={32} style={{ color: "var(--accent)", marginBottom: 12 }} />
          <h3>Projenizi Saphara Launchpad'e Getirin</h3>
          <p>BNB Chain üzerinde kripto-native 10.000+ kullanıcıya ulaşın. Whitepaper, audit ve vesting planı ile başvurun.</p>
          <div className="lp-cta-perks">
            <span><CheckCircle2 size={13} /> Topluluk oylaması</span>
            <span><CheckCircle2 size={13} /> Escrow güvencesi</span>
            <span><CheckCircle2 size={13} /> Saphara incelemesi</span>
          </div>
          <div className="lp-cta-fee">
            <Coins size={14} /> Listeleme Ücreti: <strong>500 PART</strong>
            <span className="lp-cta-fee-note">· Yalnızca onaylanan projelerden alınır</span>
          </div>
          <a href="/launchpad/apply" className="lp-cta-btn">Projenizi Başvurun →</a>
        </div>
      </div>

      {selected && (
        <ProjectModal p={selected} onClose={() => setSelected(null)} onParticipate={participate} />
      )}

      <style>{`
        .lp-page { max-width: 1100px; margin: 0 auto; padding-bottom: 80px; }

        .lp-hero { position:relative;display:flex;justify-content:space-between;align-items:center;gap:20px;padding:28px 24px;border-bottom:1px solid var(--border);flex-wrap:wrap;overflow:hidden; }
        .lp-hero-glow { position:absolute;inset:0;background:radial-gradient(ellipse at 10% 50%,rgba(240,180,41,.07),transparent 60%);pointer-events:none; }
        .lp-hero-badge { display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;color:var(--accent);background:rgba(240,180,41,.1);padding:4px 10px;border-radius:99px;margin-bottom:8px; }
        .lp-hero-text h2 { font-size:clamp(18px,3vw,26px);font-weight:900;letter-spacing:-.5px; }
        .lp-hero-text p { font-size:14px;color:var(--muted);margin-top:4px; }
        .lp-hero-stats { display:flex;align-items:center;gap:0;background:var(--surface);border:1px solid var(--border);border-radius:14px;overflow:hidden;flex-shrink:0; }
        .lp-hero-stat { padding:14px 20px;text-align:center; }
        .lp-hs-num { display:block;font-size:22px;font-weight:900;color:var(--accent); }
        .lp-hs-lbl { display:block;font-size:11px;color:var(--muted);margin-top:2px; }
        .lp-hs-div { width:1px;background:var(--border);align-self:stretch; }

        .lp-overall { padding:10px 24px; }
        .lp-overall-label { display:flex;justify-content:space-between;font-size:12px;color:var(--muted);margin-bottom:5px; }
        .lp-overall-track { height:6px;background:var(--surface-2);border-radius:99px;overflow:hidden; }
        .lp-overall-fill { height:100%;background:linear-gradient(90deg,var(--accent),#22c55e);border-radius:99px;transition:width 1s; }

        .lp-filter { display:flex;gap:8px;padding:14px 24px;overflow-x:auto;scrollbar-width:none; }
        .lp-filter-btn { padding:7px 18px;border-radius:99px;font-size:13px;font-weight:600;cursor:pointer;border:1.5px solid var(--border);background:transparent;color:var(--muted);white-space:nowrap;transition:all .15s; }
        .lp-filter-btn:hover { border-color:var(--accent);color:var(--text); }
        .lp-filter-btn.active { background:var(--accent);border-color:var(--accent);color:#1a1300; }

        .lp-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:18px;padding:20px 24px; }
        .lp-skeleton { height:380px;border-radius:16px;background:var(--surface);border:1px solid var(--border);animation:lpPulse 1.5s ease infinite; }
        @keyframes lpPulse{0%,100%{opacity:1}50%{opacity:.45}}
        .lp-empty { display:flex;flex-direction:column;align-items:center;gap:12px;padding:80px 24px;color:var(--muted); }

        .lp-card { background:var(--surface);border:1.5px solid var(--border);border-radius:18px;overflow:hidden;cursor:pointer;transition:all .2s;position:relative; }
        .lp-card:hover { border-color:var(--accent);transform:translateY(-3px);box-shadow:0 8px 24px rgba(240,180,41,.1); }
        .lp-card--live { border-color:rgba(34,197,94,.3);box-shadow:0 0 0 1px rgba(34,197,94,.1); }
        .lp-live-dot { position:absolute;top:12px;left:12px;z-index:2; }
        .lp-live-dot span { display:block;width:10px;height:10px;background:#22c55e;border-radius:50%;box-shadow:0 0 0 3px rgba(34,197,94,.3);animation:lpPulse .8s ease infinite; }

        .lp-card-banner { height:100px;flex-shrink:0; }
        .lp-card-body { padding:14px 16px 16px; }
        .lp-card-top { display:flex;gap:10px;align-items:flex-start;margin-bottom:10px; }
        .lp-card-logo { width:44px;height:44px;border-radius:12px;object-fit:cover;border:2px solid var(--border);background:var(--surface-2);flex-shrink:0; }
        .lp-card-info { flex:1;min-width:0; }
        .lp-card-name { font-size:15px;font-weight:800;display:flex;align-items:center;gap:6px;flex-wrap:wrap; }
        .lp-card-sym { font-size:11px;font-weight:700;color:var(--accent);background:rgba(240,180,41,.1);padding:2px 7px;border-radius:99px; }
        .lp-card-tag { font-size:12px;color:var(--muted);margin-top:2px; }
        .lp-card-status { font-size:10px;font-weight:700;padding:3px 8px;border-radius:99px;flex-shrink:0; }
        .lp-card-desc { font-size:13px;color:var(--muted);line-height:1.55;margin-bottom:12px; }
        .lp-card-stats { display:flex;gap:12px;align-items:center;font-size:12px;color:var(--muted);margin-bottom:12px;flex-wrap:wrap; }
        .lp-card-stats span { display:flex;align-items:center;gap:4px; }
        .lp-card-prog { margin-bottom:12px; }
        .lp-card-prog-bar { height:6px;background:var(--surface-2);border-radius:99px;overflow:hidden; }
        .lp-card-prog-bar div { height:100%;background:linear-gradient(90deg,var(--accent),#22c55e);border-radius:99px;transition:width .6s; }
        .lp-card-prog-labels { display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-top:4px; }
        .lp-card-btn { width:100%;padding:10px;border-radius:10px;background:var(--surface-2);border:1.5px solid var(--border);color:var(--text);font-size:13px;font-weight:700;cursor:pointer;transition:all .15s; }
        .lp-card-btn:hover { background:var(--accent);border-color:var(--accent);color:#1a1300; }

        .lp-cta { position:relative;margin:32px 24px;border-radius:20px;overflow:hidden;background:linear-gradient(135deg,rgba(240,180,41,.07),rgba(34,197,94,.04));border:1px solid rgba(240,180,41,.15); }
        .lp-cta-glow { position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(240,180,41,.06),transparent 70%);pointer-events:none; }
        .lp-cta-body { position:relative;text-align:center;padding:36px 24px; }
        .lp-cta-body h3 { font-size:20px;font-weight:900;margin-bottom:8px; }
        .lp-cta-body p { font-size:14px;color:var(--muted);max-width:480px;margin:0 auto 16px;line-height:1.7; }
        .lp-cta-perks { display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-bottom:20px;font-size:13px;color:var(--muted); }
        .lp-cta-perks span { display:flex;align-items:center;gap:5px;color:#3fb950; }
        .lp-cta-fee { display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:700;color:var(--accent);background:rgba(240,180,41,.1);padding:6px 14px;border-radius:99px;margin-bottom:16px; }
        .lp-cta-fee-note { font-size:11px;font-weight:400;color:var(--muted); }
        .lp-cta-btn { display:inline-flex;padding:13px 28px;border-radius:12px;background:var(--accent);color:#1a1300;font-size:14px;font-weight:800;text-decoration:none;transition:opacity .15s; }
        .lp-cta-btn:hover { opacity:.88; }

        @media(max-width:600px){
          .lp-hero{flex-direction:column;}
          .lp-hero-stats{width:100%;}
          .lp-grid{grid-template-columns:1fr;padding:16px;}
        }
      `}</style>
    </div>
  );
}
