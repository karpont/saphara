"use client";

import { useState } from "react";
import {
  Vote, Plus, CheckCircle, XCircle, Clock, Users,
  TrendingUp, Coins, ChevronDown, ChevronUp, AlertCircle,
} from "lucide-react";
import {
  useDaoProposals, useDaoStats, useCreateDaoProposal,
  useVoteProposal, useMyDaoVote, useAuth,
} from "../../hooks/useApi";

const STATUS_LABEL: Record<string, string> = {
  active:    "Aktif",
  passed:    "Kabul Edildi",
  rejected:  "Reddedildi",
  executed:  "Uygulandı",
  cancelled: "İptal",
};
const STATUS_COLOR: Record<string, string> = {
  active:    "#f0b429",
  passed:    "#22c55e",
  rejected:  "#e5484d",
  executed:  "#3b82f6",
  cancelled: "#6b7280",
};
const TYPE_LABEL: Record<string, string> = {
  general:   "Genel",
  parameter: "Parametre",
  treasury:  "Hazine",
  feature:   "Özellik",
  emergency: "Acil",
};

function VoteSection({ proposalId }: { proposalId: string }) {
  const { data: myVoteData } = useMyDaoVote(proposalId);
  const vote = useVoteProposal();
  const [reason, setReason] = useState("");
  const [showReason, setShowReason] = useState(false);

  if (myVoteData?.voted) {
    return (
      <div className="dao-already-voted">
        <CheckCircle size={16} />
        {myVoteData.vote.vote === "for" ? "Evet oyu kullandınız" :
         myVoteData.vote.vote === "against" ? "Hayır oyu kullandınız" : "Çekimser kaldınız"}
        {myVoteData.vote.reason && <p className="my-vote-reason">"{myVoteData.vote.reason}"</p>}
      </div>
    );
  }

  return (
    <div className="dao-vote-section">
      <div className="dao-vote-btns">
        <button className="vote-btn for" disabled={vote.isPending}
          onClick={() => vote.mutate({ id: proposalId, vote: "for", reason: reason || undefined })}>
          <CheckCircle size={14} /> Evet
        </button>
        <button className="vote-btn ag" disabled={vote.isPending}
          onClick={() => vote.mutate({ id: proposalId, vote: "against", reason: reason || undefined })}>
          <XCircle size={14} /> Hayır
        </button>
        <button className="vote-btn abs" disabled={vote.isPending}
          onClick={() => vote.mutate({ id: proposalId, vote: "abstain", reason: reason || undefined })}>
          Çekimser
        </button>
      </div>
      <button className="dao-reason-toggle" onClick={() => setShowReason(v => !v)}>
        {showReason ? <ChevronUp size={13} /> : <ChevronDown size={13} />} Gerekçe ekle (opsiyonel)
      </button>
      {showReason && (
        <textarea className="dao-reason-input" placeholder="Oyunuzun gerekçesini yazın…"
          value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
      )}
      {vote.isError && (
        <div className="dao-vote-error">
          <AlertCircle size={13} /> {(vote.error as any)?.message ?? "Oy gönderilemedi"}
        </div>
      )}
      {vote.isSuccess && (
        <div className="dao-vote-ok"><CheckCircle size={13} /> Oy başarıyla kaydedildi!</div>
      )}
    </div>
  );
}

