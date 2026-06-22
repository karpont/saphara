"use client";

import { useState, useRef } from "react";
import { Grid3x3, Clapperboard, Coins, BadgeCheck, Link2, Camera, Check, Loader2, X } from "lucide-react";
import {
  useProfile, useToggleFollow, useUserPosts, useUserReels, useUserBadges,
  useMe, useUpdateProfile,
} from "../../hooks/useApi";
import { GoldFrame, DiamondFrame, NeonFrame, FireFrame, GalaxyFrame, RainbowFrame, PurpleFrame } from "../market/StoreVisuals";
import { getAvatarUrl } from "../../lib/avatar";

/** activeFrame identifier → frame bileşeni */
function ProfileFrame({ frame, size, children }: { frame: string; size: number; children: React.ReactNode }) {
  if (frame.includes("diamond")) return <DiamondFrame size={size}>{children}</DiamondFrame>;
  if (frame.includes("neon"))    return <NeonFrame size={size}>{children}</NeonFrame>;
  if (frame.includes("fire"))    return <FireFrame size={size}>{children}</FireFrame>;
  if (frame.includes("galaxy"))  return <GalaxyFrame size={size}>{children}</GalaxyFrame>;
  if (frame.includes("rainbow")) return <RainbowFrame size={size}>{children}</RainbowFrame>;
  if (frame.includes("purple"))  return <PurpleFrame size={size}>{children}</PurpleFrame>;
  return <GoldFrame size={size}>{children}</GoldFrame>;
}
import { ProfileSkeleton } from "../../components/ui/Skeleton";
import { uploadMedia } from "../../lib/upload";

type Tab = "posts" | "reels" | "tipped";

/* ── Kullanıcı profil rozetleri ── */
function ProfileBadges({ handle }: { handle: string }) {
  const { data } = useUserBadges(handle);
  const earned = (data?.badges ?? []).filter((b: any) => b.earned);
  if (earned.length === 0) return null;
  return (
    <div className="profile-badges">
      {earned.map((b: any) => (
        <span key={b.id} className="profile-badge" title={b.description}>
          {b.emoji} {b.label}
        </span>
      ))}
    </div>
  );
}

