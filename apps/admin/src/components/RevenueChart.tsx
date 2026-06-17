"use client";

import { useEffect, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { adApi } from "../lib/api";
import { TrendingUp, Loader2 } from "lucide-react";

/** Reklam veren gelir/harcama ozet grafikleri (kampanya verisinden). */
export function RevenueChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await adApi<{ items: any[] }>("/campaigns");
        // Kampanya bazli harcama/gosterim ozeti
        const rows = res.items.map((c: any) => ({
          name: c.name.slice(0, 12),
          harcama: Number(c.spentPart ?? 0),
          butce: Number(c.budgetPart ?? 0),
          gosterim: c.impressions ?? 0,
        }));
        setData(rows);
      } catch { /* sessiz */ }
      finally { setLoading(false); }
    })();
  }, []);

  // 7 gunluk harcama trendi (demo dagilim — gercekte gunluk kayittan)
  const trend = Array.from({ length: 7 }, (_, i) => ({
    gun: `G${i + 1}`,
    harcama: data.reduce((s, r) => s + r.harcama, 0) / 7 * (0.7 + Math.random() * 0.6),
  }));

  if (loading) return <Loader2 className="spin" />;

  return (
    <section style={{ marginTop: 28 }}>
      <h2 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 17, marginBottom: 14 }}>
        <TrendingUp size={18} /> Gelir & Harcama
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
          <h3 style={{ fontSize: 14, marginBottom: 12, color: "var(--muted)" }}>7 Gunluk Harcama (PART)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={trend}>
              <defs><linearGradient id="sp" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f0b429" stopOpacity={0.5} /><stop offset="100%" stopColor="#f0b429" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#262a36" />
              <XAxis dataKey="gun" stroke="#8b90a0" />
              <YAxis stroke="#8b90a0" />
              <Tooltip contentStyle={{ background: "#14161d", border: "1px solid #262a36" }} />
              <Area type="monotone" dataKey="harcama" stroke="#f0b429" fill="url(#sp)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
          <h3 style={{ fontSize: 14, marginBottom: 12, color: "var(--muted)" }}>Kampanya Butce vs Harcama</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262a36" />
              <XAxis dataKey="name" stroke="#8b90a0" />
              <YAxis stroke="#8b90a0" />
              <Tooltip contentStyle={{ background: "#14161d", border: "1px solid #262a36" }} />
              <Legend />
              <Bar dataKey="butce" fill="#5b8def" radius={[4, 4, 0, 0]} />
              <Bar dataKey="harcama" fill="#f0b429" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
