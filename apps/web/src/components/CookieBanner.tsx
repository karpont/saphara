"use client";

import { useState, useEffect } from "react";
import { Shield, X, ChevronDown, ChevronUp, Check, Cookie } from "lucide-react";
import { useSaveConsent } from "../hooks/useApi";

export function CookieBanner() {
  const [visible, setVisible]     = useState(false);
  const [expanded, setExpanded]   = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const saveConsent = useSaveConsent();

  useEffect(() => {
    const given = localStorage.getItem("saphara_consent_v2");
    if (!given) setTimeout(() => setVisible(true), 1500);
  }, []);

  const save = async (a: boolean, m: boolean) => {
    localStorage.setItem("saphara_consent_v2", JSON.stringify({ analytics: a, marketing: m, at: Date.now() }));
    try { await saveConsent.mutateAsync({ analytics: a, marketing: m }); } catch { /* offline OK */ }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="ck-overlay" role="dialog" aria-modal="true" aria-label="Çerez tercihleri">
      <div className="ck-banner">

        <div className="ck-header">
          <span className="ck-icon"><Cookie size={20} /></span>
          <div>
            <strong className="ck-title">Çerezler &amp; Kişisel Veriler</strong>
            <span className="ck-badges">🇹🇷 KVKK &nbsp;·&nbsp; 🇪🇺 GDPR</span>
          </div>
          <button className="ck-close" onClick={() => save(false, false)} aria-label="Kapat"><X size={15} /></button>
        </div>

        <p className="ck-desc">
          Saphara, güvenli oturum ve temel hizmet için zorunlu çerezler kullanır. Opsiyonel çerezler yalnızca
          açık onayınızla aktif edilir. Kişisel verileriniz 6698 sayılı <strong>KVKK</strong> ve <strong>AB GDPR</strong> kapsamında korunur.{" "}
          <a href="/privacy" className="ck-link">Gizlilik Politikası →</a>
        </p>

        <div className="ck-cats">
          <div className="ck-cat ck-cat--locked">
            <div className="ck-cat-body">
              <span className="ck-cat-name">🔒 Zorunlu Çerezler</span>
              <span className="ck-cat-sub">Oturum, güvenlik, dil. Devre dışı bırakılamaz.</span>
            </div>
            <span className="ck-tag ck-tag--on">Aktif</span>
          </div>

          <div className="ck-cat" onClick={() => setAnalytics((v) => !v)} style={{ cursor: "pointer" }}>
            <div className="ck-cat-body">
              <span className="ck-cat-name">📊 Analitik</span>
              <span className="ck-cat-sub">Anonim kullanım istatistikleri — kim olduğunuzu değil, neyi kullandığınızı anlamamıza yardım eder.</span>
            </div>
            <div className={`ck-toggle ${analytics ? "ck-toggle--on" : ""}`}><span className="ck-knob" /></div>
          </div>

          <div className="ck-cat" onClick={() => setMarketing((v) => !v)} style={{ cursor: "pointer" }}>
            <div className="ck-cat-body">
              <span className="ck-cat-name">🎯 Kişiselleştirme</span>
              <span className="ck-cat-sub">İlgi alanlarınıza göre içerik ve öneriler.</span>
            </div>
            <div className={`ck-toggle ${marketing ? "ck-toggle--on" : ""}`}><span className="ck-knob" /></div>
          </div>
        </div>

        <button className="ck-detail-btn" onClick={() => setExpanded((e) => !e)}>
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {expanded ? "Yasal detayları gizle" : "KVKK / Yasal detayları görüntüle"}
        </button>

        {expanded && (
          <div className="ck-legal">
            <div className="ck-legal-item">
              <strong>Veri Sorumlusu</strong>
              <span>Saphara Teknoloji — İletişim: <a href="mailto:privacy@saphara.io">privacy@saphara.io</a></span>
            </div>
            <div className="ck-legal-item">
              <strong>Toplanan Veriler</strong>
              <span>Cüzdan adresi (public), etkileşimler, hash edilmiş IP. Özel anahtar asla toplanmaz.</span>
            </div>
            <div className="ck-legal-item">
              <strong>Saklama Süresi</strong>
              <span>Zorunlu: hesap aktifken. Analitik: 12 ay. Kişiselleştirme: 6 ay.</span>
            </div>
            <div className="ck-legal-item">
              <strong>Haklarınız (KVKK Md. 11)</strong>
              <span>Erişim, düzeltme, silme, itiraz ve taşınabilirlik. <a href="/privacy">Detaylı bilgi →</a></span>
            </div>
          </div>
        )}

        <div className="ck-actions">
          <button className="ck-btn ck-btn--accept" onClick={() => save(true, true)}>
            <Check size={14} /> Tümünü Kabul Et
          </button>
          <button className="ck-btn ck-btn--save" onClick={() => save(analytics, marketing)}>
            Seçilenleri Kaydet
          </button>
          <button className="ck-btn ck-btn--reject" onClick={() => save(false, false)}>
            Reddet
          </button>
        </div>

      </div>

      <style>{`
        .ck-overlay {
          position:fixed;bottom:0;left:0;right:0;z-index:9999;
          padding:12px 16px;display:flex;justify-content:center;
          pointer-events:none;
        }
        .ck-banner {
          width:100%;max-width:700px;pointer-events:all;
          background:var(--surface,#12121e);border:1px solid var(--border,#2a2a3a);
          border-radius:18px;padding:20px 24px;
          box-shadow:0 8px 60px rgba(0,0,0,.55),0 0 0 1px rgba(240,180,41,.08);
          animation:ckSlide .4s cubic-bezier(.22,1,.36,1);
        }
        @keyframes ckSlide{from{transform:translateY(24px);opacity:0}to{transform:translateY(0);opacity:1}}

        .ck-header{display:flex;align-items:center;gap:10px;margin-bottom:10px;}
        .ck-icon{color:var(--accent,#f0b429);flex-shrink:0;}
        .ck-title{display:block;font-size:15px;font-weight:800;}
        .ck-badges{font-size:11px;color:var(--muted,#888);display:block;margin-top:1px;}
        .ck-close{margin-left:auto;background:none;border:none;color:var(--muted,#888);cursor:pointer;padding:6px;border-radius:8px;flex-shrink:0;}
        .ck-close:hover{background:var(--surface-2,#1e1e2e);color:var(--text,#fff);}

        .ck-desc{font-size:13px;color:var(--muted,#888);line-height:1.65;margin-bottom:14px;}
        .ck-link{color:var(--accent,#f0b429);text-decoration:none;font-weight:600;}

        .ck-cats{display:flex;flex-direction:column;gap:6px;margin-bottom:10px;}
        .ck-cat{display:flex;align-items:center;gap:12px;padding:10px 14px;background:var(--surface-2,#1a1a2e);border-radius:12px;border:1px solid var(--border,#2a2a3a);transition:border-color .15s;}
        .ck-cat:not(.ck-cat--locked):hover{border-color:var(--accent,#f0b429);}
        .ck-cat--locked{opacity:.6;cursor:default;}
        .ck-cat-body{flex:1;}
        .ck-cat-name{display:block;font-size:13px;font-weight:700;color:var(--text,#fff);}
        .ck-cat-sub{display:block;font-size:12px;color:var(--muted,#888);line-height:1.4;margin-top:2px;}
        .ck-tag{font-size:11px;font-weight:700;padding:2px 8px;border-radius:99px;}
        .ck-tag--on{background:rgba(63,185,80,.15);color:#3fb950;}

        .ck-toggle{width:40px;height:23px;background:var(--border,#444);border-radius:99px;flex-shrink:0;position:relative;transition:background .2s;}
        .ck-toggle--on{background:var(--accent,#f0b429);}
        .ck-knob{position:absolute;top:3px;left:3px;width:17px;height:17px;background:#fff;border-radius:50%;transition:left .2s;box-shadow:0 1px 4px rgba(0,0,0,.3);}
        .ck-toggle--on .ck-knob{left:20px;}

        .ck-detail-btn{background:none;border:none;color:var(--muted,#888);font-size:12px;cursor:pointer;display:flex;align-items:center;gap:4px;padding:0;margin-bottom:10px;}
        .ck-detail-btn:hover{color:var(--text,#fff);}

        .ck-legal{background:var(--surface-2,#1a1a2e);border-radius:10px;padding:12px 14px;margin-bottom:12px;display:flex;flex-direction:column;gap:8px;}
        .ck-legal-item{display:flex;flex-direction:column;gap:2px;}
        .ck-legal-item strong{font-size:12px;color:var(--text,#fff);}
        .ck-legal-item span{font-size:12px;color:var(--muted,#888);line-height:1.5;}
        .ck-legal-item a{color:var(--accent,#f0b429);text-decoration:none;}

        .ck-actions{display:flex;gap:8px;flex-wrap:wrap;}
        .ck-btn{padding:9px 18px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;border:1.5px solid transparent;display:inline-flex;align-items:center;gap:6px;transition:all .15s;}
        .ck-btn--accept{background:var(--accent,#f0b429);color:#1a1300;border-color:var(--accent,#f0b429);}
        .ck-btn--accept:hover{opacity:.88;}
        .ck-btn--save{background:transparent;color:var(--text,#fff);border-color:var(--border,#444);}
        .ck-btn--save:hover{border-color:var(--accent,#f0b429);color:var(--accent,#f0b429);}
        .ck-btn--reject{background:transparent;color:var(--muted,#888);border-color:transparent;}
        .ck-btn--reject:hover{color:var(--text,#fff);}

        @media(max-width:520px){
          .ck-banner{padding:16px 14px;}
          .ck-actions{flex-direction:column;}
          .ck-btn{justify-content:center;}
        }
      `}</style>
    </div>
  );
}
