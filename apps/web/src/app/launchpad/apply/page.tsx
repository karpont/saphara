"use client";

import { useState } from "react";
import { Rocket, Shield, CheckCircle2, AlertCircle, Coins, Clock, Users, Info } from "lucide-react";
import { useAuth } from "../../../features/auth/AuthContext";
import { api } from "../../../lib/api";

const CHAIN_OPTIONS = ["BNB Smart Chain (BSC)", "Ethereum", "Polygon", "Arbitrum", "Other"];

const PERKS = [
  { icon: "🚀", title: "10K+ Kripto Kullanıcısı", desc: "Aktif Web3 topluluğuna doğrudan erişim" },
  { icon: "🔍", title: "Teknik İnceleme", desc: "Akıllı sözleşme ve ekip güvenilirlik doğrulaması" },
  { icon: "📣", title: "Platform Tanıtımı", desc: "Feed, push bildirimi ve sosyal paylaşım desteği" },
  { icon: "🤝", title: "PART Entegrasyonu", desc: "IDO ödemeleri PART token ile gerçekleşir" },
  { icon: "📊", title: "Gerçek Zamanlı Analitik", desc: "Katılımcı sayısı ve fon takibi canlı" },
  { icon: "⚖️", title: "DAO Oylaması", desc: "Topluluk, kabul edilen projeleri onaylar" },
];

const STEPS = [
  { n: "01", title: "Başvuru Formu", desc: "Proje bilgilerini ve belgelerini doldurun" },
  { n: "02", title: "Ön İnceleme", desc: "Ekibimiz 3-5 iş günü içinde değerlendirir" },
  { n: "03", title: "Listeleme Ücreti", desc: "500 PART listeleme bedeli ödenir" },
  { n: "04", title: "DAO Onayı", desc: "Topluluk oylamasıyla son onay" },
  { n: "05", title: "IDO Lansmanı", desc: "Launchpad'de yayına girersiniz" },
];

