"use client";

import { useState } from "react";
import {
  Megaphone, Plus, BarChart3, Pause, Play, Trash2, Eye, MousePointer,
  Target, Users, DollarSign, Calendar, Image as ImageIcon, ChevronRight,
  ChevronLeft, Loader2, CheckCircle2, AlertCircle, ChevronDown, ChevronUp,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useMyCampaigns, useCreateCampaign, useCampaignAction, useCampaignDetail } from "../../hooks/useApi";

type Tab = "list" | "create";
type Step = 1 | 2 | 3 | 4 | 5;

const OBJECTIVES = [
  { id: "awareness",       label: "Farkındalık",        desc: "Markanızı daha fazla kişiye tanıtın",        icon: Eye },
  { id: "traffic",         label: "Trafik",              desc: "Web sitenize veya profile ziyaretçi çekin", icon: MousePointer },
  { id: "conversions",     label: "Dönüşüm",             desc: "PART satışı veya eylem almayı artırın",     icon: Target },
  { id: "creator_collab",  label: "Creator İşbirliği",   desc: "İçerik üreticileriyle kampanya yapın",      icon: Users },
];

const INTERESTS = ["Kripto", "Sanat", "Müzik", "Oyun", "Finans", "Spor", "Teknoloji", "NFT", "DeFi", "Moda"];

const STATUS_COLOR: Record<string, string> = {
  active: "#3fb950", paused: "#f0b429", ended: "#8b90a0",
};
const STATUS_LABEL: Record<string, string> = {
  active: "Aktif", paused: "Duraklatıldı", ended: "Sonlandı",
};

export function AdManager() {
  const [tab, setTab] = useState<Tab>("list");
  const campaigns = useMyCampaigns();
  const action = useCampaignAction();

  return (
    <div className="admanager">
      <header className="topbar">
        <h1><Megaphone size={20} /> Reklam Yönetimi</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button className={tab === "list" ? "primary-btn" : "ghost-btn"} onClick={() => setTab("list")}>
            <BarChart3 size={15} /> Kampanyalarım
          </button>
          <button className={tab === "create" ? "primary-btn" : "ghost-btn"} onClick={() => setTab("create")}>
            <Plus size={15} /> Yeni Kampanya
          </button>
        </div>
      </header>

      {tab === "list" && (
        <CampaignList
          campaigns={campaigns.data?.items ?? []}
          isLoading={campaigns.isLoading}
          onAction={(id, a) => action.mutate({ id, action: a })}
          onNew={() => setTab("create")}
        />
      )}
      {tab === "create" && <CreateCampaign onDone={() => setTab("list")} />}
    </div>
  );
}

