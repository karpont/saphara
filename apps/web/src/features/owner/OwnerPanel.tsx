"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ShieldCheck, Activity, AlertTriangle, CheckCircle2, XCircle,
  TrendingUp, DollarSign, Users, Bot, Loader2, RefreshCw, Download,
  Lock, Ban, Trash2, BellOff, Play, Pause, Eye, Zap,
} from "lucide-react";
import { useIsOwner, usePartPrice, useSetPartPrice, useOwnerUsers } from "../../hooks/useApi";
import { api } from "../../lib/api";

/* ── Sentinel hook'ları ─────────────────────────────────────────────── */
function useSentinelReport() {
  return useQuery({
    queryKey: ["sentinel-report"],
    queryFn: () => api.get<any>("/admin/sentinel/report"),
    refetchInterval: 60_000,
    retry: 1,
  });
}
function useSentinelStats() {
  return useQuery({
    queryKey: ["sentinel-stats"],
    queryFn: () => api.get<any>("/admin/sentinel/stats"),
    refetchInterval: 30_000,
    retry: 1,
  });
}
function useSentinelAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ action, target }: { action: string; target: string }) =>
      api.post<any>("/admin/sentinel/action", { action, target }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sentinel-report"] });
      qc.invalidateQueries({ queryKey: ["sentinel-stats"] });
    },
  });
}
function useSentinelScan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<any>("/admin/sentinel/scan", {}),
    onSuccess: (data) => qc.setQueryData(["sentinel-report"], data),
  });
}
function useBlockedIPs() {
  return useQuery({
    queryKey: ["blocked-ips"],
    queryFn: () => api.get<{ ips: string[] }>("/admin/sentinel/blocked-ips"),
  });
}

/* ── Ana panel ──────────────────────────────────────────────────────── */
export function OwnerPanel() {
  const owner = useIsOwner();
  const [tab, setTab] = useState<"monitor" | "ads" | "users" | "price">("monitor");

  if (owner.isLoading) return <div className="feed-state"><Loader2 size={28} className="spin" /></div>;
  if (!owner.data?.isOwner) {
    return (
      <div className="feed-state error" style={{ padding: 60 }}>
        <ShieldCheck size={32} /><br />
        Bu panel yalnızca platform sahibine açıktır.<br />
        <small className="muted">Ana hesap cüzdanıyla giriş yapmalısın.</small>
      </div>
    );
  }

  return (
    <div className="owner">
      <header className="topbar">
        <h1><Bot size={20} /> AI Gözetleme Motoru</h1>
      </header>

      <div className="gami-tabs" style={{ marginBottom: 16 }}>
        <button className={tab === "monitor" ? "on" : ""} onClick={() => setTab("monitor")}>
          <Activity size={14} /> Monitor
        </button>
        <button className={tab === "ads" ? "on" : ""} onClick={() => setTab("ads")}>
          <Zap size={14} /> Reklamlar
        </button>
        <button className={tab === "users" ? "on" : ""} onClick={() => setTab("users")}>
          <Users size={14} /> Kullanıcılar
        </button>
        <button className={tab === "price" ? "on" : ""} onClick={() => setTab("price")}>
          <DollarSign size={14} /> PART Fiyat
        </button>
      </div>

      {tab === "monitor" && <AIMonitor />}
      {tab === "ads"     && <AdManager />}
      {tab === "users"   && <UserModeration />}
      {tab === "price"   && <PriceControl />}
    </div>
  );
}

