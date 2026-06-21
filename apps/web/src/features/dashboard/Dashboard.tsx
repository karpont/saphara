"use client";

import { useMemo } from "react";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell,
} from "recharts";
import { TrendingUp, Users, Eye, Coins, Heart, Loader2, DollarSign, Wallet as WalletIcon, Image as ImageIcon } from "lucide-react";
import { usePartBalance, useWallet } from "../../hooks/useWallet";
import { useMyAnalytics, useFollowerSeries, useMyNfts, usePartPrice, useBnbData } from "../../hooks/useApi";
import { useAuth } from "../auth/AuthContext";
import { WalletConnectSection } from "../auth/WalletConnectSection";
import { config } from "@saphara/config";
import { formatUnits } from "viem";

export function Dashboard() {
  const w      = useWallet();
  const auth   = useAuth();
  const part   = usePartBalance(
    config.contracts.partToken !== "0x0000000000000000000000000000000000000000"
      ? config.contracts.partToken : undefined
  );
  const analytics      = useMyAnalytics();
  const followerSeries = useFollowerSeries();
  const myNfts          = useMyNfts();
  const partPrice       = usePartPrice();
  const bnbData         = useBnbData();

  const partUsdValue = Number(part.formatted || 0) * (partPrice.data?.partUsdRate ?? 0.01);
  const bnbUsdValue  = w.nativeBalance
    ? Number(formatUnits(w.nativeBalance.value, w.nativeBalance.decimals)) * (bnbData.data?.priceUsd ?? 600)
    : 0;
  const portfolioData = [
    { name: "PART", value: partUsdValue, color: "#f0b429" },
    { name: w.nativeBalance?.symbol ?? "BNB", value: bnbUsdValue, color: "#fbbf24" },
  ].filter((d) => d.value > 0);
  const totalUsdValue = partUsdValue + bnbUsdValue;

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

      {/* Varlıklarım — gerçek cüzdan bakiyesi + NFT'ler */}
      <section className="dash-panel wide" style={{ marginBottom: 16 }}>
        <h3><WalletIcon size={16} style={{ verticalAlign: "-2px", marginRight: 6 }} /> Varlıklarım</h3>
        {!w.isConnected ? (
          <div style={{ padding: "12px 0" }}>
            <p className="muted" style={{ marginBottom: 10, fontSize: 13 }}>
              Coin ve NFT varlıklarını görmek için cüzdanını bağla.
            </p>
            <WalletConnectSection auth={auth} />
          </div>
        ) : (
          <div className="dash-holdings">
            <div className="holding-row">
              <div className="holding-item">
                <span className="muted" style={{ fontSize: 12 }}>PART</span>
                <strong>{Number(part.formatted || 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}</strong>
              </div>
              <div className="holding-item">
                <span className="muted" style={{ fontSize: 12 }}>{w.nativeBalance?.symbol ?? "BNB"}</span>
                <strong>
                  {w.nativeBalance ? Number(formatUnits(w.nativeBalance.value, w.nativeBalance.decimals)).toFixed(4) : "0"}
                </strong>
              </div>
              <div className="holding-item">
                <span className="muted" style={{ fontSize: 12 }}>NFT</span>
                <strong>{myNfts.data?.tokens?.length ?? 0}</strong>
              </div>
              <div className="holding-item">
                <span className="muted" style={{ fontSize: 12 }}>Toplam Değer</span>
                <strong>${totalUsdValue.toFixed(2)}</strong>
              </div>
            </div>

            {portfolioData.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <ResponsiveContainer width={90} height={90}>
                  <PieChart>
                    <Pie data={portfolioData} dataKey="value" nameKey="name" innerRadius={22} outerRadius={40} paddingAngle={2}>
                      {portfolioData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} contentStyle={{ background: "#14161d", border: "1px solid #262a36", fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
                  {portfolioData.map((d) => (
                    <span key={d.name}>
                      <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: d.color, marginRight: 5 }} />
                      {d.name}: ${d.value.toFixed(2)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {myNfts.isLoading ? (
              <Loader2 size={20} className="spin" style={{ marginTop: 10 }} />
            ) : (myNfts.data?.tokens?.length ?? 0) > 0 ? (
              <div className="nft-grid">
                {myNfts.data!.tokens.slice(0, 8).map((tk: any) => (
                  <a key={tk.id} href="/nft" className="nft-thumb">
                    {tk.imageUrl ? <img src={tk.imageUrl} alt={tk.name ?? "NFT"} /> : <ImageIcon size={20} />}
                    <span>{tk.collection?.symbol ?? tk.name ?? "NFT"}</span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="muted" style={{ fontSize: 13, marginTop: 8 }}>
                Henüz NFT'in yok. <a href="/nft">NFT pazarına göz at →</a>
              </p>
            )}
          </div>
        )}
        <style>{`
          .holding-row { display: flex; gap: 24px; margin-bottom: 12px; flex-wrap: wrap; }
          .holding-item { display: flex; flex-direction: column; gap: 2px; }
          .holding-item strong { font-size: 18px; }
          .nft-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(72px, 1fr)); gap: 8px; max-width: 480px; }
          .nft-thumb { display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 10px; color: var(--muted); text-decoration: none; }
          .nft-thumb img { width: 56px; height: 56px; border-radius: 8px; object-fit: cover; }
        `}</style>
      </section>

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
