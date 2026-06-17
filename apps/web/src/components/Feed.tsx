"use client";

import { useState, useMemo, useRef } from "react";
import {
  Heart, MessageCircle, Repeat2, Loader2, Newspaper,
  ExternalLink, Bookmark, Share2, MoreHorizontal, BadgeCheck,
  TrendingUp, Sparkles, Users,
} from "lucide-react";
import { TipModal } from "../features/tipping/TipModal";
import { getAvatarUrl } from "../lib/avatar";
import { PollCard } from "../features/engagement/PollCard";
import { CommentSheet } from "../features/engagement/CommentSheet";
import { StoryBar } from "../features/stories/StoryBar";
import { Carousel } from "../features/post/Carousel";
import { FeedSkeleton, EmptyState } from "./ui/Skeleton";
import {
  useFeed, useCreatePost, useLikePost, useNews,
  useToggleBookmark, useRepost, useAdsFeed, useSuggestedUsers, type FeedPost,
} from "../hooks/useApi";

type Scope = "foryou" | "following" | "trending";

export function Feed() {
  const [scope, setScope] = useState<Scope>("foryou");
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useFeed(
    scope === "following" ? "following" : "all"
  );
  const news = useNews("general");
  const campaigns = useAdsFeed(5);
  const createPost = useCreatePost();
  const likePost = useLikePost();
  const toggleBookmark = useToggleBookmark();
  const repost = useRepost();

  const [draft, setDraft] = useState("");
  const [tipTarget, setTipTarget] = useState<{ addr: `0x${string}`; handle: string } | null>(null);
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [reposted, setReposted] = useState<Record<string, boolean>>({});
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [charCount, setCharCount] = useState(0);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const posts: FeedPost[] = data?.pages.flatMap((p) => p.items) ?? [];
  const newsItems = news.data?.items ?? [];
  const activeCampaigns = campaigns.data?.items ?? [];

  const mixed = useMemo(() => {
    type FeedItem =
      | { type: "post"; data: FeedPost }
      | { type: "news"; data: any }
      | { type: "ad"; data: any }
      | { type: "who-to-follow" };

    const out: FeedItem[] = [];
    let newsIdx = 0;
    let adIdx = 0;
    posts.forEach((p, i) => {
      out.push({ type: "post", data: p });
      if ((i + 1) % 5 === 0 && newsItems[newsIdx]) {
        out.push({ type: "news", data: newsItems[newsIdx++] });
      }
      if ((i + 1) % 8 === 0) {
        out.push({ type: "who-to-follow" });
      }
      if ((i + 1) % 7 === 0 && activeCampaigns[adIdx]) {
        out.push({ type: "ad", data: activeCampaigns[adIdx++ % activeCampaigns.length] });
      }
    });
    return out;
  }, [posts, newsItems, activeCampaigns]);

  const submitPost = () => {
    if (!draft.trim()) return;
    createPost.mutate({ text: draft.trim() });
    setDraft("");
    setCharCount(0);
  };

  const onDraftChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(e.target.value);
    setCharCount(e.target.value.length);
    // Auto-resize
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  };

  const share = async (post: FeedPost) => {
    const url = `${window.location.origin}/${post.author?.handle}`;
    if (navigator.share) {
      await navigator.share({ title: post.author?.name ?? "Saphara", url }).catch(() => {});
    } else {
      await navigator.clipboard?.writeText(url);
    }
  };

  return (
    <div className="feed">
      <StoryBar />

      {/* Feed Sekmeleri — Twitter/Instagram tarzı */}
      <div className="feed-tabs">
        <button className={scope === "foryou" ? "on" : ""} onClick={() => setScope("foryou")}>
          <Sparkles size={14} /> Sana Özel
        </button>
        <button className={scope === "following" ? "on" : ""} onClick={() => setScope("following")}>
          <Users size={14} /> Takip
        </button>
        <button className={scope === "trending" ? "on" : ""} onClick={() => setScope("trending")}>
          <TrendingUp size={14} /> Trend
        </button>
      </div>

      {/* Composer — Twitter tarzı */}
      <div className="composer-full">
        <div className="composer-avatar"><div className="avatar-inner" /></div>
        <div className="composer-body">
          <textarea
            ref={textRef}
            className="composer-input"
            placeholder="Neler oluyor? #saphara"
            value={draft}
            onChange={onDraftChange}
            maxLength={280}
          />
          {charCount > 0 && (
            <div className="composer-footer">
              <div className="composer-tools">
                <a href="/create" className="composer-tool-btn" title="Medya ekle">📷</a>
                <a href="/create" className="composer-tool-btn" title="GIF">GIF</a>
                <a href="/create" className="composer-tool-btn" title="Anket">📊</a>
              </div>
              <div className="composer-right">
                <span className={`char-counter ${charCount > 260 ? "danger" : charCount > 240 ? "warn" : ""}`}>
                  {280 - charCount}
                </span>
                <button
                  className="composer-submit"
                  onClick={submitPost}
                  disabled={createPost.isPending || !draft.trim()}
                >
                  {createPost.isPending ? <Loader2 size={15} className="spin" /> : "Paylaş"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isLoading && <FeedSkeleton count={3} />}
      {isError && (
        <EmptyState
          title="Akış şu an kullanılamıyor"
          hint="Sunucu geçici olarak erişilemiyor. Lütfen daha sonra tekrar deneyin."
        />
      )}
      {!isLoading && !isError && posts.length === 0 && (
        <EmptyState
          title={scope === "following" ? "Henüz gönderi yok" : "Hoş geldin!"}
          hint={scope === "following" ? "Birilerini takip et." : "İlk gönderiyi paylaş veya keşfet."}
        />
      )}

      {mixed.map((item, idx) => {
        if (item.type === "news") return (
          <a key={`news-${idx}`} className="post news-card" href={item.data.url} target="_blank" rel="noopener noreferrer">
            <div className="news-card-tag"><Newspaper size={14} /> GÜNCEL HABER</div>
            <p className="news-card-title">{item.data.title}</p>
            {item.data.imageUrl && <img className="post-media" src={item.data.imageUrl} alt="" />}
            <span className="news-card-meta">{item.data.source} <ExternalLink size={11} /></span>
          </a>
        );

        if (item.type === "ad") return (
          <AdCard key={`ad-${idx}`} campaign={item.data} />
        );

        if (item.type === "who-to-follow") return (
          <WhoToFollow key={`wtf-${idx}`} />
        );

        const p = item.data;
        return (
          <PostItem
            key={p.id}
            post={p}
            liked={!!liked[p.id]}
            reposted={!!reposted[p.id]}
            onLike={() => {
              setLiked((l) => ({ ...l, [p.id]: !l[p.id] }));
              likePost.mutate(p.id);
            }}
            onRepost={() => {
              const next = !reposted[p.id];
              setReposted((r) => ({ ...r, [p.id]: next }));
              repost.mutate({ id: p.id, on: next });
            }}
            onTip={() => p.author?.walletAddress && setTipTarget({
              addr: p.author.walletAddress as `0x${string}`,
              handle: p.author.handle ?? "",
            })}
            onComments={() => setOpenComments(p.id)}
            onBookmark={(on) => toggleBookmark.mutate({ postId: p.id, on })}
            onShare={() => share(p)}
          />
        );
      })}

      {hasNextPage && (
        <button className="load-more" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? <><Loader2 size={15} className="spin" /> Yükleniyor…</> : "Daha fazla göster"}
        </button>
      )}

      {tipTarget && (
        <TipModal creatorAddress={tipTarget.addr} creatorHandle={tipTarget.handle} onClose={() => setTipTarget(null)} />
      )}
      {openComments && (
        <CommentSheet postId={openComments} onClose={() => setOpenComments(null)} />
      )}
    </div>
  );
}