/* ── Profil Düzenle Modali ── */
function EditProfileModal({ user, onClose }: { user: any; onClose: () => void }) {
  const update = useUpdateProfile();
  const avatarInput = useRef<HTMLInputElement>(null);

  const [name, setName]       = useState(user.name ?? "");
  const [bio, setBio]         = useState(user.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved]     = useState(false);

  const onAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadMedia(file, () => {});
      setAvatarUrl(url);
    } catch { /* hata sessiz */ }
    finally { setUploading(false); }
  };

  const save = () => {
    update.mutate({ name, bio, avatarUrl: avatarUrl || undefined }, {
      onSuccess: () => { setSaved(true); setTimeout(() => { setSaved(false); onClose(); }, 1000); },
    });
  };

  return (
    <div className="edit-profile-backdrop" onClick={onClose}>
      <div className="edit-profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="edit-profile-header">
          <h3>Profili Düzenle</h3>
          <button className="ghost-btn icon-btn" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Avatar */}
        <div className="edit-avatar-wrap">
          <div className="edit-avatar-preview">
            {avatarUrl
              ? <img src={avatarUrl} alt="avatar" className="edit-avatar-img" />
              : <div className="edit-avatar-placeholder" />
            }
            <button className="edit-avatar-btn" onClick={() => avatarInput.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 size={16} className="spin" /> : <Camera size={16} />}
            </button>
          </div>
          <input ref={avatarInput} type="file" accept="image/*" hidden onChange={onAvatarSelect} />
          <p className="muted" style={{ fontSize: 12 }}>JPG, PNG veya WebP · max 5MB</p>
        </div>

        {/* Alanlar */}
        <div className="edit-profile-fields">
          <label>Ad
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={50} placeholder="Adın" />
          </label>
          <label>Biyografi
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={300} rows={3} placeholder="Kendini tanıt…" />
            <small className="muted">{bio.length}/300</small>
          </label>
        </div>

        <div className="edit-profile-footer">
          <button className="ghost-btn" onClick={onClose}>İptal</button>
          <button className="primary-btn" disabled={update.isPending || uploading} onClick={save}>
            {update.isPending
              ? <><Loader2 size={15} className="spin" /> Kaydediliyor…</>
              : saved
                ? <><Check size={15} /> Kaydedildi</>
                : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Ana Profil bileşeni ── */
export function Profile({ handle = "creator" }: { handle?: string }) {
  const { data, isLoading, isError } = useProfile(handle);
  const { data: myData } = useMe();
  const toggleFollow = useToggleFollow();
  const [tab,       setTab]       = useState<Tab>("posts");
  const [following, setFollowing] = useState(false);
  const [editOpen,  setEditOpen]  = useState(false);

  if (isLoading) return <ProfileSkeleton />;
  if (isError || !data) return <div className="feed-state error">Profil yüklenemedi</div>;

  const isMe      = myData?.handle === data.handle;
  const followers = data._count?.followers ?? 0;

  const onFollow = () => {
    const next = !following;
    setFollowing(next);
    toggleFollow.mutate({ id: data.id, follow: next });
  };

  return (
    <div className="profile">
      {editOpen && <EditProfileModal user={myData ?? data} onClose={() => setEditOpen(false)} />}

      <header className="topbar"><h1>{data.name}</h1></header>
      <div className="profile-cover" />

      <div className="profile-head">
        {data.activeFrame ? (
          <ProfileFrame frame={data.activeFrame} size={96}>
            <img src={getAvatarUrl(data.handle, data.avatarUrl)} alt={data.name} className="avatar-img-framed" />
          </ProfileFrame>
        ) : (
          <div className="avatar profile-avatar">
            <img src={getAvatarUrl(data.handle, data.avatarUrl)} alt={data.name} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
          </div>
        )}

        <div className="profile-actions">
          {isMe ? (
            <button className="ghost-btn" onClick={() => setEditOpen(true)}>
              <Camera size={15} /> Profili Düzenle
            </button>
          ) : (
            <button
              className={following ? "ghost-btn" : "primary-btn"}
              disabled={toggleFollow.isPending}
              onClick={onFollow}
            >
              {following ? "Takiptesin" : "Takip Et"}
            </button>
          )}
        </div>
      </div>

      <div className="profile-info">
        <h2>
          {data.name}
          {data.verified && <BadgeCheck size={18} className="verified" />}
        </h2>
        <span className="muted">@{data.handle}</span>
        {data.bio && <p className="bio">{data.bio}</p>}
        {data.walletAddress && (
          <span className="wallet-chip">
            <Link2 size={14} />
            {data.walletAddress.slice(0, 6)}…{data.walletAddress.slice(-4)}
          </span>
        )}
        <div className="profile-stats">
          <span><strong>{data._count?.posts ?? 0}</strong> gönderi</span>
          <span><strong>{followers.toLocaleString("en-US")}</strong> takipçi</span>
          <span><strong>{data._count?.following ?? 0}</strong> takip</span>
          <span className="earn"><Coins size={14} /> <strong>{Number(data.earningsPart ?? 0).toLocaleString("en-US")}</strong> PART</span>
        </div>
      </div>

      <ProfileBadges handle={handle} />

      <nav className="profile-tabs">
        <button className={tab === "posts"  ? "on" : ""} onClick={() => setTab("posts")}>
          <Grid3x3 size={18} /> Gönderiler
        </button>
        <button className={tab === "reels"  ? "on" : ""} onClick={() => setTab("reels")}>
          <Clapperboard size={18} /> Reels
        </button>
        <button className={tab === "tipped" ? "on" : ""} onClick={() => setTab("tipped")}>
          <Coins size={18} /> Desteklenen
        </button>
      </nav>

      <ProfileContent handle={handle} tab={tab} earningsPart={data.earningsPart} />
    </div>
  );
}

/* ── Profil içerik sekmeleri ── */
function ProfileContent({ handle, tab, earningsPart }: { handle: string; tab: string; earningsPart: any }) {
  const posts = useUserPosts(handle);
  const reels = useUserReels(handle);

  if (tab === "tipped") {
    return (
      <div style={{ padding: "24px 20px" }}>
        <div className="profile-earn-card">
          <Coins size={28} style={{ color: "var(--accent)" }} />
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--accent)" }}>
              {Number(earningsPart ?? 0).toLocaleString("en-US")} PART
            </div>
            <div className="muted">Toplam bahşiş kazancı</div>
          </div>
        </div>
      </div>
    );
  }

  if (tab === "reels") {
    const items = reels.data?.pages.flatMap((p) => p.items) ?? [];
    if (reels.isLoading) return (
      <div className="content-grid">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="grid-item tall skeleton" />)}
      </div>
    );
    if (items.length === 0) return (
      <div className="empty-state">
        <Clapperboard size={32} className="empty-icon" />
        <p className="empty-title">Henüz Reels yok</p>
      </div>
    );
    return (
      <div className="content-grid">
        {items.map((r: any) => (
          <div key={r.id} className="grid-item tall" style={{ position: "relative", overflow: "hidden" }}>
            {r.posterUrl
              ? <img src={r.posterUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface-2)" }}>
                  <Clapperboard size={24} className="muted" />
                </div>
            }
          </div>
        ))}
      </div>
    );
  }

  // Posts sekmesi
  const items = posts.data?.pages.flatMap((p) => p.items) ?? [];
  if (posts.isLoading) return (
    <div className="content-grid">
      {Array.from({ length: 6 }).map((_, i) => <div key={i} className="grid-item skeleton" />)}
    </div>
  );
  if (items.length === 0) return (
    <div className="empty-state">
      <Grid3x3 size={32} className="empty-icon" />
      <p className="empty-title">Henüz gönderi yok</p>
    </div>
  );
  return (
    <div className="content-grid">
      {items.map((p: any) => (
        <div key={p.id} className="grid-item" style={{ position: "relative", overflow: "hidden" }}>
          {p.mediaUrls?.[0] || p.mediaUrl
            ? <img src={p.mediaUrls?.[0] || p.mediaUrl} alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{ padding: "8px", fontSize: 12, lineHeight: 1.4, overflow: "hidden" }}>
                {p.text?.slice(0, 60)}
              </div>
          }
        </div>
      ))}
    </div>
  );
}
