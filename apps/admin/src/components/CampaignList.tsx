"use client";

import { useEffect, useState } from "react";
import { adApi } from "../lib/api";
import { Pause, Play, BarChart3, Loader2 } from "lucide-react";

interface Campaign {
  id: string; name: string; objective: string; status: string;
  budgetPart: string; spentPart: string; impressions: number; clicks: number;
}

/** Reklam veren kampanya listesi + raporlama. */
export function CampaignList() {
  const [items, setItems] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setLoading(true); setErr("");
    try {
      const res = await adApi<{ items: Campaign[] }>("/campaigns");
      setItems(res.items);
    } catch (e) { setErr((e as Error).message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const toggle = async (c: Campaign) => {
    const next = c.status === "active" ? "paused" : "active";
    try {
      await adApi(`/campaigns/${c.id}/status`, { method: "POST", body: JSON.stringify({ status: next }) });
      setItems((arr) => arr.map((x) => (x.id === c.id ? { ...x, status: next } : x)));
    } catch (e) { setErr((e as Error).message); }
  };

  const ctr = (c: Campaign) => (c.impressions ? ((c.clicks / c.impressions) * 100).toFixed(2) : "0.00");

  return (
    <section style={{ marginTop: 28 }}>
      <h2 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 17, marginBottom: 14 }}>
        <BarChart3 size={18} /> Kampanyalarim
      </h2>
      {loading && <Loader2 className="spin" />}
      {err && <p style={{ color: "var(--danger)" }}>{err}</p>}
      {!loading && items.length === 0 && <p style={{ color: "var(--muted)" }}>Henuz kampanya yok. Yukaridan olustur.</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((c) => (
          <div key={c.id} style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 12, padding: 16, display: "grid",
            gridTemplateColumns: "1fr auto auto auto auto auto", gap: 16, alignItems: "center",
          }}>
            <div>
              <strong>{c.name}</strong>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{c.objective}</div>
            </div>
            <Metric label="Butce" value={`${Number(c.budgetPart).toLocaleString()} P`} />
            <Metric label="Harcama" value={`${Number(c.spentPart ?? 0).toLocaleString()} P`} />
            <Metric label="Gosterim" value={c.impressions.toLocaleString()} />
            <Metric label="CTR" value={`%${ctr(c)}`} />
            <button onClick={() => toggle(c)} style={{
              display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px",
              border: "1px solid var(--border)", borderRadius: 999, cursor: "pointer",
              background: c.status === "active" ? "var(--surface-2)" : "var(--accent)",
              color: c.status === "active" ? "var(--text)" : "#1a1300",
            }}>
              {c.status === "active" ? <><Pause size={14} /> Duraklat</> : <><Play size={14} /> Devam</>}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 11, color: "var(--muted)" }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 700 }}>{value}</div>
    </div>
  );
}
