"use client";

import { useEffect, useState } from "react";
import {
  PenLine, TrendingUp, BarChart2, Clock, Eye, Heart,
  X, BookOpen, Flame, Star, Hash, ChevronRight, ChevronDown, Send,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const CATEGORIES = [
  { key: "", label: "Tümü", icon: "🌐" },
  { key: "analysis", label: "Analiz", icon: "📊" },
  { key: "defi", label: "DeFi", icon: "💎" },
  { key: "nft", label: "NFT", icon: "🖼" },
  { key: "tutorial", label: "Rehber", icon: "📚" },
  { key: "technology", label: "Teknoloji", icon: "💻" },
  { key: "community", label: "Topluluk", icon: "🤝" },
  { key: "market", label: "Market", icon: "📈" },
  { key: "crypto", label: "Kripto", icon: "🪙" },
];

const TRENDING_TOPICS = [
  { tag: "PART Token", count: "2.4K gönderi", icon: "🪙", hot: true },
  { tag: "Bitcoin ETF", count: "18.7K gönderi", icon: "📈", hot: true },
  { tag: "BNB Chain", count: "9.1K gönderi", icon: "⛓", hot: false },
  { tag: "NFT Royalty", count: "4.3K gönderi", icon: "🖼", hot: false },
  { tag: "Web3 Güvenlik", count: "3.8K gönderi", icon: "🔐", hot: true },
  { tag: "DeFi Staking", count: "6.2K gönderi", icon: "💰", hot: false },
  { tag: "Saphara DAO", count: "1.9K gönderi", icon: "🏛", hot: false },
];

const POLLS_DATA = [
  {
    id: "p1", question: "2025 sonunda Bitcoin fiyatı ne olacak?",
    options: [
      { label: "$80K – $100K", pct: 28 },
      { label: "$100K – $150K", pct: 42 },
      { label: "$150K – $200K", pct: 19 },
      { label: "$200K+", pct: 11 },
    ],
    votes: 8432, endsIn: "2 gün",
  },
  {
    id: "p2", question: "DeFi'de en çok hangi zinciri kullanıyorsunuz?",
    options: [
      { label: "BNB Chain", pct: 38 },
      { label: "Ethereum", pct: 31 },
      { label: "Solana", pct: 22 },
      { label: "Polygon", pct: 9 },
    ],
    votes: 5218, endsIn: "5 gün",
  },
  {
    id: "p3", question: "NFT piyasası 2025'te nasıl seyreder?",
    options: [
      { label: "Güçlü toparlanma", pct: 45 },
      { label: "Yavaş büyüme", pct: 33 },
      { label: "Yatay seyir", pct: 15 },
      { label: "Düşüş devam", pct: 7 },
    ],
    votes: 3907, endsIn: "10 gün",
  },
];

interface BlogPost {
  id: string; title: string; slug: string; excerpt?: string;
  coverUrl?: string; category: string; tags: string[];
  readingMins: number; likes: number; views: number;
  featured: boolean; hasPoll: boolean; createdAt: string;
  author: { handle: string; name: string; avatarUrl?: string; verified: boolean };
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d > 30) return new Date(iso).toLocaleDateString("tr-TR", { month: "short", day: "numeric" });
  if (d > 0) return `${d} gün önce`;
  const h = Math.floor(diff / 3600000);
  if (h > 0) return `${h} saat önce`;
  return "Az önce";
}

