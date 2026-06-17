"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import {
  Heart, MessageCircle, Share2, Coins, Music, Play, Pause,
  Volume2, VolumeX, Bookmark, UserPlus, UserCheck, ChevronUp, ChevronDown,
} from "lucide-react";

export interface Reel {
  id: string;
  src: string;
  poster?: string;
  author: string;
  handle: string;
  avatarUrl?: string;
  caption: string;
  sound: string;
  likes: number;
  comments: number;
  isFollowing?: boolean;
}

export function ReelsPlayer({ reels }: { reels: Reel[] }) {
  const feedRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);

  const goTo = useCallback((idx: number) => {
    const clamped = Math.max(0, Math.min(idx, reels.length - 1));
    setCurrent(clamped);
    const items = feedRef.current?.querySelectorAll(".reel");
    items?.[clamped]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [reels.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") goTo(current + 1);
      if (e.key === "ArrowUp") goTo(current - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, goTo]);

  return (
    <div className="reels-feed" ref={feedRef}>
      {reels.map((r, i) => (
        <ReelItem key={r.id} reel={r} active={i === current}
          onNext={() => goTo(current + 1)} onPrev={() => goTo(current - 1)}
          hasNext={current < reels.length - 1} hasPrev={current > 0} />
      ))}
    </div>
  );
}

function ReelItem({ reel, active, onNext, onPrev, hasNext, hasPrev }: {
  reel: Reel; active: boolean;
  onNext: () => void; onPrev: () => void;
  hasNext: boolean; hasPrev: boolean;
}) {
  const videoRef   = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLElement>(null);
  const [playing,  setPlaying]  = useState(false);
  const [muted,    setMuted]    = useState(true);
  const [liked,    setLiked]    = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [following, setFollowing] = useState(reel.isFollowing ?? false);
  const [progress, setProgress] = useState(0);
  const [likeAnim, setLikeAnim] = useState(false);
  const [tipOpen,  setTipOpen]  = useState(false);
  const lastTapRef = useRef(0);

  /* IntersectionObserver — autoplay when visible */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
          video.play().then(() => setPlaying(true)).catch(() => {});
        } else {
          video.pause();
          setPlaying(false);
        }
      },
      { threshold: [0, 0.6, 1] }
    );
    obs.observe(video);
    return () => obs.disconnect();
  }, []);

  /* Progress bar */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTime = () => {
      if (video.duration) setProgress(video.currentTime / video.duration);
    };
    video.addEventListener("timeupdate", onTime);
    return () => video.removeEventListener("timeupdate", onTime);
  }, []);

  /* Muted sync */
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  }, []);

  /* Double-tap to like */
  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      setLiked(true);
      setLikeAnim(true);
      setTimeout(() => setLikeAnim(false), 800);
    } else {
      togglePlay();
    }
    lastTapRef.current = now;
  }, [togglePlay]);

  /* Swipe to navigate */
  const touchStartY = useRef(0);
  const onTouchStart = (e: React.TouchEvent) => { touchStartY.current = e.touches[0].clientY; };
  const onTouchEnd   = (e: React.TouchEvent) => {
    const dy = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(dy) > 60) { if (dy > 0) onNext(); else onPrev(); }
  };

  const likeCount = reel.likes + (liked ? 1 : 0);

  return (
    <section className="reel" ref={containerRef}
      onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>

      <video ref={videoRef} src={reel.src} poster={reel.poster}
        loop playsInline onClick={handleTap} />

      {/* Double-tap heart burst */}
      {likeAnim && (
        <div className="reel-like-burst">
          <Heart size={80} fill="#f43f5e" color="#f43f5e" />
        </div>
      )}

      {/* Play/pause overlay icon (momentary) */}
      {!playing && !likeAnim && (
        <button className="reel-play" onClick={togglePlay} aria-label="Oynat">
          <Play size={56} fill="white" />
        </button>
      )}

      {/* Progress bar */}
      <div className="reel-progress-track">
        <div className="reel-progress-fill" style={{ width: `${progress * 100}%` }} />
      </div>

      {/* Nav arrows */}
      {hasPrev && (
        <button className="reel-nav reel-nav-up" onClick={onPrev} aria-label="Önceki">
          <ChevronUp size={22} />
        </button>
      )}
      {hasNext && (
        <button className="reel-nav reel-nav-down" onClick={onNext} aria-label="Sonraki">
          <ChevronDown size={22} />
        </button>
      )}

      <div className="reel-overlay">

        {/* Left: author info */}
        <div className="reel-info">
          <div className="reel-author-row">
            <div className="reel-avatar">
              {reel.avatarUrl
                ? <img src={reel.avatarUrl} alt={reel.author} />
                : <div className="reel-avatar-ph">{reel.author[0]}</div>}
            </div>
            <div>
              <strong className="reel-handle">{reel.handle}</strong>
              <div className="reel-author-name">{reel.author}</div>
            </div>
            <button
              className={`reel-follow-btn ${following ? "following" : ""}`}
              onClick={() => setFollowing(f => !f)}
            >
              {following
                ? <><UserCheck size={13} /> Takip Ediliyor</>
                : <><UserPlus size={13} /> Takip Et</>}
            </button>
          </div>
          <p className="reel-caption">{reel.caption}</p>
          <span className="reel-sound">
            <Music size={13} className="spin-slow" /> {reel.sound}
          </span>
        </div>

        {/* Right: action buttons */}
        <div className="reel-actions">
          <button onClick={() => { setLiked(v => !v); }} className={`reel-action-btn ${liked ? "on" : ""}`}>
            <Heart size={28} fill={liked ? "#f43f5e" : "none"} color={liked ? "#f43f5e" : "white"} />
            <small>{likeCount.toLocaleString()}</small>
          </button>
          <button className="reel-action-btn">
            <MessageCircle size={28} />
            <small>{reel.comments.toLocaleString()}</small>
          </button>
          <button className={`reel-action-btn ${saved ? "on" : ""}`} onClick={() => setSaved(v => !v)}>
            <Bookmark size={26} fill={saved ? "var(--accent)" : "none"} color={saved ? "var(--accent)" : "white"} />
            <small>Kaydet</small>
          </button>
          <button className="reel-action-btn" onClick={() => setTipOpen(true)}>
            <Coins size={26} color="#f0b429" />
            <small>PART</small>
          </button>
          <button className="reel-action-btn" onClick={() => {
            if (navigator.share) navigator.share({ url: window.location.href, title: reel.caption });
          }}>
            <Share2 size={26} />
            <small>Paylaş</small>
          </button>
          <button className="reel-action-btn" onClick={() => setMuted(m => !m)}>
            {muted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            <small>{muted ? "Ses Aç" : "Sessize"}</small>
          </button>
        </div>
      </div>

      {/* Tip modal */}
      {tipOpen && <TipModal author={reel.author} onClose={() => setTipOpen(false)} />}
    </section>
  );
}