/* ── Kampanya Listesi ── */
function CampaignList({ campaigns, isLoading, onAction, onNew }: {
  campaigns: any[]; isLoading: boolean;
  onAction: (id: string, a: "pause" | "resume" | "end") => void;
  onNew: () => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  if (isLoading) return <div className="feed-state"><Loader2 size={28} className="spin" /></div>;

  if (campaigns.length === 0) {
    return (
      <div className="empty-state" style={{ padding: "60px 20px" }}>
        <Megaphone size={40} className="empty-icon" />
        <p className="empty-title">Henüz kampanya yok</p>
        <p className="empty-hint">İlk reklamınızı oluşturun, PART ile ödeyin</p>
        <button className="primary-btn" onClick={onNew} style={{ marginTop: 16 }}>
          <Plus size={16} /> Kampanya Oluştur
        </button>
      </div>
    );
  }

  return (
    <div className="campaign-list">
      {campaigns.map((c: any) => {
        const ctr = c.impressions > 0 ? ((c.clicks / c.impressions) * 100).toFixed(1) : "0";
        const pct = c.budgetPart > 0 ? Math.min(100, (Number(c.spentPart) / Number(c.budgetPart)) * 100) : 0;
        return (
          <div key={c.id} className="campaign-card">
            <div className="campaign-head">
              <div>
                <h3>{c.name}</h3>
                <span className="campaign-badge" style={{ background: STATUS_COLOR[c.status] }}>
                  {STATUS_LABEL[c.status] ?? c.status}
                </span>
                <span className="muted campaign-obj">{c.objective}</span>
              </div>
              <div className="campaign-actions">
                {c.status === "active" && (
                  <button className="ghost-btn icon-btn" onClick={() => onAction(c.id, "pause")} title="Duraklat">
                    <Pause size={15} />
                  </button>
                )}
                {c.status === "paused" && (
                  <button className="ghost-btn icon-btn" onClick={() => onAction(c.id, "resume")} title="Devam Et">
                    <Play size={15} />
                  </button>
                )}
                {c.status !== "ended" && (
                  <button className="ghost-btn icon-btn danger-icon" onClick={() => onAction(c.id, "end")} title="Sonlandır">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>

            <div className="campaign-metrics">
              <div className="metric"><Eye size={14} /><span>{c.impressions.toLocaleString("en-US")}</span><small>Gösterim</small></div>
              <div className="metric"><MousePointer size={14} /><span>{c.clicks.toLocaleString("en-US")}</span><small>Tıklama</small></div>
              <div className="metric"><BarChart3 size={14} /><span>{ctr}%</span><small>CTR</small></div>
              <div className="metric"><DollarSign size={14} /><span>{Number(c.spentPart).toFixed(0)}</span><small>PART Harcandı</small></div>
            </div>

            <div className="campaign-budget-bar">
              <div className="budget-bar-labels">
                <small className="muted">{Number(c.spentPart).toFixed(0)} / {Number(c.budgetPart).toFixed(0)} PART</small>
                <small className="muted">%{pct.toFixed(0)}</small>
              </div>
              <div className="budget-bar-track">
                <div className="budget-bar-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>

            <button
              className="ghost-btn campaign-detail-toggle"
              onClick={() => setExpanded(expanded === c.id ? null : c.id)}
            >
              {expanded === c.id ? <><ChevronUp size={14} /> Günlük detayı gizle</> : <><ChevronDown size={14} /> Günlük detay & grafik</>}
            </button>

            {expanded === c.id && <CampaignDailyChart campaignId={c.id} />}
          </div>
        );
      })}
    </div>
  );
}

/* ── Günlük gösterim/tıklama grafiği (campaign detail'den byDay) ── */
function CampaignDailyChart({ campaignId }: { campaignId: string }) {
  const detail = useCampaignDetail(campaignId);

  if (detail.isLoading) return <div style={{ padding: 16 }}><Loader2 size={18} className="spin" /></div>;
  if (detail.isError || !detail.data?.byDay) {
    return <p className="muted" style={{ padding: "8px 0", fontSize: 12 }}>Henüz günlük veri yok.</p>;
  }

  const chartData = Object.entries(detail.data.byDay as Record<string, { impressions: number; clicks: number }>)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, v]) => ({ day: day.slice(5), gosterim: v.impressions, tiklama: v.clicks }));

  if (chartData.length === 0) {
    return <p className="muted" style={{ padding: "8px 0", fontSize: 12 }}>Henüz günlük veri yok.</p>;
  }

  return (
    <div className="campaign-daily-chart">
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#262a36" />
          <XAxis dataKey="day" stroke="#8b90a0" tick={{ fontSize: 11 }} />
          <YAxis stroke="#8b90a0" tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={{ background: "#14161d", border: "1px solid #262a36" }} />
          <Line type="monotone" dataKey="gosterim" stroke="#f0b429" strokeWidth={2} dot={{ r: 2 }} name="Gösterim" />
          <Line type="monotone" dataKey="tiklama" stroke="#5b8def" strokeWidth={2} dot={{ r: 2 }} name="Tıklama" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── Kampanya Oluştur (5 adımlı) ── */
function CreateCampaign({ onDone }: { onDone: () => void }) {
  const createCampaign = useCreateCampaign();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState({
    name: "", objective: "awareness",
    budgetPart: "", bidPart: "", startDate: "", endDate: "",
    interests: [] as string[], minFollowers: 0, geo: "",
    headline: "", description: "", cta: "Daha Fazla Bilgi", mediaUrl: "",
  });

  const set = (k: keyof typeof form, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const toggleInterest = (i: string) =>
    set("interests", form.interests.includes(i) ? form.interests.filter((x) => x !== i) : [...form.interests, i]);

  const submit = async () => {
    await createCampaign.mutateAsync({
      ...form, interests: form.interests,
      geo: form.geo ? [form.geo] : [],
      minFollowers: form.minFollowers || undefined,
    });
    onDone();
  };

  return (
    <div className="create-campaign">
      {/* Adım göstergesi */}
      <div className="step-indicator">
        {([1,2,3,4,5] as Step[]).map((s) => (
          <div key={s} className={`step-dot ${step >= s ? "done" : ""} ${step === s ? "active" : ""}`}>
            {step > s ? <CheckCircle2 size={14} /> : s}
          </div>
        ))}
        <div className="step-labels">
          {["Hedef", "Bütçe", "Hedefleme", "İçerik", "Önizleme"].map((l, i) => (
            <span key={l} className={step === i + 1 ? "active" : ""}>{l}</span>
          ))}
        </div>
      </div>

      <div className="create-campaign-body">
        {/* Adım 1: Hedef */}
        {step === 1 && (
          <div className="step-panel">
            <h3>Kampanya Hedefi</h3>
            <input className="campaign-name-input" placeholder="Kampanya adı" value={form.name}
              onChange={(e) => set("name", e.target.value)} maxLength={60} />
            <div className="objective-grid">
              {OBJECTIVES.map(({ id, label, desc, icon: Icon }) => (
                <button key={id} className={`objective-card ${form.objective === id ? "on" : ""}`}
                  onClick={() => set("objective", id)}>
                  <Icon size={24} />
                  <strong>{label}</strong>
                  <span>{desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Adım 2: Bütçe */}
        {step === 2 && (
          <div className="step-panel">
            <h3>Bütçe & Süre</h3>
            <div className="budget-grid">
              <label>Toplam Bütçe (PART)
                <input type="number" min="100" placeholder="örn. 1000" value={form.budgetPart}
                  onChange={(e) => set("budgetPart", e.target.value)} />
              </label>
              <label>Teklif / Gösterim (PART)
                <input type="number" min="0.1" step="0.1" placeholder="örn. 5" value={form.bidPart}
                  onChange={(e) => set("bidPart", e.target.value)} />
              </label>
              <label><Calendar size={14} /> Başlangıç
                <input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
              </label>
              <label><Calendar size={14} /> Bitiş
                <input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
              </label>
            </div>
            {form.budgetPart && (
              <div className="budget-estimate">
                Tahmini erişim: ~{Math.floor(Number(form.budgetPart) / (Number(form.bidPart) || 5)).toLocaleString("en-US")} gösterim
              </div>
            )}
          </div>
        )}

        {/* Adım 3: Hedefleme */}
        {step === 3 && (
          <div className="step-panel">
            <h3>Hedef Kitle</h3>
            <label className="targeting-label">İlgi Alanları</label>
            <div className="interest-chips">
              {INTERESTS.map((i) => (
                <button key={i} className={`interest-chip ${form.interests.includes(i) ? "on" : ""}`}
                  onClick={() => toggleInterest(i)}>{i}
                </button>
              ))}
            </div>
            <div className="targeting-fields">
              <label>Min. Takipçi (fenomen hedefleme)
                <input type="number" min="0" value={form.minFollowers || ""}
                  placeholder="0 = herkese" onChange={(e) => set("minFollowers", Number(e.target.value))} />
              </label>
              <label>Coğrafya (ülke/şehir)
                <input placeholder="örn. Türkiye, İstanbul" value={form.geo}
                  onChange={(e) => set("geo", e.target.value)} />
              </label>
            </div>
          </div>
        )}

        {/* Adım 4: Reklam İçeriği */}
        {step === 4 && (
          <div className="step-panel">
            <h3>Reklam İçeriği</h3>
            <label>Başlık (maks. 60 karakter)
              <input maxLength={60} value={form.headline} placeholder="Dikkat çekici bir başlık"
                onChange={(e) => set("headline", e.target.value)} />
            </label>
            <label>Açıklama
              <textarea maxLength={200} rows={3} value={form.description} placeholder="Kısa bir açıklama..."
                onChange={(e) => set("description", e.target.value)} />
            </label>
            <label>CTA (Call to Action)
              <select value={form.cta} onChange={(e) => set("cta", e.target.value)}>
                {["Daha Fazla Bilgi", "Şimdi Al", "Kaydol", "Ziyaret Et", "İzle", "Takip Et"].map((c) =>
                  <option key={c}>{c}</option>
                )}
              </select>
            </label>
            <label><ImageIcon size={14} /> Medya URL (görsel/video)
              <input type="url" value={form.mediaUrl} placeholder="https://..."
                onChange={(e) => set("mediaUrl", e.target.value)} />
            </label>
            {form.mediaUrl && (
              <div className="ad-media-preview">
                <img src={form.mediaUrl} alt="önizleme" onError={(e) => ((e.target as any).style.display = "none")} />
              </div>
            )}
          </div>
        )}

        {/* Adım 5: Önizleme */}
        {step === 5 && (
          <div className="step-panel">
            <h3>Reklam Önizlemesi</h3>
            <p className="muted" style={{ marginBottom: 16 }}>Reklamınız feed'de bu şekilde görünecek:</p>
            <div className="ad-preview-card post">
              <div className="post-head">
                <strong>Saphara Reklamları</strong>
                <span className="muted">Sponsorlu</span>
              </div>
              {form.headline && <p style={{ fontWeight: 600 }}>{form.headline}</p>}
              {form.description && <p className="muted">{form.description}</p>}
              {form.mediaUrl && (
                <img className="post-media" src={form.mediaUrl} alt=""
                  onError={(e) => ((e.target as any).style.display = "none")} />
              )}
              {form.cta && (
                <button className="ad-cta-btn">{form.cta}</button>
              )}
            </div>
            <div className="campaign-summary">
              <div className="summary-row"><span>Hedef:</span><strong>{form.objective}</strong></div>
              <div className="summary-row"><span>Bütçe:</span><strong>{form.budgetPart} PART</strong></div>
              <div className="summary-row"><span>İlgi Alanları:</span><strong>{form.interests.join(", ") || "Tümü"}</strong></div>
            </div>
          </div>
        )}

        {/* Navigasyon */}
        <div className="step-nav">
          {step > 1 && (
            <button className="ghost-btn" onClick={() => setStep((s) => (s - 1) as Step)}>
              <ChevronLeft size={16} /> Geri
            </button>
          )}
          {step < 5 ? (
            <button className="primary-btn" onClick={() => setStep((s) => (s + 1) as Step)}
              disabled={step === 1 && !form.name}>
              İleri <ChevronRight size={16} />
            </button>
          ) : (
            <button className="primary-btn" onClick={submit} disabled={createCampaign.isPending}>
              {createCampaign.isPending
                ? <><Loader2 size={15} className="spin" /> Oluşturuluyor…</>
                : <><CheckCircle2 size={15} /> Kampanyayı Başlat</>}
            </button>
          )}
        </div>

        {createCampaign.isError && (
          <p className="muted" style={{ color: "var(--danger)", marginTop: 8 }}>
            <AlertCircle size={14} /> {(createCampaign.error as Error).message}
          </p>
        )}
      </div>
    </div>
  );
}
