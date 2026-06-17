"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Plus, Search, Lock, Globe, UserPlus, UserMinus, ChevronRight, Loader2, X } from "lucide-react";
import { api } from "../../lib/api";

function useCommunities(q?: string) {
  return useQuery({
    queryKey: ["communities", q],
    queryFn: () => api.get<any>(`/communities${q ? `?q=${encodeURIComponent(q)}` : ""}`),
    staleTime: 30_000,
  });
}
function useMyCommunities() {
  return useQuery({ queryKey: ["my-communities"], queryFn: () => api.get<any>("/communities/my/list"), staleTime: 30_000 });
}

type CTab = "discover" | "mine" | "create";

export function Communities() {
  const [tab, setTab] = useState<CTab>("discover");
  const [q, setQ] = useState("");
  const qc = useQueryClient();

  const join = useMutation({
    mutationFn: (slug: string) => api.post<any>(`/communities/${slug}/join`, {}),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["communities"] }); qc.invalidateQueries({ queryKey: ["my-communities"] }); },
  });

  return (
    <div className="communities-page">
      <header className="topbar">
        <h1><Users size={20} /> Topluluklar</h1>
        <button className="primary-btn" onClick={() => setTab("create")}>
          <Plus size={15} /> Yeni
        </button>
      </header>

      <div className="gami-tabs">
        <button className={tab === "discover" ? "on" : ""} onClick={() => setTab("discover")}>
          <Globe size={14} /> Keşfet
        </button>
        <button className={tab === "mine" ? "on" : ""} onClick={() => setTab("mine")}>
          <Users size={14} /> Topluluklarım
        </button>
        <button className={tab === "create" ? "on" : ""} onClick={() => setTab("create")}>
          <Plus size={14} /> Oluştur
        </button>
      </div>

      {tab === "discover" && (
        <>
          <div className="discover-search" style={{ margin: "12px 0" }}>
            <Search size={16} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Topluluk ara..." />
          </div>
          <CommunityList q={q} onJoin={slug => join.mutate(slug)} />
        </>
      )}
      {tab === "mine" && <MyCommunities />}
      {tab === "create" && <CreateCommunity onDone={() => setTab("mine")} />}
    </div>
  );
}

function CommunityList({ q, onJoin }: { q: string; onJoin: (slug: string) => void }) {
  const { data, isLoading } = useCommunities(q.length >= 2 ? q : undefined);
  const items = data?.items ?? [];

  if (isLoading) return <div className="feed-state"><Loader2 size={28} className="spin" /></div>;
  if (!items.length) return <div className="empty-state"><p className="muted">Topluluk bulunamadı</p></div>;

  return (
    <div className="community-list">
      {items.map((c: any) => (
        <div key={c.id} className="community-card">
          <div className="community-img">
            {c.imageUrl
              ? <img src={c.imageUrl} alt={c.name} />
              : <div className="community-img-ph">{c.name[0]}</div>}
          </div>
          <div className="community-body">
            <div className="community-name">
              {c.private ? <Lock size={13} /> : <Globe size={13} />}
              <strong>{c.name}</strong>
            </div>
            <div className="muted community-desc">{c.description ?? "Açıklama yok"}</div>
            <div className="community-meta">
              <Users size={12} /> <span>{c.memberCount} üye</span>
              <span className="muted">· @{c.creator?.handle}</span>
            </div>
          </div>
          <button className="ghost-btn" style={{ padding: "6px 12px", whiteSpace: "nowrap" }} onClick={() => onJoin(c.slug)}>
            <UserPlus size={14} /> Katıl
          </button>
        </div>
      ))}
    </div>
  );
}

function MyCommunities() {
  const { data, isLoading } = useMyCommunities();
  const qc = useQueryClient();
  const leave = useMutation({
    mutationFn: (slug: string) => api.post<any>(`/communities/${slug}/join`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-communities"] }),
  });

  const items = data?.items ?? [];
  if (isLoading) return <div className="feed-state"><Loader2 size={28} className="spin" /></div>;
  if (!items.length) return (
    <div className="empty-state">
      <Users size={40} className="empty-icon" />
      <p className="empty-title">Henüz bir topluluğa katılmadınız</p>
    </div>
  );

  return (
    <div className="community-list">
      {items.map((c: any) => (
        <div key={c.id} className="community-card">
          <div className="community-img">
            {c.imageUrl ? <img src={c.imageUrl} alt={c.name} /> : <div className="community-img-ph">{c.name[0]}</div>}
          </div>
          <div className="community-body">
            <strong>{c.name}</strong>
            <div className="muted community-desc">{c.description ?? ""}</div>
            <div className="community-meta"><Users size={12} /> {c.memberCount} üye</div>
          </div>
          <button className="ghost-btn danger-icon" style={{ padding: "6px 12px" }} onClick={() => leave.mutate(c.slug)}>
            <UserMinus size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

function CreateCommunity({ onDone }: { onDone: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", description: "", imageUrl: "", private: false });
  const create = useMutation({
    mutationFn: (body: typeof form) => api.post<any>("/communities", body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["my-communities"] }); onDone(); },
  });

  return (
    <div className="create-community-form">
      <h3>Yeni Topluluk Oluştur</h3>
      <label>İsim *
        <input maxLength={60} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Topluluk adı" />
      </label>
      <label>Açıklama
        <textarea rows={3} maxLength={300} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Topluluk hakkında kısa bir açıklama" />
      </label>
      <label>Kapak Görseli URL
        <input type="url" value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." />
      </label>
      <label className="checkbox-label">
        <input type="checkbox" checked={form.private} onChange={e => setForm(f => ({ ...f, private: e.target.checked }))} />
        Özel topluluk (sadece davetliler)
      </label>
      <div className="step-nav">
        <button className="ghost-btn" onClick={onDone}>İptal</button>
        <button className="primary-btn" disabled={!form.name.trim() || create.isPending} onClick={() => create.mutate(form)}>
          {create.isPending ? <><Loader2 size={15} className="spin" /> Oluşturuluyor…</> : <><Plus size={15} /> Oluştur</>}
        </button>
      </div>
      {create.isError && <p style={{ color: "var(--danger)", marginTop: 8 }}>{(create.error as Error).message}</p>}
    </div>
  );
}