/* ── Gönderi Kartı ── */
function PostItem({ post, liked, reposted, onLike, onRepost, onTip, onComments, onBookmark, onShare }: {
  post: FeedPost;
  liked: boolean;
  reposted: boolean;
  onLike: () => void;
  onRepost: () => void;
  onTip: () => void;
  onComments: () => void;
  onBookmark: (on: boolean) => void;
  onShare: () => void;
}) {
  const [saved, setSaved] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const p = post as any;

  return (
    <article className="post post-card">
      {/* Üst satır */}
      <div className="post-head">
        <a href={`/${post.author?.handle}`} className="post-author-avatar">
          <img
            src={getAvatarUrl(post.author?.handle ?? "user", post.author?.avatarUrl)}
            alt={post.author?.handle ?? ""}
            className="post-avatar-img"
          />
        </a>
        <div className="post-meta">
          <a href={`/${post.author?.handle}`} className="post-author-link">
            <strong>{post.author?.name ?? "Kullanıcı"}</strong>
            {post.author?.verified && <BadgeCheck size={14} className="verified post-verified" />}
          </a>
          <span className="muted post-handle">@{post.author?.handle} · {timeAgo(post.createdAt)}</span>
        </div>
        <button className="post-more-btn" onClick={() => setShowMenu(!showMenu)}>
          <MoreHorizontal size={18} />
        </button>
        {showMenu && (
          <div className="post-menu">
            <button onClick={() => { onBookmark(!saved); setSaved(!saved); setShowMenu(false); }}>
              {saved ? "Yer iminden kaldır" : "Kaydet"}
            </button>
            <button onClick={() => { onShare(); setShowMenu(false); }}>Bağlantıyı kopyala</button>
            <a href={`/${post.author?.handle}`}>Profili görüntüle</a>
          </div>
        )}
      </div>

      {/* İçerik */}
      {post.text && <p className="post-text">{post.text}</p>}
      {p.mediaUrls?.length > 1
        ? <Carousel urls={p.mediaUrls} />
        : (p.mediaUrls?.[0] || post.mediaUrl) &&
          <img className="post-media" src={p.mediaUrls?.[0] || post.mediaUrl} alt="" />
      }
      {p.poll && <PollCard poll={p.poll} />}

      {/* Aksiyonlar — Twitter tarzı */}
      <div className="post-actions">
        <button className={`action-btn like-btn ${liked ? "liked" : ""}`} onClick={onLike}>
          <Heart size={18} fill={liked ? "var(--danger)" : "none"} stroke={liked ? "var(--danger)" : "currentColor"} />
          <span>{(post.likes + (liked ? 1 : 0)).toLocaleString()}</span>
        </button>

        <button className="action-btn" onClick={onComments}>
          <MessageCircle size={18} />
          <span>{post.comments.toLocaleString()}</span>
        </button>

        <button className={`action-btn repost-btn ${reposted ? "on" : ""}`} onClick={onRepost}>
          <Repeat2 size={18} />
          <span>{((p.repostCount ?? 0) + (reposted ? 1 : 0)).toLocaleString()}</span>
        </button>

        {post.author?.walletAddress && (
          <button className="action-btn tip-btn" onClick={onTip}>
            <img src="/part-coin.svg" alt="PART" width={18} height={18} style={{ borderRadius: "50%" }} />
            <span>Bahşiş</span>
          </button>
        )}

        <div className="post-actions-right">
          <button className={`action-btn bm-btn ${saved ? "saved" : ""}`} onClick={() => { setSaved(!saved); onBookmark(!saved); }}>
            <Bookmark size={18} fill={saved ? "var(--accent)" : "none"} stroke={saved ? "var(--accent)" : "currentColor"} />
          </button>
          <button className="action-btn" onClick={onShare}>
            <Share2 size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}

/* ── Reklam Kartı ── (6829 tarihli Türk Ticaret Kanunu + RTÜK uyumlu "Reklam" etiketi) */
function AdCard({ campaign }: { campaign: any }) {
  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  const trackImpression = () => {
    fetch(`${API}/ads/track/${campaign.id}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "impression" }),
    }).catch(() => {});
  };
  const trackClick = () => {
    fetch(`${API}/ads/track/${campaign.id}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "click" }),
    }).catch(() => {});
  };

  // Görünür olunca impression say
  const ref = (node: HTMLElement | null) => {
    if (!node) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { trackImpression(); obs.disconnect(); } }, { threshold: 0.5 });
    obs.observe(node);
  };

  return (
    <article className="post ad-card" ref={ref as any}>
      {/* Yasal zorunluluk: Sponsorlu / Reklam etiketi açıkça görünmeli */}
      <div className="ad-legal-label">📢 Sponsorlu İçerik</div>
      <div className="post-head">
        <div className="ad-sponsor-logo">
          <img src="/part-coin.svg" alt="PART" width={32} height={32} />
        </div>
        <div className="post-meta">
          <strong>{campaign.name || "Saphara Reklamları"}</strong>
          <span className="ad-badge-inline">Reklam</span>
        </div>
      </div>
      {campaign.headline && <p style={{ fontWeight: 600, marginBottom: 6 }}>{campaign.headline}</p>}
      {campaign.description && <p className="muted" style={{ fontSize: 14, marginBottom: 8 }}>{campaign.description}</p>}
      {campaign.mediaUrl && (
        <img className="post-media" src={campaign.mediaUrl} alt=""
          onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
      )}
      {campaign.cta && (
        <button className="ad-cta-inline" onClick={trackClick}>{campaign.cta} →</button>
      )}
    </article>
  );
}

