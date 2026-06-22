"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ShoppingBag, ShieldCheck, DollarSign, Loader2, Store, Check,
  TrendingUp, ExternalLink, RefreshCw, Search, Filter,
  Plus, X, Package, Zap,
} from "lucide-react";
import { useListings, useCreateListing, useStore, useInventory, useBuyStoreItem, useEquipItem, useTopCrypto } from "../../hooks/useApi";
import { api } from "../../lib/api";
import { useAuth } from "../auth/AuthContext";
import { useTipping } from "../tipping/useTipping";
import { config } from "@saphara/config";
import { StoreItemVisual } from "./StoreVisuals";
import { GridSkeleton } from "../../components/ui/Skeleton";
import { getAvatarUrl } from "../../lib/avatar";

type Tab = "market" | "store" | "crypto";


const CATEGORIES = [
  { key: "", label: "Tümü", icon: "🌐" },
  { key: "nft", label: "NFT", icon: "🖼" },
  { key: "code", label: "Kod", icon: "💻" },
  { key: "design", label: "Tasarım", icon: "🎨" },
  { key: "video", label: "Video", icon: "🎬" },
  { key: "music", label: "Müzik", icon: "🎵" },
  { key: "ebook", label: "E-Kitap", icon: "📖" },
  { key: "course", label: "Kurs", icon: "🎓" },
  { key: "tools", label: "Araçlar", icon: "🔧" },
  { key: "analytics", label: "Analitik", icon: "📊" },
  { key: "marketing", label: "Pazarlama", icon: "📣" },
  { key: "consulting", label: "Danışmanlık", icon: "💼" },
  { key: "photos", label: "Fotoğraf", icon: "📷" },
];

export function Marketplace() {
  const [tab, setTab] = useState<Tab>("market");
  return (
    <div className="market">
      <header className="topbar"><h1>Market</h1></header>
      <div className="market-tabs">
        <button className={tab === "market" ? "on" : ""} onClick={() => setTab("market")}>
          <ShoppingBag size={16} /> Pazar
        </button>
        <button className={tab === "store" ? "on" : ""} onClick={() => setTab("store")}>
          <Store size={16} /> Mağaza
        </button>
        <button className={tab === "crypto" ? "on" : ""} onClick={() => setTab("crypto")}>
          <TrendingUp size={16} /> Kripto
        </button>
      </div>
      {tab === "market"  && <MarketListings />}
      {tab === "store"   && <VirtualStore />}
      {tab === "crypto"  && <CryptoMarket />}
    </div>
  );
}

