"use client";

import { useState, useEffect } from "react";
import { Search as SearchIcon, User, FileText, BadgeCheck, Loader2, Users } from "lucide-react";
import { useSearchQuery, useToggleFollow } from "../../hooks/useApi";

type Tab = "all" | "users" | "posts";

export function Search() {
  const [query, setQuery] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [tab, setTab] = useState<Tab>("all");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isLoading } = useSearchQuery(debouncedQ, tab === "all" ? "all" : tab);
  const toggleFollow = useToggleFollow();

  const users = data?.users ?? [];
  const posts = data?.posts ?? [];
  const hasResults = users.length > 0 || posts.length > 0;

  return (
    <div className="search-page">
      <header className="topbar"><h1>Ara</h1></header>

      {/* Arama kutusu */}
      <div className="search-bar-wrap">
        <div className="search-bar">
          <SearchIcon size={18} className="search-icon" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Kullanıcı, gönderi, hashtag ara..."
            className="search-input"
          />
          {isLoading && <Loader2 size={16} className="spin search-spin" />}
        </div>
      </div>

      {/* Sekmeler */}
      <div className="feed-tabs">
        <button className={tab === "all" ? "on" : ""} onClick={() => setTab("all")}>Tümü</button>
        <button className={tab === "users" ? "on" : ""} onClick={() => setTab("users")}>
          <Users size={15} /> Kullanıcılar
        </button>
        <button className={tab === "posts" ? "on" : ""} onClick={() => setTab("posts")}>
          <FileText size={15} /> Gönderiler
        </button>
      </div>

      {/* Boş durum */}
      {!debouncedQ && (
        <div className="empty-state">
          <SearchIcon size={40} className="empty-icon" />
          <p className="empty-title">Birini veya bir şey ara</p>
          <p className="empty-hint">Kullanıcı adı, isim veya konu girin</p>
        </div>
      )}

      {debouncedQ && !isLoading && !hasResults && (
        <div className="empty-state">
          <p className="empty-title">Sonuç bulunamadı</p>
          <p className="empty-hint">"{debouncedQ}" için hiçbir şey bulunamadı</p>
        </div>
      )}

      {/* Kullanıcı sonuçları */}
      {(tab === "all" || tab === "users") && users.length > 0 && (
        <section className="search-section">
          {tab === "all" && <h3 className="search-section-title"><User size={16} /> Kullanıcılar</h3>}
          {users.map((u: any) => (
            <div key={u.id} className="search-user-row">
              <a href={`/${u.handle}`} className="search-user-info">
                <div className="search-avatar">
                  {u.avatarUrl
                    ? <img src={u.avatarUrl} alt={u.name} />
                    : <div className="avatar-inner" />
                  }
                </div>
                <div>
                  <div className="search-user-name">
                    {u.name}
                    {u.verified && <BadgeCheck size={14} className="verified" style={{ marginLeft: 4 }} />}
                  </div>
                  <div className="muted search-user-handle">@{u.handle}</div>
                  {u.bio && <div className="search-user-bio muted">{u.bio.slice(0, 80)}</div>}
                </div>
              </a>
              <div className="search-user-meta">
                <small className="muted">{(u._count?.followers ?? 0).toLocaleString("en-US")} takipçi</small>
                <button
                  className="ghost-btn search-follow-btn"
                  onClick={() => toggleFollow.mutate({ id: u.id, follow: true })}
                >
                  Takip Et
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Gönderi sonuçları */}
      {(tab === "all" || tab === "posts") && posts.length > 0 && (
        <section className="search-section">
          {tab === "all" && <h3 className="search-section-title"><FileText size={16} /> Gönderiler</h3>}
          {posts.map((p: any) => (
            <article key={p.id} className="post search-post">
              <div className="post-head">
                <strong>{p.author?.name}</strong>
                <span className="muted">@{p.author?.handle}</span>
              </div>
              {p.text && <p>{p.text}</p>}
              <div className="actions">
                <span className="muted">{p.likes} beğeni</span>
                <span className="muted">{p.comments} yorum</span>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
