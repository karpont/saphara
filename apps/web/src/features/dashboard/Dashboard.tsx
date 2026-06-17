"use client";

import { useMemo } from "react";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { TrendingUp, Users, Eye, Coins, Heart, Loader2, DollarSign } from "lucide-react";
import { usePartBalance, useWallet } from "../../hooks/useWallet";
import { useMyAnalytics, useFollowerSeries } from "../../hooks/useApi";
import { config } from "@saphara/config";

export function Dashboard() {
  const w      = useWallet();
  const part   = usePartBalance(
    config.contracts.partToken !== "0x0000000000000000000000000000000000000000"
      ? config.contracts.partToken : undefined
  );
  const analytics      = useMyAnalytics();
  const followerSeries = useFollowerSeries();

  const data    = analytics.data;
  const fSeries = followerSeries.data ?? [];

  // Haftalık engagement serisi — API series verisinden
  const engageSeries = useMemo(() => {
    if (!data?.series) return [];
    return data.series.slice(-7).map((s, i) => ({
      gun: `G${i + 1}`,
      begeni: s.likes,
      yorum: s.comments,
      paylasim: s.reposts + (s.views > 0 ? Math.round(s.views / 20) : 0),
    }));
  }, [data?.series]);

  // Kazanç serisi (son 7 gün — her günün like'ından tahmin)
  const earnSeries = useMemo(() => {
    if (!data?.series) return [];
    return data.series.slice(-7).map((s, i) => ({
      gun: `G${i + 1}`,
      part: s.likes * 0.5 + s.views * 0.1,
    }));
  }, [data?.series]);

  // Follower series son 30 gün → kümülatif
  const followerCumulative = useMemo(() => {
    const base = (data?.followers ?? 0) - fSeries.reduce((s, d) => s + d.count, 0);
    let running = base;
    return fSeries.map((d) => {
      running += d.count;
      return { gun: d.date.slice(5), takipci: running };
    });
  }, [fSeries, data?.followers]);

  const er = data
    ? ((data.totalLikes / Math.max(1, data.impressions)) * 100).toFixed(1)
    : "0";

  if (analytics.isLoading) {
    return (
      <div className="dash">
        <header className="topbar"><h1>Dashboard</h1></header>
        <div className="feed-state"><Loader2 size={32} className="spin" /></div>
      </div>
    );
  }

  // API hata durumunda demo verisi göster
  const followers      = data?.followers      ?? 0;
  const followerDelta  = data?.followerDelta7d ?? 0;
  const impressions    = data?.impressions     ?? 0;
  const earningsPart   = data?.earningsPart    ?? 0;
  const earningsUsdt   = data?.earningsUsdt    ?? "0.00";

  return (
    <div className="dash">
      <header className="topbar">
        <h1>Dashboard</h1>
        {w.isConnected && (
          <span className="muted">{part.formatted.slice(0, 8)} PART · cüzdan bağlı</span>
        )}
      </header>

      {/* KPI Kartları */}
      <div className="dash-kpis">
        <KpiCard icon={Users}       label="Takipçi"        value={followers.toLocaleString()}
          delta={`${followerDelta >= 0 ? "+" : ""}${followerDelta} / 7g`} up={followerDelta >= 0} />
        <KpiCard icon={Eye}         label="Gösterim"       value={impressions > 1000 ? `${(impressions / 1000).toFixed(1)}K` : String(impressions)} />
        <KpiCard icon={Heart}       label="Etkileşim"      value={`%${er}`} />
        <KpiCard icon={Coins}       label="Kazanç (PART)"  value={earningsPart.toLocaleString()} accent />
        <KpiCard icon={DollarSign}  label="Kazanç (USDT)"  value={`$${Number(earningsUsdt).toFixed(2)}`} />
      </div>

      {/* Grafikler */}
      <div className="dash-grid">
        <Panel title="Takipçi Büyümesi (30 gün)" wide>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={followerCumulative.length > 0 ? followerCumulative : [{ gun: "—", takipci: followers }]}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f0b429" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#f0b429" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#262a36" />
              <XAxis dataKey="gun" stroke="#8b90a0" tick={{ fontSize: 11 }} />
              <YAxis stroke="#8b90a0" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#14161d", border: "1px solid #262a36" }} />
              <Area type="monotone" dataKey="takipci" stroke="#f0b429" fill="url(#g1)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Günlük Kazanç Tahmini (PART)">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={earnSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262a36" />
              <XAxis dataKey="gun" stroke="#8b90a0" />
              <YAxis stroke="#8b90a0" />
              <Tooltip contentStyle={{ background: "#14161d", border: "1px solid #262a36" }} />
              <Line type="monotone" dataKey="part" stroke="#3fb950" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Etkileşim Dağılımı (7 gün)">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={engageSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262a36" />
              <XAxis dataKey="gun" stroke="#8b90a0" />
              <YAxis stroke="#8b90a0" />
              <Tooltip contentStyle={{ background: "#14161d", border: "1px solid #262a36" }} />
              <Bar dataKey="begeni"   stackId="a" fill="#f0b429" name="Beğeni" />
              <Bar dataKey="yorum"    stackId="a" fill="#5b8def" name="Yorum" />
              <Bar dataKey="paylasim" stackId="a" fill="#3fb950" radius={[4, 4, 0, 0]} name="Paylaşım" />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {analytics.isError && (
        <p className="muted" style={{ textAlign: "center", padding: 16, fontSize: 13 }}>
          API bağlantısı yok — veriler çevrimiçi olunca yüklenir.
        </p>
      )}
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, delta, up, accent }: {
  icon: any; label: string; value: string; delta?: string; up?: boolean; accent?: boolean;
}) {
  return (
    <div className={`dash-kpi ${accent ? "accent" : ""}`}>
      <div className="dash-kpi-top"><Icon size={18} /><span>{label}</span></div>
      <div className="dash-kpi-val">{value}</div>
      {delta && <div className={`dash-kpi-delta ${up ? "up" : ""}`}><TrendingUp size={13} /> {delta}</div>}
    </div>
  );
}

function Panel({ title, children, wide }: { title: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <section className={`dash-panel ${wide ? "wide" : ""}`}>
      <h3>{title}</h3>
      {children}
    </section>
  );
}