/* ── Kimi Takip Et ── */
function WhoToFollow() {
  const { data, isLoading } = useSuggestedUsers();
  const suggestions = data?.users ?? [];

  if (isLoading) return (
    <section className="who-to-follow">
      <h4 className="wtf-title"><Users size={15} /> Kimi Takip Et</h4>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="wtf-row skeleton" style={{ height: 52, borderRadius: 8, margin: "4px 0" }} />
      ))}
    </section>
  );

  return (
    <section className="who-to-follow">
      <h4 className="wtf-title"><Users size={15} /> Kimi Takip Et</h4>
      {suggestions.slice(0, 4).map((u: any) => (
        <div key={u.handle} className="wtf-row">
          <a href={`/${u.handle}`} className="wtf-info">
            <div className="wtf-avatar">
              <img src={getAvatarUrl(u.handle, u.avatarUrl)} alt={u.handle} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
            </div>
            <div>
              <div className="wtf-name">
                {u.name}
                {u.verified && <BadgeCheck size={13} className="verified" style={{ marginLeft: 3 }} />}
              </div>
              <div className="muted" style={{ fontSize: 12 }}>{u.bio?.slice(0, 55)}</div>
            </div>
          </a>
          <a href={`/${u.handle}`} className="ghost-btn wtf-follow">Takip Et</a>
        </div>
      ))}
      <a href="/explore" className="wtf-more">Daha fazlasını göster</a>
    </section>
  );
}

function timeAgo(iso: string): string {
  if (!iso) return "";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}dk`;
  if (s < 86400) return `${Math.floor(s / 3600)}sa`;
  if (s < 604800) return `${Math.floor(s / 86400)}g`;
  return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}
