"use client";

import { useState, useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import { estimatePerformance, type Campaign } from "../lib/campaign";
import { adApi } from "../lib/api";
import { CampaignList } from "./CampaignList";
import { RevenueChart } from "./RevenueChart";

const OBJECTIVES = [
  { id: "awareness", label: "Bilinirlik" },
  { id: "traffic", label: "Trafik" },
  { id: "conversions", label: "Donusum" },
  { id: "creator_collab", label: "Fenomen Isbirligi" },
] as const;

// Demo zaman serisi (gercekte API'den)
const SERIES = Array.from({ length: 7 }, (_, i) => ({
  gun: `G${i + 1}`,
  gosterim: 4000 + Math.round(Math.random() * 6000),
  tiklama: 80 + Math.round(Math.random() * 220),
}));

export function AdvertiserPanel() {
  const [form, setForm] = useState<Campaign>({
    id: "draft", name: "", objective: "creator_collab",
    budgetPart: 50000, bidPart: 5,
    targeting: { interests: [], minFollowers: 10000, geo: ["TR"], ageRange: [18, 45] },
    creative: { mediaUrl: "", headline: "", cta: "Kesfet" },
  });

  const est = useMemo(() => estimatePerformance(form), [form]);
  const [launchState, setLaunchState] = useState<"idle"|"saving"|"done"|"error">("idle");
  const [launchMsg, setLaunchMsg] = useState("");

  const launch = async () => {
    if (!form.name.trim()) { setLaunchState("error"); setLaunchMsg("Kampanya adi gerekli"); return; }
    setLaunchState("saving"); setLaunchMsg("Kaydediliyor…");
    try {
      await adApi("/campaigns", {
        method: "POST",
        body: JSON.stringify({
          name: form.name, objective: form.objective,
          budgetPart: form.budgetPart, bidPart: form.bidPart,
          interests: form.targeting.interests, minFollowers: form.targeting.minFollowers,
          geo: form.targeting.geo, headline: form.creative.headline, cta: form.creative.cta,
        }),
      });
      setLaunchState("done"); setLaunchMsg("Kampanya olusturuldu ✓");
    } catch (e) {
      setLaunchState("error"); setLaunchMsg((e as Error).message);
    }
  };
  const set = (patch: Partial<Campaign>) => setForm((f) => ({ ...f, ...patch }));
  const setTarget = (patch: Partial<Campaign["targeting"]>) =>
    setForm((f) => ({ ...f, targeting: { ...f.targeting, ...patch } }));

  return (
    <div className="ad-shell">
      <aside className="ad-side">
        <div className="ad-brand">Saphara Ads</div>
        <nav>
          <a className="active">Kampanyalar</a>
          <a>Hedef Kitle</a>
          <a>Yaraticilar</a>
          <a>Faturalama (PART)</a>
          <a>Raporlar</a>
        </nav>
      </aside>

      <main className="ad-main">
        <h1>Yeni Kampanya</h1>

        {/* Metrik kartlari */}
        <div className="kpi-row">
          <Kpi label="Tahmini Gosterim" value={est.estImpressions.toLocaleString()} />
          <Kpi label="Tahmini Tiklama" value={est.estClicks.toLocaleString()} />
          <Kpi label="Tahmini CTR" value={`${(est.estCtr * 100).toFixed(2)}%`} />
          <Kpi label="Butce" value={`${form.budgetPart.toLocaleString()} PART`} accent />
        </div>

        <div className="ad-cols">
          {/* Form */}
          <section className="ad-card">
            <h2>Kampanya Ayarlari</h2>

            <label>Kampanya Adi
              <input value={form.name} placeholder="orn. Yaz Lansmani"
                onChange={(e) => set({ name: e.target.value })} />
            </label>

            <label>Hedef
              <div className="chips">
                {OBJECTIVES.map((o) => (
                  <button key={o.id}
                    className={form.objective === o.id ? "chip on" : "chip"}
                    onClick={() => set({ objective: o.id })}>
                    {o.label}
                  </button>
                ))}
              </div>
            </label>

            <div className="row2">
              <label>Butce (PART)
                <input type="number" value={form.budgetPart}
                  onChange={(e) => set({ budgetPart: Number(e.target.value) })} />
              </label>
              <label>Teklif / 1000 gosterim (PART)
                <input type="number" value={form.bidPart}
                  onChange={(e) => set({ bidPart: Number(e.target.value) })} />
              </label>
            </div>

            {form.objective === "creator_collab" && (
              <label>Min. Takipci (fenomen hedefleme)
                <input type="number" value={form.targeting.minFollowers ?? 0}
                  onChange={(e) => setTarget({ minFollowers: Number(e.target.value) })} />
              </label>
            )}

            <label>Ilgi Alanlari (virgulle)
              <input placeholder="crypto, muzik, oyun"
                onChange={(e) => setTarget({ interests: e.target.value.split(",").map((s) => s.trim()) })} />
            </label>

            <label>Reklam Basligi
              <input value={form.creative.headline} placeholder="Dikkat ceken baslik"
                onChange={(e) => set({ creative: { ...form.creative, headline: e.target.value } })} />
            </label>

            <button className="ad-submit" onClick={launch} disabled={launchState === "saving"}>
              {launchState === "saving" ? "Kaydediliyor…" : "Kampanyayi Baslat"}
            </button>
            {launchMsg && <p className={`launch-msg ${launchState}`}>{launchMsg}</p>}
          </section>

          {/* Grafikler + onizleme */}
          <section className="ad-card">
            <h2>Performans (son 7 gun)</h2>
            <div className="chart">
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={SERIES}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262a36" />
                  <XAxis dataKey="gun" stroke="#8b90a0" />
                  <YAxis stroke="#8b90a0" />
                  <Tooltip contentStyle={{ background: "#14161d", border: "1px solid #262a36" }} />
                  <Line type="monotone" dataKey="gosterim" stroke="#f0b429" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="chart">
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={SERIES}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262a36" />
                  <XAxis dataKey="gun" stroke="#8b90a0" />
                  <YAxis stroke="#8b90a0" />
                  <Tooltip contentStyle={{ background: "#14161d", border: "1px solid #262a36" }} />
                  <Bar dataKey="tiklama" fill="#5b8def" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <h3>Onizleme</h3>
            <div className="ad-preview">
              <div className="ad-preview-media" />
              <strong>{form.creative.headline || "Reklam basligi"}</strong>
              <button className="ad-cta">{form.creative.cta}</button>
            </div>
          </section>
        </div>
        <CampaignList />
        <RevenueChart />
      </main>
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`kpi ${accent ? "accent" : ""}`}>
      <span className="kpi-label">{label}</span>
      <span className="kpi-value">{value}</span>
    </div>
  );
}
