"use client";

/** Yukleniyor iskeletleri — spinner yerine icerik-bicimli placeholder. */
export function Skeleton({ w, h, r = 8, className = "" }: { w?: string | number; h?: string | number; r?: number; className?: string }) {
  return <div className={`skeleton ${className}`} style={{ width: w, height: h, borderRadius: r }} />;
}

/** Akis gonderi iskeleti. */
export function PostSkeleton() {
  return (
    <div className="post skel-post">
      <div className="skel-row">
        <Skeleton w={40} h={40} r={20} />
        <div style={{ flex: 1 }}>
          <Skeleton w="40%" h={12} />
          <Skeleton w="25%" h={10} className="mt6" />
        </div>
      </div>
      <Skeleton w="90%" h={12} className="mt12" />
      <Skeleton w="75%" h={12} className="mt6" />
      <Skeleton w="100%" h={180} r={12} className="mt12" />
    </div>
  );
}

/** Birden fazla iskelet. */
export function FeedSkeleton({ count = 3 }: { count?: number }) {
  return <>{Array.from({ length: count }).map((_, i) => <PostSkeleton key={i} />)}</>;
}

/** Bos durum (icerik yokken). */
export function EmptyState({ icon, title, hint }: { icon?: React.ReactNode; title: string; hint?: string }) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-icon">{icon}</div>}
      <p className="empty-title">{title}</p>
      {hint && <p className="empty-hint">{hint}</p>}
    </div>
  );
}

/** Profil sayfasi iskeleti. */
export function ProfileSkeleton() {
  return (
    <div>
      <Skeleton w="100%" h={160} r={0} />
      <div style={{ padding: "0 20px", marginTop: -40 }}>
        <Skeleton w={96} h={96} r={48} />
        <Skeleton w="40%" h={20} className="mt12" />
        <Skeleton w="25%" h={12} className="mt6" />
        <Skeleton w="80%" h={12} className="mt12" />
      </div>
    </div>
  );
}

/** Urun/kart izgarasi iskeleti. */
export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="market-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <Skeleton w="100%" h={140} r={12} />
          <Skeleton w="70%" h={14} className="mt12" />
          <Skeleton w="40%" h={12} className="mt6" />
        </div>
      ))}
    </div>
  );
}

/** Liste satiri iskeleti (bildirim, mesaj, haber). */
export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skel-row" style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <Skeleton w={36} h={36} r={18} />
          <div style={{ flex: 1 }}>
            <Skeleton w="50%" h={13} />
            <Skeleton w="80%" h={11} className="mt6" />
          </div>
        </div>
      ))}
    </div>
  );
}