function TipModal({ author, onClose }: { author: string; onClose: () => void }) {
  const [amount, setAmount] = useState("10");
  const [currency, setCurrency] = useState<"PART" | "USDT" | "BNB">("PART");
  const [sent, setSent] = useState(false);

  const send = () => {
    setSent(true);
    setTimeout(onClose, 1500);
  };

  return (
    <div className="reel-tip-backdrop" onClick={onClose}>
      <div className="reel-tip-modal" onClick={e => e.stopPropagation()}>
        <h3>💸 {author}'a Bahşiş Gönder</h3>
        <div className="reel-tip-currencies">
          {(["PART", "USDT", "BNB"] as const).map(c => (
            <button key={c} className={currency === c ? "on" : ""} onClick={() => setCurrency(c)}>{c}</button>
          ))}
        </div>
        <div className="reel-tip-amounts">
          {["5", "10", "25", "50", "100"].map(a => (
            <button key={a} className={amount === a ? "on" : ""} onClick={() => setAmount(a)}>{a}</button>
          ))}
        </div>
        <input type="number" className="reel-tip-input" value={amount}
          onChange={e => setAmount(e.target.value)} min="1" />
        {sent
          ? <div className="reel-tip-sent">✓ {amount} {currency} gönderildi!</div>
          : <button className="primary-btn" style={{ width: "100%", marginTop: 12 }} onClick={send}>
              Gönder — {amount} {currency}
            </button>}
        <button className="reel-tip-close" onClick={onClose}>✕</button>
      </div>
    </div>
  );
}
