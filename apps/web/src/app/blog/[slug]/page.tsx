"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "../../../features/auth/AuthContext";
import { api } from "../../../lib/api";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface Post {
  id: string; title: string; slug: string; content: string; excerpt?: string;
  coverUrl?: string; category: string; tags: string[]; readingMins: number;
  likes: number; views: number; hasPoll: boolean; pollQuestion?: string; pollOptions: string[];
  createdAt: string;
  author: { handle: string; name: string; avatarUrl?: string; verified: boolean; bio?: string };
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthed } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [related, setRelated] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState<number | null>(null);
  const [readPct, setReadPct] = useState(0);
  const [copied, setCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${API}/blog/${slug}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        setPost(d);
        setLoading(false);
        if (d?.category) {
          fetch(`${API}/blog?category=${d.category}`)
            .then((r) => r.json())
            .then((res) => setRelated((res.posts ?? []).filter((p: Post) => p.slug !== slug).slice(0, 3)))
            .catch(() => {});
        }
      })
      .catch(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    const onScroll = () => {
      const el = contentRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight;
      const seen = Math.max(0, -rect.top + window.innerHeight);
      setReadPct(Math.min(100, Math.round((seen / total) * 100)));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleLike() {
    if (!isAuthed || liked || !post) return;
    setLiked(true);
    setPost((p) => p ? { ...p, likes: p.likes + 1 } : p);
    try { await api.post(`/blog/${post.slug}/like`); } catch { /* ignore */ }
  }

  if (loading) {
    return (
      <div className="blog-post-wrap">
        <div className="bp-skeleton-cover" />
        <div className="bp-body"><div className="bp-skeleton-title" /><div className="bp-skeleton-text" /></div>
        <style>{`.bp-skeleton-cover{height:340px;background:var(--surface-2);border-radius:0 0 var(--radius) var(--radius)}.bp-skeleton-title{height:36px;background:var(--surface-2);border-radius:8px;margin-bottom:16px}.bp-skeleton-text{height:200px;background:var(--surface-2);border-radius:8px}.bp-body{padding:24px 20px;max-width:720px;margin:0 auto}`}</style>
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--muted)" }}>
        <p style={{ fontSize: 48 }}>📭</p>
        <p>Post not found.</p>
        <a href="/blog" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 700 }}>← Back to Blog</a>
      </div>
    );
  }

  return (
    <div className="blog-post-wrap">
      {post.coverUrl && (
        <div className="bp-cover-wrap">
          <img src={post.coverUrl} alt={post.title} className="bp-cover" />
        </div>
      )}

      <div className="bp-body">
        {/* Breadcrumb */}
        <div className="bp-bread">
          <a href="/blog">Blog</a>
          <span>›</span>
          <span className="bp-cat">{post.category}</span>
        </div>

        <h1 className="bp-title">{post.title}</h1>
        {post.excerpt && <p className="bp-excerpt">{post.excerpt}</p>}

        {/* Author row */}
        <div className="bp-author-row">
          <img
            src={post.author.avatarUrl ?? `https://api.dicebear.com/9.x/bottts/svg?seed=${post.author.handle}`}
            alt={post.author.name}
            className="bp-author-avatar"
          />
          <div className="bp-author-info">
            <a href={`/${post.author.handle}`} className="bp-author-name">
              {post.author.name} {post.author.verified && "✓"}
            </a>
            <div className="bp-meta">
              {post.readingMins} min read · {new Date(post.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </div>
          </div>
          <div className="bp-stats">
            <span>👁 {post.views.toLocaleString("en-US")}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="bp-tags">
          {post.tags.map((t) => <span key={t} className="bp-tag">#{t}</span>)}
        </div>

        {/* Content */}
        <div className="bp-content" ref={contentRef}>
          {post.content.split("\n").map((p, i) => p.trim() ? <p key={i}>{p}</p> : <br key={i} />)}
        </div>

        {/* Poll */}
        {post.hasPoll && post.pollQuestion && post.pollOptions.length > 0 && (
          <div className="bp-poll">
            <h3 className="bp-poll-q">📊 {post.pollQuestion}</h3>
            <div className="bp-poll-options">
              {post.pollOptions.map((opt, i) => (
                <button
                  key={i}
                  className={`bp-poll-opt${selectedPoll === i ? " selected" : ""}`}
                  onClick={() => setSelectedPoll(i)}
                >
                  {selectedPoll !== null && (
                    <div
                      className="bp-poll-bar"
                      style={{ width: `${selectedPoll === i ? 60 : Math.floor(Math.random() * 40)}%` }}
                    />
                  )}
                  <span className="bp-poll-label">{opt}</span>
                  {selectedPoll !== null && (
                    <span className="bp-poll-pct">{selectedPoll === i ? "60%" : `${Math.floor(Math.random() * 40)}%`}</span>
                  )}
                </button>
              ))}
            </div>
            {selectedPoll === null && <p className="bp-poll-hint">Click to vote</p>}
          </div>
        )}

        {/* Like + share */}
        <div className="bp-actions">
          <button
            className={`bp-like${liked ? " liked" : ""}`}
            onClick={handleLike}
            disabled={!isAuthed || liked}
            title={isAuthed ? "Like" : "Connect wallet to like"}
          >
            {liked ? "❤️" : "🤍"} {post.likes.toLocaleString("en-US")}
          </button>
          <button className="bp-share" onClick={() => {
            navigator.clipboard?.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}>
            {copied ? "✓ Copied!" : "🔗 Copy link"}
          </button>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
            target="_blank" rel="noreferrer" className="bp-share"
          >
            🐦 Share
          </a>
          <a href="/blog" className="bp-back">← All articles</a>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div className="bp-related">
            <h3 className="bp-related-title">Related Articles</h3>
            <div className="bp-related-grid">
              {related.map((r) => (
                <a key={r.id} href={`/blog/${r.slug}`} className="bp-related-card">
                  {r.coverUrl && <img src={r.coverUrl} alt={r.title} className="bp-related-img" />}
                  <div className="bp-related-body">
                    <span className="bp-cat-tag">{r.category}</span>
                    <div className="bp-related-ttl">{r.title}</div>
                    <div className="bp-related-meta">{r.readingMins} min read</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Reading progress (sticky top) */}
        <div className="bp-prog-bar" style={{ width: `${readPct}%` }} />
      </div>

      <style>{`
        .blog-post-wrap { max-width: 720px; margin: 0 auto; padding-bottom: 64px; }
        .bp-cover-wrap { max-height: 340px; overflow: hidden; border-radius: 0 0 var(--radius) var(--radius); }
        .bp-cover { width: 100%; height: 340px; object-fit: cover; }
        .bp-body { padding: 28px 24px; }

        .bp-bread { display: flex; gap: 8px; align-items: center; font-size: 13px; color: var(--muted); margin-bottom: 16px; }
        .bp-bread a { color: var(--accent); text-decoration: none; }
        .bp-cat { text-transform: capitalize; }

        .bp-title { font-size: clamp(22px, 4vw, 34px); font-weight: 900; letter-spacing: -0.5px; line-height: 1.2; margin-bottom: 12px; }
        .bp-excerpt { font-size: 16px; color: var(--muted); line-height: 1.65; margin-bottom: 20px; }

        .bp-author-row { display: flex; align-items: center; gap: 12px; padding: 16px 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); margin-bottom: 16px; }
        .bp-author-avatar { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; }
        .bp-author-info { flex: 1; }
        .bp-author-name { font-weight: 700; font-size: 15px; color: var(--text); text-decoration: none; }
        .bp-author-name:hover { color: var(--accent); }
        .bp-meta { font-size: 13px; color: var(--muted); margin-top: 2px; }
        .bp-stats { font-size: 13px; color: var(--muted); }

        .bp-tags { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px; }
        .bp-tag { font-size: 12px; color: var(--accent); background: rgba(240,180,41,0.1); padding: 3px 10px; border-radius: 999px; }

        .bp-content { font-size: 16px; line-height: 1.8; color: var(--text); }
        .bp-content p { margin-bottom: 16px; }

        .bp-poll { margin: 32px 0; padding: 24px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); }
        .bp-poll-q { font-size: 17px; font-weight: 700; margin-bottom: 16px; }
        .bp-poll-options { display: flex; flex-direction: column; gap: 10px; }
        .bp-poll-opt {
          position: relative; padding: 12px 16px; border-radius: 10px;
          border: 1.5px solid var(--border); background: var(--surface-2);
          color: var(--text); font-size: 15px; cursor: pointer; text-align: left;
          overflow: hidden; display: flex; justify-content: space-between; align-items: center;
          transition: border-color 0.15s;
        }
        .bp-poll-opt:hover { border-color: var(--accent); }
        .bp-poll-opt.selected { border-color: var(--accent); }
        .bp-poll-bar { position: absolute; left: 0; top: 0; height: 100%; background: rgba(240,180,41,0.12); transition: width 0.4s; }
        .bp-poll-label { position: relative; z-index: 1; }
        .bp-poll-pct { position: relative; z-index: 1; font-size: 13px; color: var(--accent); font-weight: 700; }
        .bp-poll-hint { font-size: 13px; color: var(--muted); margin-top: 10px; }

        .bp-actions { display: flex; gap: 12px; align-items: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--border); flex-wrap: wrap; }
        .bp-like { display: flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 999px; border: 1.5px solid var(--border); background: transparent; color: var(--text); font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
        .bp-like:hover:not(:disabled) { border-color: #e5484d; color: #e5484d; }
        .bp-like.liked { border-color: #e5484d; color: #e5484d; }
        .bp-like:disabled { opacity: 0.6; cursor: default; }
        .bp-back { margin-left: auto; color: var(--accent); text-decoration: none; font-size: 14px; font-weight: 600; }
        .bp-back:hover { opacity: 0.8; }
        .bp-share { padding: 10px 20px; border-radius: 999px; border: 1.5px solid var(--border); background: transparent; color: var(--muted); font-size: 14px; cursor: pointer; transition: all 0.15s; text-decoration: none; display: inline-flex; align-items: center; }
        .bp-share:hover { border-color: var(--accent); color: var(--text); }

        .bp-prog-bar { position: fixed; top: 0; left: 0; height: 3px; background: var(--accent); transition: width 0.1s; z-index: 999; pointer-events: none; }

        .bp-related { margin-top: 40px; padding-top: 32px; border-top: 1px solid var(--border); }
        .bp-related-title { font-size: 18px; font-weight: 800; margin-bottom: 16px; }
        .bp-related-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px; }
        .bp-related-card { display: flex; flex-direction: column; border: 1px solid var(--border); border-radius: 14px; overflow: hidden; text-decoration: none; color: var(--text); transition: border-color .15s, transform .15s; background: var(--surface); }
        .bp-related-card:hover { border-color: var(--accent); transform: translateY(-2px); }
        .bp-related-img { width: 100%; height: 100px; object-fit: cover; }
        .bp-related-body { padding: 10px 12px; display: flex; flex-direction: column; gap: 4px; }
        .bp-cat-tag { display: inline-block; padding: 2px 8px; border-radius: 999px; background: rgba(240,180,41,.12); color: var(--accent); font-size: 10px; font-weight: 700; text-transform: uppercase; }
        .bp-related-ttl { font-size: 13px; font-weight: 700; line-height: 1.4; }
        .bp-related-meta { font-size: 11px; color: var(--muted); }
      `}</style>
    </div>
  );
}