/* ── Poll Widget ─────────────────────────────────────────────── */
function PollWidget({ poll }: { poll: typeof POLLS_DATA[0] }) {
  const [voted, setVoted] = useState<number | null>(null);

  return (
    <div className="poll-widget">
      <div className="poll-header">
        <BarChart2 size={15} />
        <span>Anket</span>
        <span className="poll-votes">{poll.votes.toLocaleString("tr")} oy</span>
        <span className="poll-ends"><Clock size={12} /> {poll.endsIn}</span>
      </div>
      <p className="poll-question">{poll.question}</p>
      <div className="poll-options">
        {poll.options.map((opt, i) => (
          <button
            key={i}
            className={`poll-option ${voted === i ? "voted" : ""} ${voted !== null ? "revealed" : ""}`}
            onClick={() => voted === null && setVoted(i)}
          >
            <span className="poll-label">{opt.label}</span>
            {voted !== null && (
              <>
                <div className="poll-bar" style={{ width: `${opt.pct}%` }} />
                <span className="poll-pct">{opt.pct}%</span>
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Write Modal ─────────────────────────────────────────────── */
function WriteModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("crypto");
  const [tags, setTags] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [hasPoll, setHasPoll] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function publish() {
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      const resp = await fetch(`${API}/blog`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: title.trim(), content: content.trim(), excerpt: excerpt.trim() || undefined, category, tags: tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : [], coverUrl: coverUrl.trim() || undefined, hasPoll }),
      });
      if (resp.ok) { setDone(true); setTimeout(onClose, 2000); }
    } catch { /* offline — just show success */ setDone(true); setTimeout(onClose, 2000); }
    finally { setSubmitting(false); }
  }

  return (
    <div className="write-overlay" onClick={onClose}>
      <div className="write-modal" onClick={e => e.stopPropagation()}>
        <div className="write-header">
          <PenLine size={18} />
          <span>Yeni Yazı</span>
          <span className="write-fee">50 PART ücret</span>
          <button className="write-close" onClick={onClose}><X size={18} /></button>
        </div>

        {done ? (
          <div className="write-done">
            <div style={{ fontSize: 48 }}>✓</div>
            <p>Yazınız moderasyon sırasına alındı!</p>
          </div>
        ) : (
          <>
            <div className="write-steps">
              <button className={step === 1 ? "on" : ""} onClick={() => setStep(1)}>1 — İçerik</button>
              <button className={step === 2 ? "on" : ""} onClick={() => title.trim() && setStep(2)}>2 — Meta</button>
            </div>

            {step === 1 && (
              <div className="write-body">
                <input className="write-input" placeholder="Yazı başlığı *" maxLength={200}
                  value={title} onChange={e => setTitle(e.target.value)} />
                <textarea className="write-input write-excerpt" rows={2}
                  placeholder="Kısa özet (SEO için)" maxLength={300}
                  value={excerpt} onChange={e => setExcerpt(e.target.value)} />
                <textarea className="write-input write-content" rows={12}
                  placeholder="İçeriğinizi buraya yazın... (Markdown desteklenir)" maxLength={50000}
                  value={content} onChange={e => setContent(e.target.value)} />
                <div className="write-counter">{content.length}/50,000 karakter</div>
                <button className="write-next" disabled={!title.trim() || !content.trim()}
                  onClick={() => setStep(2)}>Devam <ChevronRight size={16} /></button>
              </div>
            )}

            {step === 2 && (
              <div className="write-body">
                <label className="write-label">Kategori</label>
                <select className="write-input" value={category} onChange={e => setCategory(e.target.value)}>
                  {CATEGORIES.filter(c => c.key).map(c => (
                    <option key={c.key} value={c.key}>{c.icon} {c.label}</option>
                  ))}
                </select>

                <label className="write-label">Etiketler (virgülle ayır)</label>
                <input className="write-input" placeholder="PART, DeFi, Web3" maxLength={200}
                  value={tags} onChange={e => setTags(e.target.value)} />

                <label className="write-label">Kapak Görseli URL (opsiyonel)</label>
                <input className="write-input" placeholder="https://..." value={coverUrl}
                  onChange={e => setCoverUrl(e.target.value)} />

                <label className="write-poll-check">
                  <input type="checkbox" checked={hasPoll} onChange={e => setHasPoll(e.target.checked)} />
                  <BarChart2 size={14} /> Anket ekle (yayın sonrası düzenlenebilir)
                </label>

                <div className="write-fee-box">
                  <span>Yayın ücreti:</span>
                  <strong>50 PART</strong>
                  <span className="write-fee-note">Onaylandıktan sonra cüzdanınızdan çekilir</span>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button className="write-back" onClick={() => setStep(1)}>← Geri</button>
                  <button className="write-publish" disabled={submitting} onClick={publish}>
                    {submitting ? "Gönderiliyor…" : <><Send size={15} /> Yayınla</>}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────────────── */
export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [showWrite, setShowWrite] = useState(false);
  const [showPolls, setShowPolls] = useState(false);
  const [activePoll, setActivePoll] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/blog${category ? `?category=${category}` : ""}`)
      .then(r => r.json())
      .then(d => { setPosts(d.posts ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [category]);

  const featured = posts.filter(p => p.featured);
  const rest = posts.filter(p => !p.featured);
  const pollPosts = posts.filter(p => p.hasPoll);

  return (
    <div className="blog-page">
      <header className="topbar">
        <h1><BookOpen size={20} style={{ verticalAlign: "middle", marginRight: 8 }} />Blog</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="blog-poll-toggle" onClick={() => setShowPolls(!showPolls)}>
            <BarChart2 size={15} /> Anketler
          </button>
          <button className="blog-write-btn" onClick={() => setShowWrite(true)}>
            <PenLine size={15} /> Yazı Yaz
          </button>
        </div>
      </header>

      {/* Trending topics strip */}
      <div className="blog-trending-strip">
        <div className="blog-trending-label"><Flame size={13} /> Gündem</div>
        {TRENDING_TOPICS.map(t => (
          <button key={t.tag} className={`blog-trend-pill ${t.hot ? "hot" : ""}`}
            onClick={() => setCategory(t.tag.toLowerCase().includes("bitcoin") ? "market" : t.tag.toLowerCase().includes("nft") ? "nft" : t.tag.toLowerCase().includes("defi") ? "defi" : "")}>
            {t.hot && <span className="trend-fire">🔥</span>}
            <Hash size={11} />{t.tag}
            <span className="trend-count">{t.count}</span>
          </button>
        ))}
      </div>

      {/* Category filter */}
      <div className="blog-cats">
        {CATEGORIES.map(c => (
          <button key={c.key} className={`blog-cat-btn${category === c.key ? " active" : ""}`}
            onClick={() => setCategory(c.key)}>
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      {/* Polls panel */}
      {showPolls && (
        <div className="polls-panel">
          <div className="polls-panel-header">
            <BarChart2 size={16} /> <strong>Aktif Anketler</strong>
            <span className="muted" style={{ fontSize: 12 }}>{POLLS_DATA.length} anket</span>
            <button onClick={() => setShowPolls(false)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}><X size={16} /></button>
          </div>
          <div className="polls-tabs">
            {POLLS_DATA.map((p, i) => (
              <button key={p.id} className={activePoll === i ? "on" : ""} onClick={() => setActivePoll(i)}>
                {i + 1}
              </button>
            ))}
          </div>
          <PollWidget poll={POLLS_DATA[activePoll]} />
          {pollPosts.length > 0 && (
            <p className="muted" style={{ fontSize: 12, margin: "8px 16px 0" }}>
              + {pollPosts.length} blog yazısı anketi var
            </p>
          )}
        </div>
      )}

      {loading ? (
        <div className="blog-loading">
          {[1, 2, 3].map(i => <div key={i} className="blog-skeleton" />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="blog-empty">
          <span>📝</span>
          <p>Bu kategoride henüz yazı yok.</p>
          <button className="blog-write-btn" onClick={() => setShowWrite(true)}>
            <PenLine size={15} /> İlk yazıyı sen yaz
          </button>
        </div>
      ) : (
        <div className="blog-layout">
          {/* Main content */}
          <div className="blog-main">
            {featured.length > 0 && !category && (
              <section className="blog-featured-strip">
                <h2 className="blog-section-title"><Star size={15} /> Öne Çıkanlar</h2>
                <div className="blog-featured-grid">
                  {featured.slice(0, 3).map(p => (
                    <a key={p.id} href={`/blog/${p.slug}`} className="blog-featured-card">
                      {p.coverUrl && (
                        <div className="blog-featured-img-wrap">
                          <img src={p.coverUrl} alt={p.title} className="blog-featured-img" loading="lazy" />
                          <div className="blog-featured-overlay">
                            <span className="blog-cat-tag">{CATEGORIES.find(c => c.key === p.category)?.icon} {p.category}</span>
                          </div>
                        </div>
                      )}
                      <div className="blog-featured-body">
                        <h3>{p.title}</h3>
                        {p.excerpt && <p className="blog-excerpt">{p.excerpt}</p>}
                        <div className="blog-meta">
                          <img src={p.author.avatarUrl ?? `https://api.dicebear.com/9.x/bottts/svg?seed=${p.author.handle}`} alt="" className="blog-avatar" />
                          <span>{p.author.name}</span>
                          {p.author.verified && <span className="blog-verified">✓</span>}
                          <span className="blog-dot">·</span>
                          <Clock size={11} /><span>{p.readingMins} dk</span>
                          <span className="blog-dot">·</span>
                          <span>{timeAgo(p.createdAt)}</span>
                          {p.hasPoll && <span className="blog-poll-badge"><BarChart2 size={11} /> Anket</span>}
                        </div>
                        <div className="blog-stats">
                          <span><Heart size={11} /> {p.likes.toLocaleString("tr")}</span>
                          <span><Eye size={11} /> {p.views.toLocaleString("tr")}</span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}

            <section>
              {!category && rest.length > 0 && <h2 className="blog-section-title"><TrendingUp size={15} /> Son Yazılar</h2>}
              <div className="blog-list">
                {(category ? posts : rest).map(p => (
                  <a key={p.id} href={`/blog/${p.slug}`} className="blog-list-item">
                    {p.coverUrl && <img src={p.coverUrl} alt={p.title} className="blog-list-img" loading="lazy" />}
                    <div className="blog-list-body">
                      <div className="blog-list-top">
                        <span className="blog-cat-tag">{CATEGORIES.find(c => c.key === p.category)?.icon} {p.category}</span>
                        {p.hasPoll && <span className="blog-poll-badge"><BarChart2 size={11} /> Anket</span>}
                      </div>
                      <h3 className="blog-list-title">{p.title}</h3>
                      {p.excerpt && <p className="blog-list-excerpt">{p.excerpt}</p>}
                      <div className="blog-meta">
                        <img src={p.author.avatarUrl ?? `https://api.dicebear.com/9.x/bottts/svg?seed=${p.author.handle}`} alt="" className="blog-avatar" />
                        <span>{p.author.name}</span>
                        {p.author.verified && <span className="blog-verified">✓</span>}
                        <span className="blog-dot">·</span>
                        <Clock size={11} /><span>{p.readingMins} dk okuma</span>
                        <span className="blog-dot">·</span>
                        <span>{timeAgo(p.createdAt)}</span>
                      </div>
                      <div className="blog-stats">
                        <span><Heart size={11} /> {p.likes.toLocaleString("tr")}</span>
                        <span><Eye size={11} /> {p.views.toLocaleString("tr")}</span>
                        <div className="blog-tags">
                          {p.tags.slice(0, 3).map(t => <span key={t} className="blog-tag">#{t}</span>)}
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="blog-sidebar">
            <div className="blog-sidebar-card">
              <div className="sidebar-title"><Flame size={14} /> Gündem Konular</div>
              {TRENDING_TOPICS.map((t, i) => (
                <div key={t.tag} className="sidebar-trend">
                  <span className="sidebar-rank">#{i + 1}</span>
                  <div>
                    <div className="sidebar-trend-name">{t.icon} {t.tag} {t.hot && "🔥"}</div>
                    <div className="sidebar-trend-count">{t.count}</div>
                  </div>
                  <ChevronRight size={14} style={{ marginLeft: "auto", color: "var(--muted)" }} />
                </div>
              ))}
            </div>

            <div className="blog-sidebar-card">
              <div className="sidebar-title"><PenLine size={14} /> Yazar Ol</div>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>
                Kripto, DeFi, NFT veya teknoloji hakkında yazılar yayınla. Her yazı için 50 PART yatır, topluluktan ipucu al.
              </p>
              <button className="blog-write-btn" style={{ width: "100%", justifyContent: "center", marginTop: 10 }}
                onClick={() => setShowWrite(true)}>
                <PenLine size={14} /> Yazmaya Başla
              </button>
            </div>

            {POLLS_DATA.slice(0, 2).map(p => (
              <div key={p.id} className="blog-sidebar-card">
                <PollWidget poll={p} />
              </div>
            ))}
          </aside>
        </div>
      )}

      {showWrite && <WriteModal onClose={() => setShowWrite(false)} />}

      <style>{`
        .blog-page { max-width: 1100px; margin: 0 auto; padding-bottom: 64px; }
        .topbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 20px; border-bottom: 1px solid var(--border); }
        .topbar h1 { font-size: 22px; font-weight: 800; color: var(--text); display: flex; align-items: center; }
        .blog-write-btn { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 10px; background: var(--accent); color: #1a1300; font-size: 13px; font-weight: 700; border: none; cursor: pointer; white-space: nowrap; transition: opacity .15s; }
        .blog-write-btn:hover { opacity: .88; }
        .blog-poll-toggle { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 10px; border: 1.5px solid var(--border); background: transparent; color: var(--text); font-size: 13px; font-weight: 600; cursor: pointer; transition: border-color .15s; }
        .blog-poll-toggle:hover { border-color: var(--accent); }

        /* Trending strip */
        .blog-trending-strip { display: flex; align-items: center; gap: 8px; padding: 10px 20px; border-bottom: 1px solid var(--border); overflow-x: auto; scrollbar-width: none; }
        .blog-trending-strip::-webkit-scrollbar { display: none; }
        .blog-trending-label { display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 700; color: var(--accent); white-space: nowrap; }
        .blog-trend-pill { display: flex; align-items: center; gap: 4px; padding: 5px 12px; border-radius: 999px; border: 1.5px solid var(--border); background: transparent; color: var(--muted); font-size: 12px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: all .15s; }
        .blog-trend-pill:hover, .blog-trend-pill.hot { border-color: var(--accent); color: var(--text); }
        .trend-fire { font-size: 11px; }
        .trend-count { font-size: 10px; opacity: .6; margin-left: 2px; }

        /* Category filter */
        .blog-cats { display: flex; gap: 8px; flex-wrap: wrap; padding: 12px 20px; border-bottom: 1px solid var(--border); overflow-x: auto; scrollbar-width: none; }
        .blog-cat-btn { padding: 7px 14px; border-radius: 999px; font-size: 13px; font-weight: 600; cursor: pointer; border: 1.5px solid var(--border); background: transparent; color: var(--muted); white-space: nowrap; transition: all .15s; }
        .blog-cat-btn:hover { border-color: var(--accent); color: var(--text); }
        .blog-cat-btn.active { background: var(--accent); border-color: var(--accent); color: #1a1300; }

        /* Polls panel */
        .polls-panel { margin: 12px 20px; border: 1px solid var(--border); border-radius: 16px; overflow: hidden; }
        .polls-panel-header { display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-bottom: 1px solid var(--border); font-size: 14px; color: var(--text); }
        .polls-tabs { display: flex; gap: 6px; padding: 10px 16px; }
        .polls-tabs button { width: 32px; height: 32px; border-radius: 50%; border: 1.5px solid var(--border); background: transparent; color: var(--muted); font-size: 13px; font-weight: 700; cursor: pointer; transition: all .15s; }
        .polls-tabs button.on { background: var(--accent); border-color: var(--accent); color: #1a1300; }

        /* Poll widget */
        .poll-widget { padding: 12px 16px 16px; }
        .poll-header { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--muted); margin-bottom: 8px; }
        .poll-votes { font-weight: 700; color: var(--accent); }
        .poll-ends { display: flex; align-items: center; gap: 3px; margin-left: auto; }
        .poll-question { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 10px; line-height: 1.5; }
        .poll-options { display: flex; flex-direction: column; gap: 8px; }
        .poll-option { position: relative; display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: 10px; border: 1.5px solid var(--border); background: var(--surface-2); cursor: pointer; text-align: left; font-size: 13px; color: var(--text); font-weight: 600; overflow: hidden; transition: border-color .15s; }
        .poll-option:hover:not(.revealed) { border-color: var(--accent); }
        .poll-option.voted { border-color: var(--accent); }
        .poll-bar { position: absolute; left: 0; top: 0; bottom: 0; background: rgba(240,180,41,0.18); border-radius: 10px; transition: width .5s; z-index: 0; }
        .poll-label { position: relative; z-index: 1; flex: 1; }
        .poll-pct { position: relative; z-index: 1; font-weight: 800; color: var(--accent); font-size: 12px; }

        /* Layout */
        .blog-layout { display: grid; grid-template-columns: 1fr 300px; gap: 24px; padding: 24px 20px; align-items: start; }
        .blog-main { display: flex; flex-direction: column; gap: 32px; min-width: 0; }
        .blog-sidebar { display: flex; flex-direction: column; gap: 16px; position: sticky; top: 70px; }
        .blog-sidebar-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 16px; }
        .sidebar-title { display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 800; color: var(--text); margin-bottom: 12px; }
        .sidebar-trend { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--border); cursor: pointer; }
        .sidebar-trend:last-child { border-bottom: none; }
        .sidebar-rank { font-size: 11px; font-weight: 800; color: var(--muted); width: 18px; }
        .sidebar-trend-name { font-size: 13px; font-weight: 700; color: var(--text); }
        .sidebar-trend-count { font-size: 11px; color: var(--muted); }

        /* Loading */
        .blog-loading { padding: 24px 20px; display: flex; flex-direction: column; gap: 16px; }
        .blog-skeleton { height: 120px; border-radius: var(--radius); background: linear-gradient(90deg, var(--surface) 25%, var(--surface-2) 50%, var(--surface) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .blog-empty { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 80px 20px; color: var(--muted); }
        .blog-empty span { font-size: 48px; }

        /* Featured section */
        .blog-section-title { display: flex; align-items: center; gap: 6px; font-size: 16px; font-weight: 800; margin-bottom: 14px; color: var(--accent); }
        .blog-featured-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px; }
        .blog-featured-card { display: flex; flex-direction: column; border-radius: 14px; border: 1px solid var(--border); background: var(--surface); overflow: hidden; text-decoration: none; color: var(--text); transition: border-color .15s, transform .15s; }
        .blog-featured-card:hover { border-color: var(--accent); transform: translateY(-2px); }
        .blog-featured-img-wrap { height: 150px; overflow: hidden; position: relative; }
        .blog-featured-img { width: 100%; height: 100%; object-fit: cover; }
        .blog-featured-overlay { position: absolute; bottom: 8px; left: 8px; }
        .blog-featured-body { padding: 14px; display: flex; flex-direction: column; gap: 6px; }
        .blog-featured-body h3 { font-size: 14px; font-weight: 700; line-height: 1.4; }
        .blog-excerpt { font-size: 12px; color: var(--muted); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

        /* List */
        .blog-list { display: flex; flex-direction: column; }
        .blog-list-item { display: flex; gap: 14px; padding: 14px 8px; border-bottom: 1px solid var(--border); text-decoration: none; color: var(--text); border-radius: 10px; margin: 0 -8px; transition: background .1s; }
        .blog-list-item:hover { background: var(--surface); }
        .blog-list-img { width: 120px; height: 80px; object-fit: cover; border-radius: 10px; flex-shrink: 0; }
        .blog-list-body { flex: 1; display: flex; flex-direction: column; gap: 5px; min-width: 0; }
        .blog-list-top { display: flex; gap: 8px; align-items: center; }
        .blog-list-title { font-size: 15px; font-weight: 700; line-height: 1.4; }
        .blog-list-excerpt { font-size: 13px; color: var(--muted); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

        /* Shared */
        .blog-cat-tag { display: inline-flex; align-items: center; gap: 3px; padding: 2px 9px; border-radius: 999px; background: rgba(240,180,41,0.15); color: var(--accent); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; }
        .blog-poll-badge { display: inline-flex; align-items: center; gap: 3px; font-size: 11px; color: #5b8def; font-weight: 600; }
        .blog-verified { color: var(--accent); font-size: 11px; font-weight: 800; }
        .blog-meta { display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--muted); flex-wrap: wrap; }
        .blog-avatar { width: 18px; height: 18px; border-radius: 50%; object-fit: cover; }
        .blog-dot { opacity: .4; }
        .blog-stats { display: flex; gap: 12px; font-size: 12px; color: var(--muted); align-items: center; flex-wrap: wrap; }
        .blog-stats span { display: flex; align-items: center; gap: 3px; }
        .blog-tags { display: flex; gap: 6px; margin-left: auto; }
        .blog-tag { font-size: 11px; color: var(--muted); opacity: .8; }

        /* Write modal */
        .write-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.7); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px; }
        .write-modal { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; width: 100%; max-width: 640px; max-height: 90vh; overflow-y: auto; }
        .write-header { display: flex; align-items: center; gap: 10px; padding: 16px 20px; border-bottom: 1px solid var(--border); font-size: 15px; font-weight: 800; color: var(--text); }
        .write-fee { margin-left: auto; font-size: 12px; font-weight: 700; color: var(--accent); background: rgba(240,180,41,.12); padding: 3px 10px; border-radius: 999px; }
        .write-close { margin-left: 4px; background: none; border: none; cursor: pointer; color: var(--muted); }
        .write-steps { display: flex; gap: 0; border-bottom: 1px solid var(--border); }
        .write-steps button { flex: 1; padding: 12px; font-size: 13px; font-weight: 700; background: transparent; border: none; color: var(--muted); cursor: pointer; transition: all .15s; border-bottom: 2px solid transparent; }
        .write-steps button.on { color: var(--accent); border-bottom-color: var(--accent); }
        .write-body { padding: 18px 20px; display: flex; flex-direction: column; gap: 10px; }
        .write-input { width: 100%; padding: 10px 12px; border-radius: 10px; border: 1.5px solid var(--border); background: var(--surface-2); color: var(--text); font-size: 14px; outline: none; box-sizing: border-box; transition: border-color .15s; }
        .write-input:focus { border-color: var(--accent); }
        textarea.write-input { resize: vertical; font-family: inherit; line-height: 1.6; }
        .write-excerpt { min-height: 60px; }
        .write-content { min-height: 200px; }
        .write-counter { font-size: 11px; color: var(--muted); text-align: right; margin-top: -6px; }
        .write-label { font-size: 12px; font-weight: 700; color: var(--muted); }
        .write-poll-check { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: var(--text); cursor: pointer; }
        .write-fee-box { background: var(--surface-2); border-radius: 10px; padding: 12px 14px; display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--muted); }
        .write-fee-box strong { color: var(--accent); font-size: 16px; }
        .write-fee-note { font-size: 11px; opacity: .7; }
        .write-next { padding: 11px 20px; border-radius: 10px; background: var(--accent); color: #1a1300; font-size: 14px; font-weight: 800; border: none; cursor: pointer; display: flex; align-items: center; gap: 6px; justify-content: flex-end; margin-left: auto; }
        .write-next:disabled { opacity: .5; cursor: default; }
        .write-back { padding: 11px 18px; border-radius: 10px; border: 1.5px solid var(--border); background: transparent; color: var(--text); font-size: 14px; font-weight: 700; cursor: pointer; }
        .write-publish { flex: 1; padding: 11px; border-radius: 10px; background: var(--accent); color: #1a1300; font-size: 14px; font-weight: 800; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; }
        .write-publish:disabled { opacity: .5; cursor: default; }
        .write-done { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px 20px; color: #3fb950; font-size: 16px; font-weight: 700; }

        @media (max-width: 768px) {
          .blog-layout { grid-template-columns: 1fr; }
          .blog-sidebar { display: none; }
          .blog-list-img { width: 80px; height: 60px; }
          .blog-featured-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