export default function LaunchpadApplyPage() {
  const { isAuthed } = useAuth();
  const [step, setStep] = useState(1);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    name: "", symbol: "", tagline: "", description: "",
    websiteUrl: "", twitterUrl: "", telegramUrl: "", whitepaperUrl: "",
    targetAmount: "", tokenPrice: "", totalSupply: "",
    minBuy: "100", maxBuy: "10000",
    startAt: "", endAt: "",
    chain: "BNB Smart Chain (BSC)",
    contactEmail: "",
  });

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!isAuthed) { setErr("Önce cüzdanınızı bağlayın."); return; }
    setBusy(true); setErr("");
    try {
      await api.post("/launchpad", {
        ...form,
        targetAmount: Number(form.targetAmount),
        tokenPrice:   Number(form.tokenPrice),
        totalSupply:  Number(form.totalSupply),
        minBuy:       Number(form.minBuy),
        maxBuy:       Number(form.maxBuy),
        chain: "BSC",
        startAt: new Date(form.startAt).toISOString(),
        endAt:   new Date(form.endAt).toISOString(),
      });
      setSent(true);
    } catch (e: any) {
      setErr(e?.message ?? "Gönderim başarısız oldu.");
    } finally { setBusy(false); }
  };

  if (sent) {
    return (
      <div className="apply-page">
        <header className="topbar"><h1>Launchpad Başvurusu</h1></header>
        <div className="apply-success">
          <CheckCircle2 size={56} style={{ color: "#3fb950" }} />
          <h2>Başvurunuz Alındı!</h2>
          <p>Ekibimiz 3-5 iş günü içinde <strong>{form.contactEmail || "kaydedilen e-postanıza"}</strong> geri dönecek.</p>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 8 }}>
            Onaylandıktan sonra 500 PART listeleme ücreti talep edilecektir.
          </p>
          <a href="/launchpad" className="apply-back-btn">Launchpad'e Dön</a>
        </div>
        <style>{`.apply-success{display:flex;flex-direction:column;align-items:center;text-align:center;gap:12px;padding:80px 24px;}.apply-success h2{font-size:24px;font-weight:900;}.apply-success p{font-size:14px;color:var(--muted);}.apply-back-btn{margin-top:16px;padding:12px 28px;border-radius:12px;background:var(--accent);color:#1a1300;font-size:14px;font-weight:800;text-decoration:none;}`}</style>
      </div>
    );
  }

  return (
    <div className="apply-page">
      <header className="topbar"><h1>Launchpad Başvurusu</h1></header>

      {/* Listing Fee Banner */}
      <div className="apply-fee-banner">
        <Coins size={20} style={{ color: "var(--accent)", flexShrink: 0 }} />
        <div>
          <strong>Listeleme Ücreti: 500 PART</strong>
          <p>Ücret yalnızca başvurunuz onaylandıktan sonra alınır. Reddedilen başvurulardan ücret alınmaz.</p>
        </div>
      </div>

      {/* Perks */}
      <div className="apply-perks">
        {PERKS.map((p) => (
          <div key={p.title} className="apply-perk">
            <span className="apply-perk-icon">{p.icon}</span>
            <div>
              <div className="apply-perk-title">{p.title}</div>
              <div className="apply-perk-desc">{p.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Process steps */}
      <div className="apply-process">
        <h3 className="apply-process-title">Başvuru Süreci</h3>
        <div className="apply-steps-row">
          {STEPS.map((s, i) => (
            <div key={s.n} className="apply-step">
              <div className={`apply-step-n${step > i + 1 ? " done" : step === i + 1 ? " active" : ""}`}>{step > i + 1 ? "✓" : s.n}</div>
              <div className="apply-step-info">
                <div className="apply-step-title">{s.title}</div>
                <div className="apply-step-desc">{s.desc}</div>
              </div>
              {i < STEPS.length - 1 && <div className="apply-step-line" />}
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="apply-form-wrap">
        <div className="apply-form-header">
          <Rocket size={20} style={{ color: "var(--accent)" }} />
          <h3>Proje Başvuru Formu</h3>
        </div>

        {!isAuthed && (
          <div className="apply-auth-warn">
            <AlertCircle size={14} />
            Başvuru göndermek için önce cüzdanınızı bağlamalısınız.
          </div>
        )}

        {/* Step 1: Basic Info */}
        <div className="apply-field-group">
          <div className="apply-field-group-title">Proje Bilgileri</div>
          <div className="apply-row-2">
            <div className="apply-field">
              <label>Proje Adı *</label>
              <input placeholder="örn: SapharaDAO" value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div className="apply-field">
              <label>Token Sembolü *</label>
              <input placeholder="örn: SDAO" maxLength={10} value={form.symbol} onChange={(e) => set("symbol", e.target.value.toUpperCase())} />
            </div>
          </div>
          <div className="apply-field">
            <label>Kısa Slogan</label>
            <input placeholder="Tek cümlelik proje açıklaması" value={form.tagline} onChange={(e) => set("tagline", e.target.value)} />
          </div>
          <div className="apply-field">
            <label>Proje Açıklaması *</label>
            <textarea
              placeholder="Projenizi, hedeflerinizi ve ekibinizi detaylı açıklayın…"
              rows={5}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
        </div>

        {/* Token Economics */}
        <div className="apply-field-group">
          <div className="apply-field-group-title">Token Ekonomisi</div>
          <div className="apply-row-3">
            <div className="apply-field">
              <label>Hedef Toplam (PART) *</label>
              <input type="number" placeholder="100000" value={form.targetAmount} onChange={(e) => set("targetAmount", e.target.value)} />
            </div>
            <div className="apply-field">
              <label>Token Fiyatı (PART)</label>
              <input type="number" placeholder="0.5" step="0.01" value={form.tokenPrice} onChange={(e) => set("tokenPrice", e.target.value)} />
            </div>
            <div className="apply-field">
              <label>Toplam Arz</label>
              <input type="number" placeholder="10000000" value={form.totalSupply} onChange={(e) => set("totalSupply", e.target.value)} />
            </div>
          </div>
          <div className="apply-row-2">
            <div className="apply-field">
              <label>Min. Alım (PART)</label>
              <input type="number" placeholder="100" value={form.minBuy} onChange={(e) => set("minBuy", e.target.value)} />
            </div>
            <div className="apply-field">
              <label>Max. Alım (PART)</label>
              <input type="number" placeholder="10000" value={form.maxBuy} onChange={(e) => set("maxBuy", e.target.value)} />
            </div>
          </div>
          <div className="apply-row-2">
            <div className="apply-field">
              <label>Başlangıç Tarihi *</label>
              <input type="datetime-local" value={form.startAt} onChange={(e) => set("startAt", e.target.value)} />
            </div>
            <div className="apply-field">
              <label>Bitiş Tarihi *</label>
              <input type="datetime-local" value={form.endAt} onChange={(e) => set("endAt", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="apply-field-group">
          <div className="apply-field-group-title">Bağlantılar & İletişim</div>
          <div className="apply-row-2">
            <div className="apply-field">
              <label>Website URL</label>
              <input type="url" placeholder="https://yourproject.io" value={form.websiteUrl} onChange={(e) => set("websiteUrl", e.target.value)} />
            </div>
            <div className="apply-field">
              <label>Twitter / X</label>
              <input type="url" placeholder="https://twitter.com/yourproject" value={form.twitterUrl} onChange={(e) => set("twitterUrl", e.target.value)} />
            </div>
          </div>
          <div className="apply-row-2">
            <div className="apply-field">
              <label>Telegram</label>
              <input type="url" placeholder="https://t.me/yourproject" value={form.telegramUrl} onChange={(e) => set("telegramUrl", e.target.value)} />
            </div>
            <div className="apply-field">
              <label>Whitepaper URL</label>
              <input type="url" placeholder="https://yourproject.io/whitepaper.pdf" value={form.whitepaperUrl} onChange={(e) => set("whitepaperUrl", e.target.value)} />
            </div>
          </div>
          <div className="apply-field">
            <label>İletişim E-postası *</label>
            <input type="email" placeholder="team@yourproject.io" value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} />
          </div>
        </div>

        {/* Fee notice */}
        <div className="apply-fee-notice">
          <Info size={14} />
          <span>
            Başvurunuz onaylandıktan sonra <strong>500 PART</strong> listeleme ücreti talep edilecektir.
            Ücret smart contract escrow'a kilitlenir — proje iptal olursa geri ödenir.
          </span>
        </div>

        {err && (
          <div className="apply-err">
            <AlertCircle size={13} /> {err}
          </div>
        )}

        <button
          className="apply-submit-btn"
          onClick={submit}
          disabled={busy || !isAuthed || !form.name || !form.symbol || !form.description || !form.targetAmount || !form.startAt || !form.endAt}
        >
          {busy ? "Gönderiliyor…" : "Başvuruyu Gönder"}
        </button>
        <p className="apply-submit-note">
          Başvurarak <a href="/terms">Kullanım Koşulları</a>'nı ve <a href="/privacy">Gizlilik Politikası</a>'nı kabul etmiş sayılırsınız.
        </p>
      </div>

      <style>{`
        .apply-page { max-width: 760px; margin: 0 auto; padding-bottom: 80px; }

        .apply-fee-banner { display:flex;align-items:flex-start;gap:14px;margin:16px 20px;padding:16px 18px;background:rgba(240,180,41,.06);border:1.5px solid rgba(240,180,41,.2);border-radius:14px; }
        .apply-fee-banner strong { display:block;font-size:15px;font-weight:800;margin-bottom:3px; }
        .apply-fee-banner p { font-size:13px;color:var(--muted);line-height:1.6; }

        .apply-perks { display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;padding:0 20px 16px; }
        .apply-perk { display:flex;align-items:flex-start;gap:10px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:12px; }
        .apply-perk-icon { font-size:20px;flex-shrink:0; }
        .apply-perk-title { font-size:13px;font-weight:700; }
        .apply-perk-desc { font-size:12px;color:var(--muted);margin-top:2px; }

        .apply-process { padding:0 20px 20px; }
        .apply-process-title { font-size:14px;font-weight:700;margin-bottom:14px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px; }
        .apply-steps-row { display:flex;gap:0;overflow-x:auto;scrollbar-width:none; }
        .apply-step { display:flex;flex-direction:column;align-items:center;position:relative;flex:1;min-width:100px;text-align:center; }
        .apply-step-n { width:32px;height:32px;border-radius:50%;border:2px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:var(--muted);background:var(--surface);z-index:1;margin-bottom:8px; }
        .apply-step-n.active { border-color:var(--accent);color:var(--accent); }
        .apply-step-n.done { border-color:#22c55e;color:#22c55e; }
        .apply-step-info { padding:0 4px; }
        .apply-step-title { font-size:12px;font-weight:700; }
        .apply-step-desc { font-size:10px;color:var(--muted);margin-top:2px;line-height:1.4; }
        .apply-step-line { position:absolute;top:15px;left:50%;width:100%;height:2px;background:var(--border);z-index:0; }

        .apply-form-wrap { margin:0 20px;background:var(--surface);border:1.5px solid var(--border);border-radius:18px;overflow:hidden; }
        .apply-form-header { display:flex;align-items:center;gap:10px;padding:18px 20px;border-bottom:1px solid var(--border); }
        .apply-form-header h3 { font-size:16px;font-weight:800; }

        .apply-auth-warn { display:flex;align-items:center;gap:8px;margin:16px 20px;padding:12px 14px;background:rgba(229,72,77,.08);border:1px solid rgba(229,72,77,.2);border-radius:10px;font-size:13px;color:#e5484d; }

        .apply-field-group { padding:18px 20px;border-bottom:1px solid var(--border); }
        .apply-field-group-title { font-size:12px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;color:var(--muted);margin-bottom:14px; }
        .apply-row-2 { display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px; }
        .apply-row-3 { display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:12px; }
        .apply-field { display:flex;flex-direction:column;gap:5px;margin-bottom:12px; }
        .apply-field:last-child { margin-bottom:0; }
        .apply-field label { font-size:12px;font-weight:700;color:var(--muted); }
        .apply-field input, .apply-field textarea, .apply-field select {
          padding:10px 12px;border-radius:10px;border:1.5px solid var(--border);
          background:var(--surface-2);color:var(--text);font-size:13px;outline:none;
          transition:border-color .15s;font-family:inherit;
        }
        .apply-field input:focus, .apply-field textarea:focus { border-color:var(--accent); }
        .apply-field textarea { resize:vertical;min-height:100px; }

        .apply-fee-notice { display:flex;align-items:flex-start;gap:10px;margin:16px 20px 0;padding:12px 14px;background:rgba(59,130,246,.06);border:1px solid rgba(59,130,246,.15);border-radius:10px;font-size:12px;color:var(--muted);line-height:1.6; }
        .apply-err { display:flex;align-items:center;gap:6px;margin:12px 20px 0;padding:10px 14px;background:rgba(229,72,77,.08);border-radius:8px;font-size:13px;color:#e5484d; }

        .apply-submit-btn {
          display:block;width:calc(100% - 40px);margin:16px 20px;padding:14px;
          border-radius:12px;background:var(--accent);color:#1a1300;font-size:15px;
          font-weight:800;border:none;cursor:pointer;transition:opacity .15s;
        }
        .apply-submit-btn:hover:not(:disabled) { opacity:.88; }
        .apply-submit-btn:disabled { opacity:.4;cursor:not-allowed; }
        .apply-submit-note { text-align:center;font-size:11px;color:var(--muted);padding:0 20px 20px; }
        .apply-submit-note a { color:var(--accent);text-decoration:none; }

        @media(max-width:600px) {
          .apply-row-2, .apply-row-3 { grid-template-columns:1fr; }
        }
      `}</style>
    </div>
  );
}