function ProposalCard({ p, expanded, onToggle }: { p: any; expanded: boolean; onToggle: () => void }) {
  const total = (p.votesFor + p.votesAgainst + p.votesAbstain) || 1;
  const forPct = Math.round((p.votesFor / total) * 100);
  const agPct  = Math.round((p.votesAgainst / total) * 100);
  const ends   = new Date(p.endsAt);
  const ended  = ends < new Date();
  const { isAuthed } = useAuth();

  return (
    <div className="dao-card">
      <div className="dao-card-header" onClick={onToggle}>
        <div className="dao-badges">
          <span className="dao-type-badge">{TYPE_LABEL[p.type] ?? p.type}</span>
          <span className="dao-status-badge"
            style={{ color: STATUS_COLOR[p.status], background: STATUS_COLOR[p.status] + "18" }}>
            {STATUS_LABEL[p.status] ?? p.status}
          </span>
        </div>
        <h3 className="dao-card-title">{p.title}</h3>
        <div className="dao-card-meta">
          <img src={p.author?.avatarUrl ?? `https://api.dicebear.com/9.x/bottts/svg?seed=${p.author?.handle}`}
            alt={p.author?.name} />
          <span>@{p.author?.handle}</span>
          <span className="dao-sep">·</span>
          <Clock size={11} />
          <span>{ended ? "Sona erdi" : `${Math.ceil((ends.getTime() - Date.now()) / 86400000)} gün kaldı`}</span>
          <span className="dao-sep">·</span>
          <Users size={11} />
          <span>{p._count?.votes ?? 0} oy</span>
        </div>

        {p.treasuryAmount > 0 && (
          <div className="dao-treasury-note">
            <Coins size={12} /> {Number(p.treasuryAmount).toLocaleString()} PART hazine talebi
          </div>
        )}

        <div className="dao-vote-bars">
          <div className="dao-vb-row">
            <span className="vb-label vb-for">Evet {forPct}%</span>
            <div className="vb-track"><div className="vb-fill vb-fill-for" style={{ width: `${forPct}%` }} /></div>
            <span className="vb-val">{p.votesFor.toLocaleString()}</span>
          </div>
          <div className="dao-vb-row">
            <span className="vb-label vb-ag">Hayır {agPct}%</span>
            <div className="vb-track"><div className="vb-fill vb-fill-ag" style={{ width: `${agPct}%` }} /></div>
            <span className="vb-val">{p.votesAgainst.toLocaleString()}</span>
          </div>
        </div>

        <div className="dao-card-footer">
          <span className="dao-quorum-info">Quorum: %{p.quorum} · Geçiş: %{p.passThreshold}</span>
          <span className="dao-chevron">{expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</span>
        </div>
      </div>

      {expanded && (
        <div className="dao-detail">
          <p className="dao-detail-text">{p.description}</p>

          {p.tags?.length > 0 && (
            <div className="dao-tags">
              {p.tags.map((t: string) => <span key={t} className="dao-tag">#{t}</span>)}
            </div>
          )}

          {isAuthed && p.status === "active" && !ended && (
            <VoteSection proposalId={p.id} />
          )}
          {!isAuthed && p.status === "active" && (
            <div className="dao-login-hint">Oy kullanmak için giriş yapın.</div>
          )}
        </div>
      )}
    </div>
  );
}

function CreateModal({ onClose }: { onClose: () => void }) {
  const create = useCreateDaoProposal();
  const [form, setForm] = useState({ title: "", description: "", type: "general", daysFromNow: 7, tags: "", treasuryAmount: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const endsAt = new Date(Date.now() + form.daysFromNow * 86400000).toISOString();
    create.mutate(
      {
        title: form.title, description: form.description, type: form.type, endsAt,
        tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        treasuryAmount: form.treasuryAmount ? Number(form.treasuryAmount) : undefined,
      },
      { onSuccess: () => setTimeout(onClose, 1400) }
    );
  }

  return (
    <div className="dao-overlay" onClick={onClose}>
      <div className="dao-modal" onClick={(e) => e.stopPropagation()}>
        <div className="dao-modal-hdr">
          <h2>Yeni Teklif</h2>
          <button onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="dao-form">
          <label>Başlık *</label>
          <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Teklifinizin başlığı…" />
          <label>Açıklama *</label>
          <textarea required rows={5} value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Teklifinizi detaylı açıklayın…" />
          <div className="dao-form-row">
            <div>
              <label>Tür</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label>Süre (Gün)</label>
              <input type="number" min={1} max={30} value={form.daysFromNow}
                onChange={e => setForm(f => ({ ...f, daysFromNow: Number(e.target.value) }))} />
            </div>
          </div>
          {form.type === "treasury" && (
            <div>
              <label>Hazine Talebi (PART)</label>
              <input type="number" value={form.treasuryAmount} placeholder="0"
                onChange={e => setForm(f => ({ ...f, treasuryAmount: e.target.value }))} />
            </div>
          )}
          <label>Etiketler (virgülle)</label>
          <input value={form.tags} placeholder="ekonomi, market" onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
          {create.isSuccess && <div className="dao-form-ok"><CheckCircle size={13} /> Teklif oluşturuldu!</div>}
          {create.isError && <div className="dao-form-err"><AlertCircle size={13} /> {(create.error as any)?.message}</div>}
          <button type="submit" className="dao-submit" disabled={create.isPending || create.isSuccess}>
            {create.isPending ? "Gönderiliyor…" : create.isSuccess ? "✓ Oluşturuldu" : "Teklifi Gönder"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function DaoPage() {
  const [filter, setFilter]     = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const { data: statsData } = useDaoStats();
  const { data, isLoading } = useDaoProposals(filter === "all" ? undefined : filter);
  const { isAuthed } = useAuth();

  const proposals = data?.proposals ?? [];
  const stats = statsData;

  return (
    <div className="dao-page">
      <header className="topbar"><h1>DAO Yönetişim</h1></header>

      {stats && (
        <div className="dao-stats">
          <div className="dao-stat">
            <TrendingUp size={16} style={{ color: "var(--accent)" }} />
            <div><div className="dsn">{stats.active}</div><div className="dsl">Aktif</div></div>
          </div>
          <div className="dao-sdiv" />
          <div className="dao-stat">
            <CheckCircle size={16} style={{ color: "#22c55e" }} />
            <div><div className="dsn">{stats.passed}</div><div className="dsl">Kabul</div></div>
          </div>
          <div className="dao-sdiv" />
          <div className="dao-stat">
            <Users size={16} style={{ color: "#3b82f6" }} />
            <div><div className="dsn">{(stats.totalVotes ?? 0).toLocaleString()}</div><div className="dsl">Toplam Oy</div></div>
          </div>
          <div className="dao-sdiv" />
          <div className="dao-stat">
            <Vote size={16} style={{ color: "#a855f7" }} />
            <div><div className="dsn">{stats.total}</div><div className="dsl">Teklif</div></div>
          </div>
        </div>
      )}

      <div className="dao-info">
        <Coins size={13} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 2 }} />
        <span><strong>Oy gücü PART bakiyenizle orantılıdır.</strong> Her 100 PART = 1 oy gücü (maks 100). Teklifler belirtilen quorum ve geçiş oranına göre sonuçlanır.</span>
      </div>

      <div className="dao-controls">
        <div className="dao-filters">
          {["all", "active", "passed", "rejected"].map(s => (
            <button key={s} className={filter === s ? "on" : ""} onClick={() => setFilter(s)}>
              {s === "all" ? "Tümü" : STATUS_LABEL[s]}
            </button>
          ))}
        </div>
        {isAuthed && (
          <button className="dao-new-btn" onClick={() => setShowCreate(true)}>
            <Plus size={14} /> Teklif Ver
          </button>
        )}
      </div>

      {isLoading && <div className="dao-loading">Teklifler yükleniyor…</div>}
      {!isLoading && proposals.length === 0 && (
        <div className="dao-empty"><Vote size={40} style={{ opacity: .2 }} /><p>Teklif bulunamadı</p></div>
      )}

      <div className="dao-list">
        {proposals.map((p: any) => (
          <ProposalCard key={p.id} p={p}
            expanded={expanded === p.id}
            onToggle={() => setExpanded(expanded === p.id ? null : p.id)} />
        ))}
      </div>

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} />}

      <style>{`
        .dao-page { max-width:800px;margin:0 auto;padding-bottom:80px; }

        .dao-stats { display:flex;margin:16px 20px;background:var(--surface);border:1px solid var(--border);border-radius:16px;overflow:hidden; }
        .dao-stat { flex:1;display:flex;align-items:center;gap:10px;padding:14px 16px; }
        .dsn { font-size:18px;font-weight:900; }
        .dsl { font-size:11px;color:var(--muted);margin-top:1px; }
        .dao-sdiv { width:1px;background:var(--border);align-self:stretch; }

        .dao-info { display:flex;align-items:flex-start;gap:8px;margin:0 20px 16px;padding:12px 14px;background:rgba(240,180,41,.07);border:1px solid rgba(240,180,41,.2);border-radius:12px;font-size:13px;line-height:1.6;color:var(--muted); }

        .dao-controls { display:flex;align-items:center;justify-content:space-between;padding:0 20px 14px;flex-wrap:wrap;gap:10px; }
        .dao-filters { display:flex;gap:4px;flex-wrap:wrap; }
        .dao-filters button { padding:7px 14px;border-radius:8px;border:none;background:transparent;color:var(--muted);font-size:13px;font-weight:600;cursor:pointer;transition:all .15s; }
        .dao-filters button.on { background:var(--surface-2);color:var(--text); }
        .dao-new-btn { display:flex;align-items:center;gap:6px;padding:9px 16px;border-radius:10px;background:var(--accent);color:#1a1300;font-size:13px;font-weight:700;border:none;cursor:pointer; }

        .dao-loading { text-align:center;padding:60px 20px;color:var(--muted); }
        .dao-empty { display:flex;flex-direction:column;align-items:center;gap:10px;padding:60px 20px;color:var(--muted); }
        .dao-empty p { font-size:16px;font-weight:700; }

        .dao-list { padding:0 20px;display:flex;flex-direction:column;gap:10px; }
        .dao-card { background:var(--surface);border:1.5px solid var(--border);border-radius:16px;overflow:hidden;transition:border-color .15s; }
        .dao-card:hover { border-color:rgba(240,180,41,.3); }

        .dao-card-header { padding:16px;cursor:pointer; }
        .dao-badges { display:flex;gap:6px;margin-bottom:8px; }
        .dao-type-badge { font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:rgba(59,130,246,.1);color:#3b82f6; }
        .dao-status-badge { font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px; }
        .dao-card-title { font-size:15px;font-weight:800;line-height:1.4;margin-bottom:8px; }
        .dao-card-meta { display:flex;align-items:center;gap:5px;font-size:11px;color:var(--muted);flex-wrap:wrap;margin-bottom:10px; }
        .dao-card-meta img { width:16px;height:16px;border-radius:50%; }
        .dao-sep { opacity:.35; }

        .dao-treasury-note { display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:var(--accent);background:rgba(240,180,41,.08);border-radius:8px;padding:6px 10px;margin-bottom:10px; }

        .dao-vote-bars { display:flex;flex-direction:column;gap:5px;margin-bottom:10px; }
        .dao-vb-row { display:flex;align-items:center;gap:8px; }
        .vb-label { width:82px;font-size:11px;font-weight:600;white-space:nowrap; }
        .vb-label.vb-for { color:#22c55e; }
        .vb-label.vb-ag  { color:#e5484d; }
        .vb-track { flex:1;height:6px;background:var(--surface-2);border-radius:99px;overflow:hidden; }
        .vb-fill { height:100%;border-radius:99px;transition:width .5s; }
        .vb-fill-for { background:#22c55e; }
        .vb-fill-ag  { background:#e5484d; }
        .vb-val { font-size:11px;color:var(--muted);min-width:40px;text-align:right; }

        .dao-card-footer { display:flex;align-items:center;justify-content:space-between;font-size:11px;color:var(--muted); }
        .dao-chevron { color:var(--muted); }

        .dao-detail { padding:14px 16px;border-top:1px solid var(--border);background:var(--surface-2); }
        .dao-detail-text { font-size:13px;color:var(--muted);line-height:1.75;margin-bottom:12px;white-space:pre-wrap; }
        .dao-tags { display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px; }
        .dao-tag { font-size:11px;font-weight:600;padding:3px 8px;border-radius:99px;background:var(--surface);color:var(--muted);border:1px solid var(--border); }

        .dao-vote-section { display:flex;flex-direction:column;gap:8px; }
        .dao-vote-btns { display:flex;gap:8px;flex-wrap:wrap; }
        .vote-btn { flex:1;padding:10px;border-radius:10px;border:1.5px solid var(--border);font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:all .15s;background:var(--surface); }
        .vote-btn.for  { color:#22c55e;border-color:#22c55e33; }
        .vote-btn.for:hover  { background:rgba(34,197,94,.1); }
        .vote-btn.ag   { color:#e5484d;border-color:#e5484d33; }
        .vote-btn.ag:hover   { background:rgba(229,72,77,.1); }
        .vote-btn.abs  { color:var(--muted); }
        .vote-btn:disabled { opacity:.4;cursor:not-allowed; }
        .dao-reason-toggle { display:flex;align-items:center;gap:5px;font-size:12px;color:var(--muted);background:none;border:none;cursor:pointer;padding:0;align-self:flex-start; }
        .dao-reason-input { width:100%;padding:10px 12px;border-radius:10px;background:var(--surface);border:1.5px solid var(--border);color:var(--text);font-size:13px;resize:vertical;box-sizing:border-box; }
        .dao-vote-error,.dao-vote-ok { display:flex;align-items:center;gap:6px;font-size:12px;border-radius:8px;padding:8px 12px; }
        .dao-vote-error { color:#e5484d;background:rgba(229,72,77,.08); }
        .dao-vote-ok { color:#22c55e;background:rgba(34,197,94,.08); }
        .dao-already-voted { display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:#22c55e;background:rgba(34,197,94,.08);border-radius:10px;padding:12px 14px; }
        .my-vote-reason { font-size:12px;color:var(--muted);font-weight:400;margin:4px 0 0; }
        .dao-login-hint { font-size:13px;color:var(--muted);text-align:center;padding:12px; }

        /* Create modal */
        .dao-overlay { position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px; }
        .dao-modal { background:var(--surface);border:1px solid var(--border);border-radius:20px;width:100%;max-width:540px;max-height:90vh;overflow-y:auto; }
        .dao-modal-hdr { display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1px solid var(--border);position:sticky;top:0;background:var(--surface);z-index:1; }
        .dao-modal-hdr h2 { font-size:16px;font-weight:800; }
        .dao-modal-hdr button { background:none;border:none;color:var(--muted);font-size:18px;cursor:pointer; }
        .dao-form { padding:20px;display:flex;flex-direction:column;gap:10px; }
        .dao-form label { font-size:11px;font-weight:700;color:var(--muted);margin-bottom:-4px; }
        .dao-form input,.dao-form select,.dao-form textarea { width:100%;padding:10px 12px;border-radius:10px;background:var(--surface-2);border:1.5px solid var(--border);color:var(--text);font-size:13px;outline:none;box-sizing:border-box;transition:border-color .15s; }
        .dao-form input:focus,.dao-form select:focus,.dao-form textarea:focus { border-color:var(--accent); }
        .dao-form-row { display:grid;grid-template-columns:1fr 1fr;gap:12px; }
        .dao-form-ok { display:flex;align-items:center;gap:8px;font-size:13px;color:#22c55e;background:rgba(34,197,94,.08);border-radius:8px;padding:10px; }
        .dao-form-err { display:flex;align-items:center;gap:8px;font-size:13px;color:#e5484d;background:rgba(229,72,77,.08);border-radius:8px;padding:10px; }
        .dao-submit { width:100%;padding:13px;border-radius:12px;background:var(--accent);color:#1a1300;font-size:14px;font-weight:800;border:none;cursor:pointer; }
        .dao-submit:disabled { opacity:.5;cursor:not-allowed; }

        @media(max-width:600px){
          .dao-stats { flex-wrap:wrap; }
          .dao-stat { min-width:50%; }
          .dao-vote-btns { flex-direction:column; }
          .dao-form-row { grid-template-columns:1fr; }
        }
      `}</style>
    </div>
  );
}
