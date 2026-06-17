"use client";

import { ReelsPlayer } from "../../features/reels/ReelsPlayer";
import { useReels } from "../../hooks/useApi";
import { Loader2, Film, Plus, Camera, Zap } from "lucide-react";

/* Demo reels — DB yokken veya gerçek reels yokken gösterilir.
   Kısa, herkese açık MP4'ler kullanılır. */
const DEMO_REELS = [
  {
    id: "demo-r1",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    poster: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=720&fit=crop",
    author: "Saphara Ekibi", handle: "saphara_official",
    caption: "Saphara'ya hoş geldin! Web3 sosyal platformunda içerik üret, PART token kazan. 🚀 #Saphara #Web3",
    sound: "Saphara Intro Beat",
    likes: 4821, comments: 312,
  },
  {
    id: "demo-r2",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    poster: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=400&h=720&fit=crop",
    author: "DeFi Analist", handle: "defi_analyst",
    caption: "PART token staking APY nasıl hesaplanır? 3 dakikada anlattım! 💎 #DeFi #Staking #PART",
    sound: "Crypto Beats",
    likes: 2940, comments: 187,
  },
  {
    id: "demo-r3",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    poster: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=400&h=720&fit=crop",
    author: "NFT Creator", handle: "nft_creator",
    caption: "NFT koleksiyonum 24 saatte tükendi! İşte sırrı... 🖼️ #NFT #BNBChain #Creator",
    sound: "Orijinal Ses",
    likes: 6103, comments: 423,
  },
  {
    id: "demo-r4",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    poster: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=720&fit=crop",
    author: "Kripto Guru", handle: "crypto_guru",
    caption: "Bitcoin teknik analizi! RSI ve MACD sinyalleri ne söylüyor? 📈 #Bitcoin #TeknikAnaliz",
    sound: "Trending Crypto",
    likes: 8247, comments: 601,
  },
  {
    id: "demo-r5",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    poster: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=720&fit=crop",
    author: "Saphara Ekibi", handle: "saphara_official",
    caption: "Launchpad IDO başvuruları açıldı! Diamond tier sahipleri garantili allocation alıyor 🚀 #IDO #Launchpad",
    sound: "Pump It Up",
    likes: 12540, comments: 891,
  },
];

export default function ReelsPage() {
  const { data, isLoading } = useReels();

  const apiReels = (data?.items ?? []).map((r: any) => ({
    id: r.id, src: r.videoUrl, poster: r.posterUrl,
    author: r.author?.name ?? "", handle: r.author?.handle ?? "",
    caption: r.caption ?? "", sound: r.sound ?? "Orijinal ses",
    likes: r.likes ?? 0, comments: r.comments ?? 0,
  }));

  const reels = apiReels.length > 0 ? apiReels : DEMO_REELS;

  if (isLoading) {
    return (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, color: "var(--muted)" }}>
        <Loader2 size={32} className="spin" />
        <p style={{ fontSize: 14 }}>Reels yükleniyor…</p>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div style={{
        height: "calc(100vh - 60px)", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 24, padding: "32px 24px", textAlign: "center",
      }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(240,180,41,.12)", border: "2px solid var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Film size={36} style={{ color: "var(--accent)" }} />
        </div>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: "var(--text)", marginBottom: 8 }}>
            Henüz Reels yok
          </h2>
          <p style={{ fontSize: 14, color: "var(--muted)", maxWidth: 320, lineHeight: 1.7 }}>
            İlk kısa videoyu sen yükle, toplulukla paylaş ve PART token kazan!
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <a href="/studio" style={{
            display: "flex", alignItems: "center", gap: 8, padding: "12px 24px",
            borderRadius: 12, background: "var(--accent)", color: "#1a1300",
            fontSize: 14, fontWeight: 800, textDecoration: "none",
          }}>
            <Camera size={16} /> Studio'da Çek
          </a>
          <a href="/create" style={{
            display: "flex", alignItems: "center", gap: 8, padding: "12px 20px",
            borderRadius: 12, border: "1.5px solid var(--border)", color: "var(--text)",
            fontSize: 14, fontWeight: 700, textDecoration: "none",
          }}>
            <Plus size={16} /> Video Yükle
          </a>
        </div>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
          {[
            { icon: Zap, label: "Her izlenme için PART kazan" },
            { icon: Film, label: "9:16 dikey video format" },
            { icon: Camera, label: "Max 60 saniye" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--muted)" }}>
              <Icon size={14} style={{ color: "var(--accent)" }} /> {label}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return <ReelsPlayer reels={reels} />;
}
