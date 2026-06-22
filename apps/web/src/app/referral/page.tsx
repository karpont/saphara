"use client";

import { useState } from "react";
import {
  Copy, Check, Users, Gift, TrendingUp, Shield,
  ChevronDown, ChevronUp, Coins, AlertCircle, Trophy,
} from "lucide-react";
import {
  useMyReferral, useApplyReferral, useClaimReferral,
  useReferralLeaderboard, useReferralStats, useAuth,
} from "../../hooks/useApi";

const TIERS = [
  { n: 1,  label: "1 Davet",  reward: "50 PART",    icon: "🐣", color: "#888"    },
  { n: 5,  label: "5 Davet",  reward: "300 PART",   icon: "🐰", color: "#3fb950" },
  { n: 10, label: "10 Davet", reward: "750 PART",   icon: "🦊", color: "#f0b429" },
  { n: 25, label: "25 Davet", reward: "2,500 PART", icon: "🦁", color: "#e5484d" },
  { n: 50, label: "50 Davet", reward: "6,000 PART", icon: "🐉", color: "#7c3aed" },
];
const FAQS = [
  { q: "Referral ödülleri ne zaman ödenir?", a: "Davet ettiğiniz kişi cüzdanını bağlayıp ilk gönderisini yaptıktan sonra ödül bekleyen havuza düşer. \"Ödül Talep Et\" butonuyla anında çekilebilir." },
  { q: "Kaç kişiyi davet edebilirim?", a: "Davet sayısında sınır yoktur! Her başarılı davet için 50 PART, daveti yapan kişi için ödüllendirilir." },
  { q: "Referral kodum nasıl çalışır?", a: "Referral linkinizi veya kodunuzu paylaşın. Kayıt olan kişi ilk oturumda kodu uygulayarak 25 PART bonus kazanır, siz de 50 PART kazanırsınız." },
  { q: "Ödüllerim nerede görünür?", a: "\"Ödüllerim\" sekmesinde kazandığınız ve bekleyen ödüllerinizi görebilirsiniz. Tüm ödemeler PART bakiyenize eklenir." },
];

