"use client";

import { Bookmark, Heart, MessageCircle, Share2, Trash2, BookmarkX } from "lucide-react";
import { useBookmarks, useToggleBookmark } from "../../hooks/useApi";
import { ListSkeleton } from "../../components/ui/Skeleton";
import { getAvatarUrl } from "../../lib/avatar";

export function Bookmarks() {
  const { data, isLoading } = useBookmarks();
  const toggle = useToggleBookmark();
  const items = data?.items ?? [];

  return (
    <div className="bookmarks-page">
      <header className="topbar">
        <h1><Bookmark size={20} /> Kaydedilenler</h1>
      </header>

      {isLoading && <ListSkeleton count={5} />}

      {!isLoading && items.length === 0 && (
        <div className="bk-empty">
          <BookmarkX size={48} style={{ opacity: .25 }} />
          <p>Henüz kaydedilen gönderi yok</p>
          <span>Bir gönderinin altındaki 🔖 ikonuna tıklayarak buraya ekleyebilirsin.</span>
        </div>
      )}

      {items.map((p: any) => {
        const handle = p.author?.handle ?? "kullanici";
        const name   = p.author?.name ?? handle;
        const avatar = getAvatarUrl(handle, p.author?.avatarUrl);
        const date   = p.createdAt
          ? new Date(p.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })
          : "";

        return (
          <article key={p.id} className="bk-card">
            <div className="bk-card-head">
              <img src={avatar} alt={name} className="bk-avatar" />
              <div className="bk-author">
                <a href={`/${handle}`} className="bk-name">{name}</a>
                <span className="bk-handle">@{handle} · {date}</span>
              </div>
              <button
                className="bk-remove-btn"
                title="Kaydı kaldır"
                onClick={() => toggle.mutate({ postId: p.id, on: false })}
                disabled={toggle.isPending}
              >
                <Trash2 size={14} />
              </button>
            </div>

            {p.text && <p className="bk-text">{p.text}</p>}

            {p.imageUrl && (
              <img src={p.imageUrl} alt="gönderi görseli" className="bk-image" />
            )}

            <div className="bk-actions">
              <span className="bk-action"><Heart size={14} /> {p.likeCount ?? 0}</span>
              <span className="bk-action"><MessageCircle size={14} /> {p.commentCount ?? 0}</span>
              <a href={`/${handle}`} className="bk-action bk-view-link">
                <Share2 size={14} /> Profile Git
              </a>
            </div>
          </article>
        );
      })}

      <style>{`
        .bookmarks-page { max-width: 680px; margin: 0 auto; }
        .bk-empty { display:flex;flex-direction:column;align-items:center;gap:10px;padding:80px 24px;text-align:center;color:var(--muted); }
        .bk-empty p { font-size:16px;font-weight:700; }
        .bk-empty span { font-size:13px; }
        .bk-card { padding:16px 20px;border-bottom:1px solid var(--border);transition:background .15s; }
        .bk-card:hover { background:var(--surface-2); }
        .bk-card-head { display:flex;align-items:center;gap:10px;margin-bottom:10px; }
        .bk-avatar { width:38px;height:38px;border-radius:50%;object-fit:cover;border:2px solid var(--border); }
        .bk-author { flex:1;min-width:0; }
        .bk-name { font-size:14px;font-weight:700;color:var(--text);text-decoration:none;display:block; }
        .bk-name:hover { color:var(--accent); }
        .bk-handle { font-size:12px;color:var(--muted); }
        .bk-remove-btn { padding:6px;border-radius:8px;border:none;background:transparent;color:var(--muted);cursor:pointer;transition:all .15s; }
        .bk-remove-btn:hover { background:rgba(229,72,77,.1);color:#e5484d; }
        .bk-text { font-size:14px;line-height:1.65;color:var(--text);margin-bottom:10px;white-space:pre-wrap;word-break:break-word; }
        .bk-image { width:100%;max-height:300px;object-fit:cover;border-radius:12px;margin-bottom:10px;border:1px solid var(--border); }
        .bk-actions { display:flex;gap:16px;align-items:center; }
        .bk-action { display:flex;align-items:center;gap:5px;font-size:13px;color:var(--muted); }
        .bk-view-link { margin-left:auto;text-decoration:none;color:var(--accent);font-size:13px; }
        .bk-view-link:hover { text-decoration:underline; }
      `}</style>
    </div>
  );
}
