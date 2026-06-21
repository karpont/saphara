"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Trophy, Flame, Star, Gift, CheckCircle2, Clock, Zap, Users, Target,
  Copy, Share2, TrendingUp, Calendar, Lock, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "../../lib/api";

function useGamificationStats() {
  return useQuery({ queryKey: ["gami-stats"], queryFn: () => api.get<any>("/gamification/stats"), staleTime: 30_000 });
}
function useQuests() {
  return useQuery({ queryKey: ["quests"], queryFn: () => api.get<any>("/gamification/quests"), staleTime: 30_000 });
}
function useLeaderboard() {
  return useQuery({ queryKey: ["leaderboard"], queryFn: () => api.get<any>("/gamification/leaderboard"), staleTime: 60_000 });
}

const KIND_LABEL: Record<string, string> = { daily: "Günlük", weekly: "Haftalık", achievement: "Başarım", onboarding: "Başlangıç" };
const KIND_COLOR: Record<string, string> = { daily: "#f0b429", weekly: "#818cf8", achievement: "#3fb950", onboarding: "#38bdf8" };

type GamiTab = "overview" | "quests" | "leaderboard" | "referral";

export function Gamification() {
  const [tab, setTab] = useState<GamiTab>("overview");
  const stats = useGamificationStats();
  const qc = useQueryClient();

  const dailyLogin = useMutation<{ partReward: number; xpReward: number }, Error>({
    mutationFn: () => api.post<{ partReward: number; xpReward: number }>("/gamification/daily-login", {}),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["gami-stats"] }); },
  });

  const s = stats.data;

  return (
    <div className="gami-page">
      <header className="topbar">
        <h1><Trophy size={20} /> Seviye & Ödüller</h1>
      </header>

      {/* Günlük giriş butonu */}
      <div className="daily-claim-banner">
        <Flame size={20} color="#f0b429" />
        <span>{s ? `${s.loginStreak} günlük seri 🔥` : "Yükleniyor..."}</span>
        <button
          className="primary-btn"
          onClick={() => dailyLogin.mutate()}
          disabled={dailyLogin.isPending}
        >
          {dailyLogin.isPending ? "..." : "Günlük Ödül Al"}
        </button>
        {dailyLogin.data && (
          <span className="gami-toast">+{dailyLogin.data.partReward} PART · +{dailyLogin.data.xpReward} XP ✓</span>
        )}
        {dailyLogin.isError && (
          <span className="gami-toast error">Bugün zaten aldınız ✓</span>
        )}
      </div>

      {/* Level bar */}
      {s && (
        <div className="level-card">
          <div className="level-header">
            <div className="level-badge">{s.level}</div>
            <div>
              <strong className="level-title">{s.levelTitle}</strong>
              <div className="muted" style={{ fontSize: 13 }}>{s.xp.toLocaleString()} XP · {s.xpToNext.toLocaleString()} XP'ye ihtiyaç</div>
            </div>
            <div style={{ marginLeft: "auto", textAlign: "right" }}>
              <div className="streak-badge"><Flame size={14} color="#f0b429" /> {s.loginStreak} gün</div>
            </div>
          </div>
          <div className="xp-bar-track">
            <div className="xp-bar-fill" style={{ width: `${Math.min(100, (s.xpProgress / s.xpForLevel) * 100).toFixed(1)}%` }} />
          </div>
          <div className="xp-bar-labels">
            <small className="muted">Seviye {s.level}</small>
            <small className="muted">{Math.round((s.xpProgress / s.xpForLevel) * 100)}%</small>
            <small className="muted">Seviye {s.level + 1}</small>
          </div>
        </div>
      )}

      {/* Sekmeler */}
      <div className="gami-tabs">
        {(["overview", "quests", "leaderboard", "referral"] as GamiTab[]).map(t => (
          <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>
            {t === "overview" && <><Zap size={14} /> Genel</>}
            {t === "quests" && <><Target size={14} /> Görevler</>}
            {t === "leaderboard" && <><TrendingUp size={14} /> Liderlik</>}
            {t === "referral" && <><Share2 size={14} /> Referans</>}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab />}
      {tab === "quests" && <QuestsTab />}
      {tab === "leaderboard" && <LeaderboardTab />}
      {tab === "referral" && <ReferralTab code={s?.referralCode} />}
    </div>
  );
}

/* ── Genel Bakış ── */
function OverviewTab() {
  const quests = useQuests();
  const items = quests.data?.quests ?? [];
  const completed = items.filter((q: any) => q.completed).length;
  const daily = items.filter((q: any) => q.kind === "daily");
  const achievements = items.filter((q: any) => q.kind === "achievement");

  return (
    <div className="gami-overview">
      <div className="gami-stat-grid">
        <div className="gami-stat-card">
          <CheckCircle2 size={24} color="#3fb950" />
          <div className="gami-stat-num">{completed}</div>
          <div className="gami-stat-label">Tamamlanan Görev</div>
        </div>
        <div className="gami-stat-card">
          <Target size={24} color="#f0b429" />
          <div className="gami-stat-num">{items.length}</div>
          <div className="gami-stat-label">Toplam Görev</div>
        </div>
        <div className="gami-stat-card">
          <Calendar size={24} color="#818cf8" />
          <div className="gami-stat-num">{daily.filter((q: any) => q.completed).length}/{daily.length}</div>
          <div className="gami-stat-label">Günlük Görev</div>
        </div>
        <div className="gami-stat-card">
          <Trophy size={24} color="#f0b429" />
          <div className="gami-stat-num">{achievements.filter((q: any) => q.completed).length}</div>
          <div className="gami-stat-label">Başarım</div>
        </div>
      </div>

      <h3 style={{ marginTop: 24, marginBottom: 12 }}>Sonraki Ödüller</h3>
      <div className="reward-milestones">
        {[5, 10, 20, 30, 50].map(lvl => (
          <div key={lvl} className="reward-milestone">
            <div className="milestone-level">Sv {lvl}</div>
            <div className="milestone-reward">
              {lvl === 5 && "🎁 20 PART"}
              {lvl === 10 && "👑 PART Supporter Unvanı"}
              {lvl === 20 && "💎 80 PART"}
              {lvl === 30 && "🚀 150 PART"}
              {lvl === 50 && "⚡ Efsane Unvanı"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Görevler ── */
function QuestsTab() {
  const quests = useQuests();
  const qc = useQueryClient();
  const claim = useMutation({
    mutationFn: (id: string) => api.post<any>(`/gamification/quests/${id}/claim`, {}),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["quests"] });
      qc.invalidateQueries({ queryKey: ["gami-stats"] });
      toast.success(`+${data?.xpReward ?? 0} XP${Number(data?.partReward) > 0 ? ` · +${data.partReward} PART` : ""} kazandın!`);
    },
    onError: (err) => toast.error((err as Error).message || "Ödül alınamadı, tekrar dene."),
  });

  const items: any[] = quests.data?.quests ?? [];
  const groups = ["onboarding", "daily", "weekly", "achievement"];

  return (
    <div className="quests-panel">
      {groups.map(kind => {
        const group = items.filter(q => q.kind === kind);
        if (!group.length) return null;
        return (
          <div key={kind} className="quest-group">
            <h4 style={{ color: KIND_COLOR[kind], marginBottom: 10 }}>
              {KIND_LABEL[kind]} Görevleri
            </h4>
            {group.map((q: any) => (
              <div key={q.id} className={`quest-card ${q.completed ? "completed" : ""}`}>
                <div className="quest-icon">{q.icon ?? "📋"}</div>
                <div className="quest-body">
                  <strong>{q.title}</strong>
                  <div className="muted" style={{ fontSize: 12 }}>{q.description}</div>
                  {q.target > 1 && (
                    <div className="quest-progress-bar">
                      <div className="quest-progress-fill" style={{ width: `${Math.min(100, (q.userProgress / q.target) * 100)}%` }} />
                    </div>
                  )}
                  <div className="quest-rewards">
                    <span><Zap size={11} color="#818cf8" /> {q.xpReward} XP</span>
                    {Number(q.partReward) > 0 && <span>· 🪙 {q.partReward} PART</span>}
                    {q.target > 1 && <span className="muted">· {q.userProgress}/{q.target}</span>}
                  </div>
                </div>
                <div className="quest-action">
                  {q.claimed ? (
                    <span className="quest-done"><CheckCircle2 size={18} color="#3fb950" /></span>
                  ) : q.completed ? (
                    <button className="primary-btn" style={{ padding: "4px 12px", fontSize: 12 }}
                      onClick={() => claim.mutate(q.id)} disabled={claim.isPending}>
                      Al
                    </button>
                  ) : (
                    <span className="quest-lock"><Lock size={16} color="#555" /></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

/* ── Liderlik Tablosu ── */
function LeaderboardTab() {
  const lb = useLeaderboard();
  const items = lb.data?.items ?? [];

  return (
    <div className="leaderboard-panel">
      <p className="muted" style={{ marginBottom: 16, fontSize: 13 }}>En fazla XP kazanan Saphara kullanıcıları</p>
      {items.map((u: any) => (
        <div key={u.handle} className={`lb-row ${u.rank <= 3 ? "lb-top" : ""}`}>
          <div className="lb-rank">
            {u.rank === 1 ? "🥇" : u.rank === 2 ? "🥈" : u.rank === 3 ? "🥉" : `#${u.rank}`}
          </div>
          <div className="lb-avatar">
            {u.avatarUrl
              ? <img src={u.avatarUrl} alt={u.handle} width={36} height={36} style={{ borderRadius: "50%", objectFit: "cover" }} />
              : <div className="lb-avatar-ph">{u.name?.[0] ?? "?"}</div>}
          </div>
          <div className="lb-info">
            <strong>{u.name}</strong>
            <div className="muted" style={{ fontSize: 12 }}>@{u.handle} · {u.levelTitle}</div>
          </div>
          <div className="lb-stats">
            <div><Zap size={12} color="#818cf8" /> {u.xp.toLocaleString()} XP</div>
            <div className="muted" style={{ fontSize: 11 }}>Sv {u.level}</div>
          </div>
        </div>
      ))}
      {!lb.isLoading && items.length === 0 && <p className="muted center">Henüz veri yok</p>}
    </div>
  );
}

/* ── Referans ── */
function ReferralTab({ code }: { code?: string }) {
  const qc = useQueryClient();
  const [inputCode, setInputCode] = useState("");
  const [copied, setCopied] = useState(false);
  const useCode = useMutation({
    mutationFn: (c: string) => api.post<any>("/gamification/referral/use", { code: c }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gami-stats"] }),
  });

  const refLink = code ? `https://saphara.io/join?ref=${code}` : "";

  const copy = () => {
    if (refLink) { navigator.clipboard.writeText(refLink); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  return (
    <div className="referral-panel">
      <div className="referral-hero">
        <Users size={40} color="#818cf8" />
        <h3>Arkadaşını Davet Et, PART Kazan!</h3>
        <p className="muted">Her başarılı davette <strong>1-50 PART</strong> kazan — ne kadar çok davet edersen birim ödülün o kadar artar (5. davette 1 PART, 50. davette 50 PART).<br />Davet ettiğin kişi de yarısı kadar hoş geldin ödülü alır.</p>
      </div>

      {code && (
        <div className="referral-code-box">
          <div className="referral-code">{code}</div>
          <button className="ghost-btn" onClick={copy} style={{ gap: 6 }}>
            <Copy size={14} /> {copied ? "Kopyalandı!" : "Kopyala"}
          </button>
        </div>
      )}

      {refLink && (
        <div className="referral-link">
          <input readOnly value={refLink} className="referral-link-input" />
          <button className="primary-btn" onClick={copy}>
            <Share2 size={14} /> Paylaş
          </button>
        </div>
      )}

      <div className="referral-divider">— Davet kodunu kullan —</div>

      <div className="referral-use">
        <input
          className="referral-input"
          placeholder="Referans kodunu gir (örn. AB12CD)"
          value={inputCode}
          onChange={e => setInputCode(e.target.value.toUpperCase())}
          maxLength={8}
        />
        <button className="primary-btn" disabled={inputCode.length < 4 || useCode.isPending}
          onClick={() => useCode.mutate(inputCode)}>
          {useCode.isPending ? "..." : "Uygula"}
        </button>
      </div>
      {useCode.isSuccess && (
        <p style={{ color: "#3fb950", marginTop: 8 }}>
          ✓ +{useCode.data?.partEarned ?? 0} PART ve +{useCode.data?.xpEarned ?? 0} XP kazandınız!
        </p>
      )}
      {useCode.isError && <p style={{ color: "var(--danger)", marginTop: 8 }}>{(useCode.error as Error).message}</p>}

      <div className="referral-steps">
        <h4 style={{ marginBottom: 12 }}>Nasıl Çalışır?</h4>
        {[
          { n: 1, text: "Referans linkini kopyala veya kodunu paylaş" },
          { n: 2, text: "Arkadaşın Saphara'ya kayıt olup kodu girer" },
          { n: 3, text: "Her ikiniz de anında ödül alırsınız" },
          { n: 4, text: "Daha fazla davet → daha fazla PART!" },
        ].map(s => (
          <div key={s.n} className="referral-step">
            <div className="referral-step-num">{s.n}</div>
            <div>{s.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