/* ── AI Monitor ─────────────────────────────────────────────────────── */
function AIMonitor() {
  const report  = useSentinelReport();
  const stats   = useSentinelStats();
  const scan    = useSentinelScan();
  const action  = useSentinelAction();
  const blocked = useBlockedIPs();
  const [actionMsg, setActionMsg] = useState("");

  const r = report.data;
  const s = stats.data;

  const doAction = (act: string, target: string) => {
    action.mutate({ action: act, target }, {
      onSuccess: (d) => setActionMsg(d.msg ?? "Yapıldı"),
      onError: (e) => setActionMsg((e as Error).message),
    });
  };

  const downloadReport = () => {
    if (!r) return;
    const blob = new Blob([JSON.stringify(r, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `saphara-rapor-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Araç çubuğu */}
      <div className="bot-toolbar">
        <button className="ghost-btn" disabled={scan.isPending} onClick={() => scan.mutate()}>
          <RefreshCw size={15} className={scan.isPending ? "spin" : ""} /> Anlık Tara
        </button>
        <button className="ghost-btn" onClick={downloadReport} disabled={!r}>
          <Download size={15} /> Raporu İndir
        </button>
        {actionMsg && <span className="launch-msg" style={{ color: "#3fb950" }}>{actionMsg}</span>}
      </div>

      {/* Özet banner */}
      {r && (
        <div className={`bot-summary ${r.issues?.some((i: any) => i.severity === "critical") ? "crit" : "ok"}`}>
          <Activity size={20} /> {r.summary}
          <small>Son tarama: {new Date(r.generatedAt).toLocaleTimeString("tr-TR")}</small>
        </div>
      )}

      {/* Canlı istatistikler */}
      {s && (
        <>
          <h3><Eye size={15} /> Canlı İstatistikler</h3>
          <div className="stat-grid">
            {[
              ["totalUsers",      "Kullanıcı"],
              ["totalPosts",      "Gönderi"],
              ["totalReels",      "Reels"],
              ["activeCampaigns", "Aktif Reklam"],
              ["totalTips",       "Bahşiş"],
              ["totalMessages",   "Mesaj"],
              ["newUsers24h",     "Yeni (24s)"],
              ["newPosts24h",     "Yeni Gönderi (24s)"],
              ["blockedIPs",      "Engellenen IP"],
            ].map(([k, lbl]) => (
              <div key={k} className="stat-card">
                <span className="stat-num">{Number((s as any)[k] ?? 0).toLocaleString("tr-TR")}</span>
                <span className="stat-lbl">{lbl}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Sistem sağlığı */}
      {r?.health && (
        <>
          <h3><CheckCircle2 size={15} /> Sistem Sağlığı</h3>
          <div className="health-grid">
            {r.health.map((h: any) => (
              <div key={h.name} className={`health-card ${h.ok ? "ok" : "fail"}`}>
                {h.ok ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                <span>{h.name}</span>
                {h.latencyMs != null && <small>{h.latencyMs}ms</small>}
                {h.detail && <small className="muted">{h.detail}</small>}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Tespitler & Öneriler */}
      {r?.issues && (
        <>
          <h3><AlertTriangle size={15} /> Tespitler & Öneriler</h3>
          <div className="issues">
            {r.issues.length === 0 && <p className="muted">Tespit yok — her şey yolunda.</p>}
            {r.issues.map((i: any) => (
              <div key={i.id} className={`issue ${i.severity}`}>
                <div className="issue-head">
                  {i.severity === "critical"
                    ? <AlertTriangle size={15} color="#f85149" />
                    : i.severity === "warning"
                      ? <AlertTriangle size={15} color="#f0b429" />
                      : <TrendingUp size={15} color="#3fb950" />}
                  <strong>{i.title}</strong>
                </div>
                <p className="issue-detail">{i.detail}</p>
                <p className="issue-suggestion"><Bot size={12} /> {i.suggestion}</p>
                {/* Eylem butonları */}
                {i.actionable?.startsWith("block_ip:") && (
                  <button className="ghost-btn danger-icon" style={{ marginTop: 6 }}
                    onClick={() => doAction("block_ip", i.actionable.replace("block_ip:", ""))}>
                    <Ban size={13} /> IP Engelle
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Güvenlik olayları */}
      {r?.recentSecurityEvents?.length > 0 && (
        <>
          <h3><Lock size={15} /> Son Güvenlik Olayları</h3>
          <div className="error-log security-log">
            {r.recentSecurityEvents.map((e: any, i: number) => (
              <div key={i} className="err-row">
                <span className="err-lvl warning">{e.type}</span>
                {e.ip && (
                  <span className="muted" style={{ marginRight: 6 }}>
                    {e.ip}
                    <button className="ghost-btn danger-icon" style={{ padding: "1px 6px", marginLeft: 4 }}
                      onClick={() => doAction("block_ip", e.ip)}>
                      <Ban size={11} />
                    </button>
                  </span>
                )}
                {e.detail}
                <small className="muted" style={{ marginLeft: 8 }}>
                  {new Date(e.at).toLocaleTimeString("tr-TR")}
                </small>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Engellenen IP'ler */}
      {(blocked.data?.ips?.length ?? 0) > 0 && (
        <>
          <h3><Ban size={15} /> Engellenen IP'ler ({blocked.data!.ips.length})</h3>
          <div className="error-log">
            {blocked.data!.ips.map((ip) => (
              <div key={ip} className="err-row">
                <span>{ip}</span>
                <button className="ghost-btn" style={{ padding: "1px 8px", marginLeft: 8 }}
                  onClick={() => doAction("unblock_ip", ip)}>
                  Kaldır
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Son hatalar */}
      {r?.recentErrors?.length > 0 && (
        <>
          <h3>Son Hatalar</h3>
          <div className="error-log">
            {r.recentErrors.map((e: any, i: number) => (
              <div key={i} className="err-row">
                <span className={`err-lvl ${e.level}`}>{e.level}</span> {e.msg}
                <small className="muted" style={{ marginLeft: 8 }}>
                  {new Date(e.at).toLocaleTimeString("tr-TR")}
                </small>
              </div>
            ))}
          </div>
        </>
      )}

      {(report.isLoading || stats.isLoading) && (
        <div className="feed-state"><Loader2 size={24} className="spin" /><p>Sistem taranıyor…</p></div>
      )}
    </div>
  );
}

/* ── Reklam Yönetimi (owner gözünden) ─────────────────────────────────── */
function AdManager() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["owner-campaigns"],
    queryFn: () => api.get<{ items: any[] }>("/ads/campaigns"),
  });
  const action = useSentinelAction();
  const [msg, setMsg] = useState("");

  const endCampaign = (id: string) => {
    action.mutate({ action: "end_campaign", target: id }, {
      onSuccess: () => { setMsg("Kampanya sonlandırıldı"); refetch(); },
      onError: (e) => setMsg((e as Error).message),
    });
  };

  if (isLoading) return <div className="feed-state"><Loader2 size={24} className="spin" /></div>;

  return (
    <section className="owner-section">
      <div className="bot-toolbar">
        <button className="ghost-btn" onClick={() => refetch()}><RefreshCw size={14} /> Yenile</button>
        {msg && <span className="launch-msg" style={{ color: "#3fb950" }}>{msg}</span>}
      </div>
      <h3><Zap size={15} /> Tüm Kampanyalar ({data?.items?.length ?? 0})</h3>
      <div className="user-table">
        {(data?.items ?? []).map((c: any) => (
          <div key={c.id} className="user-row" style={{ flexWrap: "wrap", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <strong>{c.name}</strong>
              <small className="muted" style={{ display: "block" }}>
                {c.objective} · {c.impressions} gösterim · {c.clicks} tıklama
              </small>
              <small className="muted">
                Bütçe: {c.budgetPart} PART · Kalan: {c.budgetRemaining} PART
              </small>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span className={`badge-pill ${c.status === "active" ? "ok" : c.status === "paused" ? "warn" : "muted"}`}>
                {c.status === "active" ? <Play size={11} /> : <Pause size={11} />} {c.status}
              </span>
              {c.status !== "ended" && (
                <button className="ghost-btn danger-icon" style={{ padding: "4px 8px" }}
                  onClick={() => endCampaign(c.id)}>
                  <Trash2 size={13} /> Sonlandır
                </button>
              )}
            </div>
          </div>
        ))}
        {!data?.items?.length && <p className="muted">Kampanya yok</p>}
      </div>
    </section>
  );
}

/* ── Kullanıcı Moderasyon ───────────────────────────────────────────── */
function UserModeration() {
  const users  = useOwnerUsers();
  const action = useSentinelAction();
  const [msg, setMsg] = useState("");

  const doAction = (act: string, target: string) => {
    action.mutate({ action: act, target }, {
      onSuccess: (d) => setMsg(d.msg ?? "Yapıldı"),
      onError: (e) => setMsg((e as Error).message),
    });
  };

  return (
    <section className="owner-section">
      {msg && <div className="launch-msg" style={{ color: "#3fb950", marginBottom: 8 }}>{msg}</div>}
      <h3><Users size={16} /> Kullanıcılar (son 50)</h3>
      {users.isLoading && <Loader2 className="spin" />}
      <div className="user-table">
        {(users.data?.users ?? []).map((u: any) => (
          <div key={u.id} className="user-row">
            <div style={{ flex: 1 }}>
              <span>@{u.handle} {u.verified && <ShieldCheck size={13} className="verified" />}</span>
              <small className="muted" style={{ display: "block" }}>
                {u._count?.posts ?? 0} gönderi · {u._count?.followers ?? 0} takipçi
              </small>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="ghost-btn" style={{ padding: "4px 8px" }}
                onClick={() => doAction("warn_user", u.id)} title="Kullanıcıyı uyar">
                <BellOff size={13} />
              </button>
              <button className="ghost-btn danger-icon" style={{ padding: "4px 8px" }}
                onClick={() => doAction("suspend_user", u.id)} title="Hesabı askıya al">
                <Ban size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── PART Fiyat Kontrolü ────────────────────────────────────────────── */
function PriceControl() {
  const price    = usePartPrice();
  const setPrice = useSetPartPrice();
  const [val, setVal] = useState("");
  const [msg, setMsg] = useState("");

  const current = price.data?.partUsdRate ?? 0.01;
  const floor   = price.data?.floor ?? 0.01;

  const save = () => {
    const r = Number(val);
    if (!Number.isFinite(r) || r < floor) { setMsg(`Taban ${floor} altında olamaz`); return; }
    setPrice.mutate(r, {
      onSuccess: () => setMsg(`Fiyat güncellendi: $${r}/PART`),
      onError: (e) => setMsg((e as Error).message),
    });
  };

  return (
    <section className="owner-section">
      <h3><DollarSign size={18} /> PART Fiyat Yönetimi</h3>
      <div className="price-control">
        <div className="price-current">
          <span className="muted">Güncel</span>
          <strong>${current} / PART</strong>
          <small className="muted">Taban: ${floor} · Yukarı serbest</small>
        </div>
        <div className="price-edit">
          <input type="number" step="0.01" min={floor} placeholder={`Yeni fiyat (min ${floor})`}
            value={val} onChange={(e) => setVal(e.target.value)} />
          <button className="primary-btn" disabled={setPrice.isPending} onClick={save}>
            {setPrice.isPending ? "Kaydediliyor…" : "Fiyatı Güncelle"}
          </button>
        </div>
      </div>
      {msg && (
        <p className="launch-msg" style={{ color: msg.includes("güncellendi") ? "#3fb950" : "var(--danger)" }}>
          {msg}
        </p>
      )}
      <p className="muted" style={{ fontSize: 13, marginTop: 8 }}>
        Fiyat değişince mağazadaki ~$ referanslı ürünlerin PART karşılığı otomatik güncellenir.
        PART Contract: <code>0xD95aC89029451c57Adf172192176d7264d49305a</code>
      </p>
    </section>
  );
}