export default function ReferralPage() {
  const { isAuthed } = useAuth();
  const [tab, setTab]       = useState<"overview" | "leaderboard" | "my">("overview");
  const [copied, setCopied] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [applyCode, setApplyCode] = useState("");

  const { data: myData, isLoading: myLoading } = useMyReferral();
  const { data: lbData }   = useReferralLeaderboard();
  const { data: statsData } = useReferralStats();
  const apply = useApplyReferral();
  const claim = useClaimReferral();

  const referralCode = myData?.referralCode ?? "—";
  const referralLink = typeof window !== "undefined"
    ? `${window.location.origin}/join?ref=${referralCode}`
    : `https://saphara.io/join?ref=${referralCode}`;

  const copy = () => {
    navigator.clipboard?.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const leaderboard = lbData?.leaderboard ?? [];

  return (
    <div className="ref-wrap">
      <header className="topbar"><h1>Referral Programı</h1></header>

      {/* Hero */}
      <div className="ref-hero">
        <div className="ref-hero-glow" />
        <div className="ref-hero-text">
          <div className="ref-hero-badge"><Gift size={13} /> Arkadaşını Davet Et, PART Kazan</div>
          <h2>Her davet <span style={{ color: "var(--accent)" }}>50 PART</span></h2>
          <p>Her başarılı referral için 50 PART kazanın. Davet edilen kişi de 25 PART bonus alır!</p>
        </div>
        {statsData && (
          <div className="ref-hero-stats">
            <div className="ref-hs"><span className="ref-hs-n">{statsData.totalReferrals}</span><span className="ref-hs-l">Toplam Davet</span></div>
            <div className="ref-hs-div" />
            <div className="ref-hs"><span className="ref-hs-n">{statsData.rewardPerReferral}</span><span className="ref-hs-l">PART / Davet</span></div>
            <div className="ref-hs-div" />
            <div className="ref-hs"><span className="ref-hs-n">{(statsData.totalPartDistributed / 1000).toFixed(0)}K</span><span className="ref-hs-l">PART Dağıtıldı</span></div>
          </div>
        )}
      </div>

      {/* Link box */}
      <div className="ref-link-box">
        <div className="ref-link-label">Referral Linkin</div>
        {!isAuthed ? (
          <div className="ref-no-auth"><Shield size={14} /> Referral linki için giriş yapın</div>
        ) : myLoading ? (
          <div className="ref-no-auth">Yükleniyor…</div>
        ) : (
          <>
            <div className="ref-link-row">
              <span className="ref-link-url">{referralLink}</span>
              <button className="ref-copy-btn" onClick={copy}>
                {copied ? <><Check size={13} /> Kopyalandı!</> : <><Copy size={13} /> Kopyala</>}
              </button>
            </div>
            <div className="ref-code-row">
              <span className="ref-code-label">Kod:</span>
              <code className="ref-code">{referralCode}</code>
            </div>
            <div className="ref-share-row">
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("Saphara'ya katıl, PART kazan! " + referralLink)}`}
                target="_blank" rel="noreferrer" className="ref-share-btn">
                🐦 Twitter
              </a>
              <a href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent("Saphara - Web3 Social Platform!")}`}
                target="_blank" rel="noreferrer" className="ref-share-btn">
                ✈️ Telegram
              </a>
            </div>

            {myData && (myData.pendingEarnings > 0 || myData.totalEarned > 0) && (
              <div className="ref-earnings-row">
                <div className="ref-earn-item">
                  <Coins size={14} style={{ color: "var(--accent)" }} />
                  <span>Bekleyen: <strong>{myData.pendingEarnings} PART</strong></span>
                </div>
                <div className="ref-earn-item">
                  <Check size={14} style={{ color: "#22c55e" }} />
                  <span>Ödenen: <strong>{myData.totalEarned} PART</strong></span>
                </div>
                {myData.pendingEarnings > 0 && (
                  <button className="ref-claim-btn" disabled={claim.isPending}
                    onClick={() => claim.mutate()}>
                    {claim.isPending ? "Talep ediliyor…" : claim.isSuccess ? "✓ Eklendi!" : `${myData.pendingEarnings} PART Talep Et`}
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Apply referral code */}
      {isAuthed && !myData?.referralCode?.startsWith("REF-") ? null : isAuthed && (
        <div className="ref-apply-box">
          <div className="ref-apply-label">Davet Koduyla Kayıt Oldunuz mu?</div>
          <div className="ref-apply-row">
            <input className="ref-apply-input" placeholder="REF-XXXXXXXX"
              value={applyCode} onChange={e => setApplyCode(e.target.value.toUpperCase())} />
            <button className="ref-apply-btn" disabled={!applyCode.trim() || apply.isPending}
              onClick={() => apply.mutate(applyCode.trim())}>
              {apply.isPending ? "…" : "Uygula"}
            </button>
          </div>
          {apply.isSuccess && <p className="ref-apply-ok"><Check size={13} /> Kod uygulandı! 25 PART bonus eklendi.</p>}
          {apply.isError && <p className="ref-apply-err"><AlertCircle size={13} /> {(apply.error as any)?.message}</p>}
        </div>
      )}

      {/* Tabs */}
      <div className="ref-tabs">
        <button className={tab === "overview" ? "on" : ""} onClick={() => setTab("overview")}>
          <TrendingUp size={14} /> Kademeler
        </button>
        <button className={tab === "leaderboard" ? "on" : ""} onClick={() => setTab("leaderboard")}>
          <Trophy size={14} /> Sıralama
        </button>
        {isAuthed && (
          <button className={tab === "my" ? "on" : ""} onClick={() => setTab("my")}>
            <Users size={14} /> Davetlerim
          </button>
        )}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="ref-tiers">
          {TIERS.map((t, i) => (
            <div key={t.n} className="ref-tier-card" style={{ borderColor: t.color + "44" }}>
              <span className="ref-tier-icon">{t.icon}</span>
              <div className="ref-tier-info">
                <div className="ref-tier-label">{t.label}</div>
                <div className="ref-tier-reward" style={{ color: t.color }}>+{t.reward}</div>
              </div>
              <div className="ref-tier-badge" style={{ background: t.color + "18", color: t.color }}>Tier {i + 1}</div>
            </div>
          ))}

          <div className="ref-how">
            <h3>Nasıl Çalışır?</h3>
            <div className="ref-how-steps">
              {[
                { num: "1", title: "Linki Kopyala", sub: "Kendi referral linkini al" },
                { num: "2", title: "Arkadaşına Gönder", sub: "Sosyal medyada veya DM ile paylaş" },
                { num: "3", title: "Birlikte Kazan", sub: "Sen 50, arkadaşın 25 PART alır" },
              ].map(s => (
                <div key={s.num} className="ref-how-step">
                  <span className="ref-how-num">{s.num}</span>
                  <div><strong>{s.title}</strong><br /><span>{s.sub}</span></div>
                </div>
              ))}
            </div>
          </div>

          <div className="ref-faqs">
            {FAQS.map((f, i) => (
              <div key={i} className="ref-faq-item">
                <button className="ref-faq-q" onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                  {f.q} {faqOpen === i ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {faqOpen === i && <p className="ref-faq-a">{f.a}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      {tab === "leaderboard" && (
        <div className="ref-lb">
          {leaderboard.length === 0 && (
            <div className="ref-lb-empty"><Trophy size={36} style={{ opacity: .2 }} /><p>Henüz lider yok</p></div>
          )}
          {leaderboard.map((u: any) => (
            <div key={u.rank} className={`ref-lb-row${u.rank <= 3 ? " ref-lb-top" : ""}`}>
              <span className="ref-lb-rank">
                {u.rank === 1 ? "🥇" : u.rank === 2 ? "🥈" : u.rank === 3 ? "🥉" : `#${u.rank}`}
              </span>
              <img src={u.user?.avatarUrl ?? `https://api.dicebear.com/9.x/bottts/svg?seed=${u.user?.handle}`}
                alt={u.user?.handle} className="ref-lb-avatar" />
              <div className="ref-lb-info">
                <div className="ref-lb-handle">@{u.user?.handle}</div>
                <div className="ref-lb-sub">{u.referralCount} davet</div>
              </div>
              <div className="ref-lb-earned">{u.totalEarned.toLocaleString("en-US")} PART</div>
            </div>
          ))}
          <p className="ref-lb-note">* Bu ay en fazla davet eden ilk 3 kişi ekstra 500 PART bonus alır.</p>
        </div>
      )}

      {/* My referrals */}
      {tab === "my" && isAuthed && (
        <div className="ref-my">
          {myLoading && <div style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>Yükleniyor…</div>}
          {!myLoading && (myData?.referrals ?? []).length === 0 && (
            <div className="ref-lb-empty">
              <Gift size={36} style={{ opacity: .2 }} />
              <p>Henüz davet yok</p>
              <span>Referral linkinizi paylaşın ve PART kazanmaya başlayın.</span>
            </div>
          )}
          {(myData?.referrals ?? []).map((r: any) => (
            <div key={r.id} className="ref-my-row">
              <img src={r.referred?.avatarUrl ?? `https://api.dicebear.com/9.x/bottts/svg?seed=${r.referred?.handle}`}
                alt={r.referred?.handle} className="ref-lb-avatar" />
              <div className="ref-lb-info">
                <div className="ref-lb-handle">@{r.referred?.handle ?? "—"}</div>
                <div className="ref-lb-sub">{new Date(r.createdAt).toLocaleDateString("tr-TR")}</div>
              </div>
              <div className={`ref-my-status ${r.paid ? "paid" : "pending"}`}>
                {r.paid ? <><Check size={11} /> {Number(r.rewardPart)} PART ödendi</> : <><Coins size={11} /> {Number(r.rewardPart)} PART bekliyor</>}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .ref-wrap { max-width:760px;margin:0 auto;padding-bottom:80px; }

        .ref-hero { position:relative;display:flex;justify-content:space-between;align-items:center;gap:16px;padding:24px;border-bottom:1px solid var(--border);flex-wrap:wrap;overflow:hidden; }
        .ref-hero-glow { position:absolute;inset:0;background:radial-gradient(ellipse at 0% 50%,rgba(240,180,41,.07),transparent 60%);pointer-events:none; }
        .ref-hero-badge { display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;color:var(--accent);background:rgba(240,180,41,.1);padding:4px 10px;border-radius:99px;margin-bottom:8px; }
        .ref-hero-text h2 { font-size:clamp(18px,3vw,26px);font-weight:900; }
        .ref-hero-text p { font-size:13px;color:var(--muted);margin-top:4px; }
        .ref-hero-stats { display:flex;align-items:center;background:var(--surface);border:1px solid var(--border);border-radius:14px;overflow:hidden; }
        .ref-hs { padding:14px 20px;text-align:center; }
        .ref-hs-n { display:block;font-size:22px;font-weight:900;color:var(--accent); }
        .ref-hs-l { display:block;font-size:10px;color:var(--muted);margin-top:2px; }
        .ref-hs-div { width:1px;background:var(--border);align-self:stretch; }

        .ref-link-box { margin:16px 20px;padding:20px;background:var(--surface);border:1px solid var(--border);border-radius:16px; }
        .ref-link-label { font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px; }
        .ref-no-auth { display:flex;align-items:center;gap:6px;font-size:13px;color:var(--muted); }
        .ref-link-row { display:flex;gap:10px;align-items:center;background:var(--surface-2);border-radius:10px;padding:10px 14px;margin-bottom:10px; }
        .ref-link-url { flex:1;font-size:12px;color:var(--muted);word-break:break-all; }
        .ref-copy-btn { display:flex;align-items:center;gap:5px;padding:8px 14px;border-radius:8px;background:var(--accent);color:#1a1300;font-size:12px;font-weight:700;border:none;cursor:pointer;white-space:nowrap; }
        .ref-code-row { display:flex;align-items:center;gap:8px;margin-bottom:10px;font-size:12px;color:var(--muted); }
        .ref-code { font-family:monospace;font-size:13px;font-weight:700;color:var(--accent);background:rgba(240,180,41,.08);padding:3px 8px;border-radius:6px; }
        .ref-share-row { display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px; }
        .ref-share-btn { display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:10px;font-size:12px;font-weight:700;text-decoration:none;border:1.5px solid var(--border);color:var(--text);transition:all .15s; }
        .ref-share-btn:hover { border-color:var(--accent); }

        .ref-earnings-row { display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:12px 14px;background:var(--surface-2);border-radius:10px;font-size:13px; }
        .ref-earn-item { display:flex;align-items:center;gap:5px; }
        .ref-claim-btn { margin-left:auto;padding:8px 16px;border-radius:8px;background:var(--accent);color:#1a1300;font-size:12px;font-weight:700;border:none;cursor:pointer; }

        .ref-apply-box { margin:0 20px 16px;padding:16px;background:var(--surface);border:1px solid var(--border);border-radius:12px; }
        .ref-apply-label { font-size:12px;font-weight:700;color:var(--muted);margin-bottom:8px; }
        .ref-apply-row { display:flex;gap:8px; }
        .ref-apply-input { flex:1;padding:9px 12px;border-radius:8px;background:var(--surface-2);border:1.5px solid var(--border);color:var(--text);font-size:13px;outline:none;font-family:monospace; }
        .ref-apply-input:focus { border-color:var(--accent); }
        .ref-apply-btn { padding:9px 16px;border-radius:8px;background:var(--surface-2);border:1.5px solid var(--border);color:var(--text);font-size:13px;font-weight:700;cursor:pointer; }
        .ref-apply-btn:hover:not(:disabled) { border-color:var(--accent); }
        .ref-apply-ok { display:flex;align-items:center;gap:6px;font-size:12px;color:#22c55e;margin-top:6px; }
        .ref-apply-err { display:flex;align-items:center;gap:6px;font-size:12px;color:#e5484d;margin-top:6px; }

        .ref-tabs { display:flex;gap:4px;margin:0 20px 12px;background:var(--surface-2);border-radius:12px;padding:4px; }
        .ref-tabs button { flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:9px;border-radius:9px;border:none;font-size:13px;font-weight:600;cursor:pointer;background:transparent;color:var(--muted);transition:all .15s; }
        .ref-tabs button.on { background:var(--surface);color:var(--text);box-shadow:0 1px 4px rgba(0,0,0,.15); }

        .ref-tiers { padding:0 20px;display:flex;flex-direction:column;gap:10px; }
        .ref-tier-card { display:flex;align-items:center;gap:14px;padding:14px 16px;background:var(--surface);border:1.5px solid;border-radius:14px;transition:transform .15s; }
        .ref-tier-card:hover { transform:translateX(4px); }
        .ref-tier-icon { font-size:28px; }
        .ref-tier-info { flex:1; }
        .ref-tier-label { font-size:13px;font-weight:700; }
        .ref-tier-reward { font-size:16px;font-weight:900;margin-top:2px; }
        .ref-tier-badge { font-size:11px;font-weight:700;padding:4px 10px;border-radius:99px; }

        .ref-how { margin-top:20px;padding:20px;background:var(--surface);border:1px solid var(--border);border-radius:16px; }
        .ref-how h3 { font-size:15px;font-weight:700;margin-bottom:14px; }
        .ref-how-steps { display:flex;gap:16px;flex-wrap:wrap; }
        .ref-how-step { display:flex;align-items:flex-start;gap:12px;flex:1;min-width:150px; }
        .ref-how-num { width:28px;height:28px;border-radius:50%;background:var(--accent);color:#1a1300;font-weight:900;font-size:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
        .ref-how-step strong { font-size:13px; }
        .ref-how-step span { font-size:12px;color:var(--muted); }

        .ref-faqs { margin-top:16px; }
        .ref-faq-item { border-bottom:1px solid var(--border); }
        .ref-faq-q { width:100%;background:none;border:none;padding:14px 0;display:flex;justify-content:space-between;align-items:center;font-size:13px;font-weight:600;color:var(--text);cursor:pointer;text-align:left;gap:12px; }
        .ref-faq-q:hover { color:var(--accent); }
        .ref-faq-a { font-size:12px;color:var(--muted);line-height:1.7;padding-bottom:12px; }

        .ref-lb { padding:0 20px;display:flex;flex-direction:column; }
        .ref-lb-empty { display:flex;flex-direction:column;align-items:center;gap:10px;padding:60px 20px;color:var(--muted);text-align:center; }
        .ref-lb-empty p { font-size:16px;font-weight:700; }
        .ref-lb-row { display:flex;align-items:center;gap:12px;padding:14px 0;border-bottom:1px solid var(--border); }
        .ref-lb-top { background:rgba(240,180,41,.04);margin:0 -8px;padding:14px 8px;border-radius:10px;border-color:transparent; }
        .ref-lb-rank { width:32px;text-align:center;font-size:18px;font-weight:700; }
        .ref-lb-avatar { width:36px;height:36px;border-radius:50%;border:2px solid var(--border); }
        .ref-lb-info { flex:1; }
        .ref-lb-handle { font-size:14px;font-weight:700; }
        .ref-lb-sub { font-size:12px;color:var(--muted); }
        .ref-lb-earned { font-size:14px;font-weight:800;color:var(--accent); }
        .ref-lb-note { font-size:12px;color:var(--muted);margin-top:16px;padding-top:12px;border-top:1px solid var(--border); }

        .ref-my { padding:0 20px;display:flex;flex-direction:column; }
        .ref-my-row { display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border); }
        .ref-my-status { display:flex;align-items:center;gap:4px;font-size:11px;font-weight:700;padding:4px 10px;border-radius:99px; }
        .ref-my-status.paid { background:rgba(34,197,94,.1);color:#22c55e; }
        .ref-my-status.pending { background:rgba(240,180,41,.1);color:var(--accent); }

        @media(max-width:600px){
          .ref-hero { flex-direction:column; }
          .ref-hero-stats { width:100%; }
        }
      `}</style>
    </div>
  );
}