/* ──────────────── Pazar (kullanıcı ilanları) ──────────────── */
function CreateListingModal({ onClose }: { onClose: () => void }) {
  const create = useCreateListing();
  const [form, setForm] = useState({ title: "", description: "", pricePart: "", category: "digital", imageUrl: "" });
  const price = Number(form.pricePart) || 0;
  const commission = price * 0.025;
  const sellerReceives = price - commission;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.pricePart) return;
    create.mutate(
      { title: form.title, description: form.description, pricePart: form.pricePart, imageUrl: form.imageUrl || undefined, ...(form.category !== "digital" ? { category: form.category } : {}) } as any,
      { onSuccess: () => setTimeout(onClose, 1400) }
    );
  }

  return (
    <div className="ml-modal-overlay" onClick={onClose}>
      <div className="ml-modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
        <button className="ml-modal-close" onClick={onClose}><X size={18} /></button>
        <div className="ml-modal-body" style={{ paddingTop: 8 }}>
          <h2 style={{ marginBottom: 16 }}>İlan Oluştur</h2>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input required placeholder="Başlık *" className="create-input"
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <textarea placeholder="Açıklama" className="create-input" rows={3}
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <select className="create-input" value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.filter(c => c.key).map(c => <option key={c.key} value={c.key}>{c.icon} {c.label}</option>)}
            </select>
            <input required type="number" placeholder="Fiyat (PART) *" className="create-input" min={1}
              value={form.pricePart} onChange={e => setForm(f => ({ ...f, pricePart: e.target.value }))} />
            <input placeholder="Görsel URL (opsiyonel)" className="create-input"
              value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} />

            {price > 0 && (
              <div className="create-fee-preview">
                <span>Fiyat: <strong>{price} PART</strong></span>
                <span>Komisyon (%2.5): <strong>{commission.toFixed(1)} PART</strong></span>
                <span>Net kazanç: <strong style={{ color: "var(--accent)" }}>{sellerReceives.toFixed(1)} PART</strong></span>
              </div>
            )}

            {create.isSuccess && <p style={{ color: "#22c55e", fontSize: 13 }}>✓ İlan oluşturuldu!</p>}
            {create.isError  && <p style={{ color: "#e5484d", fontSize: 13 }}>{(create.error as any)?.message}</p>}

            <button type="submit" className="ml-modal-buy" disabled={create.isPending || create.isSuccess}>
              {create.isPending ? "Oluşturuluyor…" : create.isSuccess ? "✓ Oluşturuldu" : "İlanı Yayınla"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function MarketListings() {
  const { data, isLoading } = useListings();
  const { isAuthed } = useAuth();
  const feePct = "2.5";
  const tip = useTipping();

  const [search, setSearch]       = useState("");
  const [category, setCategory]   = useState("");
  const [sortBy, setSortBy]       = useState<"newest" | "price_asc" | "price_desc">("newest");
  const [busyId, setBusyId]       = useState("");
  const [msg, setMsg]             = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [quickView, setQuickView] = useState<any>(null);

  const allItems = data?.items ?? [];

  const items = useMemo(() => {
    let list = [...allItems];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p: any) =>
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.seller?.handle?.toLowerCase().includes(q)
      );
    }
    if (category) {
      list = list.filter((p: any) => (p.category ?? "").toLowerCase() === category);
    }
    if (sortBy === "price_asc")  list.sort((a: any, b: any) => Number(a.pricePart) - Number(b.pricePart));
    if (sortBy === "price_desc") list.sort((a: any, b: any) => Number(b.pricePart) - Number(a.pricePart));
    return list;
  }, [allItems, search, category, sortBy]);

  const purchaseListing = async (p: any) => {
    if (!isAuthed) { setMsg("Satın almak için önce giriş yapın."); return; }
    setBusyId(p.id); setMsg("");
    try {
      // Try API buy first (off-chain PART balance), fall back to on-chain
      try {
        await api.post(`/listings/${p.id}/buy`);
        setMsg(`${p.title} başarıyla satın alındı ✓`);
      } catch (apiErr: any) {
        // Fallback: on-chain payment
        const usdtAmt = (Number(p.pricePart) * config.partUsdRate).toFixed(2);
        try {
          await tip.tipWithUsdt(p.seller?.walletAddress ?? config.treasury, usdtAmt);
        } catch {
          await tip.tipWithPart(p.seller?.walletAddress ?? config.treasury, String(p.pricePart));
        }
        setMsg(`${p.title} başarıyla satın alındı ✓`);
      }
      setQuickView(null);
    } catch (e) {
      setMsg((e as Error).message.slice(0, 100));
    } finally { setBusyId(""); }
  };

  if (isLoading) return <GridSkeleton count={8} />;

  return (
    <div className="ml-wrap">

      {/* ── Top bar ── */}
      <div className="ml-topbar">
        <div className="ml-search-wrap">
          <Search size={15} className="ml-search-icon" />
          <input
            className="ml-search"
            placeholder="İlan, kategori veya satıcı ara…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && <button className="ml-search-clear" onClick={() => setSearch("")}><X size={14} /></button>}
        </div>
        <select className="ml-sort" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
          <option value="newest">En Yeni</option>
          <option value="price_asc">Fiyat: Düşük → Yüksek</option>
          <option value="price_desc">Fiyat: Yüksek → Düşük</option>
        </select>
        {isAuthed && (
          <button className="ml-create-btn" onClick={() => setShowCreate(true)}>
            <Plus size={15} /> İlan Aç
          </button>
        )}
      </div>

      {/* ── Category pills ── */}
      <div className="ml-cats">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            className={`ml-cat${category === c.key ? " on" : ""}`}
            onClick={() => setCategory(c.key)}
          >
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      {/* ── Stats strip ── */}
      <div className="ml-stats">
        <span><Package size={13} /> {allItems.length} ilan</span>
        <span><ShieldCheck size={13} /> Escrow korumalı</span>
        <span><Zap size={13} /> PART + USDT kabul</span>
        {items.length !== allItems.length && <span><Filter size={13} /> {items.length} sonuç</span>}
      </div>

      {msg && (
        <div className={`ml-msg ${msg.includes("✓") ? "ml-msg--ok" : "ml-msg--err"}`}>
          {msg} <button onClick={() => setMsg("")}><X size={13} /></button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="market-empty">
          <ShoppingBag size={40} className="empty-icon" />
          <p className="empty-title">{search || category ? "Sonuç bulunamadı" : "Henüz ilan yok"}</p>
          <p className="muted">{search ? "Farklı bir arama deneyin" : "İlk ilanı sen aç!"}</p>
        </div>
      ) : (
        <div className="ml-grid">
          {items.map((p: any) => {
            const handle = p.seller?.handle ?? "satici";
            const avatar = getAvatarUrl(handle, p.seller?.avatarUrl);
            const usd = (Number(p.pricePart) * config.partUsdRate).toFixed(2);
            const isBusy = busyId === p.id;

            return (
              <article key={p.id} className="ml-card" onClick={() => setQuickView(p)}>
                <div className="ml-card-img">
                  <img
                    src={p.imageUrl ?? `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(p.title)}&size=300`}
                    alt={p.title}
                    loading="lazy"
                  />
                  {p.category && <span className="ml-badge">{p.category}</span>}
                </div>
                <div className="ml-card-body">
                  <div className="ml-seller">
                    <img src={avatar} alt={handle} className="ml-seller-avatar" />
                    <span className="ml-seller-name">@{handle}</span>
                    {p.seller?.verified && <span className="ml-verified">✓</span>}
                  </div>
                  <h3 className="ml-card-title">{p.title}</h3>
                  {p.description && (
                    <p className="ml-card-desc">{p.description.slice(0, 80)}{p.description.length > 80 ? "…" : ""}</p>
                  )}
                  <div className="ml-card-footer">
                    <div className="ml-price">
                      <DollarSign size={13} />
                      <strong>{usd} USDT</strong>
                      <small>{Number(p.pricePart).toLocaleString("en-US")} PART</small>
                    </div>
                    <button
                      className="ml-buy-btn"
                      disabled={isBusy}
                      onClick={(e) => { e.stopPropagation(); purchaseListing(p); }}
                    >
                      {isBusy ? <Loader2 size={13} className="spin" /> : <ShoppingBag size={13} />}
                      Al
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ── Quick View Modal ── */}
      {quickView && (
        <div className="ml-modal-overlay" onClick={() => setQuickView(null)}>
          <div className="ml-modal" onClick={(e) => e.stopPropagation()}>
            <button className="ml-modal-close" onClick={() => setQuickView(null)}><X size={18} /></button>
            <div className="ml-modal-img">
              <img
                src={quickView.imageUrl ?? `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(quickView.title)}&size=400`}
                alt={quickView.title}
              />
            </div>
            <div className="ml-modal-body">
              {quickView.category && <span className="ml-badge">{quickView.category}</span>}
              <h2>{quickView.title}</h2>
              <div className="ml-seller" style={{ margin: "10px 0" }}>
                <img src={getAvatarUrl(quickView.seller?.handle ?? "", quickView.seller?.avatarUrl)} alt="" className="ml-seller-avatar" />
                <span>@{quickView.seller?.handle}</span>
                {quickView.seller?.verified && <span className="ml-verified">✓</span>}
              </div>
              {quickView.description && <p className="ml-modal-desc">{quickView.description}</p>}
              <div className="ml-modal-price">
                <div>
                  <strong style={{ fontSize: 22 }}>{Number(quickView.pricePart).toLocaleString("en-US")} PART</strong>
                  <span className="muted" style={{ fontSize: 13, marginLeft: 8 }}>${(Number(quickView.pricePart) * config.partUsdRate).toFixed(2)}</span>
                </div>
                <div className="ml-modal-fee">
                  <ShieldCheck size={13} /> %{feePct} komisyon · Satıcı alır: {(Number(quickView.pricePart) * 0.975).toFixed(1)} PART
                </div>
              </div>
              <button
                className="ml-modal-buy"
                disabled={busyId === quickView.id}
                onClick={() => purchaseListing(quickView)}
              >
                {busyId === quickView.id ? <><Loader2 size={16} className="spin" /> İşleniyor…</> : <><ShoppingBag size={16} /> Satın Al</>}
              </button>
              {msg && <p style={{ marginTop: 8, fontSize: 13, color: msg.includes("✓") ? "#3fb950" : "var(--danger)" }}>{msg}</p>}
            </div>
          </div>
        </div>
      )}

      {showCreate && <CreateListingModal onClose={() => setShowCreate(false)} />}

      <style>{`
        .ml-wrap { padding: 16px 20px 64px; max-width: 1100px; }

        .ml-topbar { display: flex; gap: 10px; align-items: center; margin-bottom: 12px; flex-wrap: wrap; }
        .ml-search-wrap { flex: 1; min-width: 200px; position: relative; display: flex; align-items: center; }
        .ml-search-icon { position: absolute; left: 12px; color: var(--muted); pointer-events: none; }
        .ml-search { width: 100%; padding: 9px 12px 9px 34px; border-radius: 10px; border: 1.5px solid var(--border); background: var(--surface-2); color: var(--text); font-size: 14px; outline: none; }
        .ml-search:focus { border-color: var(--accent); }
        .ml-search-clear { position: absolute; right: 10px; background: none; border: none; color: var(--muted); cursor: pointer; padding: 2px; }
        .ml-sort { padding: 9px 12px; border-radius: 10px; border: 1.5px solid var(--border); background: var(--surface-2); color: var(--text); font-size: 13px; cursor: pointer; outline: none; }
        .ml-create-btn { display: flex; align-items: center; gap: 6px; padding: 9px 16px; border-radius: 10px; background: var(--accent); color: #1a1300; font-size: 13px; font-weight: 700; border: none; cursor: pointer; white-space: nowrap; }
        .ml-create-btn:hover { opacity: .88; }

        .ml-cats { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
        .ml-cat { padding: 6px 14px; border-radius: 99px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1.5px solid var(--border); background: transparent; color: var(--muted); white-space: nowrap; transition: all .15s; }
        .ml-cat:hover { border-color: var(--accent); color: var(--text); }
        .ml-cat.on { background: var(--accent); border-color: var(--accent); color: #1a1300; }

        .ml-stats { display: flex; gap: 16px; align-items: center; font-size: 12px; color: var(--muted); margin-bottom: 16px; flex-wrap: wrap; }
        .ml-stats span { display: flex; align-items: center; gap: 4px; }

        .ml-msg { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; margin-bottom: 12px; }
        .ml-msg--ok { background: rgba(63,185,80,.12); color: #3fb950; }
        .ml-msg--err { background: rgba(231,70,70,.12); color: var(--danger, #e74646); }
        .ml-msg button { background: none; border: none; cursor: pointer; color: inherit; }

        .ml-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
        .ml-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; cursor: pointer; transition: border-color .15s, transform .15s; display: flex; flex-direction: column; }
        .ml-card:hover { border-color: var(--accent); transform: translateY(-3px); }

        .ml-card-img { height: 160px; overflow: hidden; position: relative; background: var(--surface-2); }
        .ml-card-img img { width: 100%; height: 100%; object-fit: cover; transition: transform .3s; }
        .ml-card:hover .ml-card-img img { transform: scale(1.04); }
        .ml-badge { position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,.65); color: #fff; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 99px; text-transform: uppercase; letter-spacing: .5px; }

        .ml-card-body { padding: 12px 14px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
        .ml-seller { display: flex; align-items: center; gap: 6px; }
        .ml-seller-avatar { width: 26px; height: 26px; border-radius: 50%; object-fit: cover; border: 1.5px solid var(--border); }
        .ml-seller-name { font-size: 12px; color: var(--muted); }
        .ml-verified { color: var(--accent); font-size: 11px; font-weight: 700; }

        .ml-card-title { font-size: 14px; font-weight: 700; line-height: 1.35; color: var(--text); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .ml-card-desc { font-size: 12px; color: var(--muted); line-height: 1.4; }

        .ml-card-footer { display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 8px; border-top: 1px solid var(--border); }
        .ml-price { display: flex; align-items: center; gap: 3px; font-size: 13px; }
        .ml-price strong { color: var(--text); }
        .ml-price small { color: var(--muted); font-size: 10px; margin-left: 4px; }
        .ml-buy-btn { display: flex; align-items: center; gap: 4px; padding: 6px 12px; border-radius: 8px; background: var(--accent); color: #1a1300; font-size: 12px; font-weight: 700; border: none; cursor: pointer; transition: opacity .15s; }
        .ml-buy-btn:hover:not(:disabled) { opacity: .85; }
        .ml-buy-btn:disabled { opacity: .5; cursor: default; }

        /* Quick view modal */
        .ml-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.65); z-index: 999; display: flex; align-items: center; justify-content: center; padding: 16px; }
        .ml-modal { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; width: 100%; max-width: 600px; overflow: hidden; position: relative; max-height: 90vh; overflow-y: auto; }
        .ml-modal-close { position: absolute; top: 12px; right: 12px; background: var(--surface-2); border: none; color: var(--text); cursor: pointer; border-radius: 8px; padding: 6px; z-index: 1; }
        .ml-modal-img { height: 240px; overflow: hidden; background: var(--surface-2); }
        .ml-modal-img img { width: 100%; height: 100%; object-fit: cover; }
        .ml-modal-body { padding: 20px 24px; }
        .ml-modal-body h2 { font-size: 20px; font-weight: 800; margin: 8px 0; }
        .ml-modal-desc { font-size: 14px; color: var(--muted); line-height: 1.7; margin: 12px 0; }
        .ml-modal-price { display: flex; flex-direction: column; gap: 4px; margin: 16px 0; }
        .ml-modal-fee { display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--muted); }
        .ml-modal-buy { width: 100%; padding: 13px; border-radius: 12px; background: var(--accent); color: #1a1300; font-size: 15px; font-weight: 800; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: opacity .15s; }
        .ml-modal-buy:hover:not(:disabled) { opacity: .88; }
        .ml-modal-buy:disabled { opacity: .5; cursor: default; }

        .create-input { width:100%;padding:9px 12px;border-radius:10px;border:1.5px solid var(--border);background:var(--surface-2);color:var(--text);font-size:13px;outline:none;box-sizing:border-box;transition:border-color .15s; }
        .create-input:focus { border-color:var(--accent); }
        textarea.create-input { resize:vertical; }
        .create-fee-preview { background:var(--surface-2);border-radius:10px;padding:10px 14px;font-size:12px;display:flex;flex-direction:column;gap:4px;color:var(--muted); }
        .create-fee-preview strong { color:var(--text); }

        @media (max-width: 600px) {
          .ml-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px; }
          .ml-card-img { height: 120px; }
        }
      `}</style>
    </div>
  );
}

/* ──────────────── Reklam İzle Modal ──────────────── */
const AD_DURATION = 15;
const AD_REWARD   = 10;

function WatchAdModal({ onClose, onReward }: { onClose: () => void; onReward: (part: number) => void }) {
  const [secs, setSecs] = useState(AD_DURATION);
  const done = secs <= 0;

  useEffect(() => {
    if (done) return;
    const t = setTimeout(() => setSecs(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secs, done]);

  const claim = () => { onReward(AD_REWARD); onClose(); };
  const pct   = Math.round(((AD_DURATION - secs) / AD_DURATION) * 100);

  return (
    <div className="ml-modal-overlay" onClick={done ? onClose : undefined}>
      <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ad-header">
          <span><Zap size={15} style={{ verticalAlign: "middle" }} /> Reklam İzle &amp; <strong>{AD_REWARD} PART</strong> Kazan</span>
          {done && <button className="ml-modal-close" style={{ position: "static" }} onClick={onClose}><X size={18} /></button>}
        </div>
        <div className="ad-body">
          <div className="ad-brand-logo">🎯</div>
          <p className="ad-title">Saphara ile Kazan</p>
          <p className="ad-sub">Web3 sosyal platformunda içerik paylaş, PART token kazan.</p>
          {!done && (
            <div className="ad-counter">{secs}s</div>
          )}
        </div>
        {!done ? (
          <div className="ad-progress-wrap">
            <div className="ad-progress-bar" style={{ width: `${pct}%` }} />
          </div>
        ) : (
          <button className="ad-claim-btn" onClick={claim}>
            <Zap size={16} /> {AD_REWARD} PART Ödülü Al
          </button>
        )}
        <style>{`
          .ad-modal { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; width: 100%; max-width: 380px; overflow: hidden; }
          .ad-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px 10px; border-bottom: 1px solid var(--border); font-size: 14px; font-weight: 700; color: var(--text); }
          .ad-body { display: flex; flex-direction: column; align-items: center; padding: 28px 20px 20px; gap: 8px; }
          .ad-brand-logo { font-size: 52px; }
          .ad-title { font-size: 18px; font-weight: 800; color: var(--text); margin: 0; }
          .ad-sub { font-size: 13px; color: var(--muted); text-align: center; margin: 0; }
          .ad-counter { width: 56px; height: 56px; border-radius: 50%; background: var(--surface-2); border: 3px solid var(--accent); display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 800; color: var(--accent); margin-top: 8px; }
          .ad-progress-wrap { height: 6px; background: var(--surface-2); }
          .ad-progress-bar { height: 100%; background: var(--accent); transition: width .9s linear; border-radius: 0 3px 3px 0; }
          .ad-claim-btn { width: 100%; padding: 14px; background: var(--accent); color: #1a1300; font-size: 15px; font-weight: 800; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: opacity .15s; }
          .ad-claim-btn:hover { opacity: .88; }
          .watch-ad-btn { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 10px; background: rgba(240,180,41,.15); border: 1.5px solid var(--accent); color: var(--accent); font-size: 13px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: background .15s; }
          .watch-ad-btn:hover { background: rgba(240,180,41,.28); }
        `}</style>
      </div>
    </div>
  );
}

/* ──────────────── Sanal Mağaza ──────────────── */
const KIND_LABEL: Record<string, string> = { avatar: "Profil Resmi", frame: "Çerçeve", badge: "Rozet", theme: "Tema" };

function VirtualStore() {
  const [kind, setKind]     = useState<string>("");
  const store               = useStore(kind || undefined);
  const inventory           = useInventory();
  const buy                 = useBuyStoreItem();
  const equip               = useEquipItem();
  const tip                 = useTipping();
  const [busyId, setBusyId] = useState<string>("");
  const [msg, setMsg]       = useState("");
  const [showAd, setShowAd] = useState(false);
  const [adMsg, setAdMsg]   = useState("");

  const items = store.data?.items ?? [];
  const owned = new Map((inventory.data?.items ?? []).map((i: any) => [i.itemId, i]));
  const KINDS = ["", "avatar", "frame", "badge", "theme"];

  const purchase = async (item: any) => {
    setBusyId(item.id); setMsg("");
    try {
      const usdtAmount = (Number(item.priceUsd ?? (Number(item.pricePart) * config.partUsdRate).toFixed(2))).toFixed(2);
      try {
        await tip.tipWithUsdt(config.treasury, usdtAmount);
      } catch {
        await tip.tipWithPart(config.treasury, String(item.pricePart));
      }
      await buy.mutateAsync({ itemId: item.id, txHash: undefined });
      setMsg(`${item.name} satın alındı ✓`);
    } catch (e) {
      setMsg((e as Error).message.slice(0, 80));
    } finally { setBusyId(""); }
  };

  const handleAdReward = (part: number) => {
    setAdMsg(`+${part} PART kazandın! ✓`);
    setTimeout(() => setAdMsg(""), 4000);
  };

  return (
    <div className="store">
      <div className="store-topbar">
        <div className="discover-cats" style={{ flex: 1 }}>
          {KINDS.map((k) => (
            <button key={k || "all"} className={kind === k ? "cat on" : "cat"} onClick={() => setKind(k)}>
              {k ? KIND_LABEL[k] : "Tümü"}
            </button>
          ))}
        </div>
        <button className="watch-ad-btn" onClick={() => setShowAd(true)}>
          <Zap size={14} /> Reklam İzle · {10} PART
        </button>
      </div>
      {adMsg && <p className="launch-msg" style={{ color: "#3fb950", margin: "0 0 10px" }}>{adMsg}</p>}
      <p className="store-note muted">
        Profil görünümünü USDT veya PART ile kişiselleştir. Tüm BNB Chain cüzdanları desteklenir.
      </p>
      {store.isLoading && <GridSkeleton count={6} />}
      <div className="market-grid">
        {items.map((item: any) => {
          const has = owned.get(item.id);
          const usdPrice = item.priceUsd ? Number(item.priceUsd).toFixed(2) : (Number(item.pricePart) * config.partUsdRate).toFixed(2);
          return (
            <article key={item.id} className="product store-item">
              <div className="product-img store-img">
                <StoreItemVisual name={item.name} kind={item.kind} imageUrl={item.imageUrl} size={72} />
              </div>
              <div className="product-body">
                <span className="kind-tag">{KIND_LABEL[item.kind]}</span>
                <h3>{item.name}</h3>
                <div className="price usdt">
                  <DollarSign size={15} /> {usdPrice} USDT
                  <small className="muted"> · {Number(item.pricePart).toLocaleString("en-US")} PART</small>
                </div>
                {has ? (
                  <button className="buy owned" disabled={equip.isPending} onClick={() => equip.mutate(has.id)}>
                    {has.equipped ? <><Check size={16} /> Kuşanıldı</> : "Kuşan"}
                  </button>
                ) : (
                  <button className="buy" disabled={busyId === item.id} onClick={() => purchase(item)}>
                    {busyId === item.id ? <Loader2 size={16} className="spin" /> : <ShoppingBag size={16} />}
                    {usdPrice} USDT ile Al
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
      {msg && <p className="launch-msg" style={{ color: msg.includes("✓") ? "#3fb950" : "var(--danger)" }}>{msg}</p>}
      {showAd && <WatchAdModal onClose={() => setShowAd(false)} onReward={handleAdReward} />}
      <style>{`.store-topbar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 4px; }`}</style>
    </div>
  );
}

/* ──────────────── Kripto Market ──────────────── */
function CryptoMarket() {
  const { data, isLoading, refetch, isFetching } = useTopCrypto();
  const items = data?.items ?? [];
  const colorFor = (v: number) => v >= 0 ? "#3fb950" : "var(--danger)";

  return (
    <div className="crypto-market">
      <div className="crypto-header">
        <span className="muted" style={{ fontSize: 13 }}>CoinGecko verisi · 1dk önbellek</span>
        <button className="ghost-btn" style={{ padding: "4px 10px" }} onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw size={14} className={isFetching ? "spin" : ""} /> Yenile
        </button>
      </div>
      {isLoading && (
        <div className="crypto-grid">
          {Array.from({ length: 12 }).map((_, i) => <div key={i} className="crypto-card skeleton" />)}
        </div>
      )}
      <div className="crypto-grid">
        {items.map((coin: any, idx: number) => {
          const change = coin.change24h ?? coin.price_change_percentage_24h ?? 0;
          const price  = coin.priceUsd  ?? coin.current_price ?? 0;
          const mcap   = coin.marketCap ?? coin.market_cap ?? 0;
          const sym    = (coin.symbol ?? "?").toUpperCase();
          return (
            <article key={coin.symbol ?? idx} className="crypto-card">
              <div className="crypto-card-top">
                {coin.image
                  ? <img src={coin.image} alt={sym} className="crypto-logo" width={36} height={36} />
                  : <div className="crypto-logo-ph">{sym[0]}</div>}
                <div>
                  <strong>{sym}</strong>
                  <div className="muted" style={{ fontSize: 12 }}>{coin.name}</div>
                </div>
                <span className="crypto-rank">#{idx + 1}</span>
              </div>
              <div className="crypto-price">
                ${Number(price).toLocaleString(undefined, { maximumFractionDigits: price < 1 ? 6 : 2 })}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: colorFor(change) }}>
                  {change >= 0 ? "+" : ""}{Number(change).toFixed(2)}% (24s)
                </span>
                <a href={`https://www.coingecko.com/en/coins/${coin.id ?? coin.symbol?.toLowerCase()}`}
                  target="_blank" rel="noopener noreferrer"
                  className="muted" style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 2 }}>
                  CG <ExternalLink size={10} />
                </a>
              </div>
              <div className="crypto-mcap muted">Mcap: ${(Number(mcap) / 1e9).toFixed(2)}B</div>
            </article>
          );
        })}
      </div>
      {!isLoading && items.length === 0 && (
        <div className="market-empty">
          <TrendingUp size={36} className="empty-icon" />
          <p className="empty-title">Veri yüklenemedi</p>
          <button className="primary-btn" onClick={() => refetch()}>Tekrar Dene</button>
        </div>
      )}
      <p className="muted" style={{ textAlign: "center", fontSize: 12, marginTop: 20 }}>
        Veri: CoinGecko API · Yatırım tavsiyesi değildir
      </p>
    </div>
  );
}
